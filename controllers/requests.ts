import { Response } from "express";
import Form, { assignee } from "../interfaces/form";
import { GetForm } from "../Utils/formUtils";
import submissionRequests from "../interfaces/submissionRequests";
import submission from "../interfaces/submissions";
import {
  getSubmission,
  updateCurrentNodeData,
  updateNextOrPrevNodeProperties,
} from "../Utils/requestUtils";

exports.createRequest = async (req: any, res: Response) => {
  const { id, name, email } = req.user;
  const assignee: assignee = {
    id: id,
    name: name,
    email: email,
  };
  const { submissionsContainer, submissionRequestsContainer } = req.cosmos;
  const formId: string = req.params.formId;
  const form: Form = await GetForm(req, res, formId);
  if (!form) {
    res.status(404).json({ error: "Form Not found" });
    return;
  }
  if (form.status != "published") {
    res.status(400).json({ error: "Form is Not Published" });
    return;
  }
  const submissionRequest: submissionRequests = {
    formId: form.id!,
    formVersion: form.version!,
    flowStatus: "Inprogress",
    SubmittedBy: assignee,
    reactFlow: form.reactFlow!,
  };
  const jsonSchema: any = req.body.jsonSchema;
  const submitData: any = req.body.submitData;

  const submission: submission = {
    formId: formId,
    assigneeId: assignee.id,
    assigneeName: assignee.name,
    assigneeEmail: assignee.email,
    jsonSchema: jsonSchema,
    submitData: submitData,
  };

  const { resource: createdSubmission } =
    await submissionsContainer.items.create(submission);

  const submissionId = createdSubmission.id;
  const { currentNode, nodes, edges } = await updateCurrentNodeData(
    submissionId,
    submissionRequest,
    assignee
  );

  await updateNextOrPrevNodeProperties(res, edges, nodes, currentNode!, "Next");
  const { resource: createdSubmissionRequest } =
    await submissionRequestsContainer.items.create(submissionRequest);
  res
    .status(201)
    .json({ response: "request created", createdSubmissionRequest });
  return;
};

exports.getRequests = async (req: any, res: any) => {
  const { id, email } = req.user;
  const { submissionRequestsContainer } = req.cosmos;

  try {
    const querySpec = {
      query:
        "SELECT c.id, c.formId, c.version, c.reactFlow, c.SubmittedBy, c.flowStatus FROM c JOIN r IN c.reactFlow.nodes WHERE r.data.assignee.email = @email AND r.data.assignee.id = @id AND r.data.status = 'active' AND r.id != '1'",
      parameters: [
        { name: "@email", value: email },
        { name: "@id", value: id },
      ],
    };

    const { resources } = await submissionRequestsContainer.items
      .query(querySpec)
      .fetchAll();

    if (resources.length) {
      const request = await Promise.all(
        resources.map(async (resource: any) => {
          const nodesData = await Promise.all(
            resource.reactFlow.nodes.map(async (node: any) => {
              const { assignee, submissionId } = node.data;

              if (assignee && submissionId) {
                const { name, email } = assignee;
                const da = await getSubmission(req, res, submissionId);
                return { name, email, submissionId, da };
              }
              return null;
            })
          );

          const filteredNodesData = nodesData.filter(
            (node: any) => node !== null
          );
          return {
            id: resource.id,
            flowStatus: resource.flowStatus,
            submittedBy: resource.SubmittedBy,
            data: filteredNodesData,
          };
        })
      );

      res.status(200).json({ resources: request });
      return;
    }
  } catch (err) {
    throw err;
  }
};
