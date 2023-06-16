import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import {  Owner, TokenPayload } from "../interfaces/interfaces";
interface CustomRequest extends Request {
  user?: {
    rt: string;
    id: string;
  };
}
export const authRefreshToken = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const token: string | undefined = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ response: "Unauthorized" });
    return;
  }

  try {
    const decodedToken = jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET!
    ) as {
      id: string;
    };

    if (!decodedToken) {
      res.status(403).json({ response: "Forbidden" });
      return;
    }

    const id: string = decodedToken.id;
    req.user = {
      rt: token,
      id: id,
    };

    next();
  } catch (error) {
    console.log("in error");
    res.status(403).json({ response: "Forbidden" });
    return;
  }
};

export const validateUserRole = (req: any, res: Response, next: NextFunction) => {
    const { role, department } = req.user;
    if (role !== "super admin" && department.departmentRole !== "admin") {
      res.status(401).json({ error: "This Route is Admin Protected!" });
      return;
    }
    next();
  };




export const authenticateUserMiddleware = (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const authorizationHeader: string | undefined = req.headers["authorization"];

  if (!authorizationHeader) {
    res.status(401).json({ response: "Unauthorized" });
    return;
  }
  const token: string | undefined = authorizationHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ response: "Unauthorized" });
    return;
  }

  try {
    const decodedToken: TokenPayload | undefined = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    ) as TokenPayload | undefined;

    if (!decodedToken) {
      res.status(403).json({ response: "Forbidden" });
      return;
    }

    const { id, name, email, role, department } = decodedToken;
    const { departmentName, departmentRole } = department;
    const owner: Owner = {
      id: id,
      name: name,
      email: email,
      departmentName: departmentName,
      departmentRole: departmentRole,
      role: "owner",
    };
    req.user = {
      id,
      name,
      email,
      role,
      department: {
        departmentName,
        departmentRole,
      },
      owner,
    };
    next();
  } catch (error) {
    res.status(403).json({ response: "Forbidden" });
    return;
  }
};
