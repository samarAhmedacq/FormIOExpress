import { Request } from "express";

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
  export interface request {
    formID: string;
    RequestorId: string;
    name: string;
    email: string;
    status: string;
    Type: string;
    id?: string;
    _rid?: string;
    _self?: string;
    _etag?: string;
    _attachments?: string;
    _ts?: number;
  }

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

  export interface submission {
    id?: string;
    formId?:string;
    assigneeId: string;
    assigneeName: string;
    assigneeEmail: string;
    jsonSchema: any;
    submitData:any;
  }

  export interface Tokens {
    accessToken: string;
    refreshToken: string;
  }
  
  export interface UserToken {
    name: string;
    email: string;
    department: {
      departmentName: string;
      departmentRole: string;
    };
    role: string;
    id: string;
  }

  export interface User {
    name?: string;
    email: string;
    password?: string;
    department?: {
      departmentName: string;
      departmentRole: string;
    };
    role?:string;
    hashedRt?:string | null;
    id?:string;
    _rid?: string;
    _self?: string;
    _etag?: string;
    _attachments?: string;
    _ts?: number;
  }
  export interface loginUser{
    email: string;
    password: string;
  }

  export interface query {
    query: string;
    parameters?: {
      name: string;
      value: any;
    }[];
  }

  export interface TokenPayload {
    id: string;
    name: string;
    email:string;
    role: string;
    department: {
      departmentName: string;
      departmentRole: string;
    };
    iat: number;
    exp: number;
  };

 export interface CustomRequest extends Request {
    user?: {
      id: string;
      name: string;
      email?:string,
      role: string;
      department: {
        departmentName: string;
        departmentRole: string;
      };
      owner:Owner
    };
  }

  interface AuthUser {
    user: {
      name: string;
      email: string;
      department: {
        departmentName: string;
        departmentRole: string;
      };
      role: string;
      id: string;
    };
    accessToken: string;
    refreshToken: string;
  }
  export default Form;
  