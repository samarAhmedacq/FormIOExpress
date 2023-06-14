interface User {
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
  export default User;