import { Response } from "express";
import FormSchema, {
  FormCode,
  updateFormSchema,
  shareSchema,
  statusSchema,
} from "../models/FormSchema";
import {
  Flow,
  JsonSchema,
  formRole,
  Form,
  query,
  request,
} from "../interfaces/interfaces";
import {
  GetForm,
  checkDraftPresent,
  checkFormCode,
  createOwner,
  createRequest,
  getEmailOfOwner,
  getIdOfOwner,
  getRequest,
  publishCheck,
} from "../Utils/formUtils";
import { sendEmail } from "../Utils/userUtils";

import {
  getAFormToPublish,
  getAllDepFormsAdmin,
  getAllFormsOfUser,
  getDepFormsAdmin,
  getFormForDraft,
  getFormForShare,
  getFormWithCodeAndVersion,
  getFormWithId,
  getFormWithStatus,
  getLatestForms,
} from "../queries/formQueries";

exports.createForm = async (req: any, res: Response) => {
  const form: Form = req.body;
  const { owner } = req.user;
  const { formsContainer } = req.cosmos;

  const formCodeValidationResult = await FormCode.validate(form.formCode);
  if (formCodeValidationResult.error) {
    res.status(400).json({ error: formCodeValidationResult.error.message });
    return;
  }

  const ownerId: string = owner.id;
  const exists: boolean = await checkFormCode(req, form.formCode, ownerId);
  if (exists) {
    res.status(400).json({
      error:
        "A form with the same FormCode already exists. Please choose a different FormCode.",
    });
    return;
  }

  try {
    await FormSchema.validate(form);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
    return;
  }

  const roles: formRole[] = [owner];
  form.roles = roles;
  form.status = "draft";
  form.version = 1;

  await formsContainer.items.create(form);

  res.status(201).json({ form });
  return;
};

exports.getForm = async (req: any, res: Response) => {
  const formId: string = req.params.formId;
  const { formsContainer } = req.cosmos;
  const { id } = req.user;

  
    const querySpec: query = getFormWithId(formId, id);
    const { resources } = await formsContainer.items
      .query(querySpec)
      .fetchAll();
    if (resources.length > 0) {
      const form: Form = resources[0];
      res.status(200).json({ form });
      return;
    } else {
      res.status(404).json({ error: "Form Not found" });
      return;
    }
 
};

exports.getFormsByStatus = async (req: any, res: Response) => {
  const { id } = req.user;
  const status: string = req.params.status;
  const { formsContainer } = req.cosmos;
  const { error } = statusSchema.validate(status);
  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }
  
    const querySpec: query = getFormWithStatus(status, id);

    const { resources } = await formsContainer.items
      .query(querySpec)
      .fetchAll();

    if (resources.length) {
      const forms: Form[] = resources;
      res.status(200).json({ forms });
      return;
    } else {
      res.status(404).json({ error: "Form Not Found" });
      return;
    }

};

exports.editForm = async (req: any, res: Response) => {
  const updatedForm: JsonSchema = req.body;
  const formId: string = req.params.formId;
  const { id } = req.user;
  const { formsContainer } = req.cosmos;

  try {
    await updateFormSchema.validate(updatedForm);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
    return;
  }

  const querySpec: query = getFormWithId(formId, id);

  const { resources } = await formsContainer.items.query(querySpec).fetchAll();

  if (resources.length > 0) {
    const form = resources[0];
    form.jsonSchema = updatedForm.jsonSchema;

    await formsContainer.item(form.id, form.id).replace(form);

    res.status(200).json({ form });
    return;
  } else {
    res.status(404).json({
      error: "there is no form with this id or the form is not in draft phase",
    });
    return;
  }
};

