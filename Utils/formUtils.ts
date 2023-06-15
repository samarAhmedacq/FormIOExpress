import Form, { Owner, formRole } from "../interfaces/form";

export const checkFormCode = async (
  req: any,
  codeToBeChecked: string | undefined,
  ownerId: string
): Promise<boolean> => {
  const { formsContainer } = req.cosmos;

  const querySpec = {
    query:
      "SELECT f.formName,f.jsonSchema,f.formCode,f.roles,f.id,f.status FROM forms f JOIN o IN f.roles WHERE o.id = @ownerId AND (o.role = 'owner' OR o.role = 'contributor') AND f.formCode = @formCode",
    parameters: [
      { name: "@formCode", value: codeToBeChecked },
      { name: "@ownerId", value: ownerId },
    ],
  };
  const { resources } = await formsContainer.items.query(querySpec).fetchAll();
  if (resources.length > 0) {
    return true;
  } else {
    return false;
  }
};

export const GetForm = async (
  req: any,
  res: any,
  formID: string
): Promise<Form> => {
  const { formsContainer } = req.cosmos;
  try {
    const { resource } = await formsContainer.item(formID, formID).read();
    const form: Form = resource;
    return form;
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
    throw error;
  }
};

export const getIdOfOwner = async (objects: any): Promise<string> => {
  const ownerObject = objects.find((obj: any) => obj.role === "owner");
  return ownerObject ? ownerObject.id : null;
};
export const getEmailOfOwner = async (objects: any): Promise<string> => {
  const ownerObject = objects.find((obj: any) => obj.role === "owner");
  return ownerObject ? ownerObject.email : null;
};

export const checkDraftPresent = async (
  req: any,
  codeToBeChecked: string,
  ownerId: string
) => {
  const { formsContainer } = req.cosmos;
  try {
    const querySpec = {
      query:
        "SELECT f.formName,f.jsonSchema,f.formCode,f.roles,f.id,f.status FROM forms f JOIN o IN f.roles WHERE o.id = @ownerId AND (o.role = 'owner' OR o.role = 'contributor') AND f.formCode = @formCode AND f.status = 'draft'",
      parameters: [
        { name: "@formCode", value: codeToBeChecked },
        { name: "@ownerId", value: ownerId },
      ],
    };
    const { resources } = await formsContainer.items
      .query(querySpec)
      .fetchAll();
    if (resources.length > 0) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    throw err;
  }
};

export const createRequest = async (
  req: any,
  formId: string,
  RequestorId: string,
  name: string,
  email: string,
  status: string,
  Type: string
) => {
  const { requestsContainer } = req.comsos;
  const { resource }: any = await requestsContainer.items.create({
    formID: formId,
    RequestorId: RequestorId,
    name: name,
    email: email,
    status: status,
    Type: Type,
  });
  return resource;
};

export const publishCheck = async (
  req: any,
  codeToBeChecked: string,
  idToBeChecked: string
) => {
  const { formsContainer } = req.cosmos;
  const querySpec = {
    query:
      "SELECT f.formName,f.jsonSchema,f.formCode,f.roles,f.id,f.status,f.version,f.department,f.reactFlow,f.ReferenceNumber FROM forms f WHERE f.formCode = @formCode AND f.id != @id AND f.status = @status",
    parameters: [
      { name: "@formCode", value: codeToBeChecked },
      { name: "@id", value: idToBeChecked },
      { name: "@status", value: "published" },
    ],
  };
  const { resources } = await formsContainer.items.query(querySpec).fetchAll();
  if (resources.length > 0) {
    const form2: Form = resources[0];
    form2.status = "archived";
    await formsContainer.item(form2.id, form2.id).replace(form2);
  }
};

export const getRequest = async (
  req: any,
  res: any,
  formId: string,
  verificationCode: string,
  type: string
) => {
  const { requestsContainer } = req.cosmos;
  const querySpec = {
    query:
      "SELECT * FROM c WHERE c.id = @id AND c.formID = @formID AND c.Type = @type",
    parameters: [
      {
        name: "@id",
        value: verificationCode,
      },
      {
        name: "@formID",
        value: formId,
      },
      {
        name: "@type",
        value: type,
      },
    ],
  };

  const { resources } = await requestsContainer.items
    .query(querySpec)
    .fetchAll();

  if (resources.length > 0) {
    return resources[0];
  } else {
    res.status(404).json({ error: "there is no request against this ID" });
    return;
  }
};

export const createOwner = async (resource: any) => {
  let roles: formRole[] = [];
  const owner: Owner = {
    id: resource.RequestorId,
    email: resource.email,
    name: resource.name,
    departmentName: resource.departmentName,
    departmentRole: resource.departmentRole,
    role: "owner",
  };
  roles.push(owner);
  return roles;
};
