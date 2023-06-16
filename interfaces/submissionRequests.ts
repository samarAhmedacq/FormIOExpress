export interface ReactFlowNode {
  id: string;
  type: string;
  position: {
    x: number;
    y: number;
  };
  positionAbsolute?: {
    x: number;
    y: number;
  };
  selected?: boolean;
  data: {
    label: string;
    submissionId?:string;
    assignee?: {
      id: string;
      name: string;
      email: string;
    };
    status?: string;
  };
  width?: number;
  dragging?: boolean;
  style?:any;
  height?:number;
}

export interface ReactFlowEdge {
  id: string;
  source: string;
  sourceHandle?: string | null;
  target: string;
  targetHandle?: string | null;
  label?: string;
  animated?: boolean;
  selected?:boolean
}

export interface ReactFlowData {
  edges: ReactFlowEdge[];
  nodes: ReactFlowNode[];
}

export interface submissionRequests {
  requestId?:string,
  id?: string;
  formId: string;
  SubmittedBy: any;
  flowStatus: string;
  formVersion: number;
  reactFlow: ReactFlowData;
}

export default submissionRequests;
