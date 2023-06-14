import express from "express";
const {
  createUser,
  signIn,
  getAllUsers,
  getAllUsersOfDepartment,
  RefreshTokens,
} = require("../controllers/users");
import { authenticateUserMiddleware } from "../middlewares/authUser";
import { authRefreshToken } from "../middlewares/authRefresh";
const userRoutes = express.Router();
userRoutes.route("/signIn").post(signIn);
userRoutes.route("/").get(authenticateUserMiddleware, getAllUsers);
userRoutes.route("/createUser").post(createUser);
userRoutes.route("/refreshToken").get(authRefreshToken, RefreshTokens);

userRoutes
  .route("/:departmentName")
  .get(authenticateUserMiddleware, getAllUsersOfDepartment);
export default userRoutes;
