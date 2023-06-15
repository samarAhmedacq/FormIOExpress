import express from "express";
const { createRequest, getRequests } = require("../controllers/requests");
import { authenticateUserMiddleware } from "../middlewares/authUser";
import { validateUserRole } from "../middlewares/validateUserRole";

const requestRoutes = express.Router();

requestRoutes
  .route("/createRequest/:formId")
  .post(authenticateUserMiddleware, createRequest);

requestRoutes
  .route("/getRequests")
  .get(authenticateUserMiddleware, validateUserRole, getRequests);

export default requestRoutes;
