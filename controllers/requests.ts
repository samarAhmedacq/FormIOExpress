import { Response } from "express";
import {
  Form,
  assignee,
  query,
  submission,
  submissionRequests,
} from "../interfaces/interfaces";
import { GetForm } from "../Utils/formUtils";

import {
  createAssignee,
  createNewSubmission,
  createSubmission,
  createSubmissionRequest,
  findNodesEdgesAndCurrentNode,
  getRequestWithId,
  processResources,
  rejectRequest,
  updateCurrentNodeData,
  updateNextOrPrevNodeProperties,
  updateNodeProperties,
} from "../Utils/requestUtils";
import { getRequests } from "../queries/requestQueries";

exports.createRequest = async (req: any, res: Response) => {
  const assignee: assignee = await createAssignee(req.user);
  const { submissionsContainer, submissionRequestsContainer } = req.cosmos;
  const formId: string = req.params.formId;
  const jsonSchema: any = req.body.jsonSchema;
  const submitData: any = req.body.submitData;
  const form: Form | undefined = await GetForm(req, res, formId);

  if (form!.status != "published") {
    res.status(400).json({ error: "Form is Not Published" });
    return;
  }
  const submissionRequest: submissionRequests = await createSubmissionRequest(
    form!,
    assignee
  );

  const submission: submission = await createSubmission(
    formId,
    assignee,
    jsonSchema,
    submitData
  );
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

  const newSubmission = await createNewSubmission(
    createdSubmissionRequest,
    submission
  );

  await submissionsContainer.item(submissionId, formId).replace(newSubmission);

  res
    .status(201)
    .json({ response: "request created", createdSubmissionRequest });
  return;
};

exports.getRequests = async (req: any, res: any) => {
  const { id, email } = req.user;
  const { submissionRequestsContainer } = req.cosmos;

  const querySpec: query = getRequests(email, id);

  const { resources } = await submissionRequestsContainer.items
    .query(querySpec)
    .fetchAll();

  if (resources.length) {
    const request = await processResources(resources, req, res);

    res.status(200).json({ resources: request });
    return;
  } else {
    res.status(404).json({ error: "no request received" });
    return;
  }
};

exports.requestResponse = async (req: any, res: any) => {
  const assignee: assignee = await createAssignee(req.user);
  const response: string = req.params.response;
  const requestId: string = req.params.requestId;
  const jsonSchema: any = req.body.jsonSchema;
  const submitData: any = req.body.submitData;
  const request: submissionRequests = await getRequestWithId(
    req,
    res,
    requestId
  );
  if (
    !request ||
    request.flowStatus == "rejected" ||
    request.flowStatus == "completed"
  ) {
    res.status(400).json({
      error:
        "You cannot respond to this request as it is already completed or rejected",
    });
    return;
  }
  const data = await findNodesEdgesAndCurrentNode(res, request, assignee.id);
  if (data) {
    const nodes = data!.nodes;
    const edges = data!.edges;
    const currentNode = data!.currentNode;
    if (response === "accept") {
      await updateNodeProperties(
        res,
        assignee,
        request.formId,
        req,
        nodes,
        edges,
        currentNode,
        jsonSchema,
        submitData,
        "inactive",
        "accept"
      );
      await updateNextOrPrevNodeProperties(
        res,
        edges,
        nodes,
        currentNode,
        "Next"
      );
      // await requestUtils.sendEmail(
      //   request.SubmittedBy.email,
      //   assignee.email,
      //   `${assignee.email} has accepted the request`
      // );
    } else if (response === "revert") {
      if (currentNode.type === "input") {
        res.status(404).json({
          error: "you cannot revert the request as you are the input node",
        });
        return;
      }
      await updateNodeProperties(
        res,
        assignee,
        request.formId,
        req,
        nodes,
        edges,
        currentNode,
        jsonSchema,
        submitData,
        "inactive",
        "reverted"
      );
      await updateNextOrPrevNodeProperties(
        res,
        edges,
        nodes,
        currentNode,
        "Prev"
      );
      // await requestUtils.sendEmail(
      //   request.SubmittedBy.email,
      //   assignee.email,
      //   `${assignee.email} has reverted the request`
      // );
    } else if (response === "rejected") {
      const response = await rejectRequest(req, request, assignee);
      res.status(200).json({ response });
      return;
    }
    const allNodesInactive: boolean = request.reactFlow.nodes.every(
      (node) => node.data.status === "inactive"
    );
    if (allNodesInactive) {
      request.flowStatus = "completed";
    }
    const { submissionRequestsContainer } = req.cosmos;
    await submissionRequestsContainer
      .item(request.id, request.id)
      .replace(request);
    res.status(200).json({ request });
    return;
  } else {
    return;
  }
};
