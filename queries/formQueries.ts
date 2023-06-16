export const getFormWithId = (formId: string, id: string) => {
  return {
    query:
      "SELECT f.id, f.jsonSchema,f.roles,f.status,f.formCode,f.formName,f.department,f.ReferenceNumber,f.reactFlow,f.version FROM forms f JOIN o IN f.roles WHERE o.id = @ownerId AND f.id = @formId",
    parameters: [
      {
        name: "@ownerId",
        value: id,
      },
      {
        name: "@formId",
        value: formId,
      },
    ],
  };
};

export const getLatestForms = (id: string) => {
  return {
    query:
      "SELECT f.formCode, MAX(f.version) AS LatestVersion FROM forms f JOIN o IN f.roles WHERE o.id = @ownerId AND (o.role = 'owner' OR o.role = 'contributor') GROUP BY f.formCode",
    parameters: [
      {
        name: "@ownerId",
        value: id,
      },
    ],
  };
};

export const getFormWithCodeAndVersion = (
  id: string,
  formCode: string,
  version: number
) => {
  return {
    query:
      "SELECT f.formName,f.jsonSchema,f.formCode,f.id,f.status,f.department,f.version,f.reactFlow,f.ReferenceNumber,f.roles FROM forms f JOIN o IN f.roles WHERE o.id = @ownerId AND (o.role = 'owner' OR o.role = 'contributor') AND f.formCode = @formCode AND f.version = @version",
    parameters: [
      { name: "@formCode", value: formCode },
      { name: "@ownerId", value: id },
      { name: "@version", value: version },
    ],
  };
};

export const getFormForShare = (id: string, formId: string) => {
  return {
    query:
      "SELECT f.id, f.jsonSchema,f.roles,f.formName,f.formCode,f.version,f.status,f.department,f.ReferenceNumber,f.reactFlow FROM forms f JOIN o IN f.roles WHERE o.id = @ownerId AND o.role = @role AND f.id = @formId",
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
        name: "@role",
        value: "owner",
      },
    ],
  };
};

export const getAllFormsOfUser = (id: string) => {
  return {
    query:
      "SELECT f.id ,f.jsonSchema,f.formName,f.formCode,f.status,f.department,f.ReferenceNumber,f.reactFlow,f.roles FROM forms f JOIN o IN f.roles WHERE o.id = @ownerId AND (o.role = 'owner' OR o.role = 'contributor')",
    parameters: [
      {
        name: "@ownerId",
        value: id,
      },
    ],
  };
};

export const getDepFormsAdmin = (departmentName: string) => {
  return {
    query:
      "SELECT f.id ,f.jsonSchema,f.formName,f.status,f.formCode,f.roles,f.department,f.version,f.ReferenceNumber,f.reactFlow FROM forms f WHERE (f.status = 'draft' OR f.status = 'published') AND ARRAY_CONTAINS(f.department, @departmentName)",
    parameters: [
      {
        name: "@departmentName",
        value: departmentName,
      },
    ],
  };
};

export const getAllDepFormsAdmin = (departmentName: string) => {
  return {
    query:
      "SELECT f.id ,f.jsonSchema,f.formName,f.status,f.formCode,f.roles,f.department,f.version,f.ReferenceNumber,f.reactFlow FROM forms f WHERE f.status = 'published' AND ARRAY_CONTAINS(f.department, @departmentName)",
    parameters: [
      {
        name: "@departmentName",
        value: departmentName,
      },
    ],
  };
};

export const getAFormToPublish = (id: string, formId: string) => {
  return {
    query:
      "SELECT f.formName,f.jsonSchema,f.formCode,f.roles,f.id,f.status,f.version,f.department,f.reactFlow,f.ReferenceNumber FROM forms f JOIN o IN f.roles WHERE o.id = @ownerId AND (o.role = 'owner' OR o.role = 'contributor') AND f.id = @formId",
    parameters: [
      {
        name: "@ownerId",
        value: id,
      },
      {
        name: "@formId",
        value: formId,
      },
    ],
  };
};

export const getFormForDraft = (formId: string, id: string) => {
  return {
    query:
      "SELECT f.id, f.jsonSchema,f.roles,f.status,f.formCode,f.formName,f.version,f.department,f.ReferenceNumber,f.reactFlow FROM forms f JOIN o IN f.roles WHERE o.id = @ownerId AND (o.role = @role OR o.role = 'contributor') AND f.id = @formId AND f.status = @status",
    parameters: [
      { name: "@ownerId", value: id },
      { name: "@formId", value: formId },
      { name: "@status", value: "published" },
      { name: "@role", value: "owner" },
    ],
  };
};

export const getFormWithStatus = (status: string, id: string) => {
  return {
    query:
      "SELECT f.id ,f.jsonSchema,f.formName,f.status,f.formCode FROM forms f JOIN o IN f.roles WHERE o.id = @ownerId AND o.role = 'owner' AND f.status = @status",
    parameters: [
      {
        name: "@ownerId",
        value: id,
      },
      {
        name: "@status",
        value: status,
      },
    ],
  };
};

export const checkCode = (codeToBeChecked: string, ownerId: string) => {
  return {
    query:
      "SELECT f.formName,f.jsonSchema,f.formCode,f.roles,f.id,f.status FROM forms f JOIN o IN f.roles WHERE o.id = @ownerId AND (o.role = 'owner' OR o.role = 'contributor') AND f.formCode = @formCode",
    parameters: [
      { name: "@formCode", value: codeToBeChecked },
      { name: "@ownerId", value: ownerId },
    ],
  };
};

export const checkDraft = (codeToBeChecked: string, ownerId: string) => {
  return {
    query:
    "SELECT f.formName,f.jsonSchema,f.formCode,f.roles,f.id,f.status FROM forms f JOIN o IN f.roles WHERE o.id = @ownerId AND (o.role = 'owner' OR o.role = 'contributor') AND f.formCode = @formCode AND f.status = 'draft'",
  parameters: [
    { name: "@formCode", value: codeToBeChecked },
    { name: "@ownerId", value: ownerId },
  ],
  };
};

export const checkPublish = (codeToBeChecked: string, idToBeChecked: string) => {
  return {
    query:
    "SELECT f.formName,f.jsonSchema,f.formCode,f.roles,f.id,f.status,f.version,f.department,f.reactFlow,f.ReferenceNumber FROM forms f WHERE f.formCode = @formCode AND f.id != @id AND f.status = @status",
  parameters: [
    { name: "@formCode", value: codeToBeChecked },
    { name: "@id", value: idToBeChecked },
    { name: "@status", value: "published" },
  ],
  };
};

export const GetPublishOrCloneRequest = (verificationCode: string, formId: string,type:string) => {
  return {
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
}


