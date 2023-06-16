import {
  JsonSchema,
  Form,
  ReactFlowEdge,
  ReactFlowNode,
  assignee,
  query,
  submission,
  submissionRequests,
} from "../interfaces/interfaces";
import { RequestWithId, submissionGet } from "../queries/requestQueries";

export const updateCurrentNodeData = async (
  submissionId: string,
  submissionRequest: submissionRequests,
  assignee: assignee
) => {
  try {
    const currentNode: ReactFlowNode | undefined =
      submissionRequest.reactFlow.nodes.find((node) => node.id === "1");
    const nodes: ReactFlowNode[] = submissionRequest.reactFlow.nodes;
    const edges: ReactFlowEdge[] = submissionRequest.reactFlow.edges;
    currentNode!.data.submissionId = submissionId;
    currentNode!.data.assignee = assignee;
    currentNode!.data.status = "inactive";
    return { currentNode, nodes, edges };
  } catch (err) {
    throw err;
  }
};

export const updateNextOrPrevNodeProperties = async (
  res: any,
  edges: ReactFlowEdge[],
  nodes: ReactFlowNode[],
  currentNode: ReactFlowNode,
  Nodes: string
) => {
  if (Nodes === "Next") {
    edges
      .filter((edge) => edge.source === currentNode.id)
      .map((edge) => {
        const node = nodes.find((node) => node.id === edge.target);
        node!.data.status = "active";
        // this.sendEmail(
        //   node.data.assignee.email,
        //   currentNode.data.assignee.email,
        //   `${currentNode.data.assignee.email} has sent a request to you`
        // );
        return node;
      });
  } else if (Nodes === "Prev") {
    edges
      .filter((edge) => edge.target === currentNode.id)
      .map((edge) => {
        const node = nodes.find((node) => node.id === edge.source);
        if (!node) {
          res.status(404).json({
            error: "Yoo cannot revert the node as you are at the first node",
          });
          return;
        }

        node.data.status = "active";
        // this.sendEmail(
        //   node.data.assignee.email,
        //   currentNode.data.assignee.email,
        //   `${currentNode.data.assignee.email} has sent a request to you`
        // );

        return node;
      });
  }
};

export const getSubmission = async (
  req: any,
  res: any,
  submissionId: string
) => {
  const { submissionsContainer } = req.cosmos;
  const querySpec: query = submissionGet(submissionId);

  const { resources } = await submissionsContainer.items
    .query(querySpec)
    .fetchAll();

  if (resources.length > 0) {
    const { jsonSchema, submitData } = resources[0];
    return { jsonSchema, submitData };
  } else {
    res.status(404).json({ error: "Submission not found" });
    return;
  }
};

export const getRequestWithId = async (
  req: any,
  res: any,
  requestId: string
) => {
  const { submissionRequestsContainer } = req.cosmos;
  try {
    const querySpec: query = RequestWithId(requestId);

    const { resources } = await submissionRequestsContainer.items
      .query(querySpec)
      .fetchAll();

    if (resources.length > 0) {
      const form = resources[0];
      return form;
    } else {
      res.status(404).json({ error: "Request Not found" });
      return;
    }
  } catch (err) {
    throw err;
  }
};

export const findNodesEdgesAndCurrentNode = async (
  res: any,
  request: submissionRequests,
  assigneeId: string
) => {
  const nodes: ReactFlowNode[] = request.reactFlow.nodes;
  const edges: ReactFlowEdge[] = request.reactFlow.edges;
  const currentNode: ReactFlowNode | undefined = nodes.find(
    (node) => node.data.assignee!.id === assigneeId
  );

  if (currentNode && currentNode.data.status === "active") {
    return {
      nodes,
      edges,
      currentNode,
    };
  } else {
    res
      .status(404)
      .json({ error: "Cannot respond. Current node is not active." });
    return;
  }
};