exports.createDraft = async (req: any, res: Response) => {
  const formId: string = req.params.formId;
  const { id } = req.user;
  const { formsContainer } = req.cosmos;

  const querySpec = getFormForDraft(formId, id);

  const { resources } = await formsContainer.items.query(querySpec).fetchAll();
  if (resources.length > 0) {
    const form: Form = resources[0];
    const codeToBeChecked: string = form.formCode!;
    const exists: boolean = await checkDraftPresent(req, codeToBeChecked, id);
    if (exists) {
      res.status(400).json({
        error: "there is a draft of this form already present",
      });
      return;
    }
    const version: number = form.version! + 1;
    if (form.status == "published") {
      let newForm = form;
      newForm.status = "draft";
      newForm.version = version;
      newForm.id = "";
      await formsContainer.items.create(newForm);
      res.status(201).json({ newForm });
      return;
    }
  } else {
    res.status(404).json({
      error: "there is no form with this id or the form is not in draft phase",
    });
    return;
  }
};

exports.createFlow = async (req: any, res: Response) => {
  const { id } = req.user;
  const Flow: Flow = req.body;

  const formId: string = req.params.formId;
  const form: Form | undefined = await GetForm(req, res, formId);
  if (!form) {
    res.status(404).json({ error: "there is no form with given id" });
    return;
  }

  const { formsContainer } = req.cosmos;
  const formRoles = form.roles;

  const OwnerId: string = await getIdOfOwner(formRoles);
  if (id != OwnerId) {
    res.status(400).json({
      error:
        "You are not owner of the form you cannot create the Flow of this form",
    });
    return;
  }
  if (form.reactFlow) {
    res
      .status(400)
      .json({ error: "The ReactFlow of this form is already created" });
    return;
  }
  const updatedForm: Form = form;
  updatedForm.reactFlow = Flow;
  await formsContainer.item(form.id, form.id).replace(updatedForm);
  res.status(201).json({ form });
  return;
};

exports.editFlow = async (req: any, res: Response) => {
  const { id } = req.user;
  const Flow: Flow = req.body;

  const formId: string = req.params.formId;
  const form: Form | undefined = await GetForm(req, res, formId);
  if (!form) {
    res.status(404).json({ error: "there is no form with given id" });

    return;
  }
  const { formsContainer } = req.cosmos;
  const formRoles = form.roles;

  const OwnerId: string = await getIdOfOwner(formRoles);
  if (id != OwnerId) {
    res.status(400).json({
      error:
        "You are not owner of the form you cannot edit the Flow of this form",
    });
    return;
  }

  const updatedForm: Form = form;
  updatedForm.reactFlow = Flow;
  await formsContainer.item(form.id, form.id).replace(updatedForm);
  res.status(200).json({ form });
  return;
};

exports.getLatestForms = async (req: any, res: Response) => {
  const { id } = req.user;
  const { formsContainer } = req.cosmos;
  const querySpec: query = getLatestForms(id);

  const { resources } = await formsContainer.items.query(querySpec).fetchAll();

  if (resources.length) {
    const forms: Form[] = resources;
    res.status(200).json({ forms });
    return;
  } else {
    res.status(404).json({ error: "there is no form present" });
    return;
  }
};

exports.SearchFormWithCodeAndVersion = async (req: any, res: Response) => {
  const { id } = req.user;
  const formCode: string = req.params.formCode;
  const version: number = parseInt(req.params.version);
  const { formsContainer } = req.cosmos;
  const querySpec: query = getFormWithCodeAndVersion(id, formCode, version);

  const { resources } = await formsContainer.items.query(querySpec).fetchAll();

  if (resources.length) {
    const form: Form = resources[0];
    res.status(200).json({ form });
    return;
  } else {
    res.status(404).json({ error: "there is no form present" });
    return;
  }
};

exports.shareForm = async (req: any, res: Response) => {
  const { formsContainer } = req.cosmos;
  const { id, owner } = req.user;
  const formId: string = req.params.formId;
  const shareWith: formRole = req.body;
  const { error } = shareSchema.validate(shareWith);
  if (error) {
    res.status(400).json({ error: error.message });
  }
  const querySpec: query = getFormForShare(id, formId);

  const { resources } = await formsContainer.items.query(querySpec).fetchAll();

  if (resources.length > 0) {
    const form: Form = resources[0];
    let newID: string = shareWith.id;
    let roles: formRole[] = [];
    roles = form.roles!;
    roles.forEach((owner) => {
      if (owner.id === newID) {
        res
          .status(400)
          .json({ error: "Form is already shared with this User" });
          return;
      }
      
    });
    roles.push(shareWith);
    form.roles = roles;
    await formsContainer.item(form.id, form.id).replace(form);
    // await sendEmail(
     
    //   shareWith.email,
    //   owner.email,
    //   `${owner.email} has shared form with ${shareWith.email}`
    // );
    res.status(200).json({ form });
    return;
  }
  else
  {
    res
    .status(404)
    .json({ error: "Form Not Found" });
    return;
  }
};

