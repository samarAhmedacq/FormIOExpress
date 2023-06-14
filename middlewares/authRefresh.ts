import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

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