export const updateNodeProperties = async (
  res: any,
  assignee: assignee,
  formId: string,
  req: any,
  nodes: ReactFlowNode[],
  edges: ReactFlowEdge[],
  currentNode: ReactFlowNode,
  jsonSchema: JsonSchema,
  submitData: any,
  status: string,
  response: string
) => {
  const submission: any = createSubmission(
    formId,
    assignee,
    jsonSchema,
    submitData
  );

  if (!currentNode) {
    res.status(404).json({ error: "No node found with matching assignee ID" });
    return;
  }

  currentNode.data.status = status;
  if (response === "accept") {
    const { submissionsContainer } = req.cosmos;
    const { resource: createdSubmission } =
      await submissionsContainer.items.create(submission);

    const submissionId = createdSubmission.id;
    currentNode.data.submissionId = submissionId;
  }
  const relatedNodes: ReactFlowNode[] = edges
    .filter((edge) =>
      status === "active"
        ? edge.source === currentNode.id
        : edge.target === currentNode.id
    )
    .map((edge) => {
      const node = nodes.find((node) =>
        status === "active" ? node.id === edge.target : node.id === edge.source
      )!;
      if (node) {
        node.data.status = status;
      }
      return node;
    });

  return relatedNodes;
};

export const deactivateAllNodes = async (reactFlow: any) => {
  const updatedNodes: ReactFlowNode[] = reactFlow.nodes.map((node: any) => ({
    ...node,
    data: {
      ...node.data,
      status: "inactive",
    },
  }));
  return updatedNodes;
};

export const rejectRequest = async (
  req: any,
  request: submissionRequests,
  assignee: assignee
) => {
  const { submissionRequestsContainer } = req.cosmos;
  request.flowStatus = "rejected";
  const updatedReactFlow = await deactivateAllNodes(request.reactFlow);
  request.reactFlow.nodes = updatedReactFlow;
  await submissionRequestsContainer
    .item(request.id, request.formId)
    .replace(request);
  // await requestUtils.sendEmail(
  //   request.SubmittedBy.email,
  //   assignee.email,
  //   `${assignee.email} has rejected the request. The flow has ended.`
  // );
  return request;
};

export const createSubmissionRequest = async (
  form: Form,
  assignee: assignee
) => {
  return {
    formId: form.id!,
    formVersion: form.version!,
    flowStatus: "Inprogress",
    SubmittedBy: assignee,
    reactFlow: form.reactFlow!,
  };
};

export const createAssignee = async (user: any) => {
  const { id, name, email } = user;
  return {
    id: id,
    name: name,
    email: email,
  };
};

export const createSubmission = async (
  formId: string,
  assignee: assignee,
  jsonSchema: any,
  submitData: any
) => {
  return {
    formId: formId,
    assigneeId: assignee.id,
    assigneeName: assignee.name,
    assigneeEmail: assignee.email,
    jsonSchema: jsonSchema,
    submitData: submitData,
  };
};
export const createNewSubmission = async (
  createdSubmissionRequest: submissionRequests,
  submission: submission
) => {
  return {
    requestId: createdSubmissionRequest.id,
    ...submission,
  };
};

export const processResources = async (
  resources: any[],
  req: any,
  res: any
) => {
  return Promise.all(
    resources.map(async (resource: any) => {
      const nodesData = await processNodesData(
        resource.reactFlow.nodes,
        req,
        res
      );

      const filteredNodesData = nodesData.filter((node: any) => node !== null);
      return {
        requestId: resource.id,
        flowStatus: resource.flowStatus,
        submittedBy: resource.SubmittedBy,
        data: filteredNodesData,
      };
    })
  );
};
export const processNodesData = async (
  nodes: ReactFlowNode[],
  req: any,
  res: any
) => {
  return Promise.all(
    nodes.map(async (node: any) => {
      const { assignee, submissionId } = node.data;

      if (assignee && submissionId) {
        const { name, email } = assignee;
        const submissionData = await getSubmission(req, res, submissionId);
        return { name, email, submissionId, da: submissionData };
      }

      return null;
    })
  );
};