exports.getAllFormsOfUser = async (req: any, res: Response) => {
  const { id } = req.user;
  const { formsContainer } = req.cosmos;
  const querySpec: query = getAllFormsOfUser(id);

  const { resources }: any = await formsContainer.items
    .query(querySpec)
    .fetchAll();

  if (resources.length) {
    const forms: Form[] = resources;
    res.status(200).json({ forms });
    return;
  } else {
    res.status(404).json({ error: "there is no form present" });
    return;
  }
};

exports.getDepFormsAdmin = async (req: any, res: Response) => {
  const { department } = req.user;
  const { formsContainer } = req.cosmos;
  const departmentName: string = department.departmentName;
  const querySpec: query = getDepFormsAdmin(departmentName);

  const { resources } = await formsContainer.items.query(querySpec).fetchAll();

  if (resources.length) {
    const forms: Form[] = resources;
    res.status(200).json({ forms });
    return;
  } else {
    res.status(404).json({ error: "there is no form present" });
    return;
  }
};

exports.getAllDepFormsAdmin = async (req: any, res: Response) => {
  const { formsContainer } = req.cosmos;
  const departmentName: string = req.params.departmentName;
  const querySpec: query = getAllDepFormsAdmin(departmentName);

  const { resources } = await formsContainer.items.query(querySpec).fetchAll();

  if (resources.length) {
    const forms: Form[] = resources;
    res.status(200).json({ forms });
    return;
  } else {
    res.status(404).json({ error: "there is no form present" });
    return;
  }
};

exports.getFormsMember = async (req: any, res: Response) => {
  const { department } = req.user;
  const { formsContainer } = req.cosmos;
  const departmentName: string = department.departmentName;
  const querySpec: query = getAllDepFormsAdmin(departmentName);

  const { resources } = await formsContainer.items.query(querySpec).fetchAll();

  if (resources.length) {
    const forms: Form[] = resources;
    res.status(200).json({ forms });
    return;
  } else {
    res.status(404).json({ error: "there is no form present" });
    return;
  }
};

exports.publishForm = async (req: any, res: Response) => {
  const { formsContainer } = req.cosmos;
  const { id, name, email } = req.user;
  const formId: string = req.params.formId;

  const querySpec: query = getAFormToPublish(id, formId);

  const { resources } = await formsContainer.items.query(querySpec).fetchAll();

  if (resources.length > 0) {
    const form: Form = resources[0];
    if (form.status == "published" || form.status == "archived") {
      res.status(400).json({
        error:
          "Form cannot be published as it is already archived or published",
      });
      return;
    }
    if (!form.reactFlow) {
      res.status(400).json({
        error:
          "Form cannot be published as the react Flow of this Form is not created",
      });
      return;
    }
    const OwnerId: string = await getIdOfOwner(form.roles);
    const OwnerEmail = await getEmailOfOwner(form.roles);
    if (OwnerId != id) {
      const resource: request = await createRequest(
        req,
        formId,
        id,
        name,
        email,
        "pending",
        "publish"
      );

      // await sendEmail(
      //   email,
      //   OwnerEmail,
      //   `<p>${email} the contributor in this form is trying to publish this form ${formId} </p><p>Accept Request: <a href="http://localhost:4000/form/publishContributorForm/${formId}/${resource.id}">Accept</a></p>`
      // );

      return resource;
    }
    await publishCheck(req, form.formCode!, form.id!);
    form.status = "published";
    await formsContainer.item(form.id, form.id).replace(form);

    res.status(200).json({ form });
    return;
  } else {
    res.status(404).json({ error: "No Form Found with this Id" });
    return;
  }
};

