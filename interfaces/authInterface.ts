import { Request } from "express";
import { Owner } from "./form";
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
      role: string;
      department: {
        departmentName: string;
        departmentRole: string;
      };
      owner:Owner
    };
  }