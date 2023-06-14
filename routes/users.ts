import express from "express";
const {
  createUser,
  signIn,
  getAllUsers,
  getAllUsersOfDepartment,
  RefreshTokens,
  deleteUser,
} = require("../controllers/users");
import { authenticateUserMiddleware } from "../middlewares/authUser";
import { authRefreshToken } from "../middlewares/authRefresh";
import { validateUserRole } from "../middlewares/validateUserRole";
const userRoutes = express.Router();
userRoutes.route("/signIn").post(signIn);
userRoutes.route("/createUser").post(createUser);
userRoutes
  .route("/")
  .get(authenticateUserMiddleware, validateUserRole, getAllUsers);

userRoutes
  .route("/deleteUser/:userId")
  .delete(authenticateUserMiddleware, validateUserRole, deleteUser);
userRoutes.route("/refreshToken").get(authRefreshToken, RefreshTokens);

userRoutes
  .route("/:departmentName")
  .get(authenticateUserMiddleware, getAllUsersOfDepartment);
export default userRoutes;
