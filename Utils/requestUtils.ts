import { assignee } from "../interfaces/form";
import submissionRequests, {
  ReactFlowEdge,
  ReactFlowNode,
} from "../interfaces/submissionRequests";
import submission from "../interfaces/submissions";

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
  const querySpec = {
    query:
      "SELECT c.id, c.jsonSchema, c.submitData FROM c WHERE c.id = @submissionId",
    parameters: [{ name: "@submissionId", value: submissionId }],
  };

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
