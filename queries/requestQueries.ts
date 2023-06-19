export const getRequests = (email: string, id: string) => {
  return {
    query:
      "SELECT c.id, c.formId, c.version, c.reactFlow, c.SubmittedBy, c.flowStatus FROM c JOIN r IN c.reactFlow.nodes WHERE r.data.assignee.email = @email AND r.data.assignee.id = @id AND r.data.status = 'active' AND r.id != '1'",
    parameters: [
      { name: "@email", value: email },
      { name: "@id", value: id },
    ],
  };
};

export const submissionGet = (submissionId: string) => {
  return {
    query:
      "SELECT c.id, c.jsonSchema, c.submitData FROM c WHERE c.id = @submissionId",
    parameters: [{ name: "@submissionId", value: submissionId }],
  };
};

export const RequestWithId = (requestId: string) => {
  return {
    query: "SELECT * FROM c WHERE c.id = @id",
    parameters: [
      {
        name: "@id",
        value: requestId,
      },
    ],
  };
};
