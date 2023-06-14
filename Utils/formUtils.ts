import Form from "../interfaces/form";

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

export const checkDraftPresent = async (
  req:any,
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
