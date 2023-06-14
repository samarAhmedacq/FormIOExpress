import { Response,NextFunction } from "express";
export const validateUserRole = (req: any, res: Response, next: NextFunction) => {
    const { role, department } = req.user;
    if (role !== "super admin" && department.departmentRole !== "admin") {
      res.status(401).json({ error: "This Route is Admin Protected!" });
      return;
    }
    next();
  };