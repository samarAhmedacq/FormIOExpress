export interface formRole {
  id: string;
  name: string;
  email: string;
  departmentName: string;
  departmentRole: string;
  role: string;
}
export interface Form {
  formName: string;
  jsonSchema: {};
  formCode?: string;
  department: [];
  ReferenceNumber: string;
  reactFlow?: Flow;
  roles?: formRole[];
  status?: string;
  version?: number;
  id?: string;
  _rid?: string;
  _self?: string;
  _etag?: string;
  _attachments?: string;
  _ts?: number;
}
export interface Edge {
  id: string;
  source: string;
  sourceHandle?: string;
  target: string;
  targetHandle?: string;
  label?: string;
  animated?: boolean;
  selected?: boolean;
}

export interface NodeData {
  label: string;
  assignee: {
    id: string;
    name: string;
    email: string;
  };
}

export interface Node {
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
  data: NodeData;
  width?: number;
  height?: number;
  dragging?: boolean;
  hidden?: boolean;
  style?: any;
}

export interface Flow {
  edges: Edge[];
  nodes: Node[];
}

export interface JsonSchema {
  jsonSchema: {
    components: [];
  };
}

export interface Owner {
  id: string;
  name: string;
  email: string;
  departmentName: string;
  departmentRole: string;
  role: "owner";
}

export interface assignee {
  id: string;
  name: string;
  email: string;
}

export default Form;
