import { Response } from "express";
import Form, { assignee } from "../interfaces/form";
import { GetForm } from "../Utils/formUtils";
import submissionRequests from "../interfaces/submissionRequests";
import submission from "../interfaces/submissions";
import {
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