exports.publishContributorForm = async (req: any, res: Response) => {
  const { formsContainer, requestsContainer } = req.cosmos;
  const formID: string = req.params.formId;
  const verificationCode: string = req.params.verificationCode;
  const resource: any = await getRequest(
    req,
    res,
    formID,
    verificationCode,
    "publish"
  );
  if (resource) {
    if (resource.status != "pending") {
      res
        .status(400)
        .json({ error: "you have already accepted or rejected the request" });
      return;
    }

    const form: Form | undefined = await GetForm(req, res, formID);
    if (form!.status == "published" || form!.status == "archived") {
      res.status(400).json({
        error: "you cannot publish as it is already published or archived",
      });
      return;
    }

    const codeToBeChecked: string = form!.formCode!;
    const idToBeChecked: string = form!.id!;

    await publishCheck(req, codeToBeChecked, idToBeChecked);
    form!.status = "published";
    await formsContainer.item(form!.id, form!.id).replace(form);
    await sendEmail(
      resource.email,
      "samarahmedfast5@gmail.com",
      "form Publish is accepted"
    );
    const UpdatedResource = resource;
    UpdatedResource.status = "accepted";
    await requestsContainer
      .item(resource.id, resource.id)
      .replace(UpdatedResource);
    res.status(200).json({ response: "form is published" });
    return;
  } else {
    res.status(404).json({ error: "No Form Found with this Id" });
    return;
  }
};

exports.cloneForm = async (req: any, res: Response) => {
  const { formsContainer } = req.cosmos;
  const formId: string = req.params.formId;
  const { owner } = req.user;
  const form: Form | undefined = await GetForm(req, res, formId);
  if (!form) {
    res.status(400).json({ error: "there is no form with given id" });

    return;
  }
  const ownerEmail: string = await getEmailOfOwner(form.roles);
  
    if (owner.email != ownerEmail) {
      const resource: request = await createRequest(
        req,
        formId,
        owner.id,
        owner.name,
        owner.email,
        "pending",
        "clone"
      );

      // await formUtils.sendVerificationEmail(
      //   "samarahmedfast5@gmail.com",
      //   resource.id,
      //   owner,
      //   formID,
      //   form.formName
      // );

      return resource;
    }
    let roles = [];
    roles.push(owner);
    let NewForm = form;
    NewForm.id = "";
    NewForm.roles = roles;
    NewForm.status = "draft";
    NewForm.version = 1;

    const { resource } = await formsContainer.items.create(NewForm);
    const createdForm: Form = resource;
    res.status(201).json({ createdForm });

};

exports.rejectCloneForm = async (req: any, res: Response) => {
  const email: string = req.params.email;
  await sendEmail(email, "", "");
  return;
};

exports.verifyClone = async (req: any, res: Response) => {
  const { formsContainer, requestsContainer } = req.cosmos;
  const formId: string = req.params.formId;
  const verificationCode: string = req.params.verificationCode;
  
    const resource = await getRequest(
      req,
      res,
      formId,
      verificationCode,
      "clone"
    );
    if (resource) {
      if (resource.status != "pending") {
        res
          .status(400)
          .json({ error: "you have already accepted or rejected the request" });
        return;
      }

      const form: Form | undefined = await GetForm(req, res, formId);
      if (!form) {
        res.status(400).json({ error: "there is no form with given id" });

        return;
      }
      let roles: formRole[] = await createOwner(resource);

      let NewForm: Form = form;
      NewForm.id = "";
      NewForm.roles = roles;
      NewForm.status = "draft";
      NewForm.version = 1;

      await formsContainer.items.create(NewForm);
      // await formUtils.sendAcceptanceEmail(resource.email, "clone");
      const UpdatedResource = resource;
      UpdatedResource.status = "accepted";
      await requestsContainer
        .item(resource.id, resource.id)
        .replace(UpdatedResource);
      res
        .status(200)
        .json({ response: `${resource.name} has cloned your Form` });
      return;
    } else {
      res.status(404).json({ error: "Request Not found" });
      return;
    }

};
