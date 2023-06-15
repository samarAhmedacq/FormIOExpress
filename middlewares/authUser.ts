import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { TokenPayload, CustomRequest } from "../interfaces/authInterface";
import { Owner } from "../interfaces/form";

export const authenticateUserMiddleware = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  console.log("h");
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
