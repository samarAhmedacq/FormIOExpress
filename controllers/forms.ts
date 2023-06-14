import { Response } from "express";
import FormSchema, { FormCode, updateFormSchema } from "../models/FormSchema";
import Form, { Flow, JsonSchema, formRole } from "../interfaces/form";
import {
  GetForm,
  checkDraftPresent,
  checkFormCode,
  getIdOfOwner,
} from "../Utils/formUtils";

exports.createForm = async (req: any, res: Response) => {
  const form: Form = req.body;
  const { owner } = req.user;
  const { formsContainer } = req.cosmos;

  const formCodeValidationResult = await FormCode.validate(form.formCode);
  if (formCodeValidationResult.error) {
    res.status(404).json({ error: formCodeValidationResult.error.message });
    return;
  }

  const ownerId: string = owner.id;
  const exists: boolean = await checkFormCode(req, form.formCode, ownerId);
  if (exists) {
    res.status(404).json({
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

  const querySpec = {
    query:
      "SELECT f.id, f.jsonSchema,f.roles,f.status,f.formCode,f.formName,f.department,f.ReferenceNumber,f.reactFlow,f.version FROM forms f JOIN o IN f.roles WHERE o.id = @ownerId AND (o.role = 'owner' OR o.role = 'contributor') AND f.id = @formId AND f.status = @status",
    parameters: [
      {
        name: "@ownerId",
        value: id,
      },
      {
        name: "@formId",
        value: formId,
      },
      {
        name: "@status",
        value: "draft",
      },
    ],
  };

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

  const querySpec = {
    query:
      "SELECT f.id, f.jsonSchema,f.roles,f.status,f.formCode,f.formName,f.version,f.department,f.ReferenceNumber,f.reactFlow FROM forms f JOIN o IN f.roles WHERE o.id = @ownerId AND (o.role = @role OR o.role = 'contributor') AND f.id = @formId AND f.status = @status",
    parameters: [
      { name: "@ownerId", value: id },
      { name: "@formId", value: formId },
      { name: "@status", value: "published" },
      { name: "@role", value: "owner" },
    ],
  };

  const { resources } = await formsContainer.items.query(querySpec).fetchAll();
  if (resources.length > 0) {
    const form: Form = resources[0];
    const codeToBeChecked: string = form.formCode!;
    const exists: boolean = await checkDraftPresent(req, codeToBeChecked, id);
    if (exists) {
      res.status(404).json({
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
  }
};

exports.createFlow = async (req: any, res: Response) => {
  const { id } = req.user;
  const Flow: Flow = req.body;

  const formId: string = req.params.formId;
  const form: Form = await GetForm(req, res, formId);

  const { formsContainer } = req.cosmos;
  const formRoles = form.roles;

  const OwnerId: string = await getIdOfOwner(formRoles);
  if (id != OwnerId) {
    res.status(404).json({
      error:
        "You are not owner of the form you cannot create the Flow of this form",
    });
    return;
  }
  if (form.reactFlow) {
    res
      .status(404)
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
  const form: Form = await GetForm(req, res, formId);

  const { formsContainer } = req.cosmos;
  const formRoles = form.roles;

  const OwnerId: string = await getIdOfOwner(formRoles);
  if (id != OwnerId) {
    res.status(404).json({
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
  const querySpec = {
    query:
      "SELECT f.formCode, MAX(f.version) AS LatestVersion FROM forms f JOIN o IN f.roles WHERE o.id = @ownerId AND (o.role = 'owner' OR o.role = 'contributor') GROUP BY f.formCode",
    parameters: [
      {
        name: "@ownerId",
        value: id,
      },
    ],
  };

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
  const querySpec = {
    query:
      "SELECT f.formName,f.jsonSchema,f.formCode,f.id,f.status,f.department,f.version,f.reactFlow,f.ReferenceNumber,f.roles FROM forms f JOIN o IN f.roles WHERE o.id = @ownerId AND (o.role = 'owner' OR o.role = 'contributor') AND f.formCode = @formCode AND f.version = @version",
    parameters: [
      { name: "@formCode", value: formCode },
      { name: "@ownerId", value: id },
      { name: "@version", value: version },
    ],
  };

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
