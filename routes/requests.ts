import express from "express";
const {
  createRequest,
  getRequests,
  requestResponse,
} = require("../controllers/requests");
import { authenticateUserMiddleware } from "../middlewares/authUser";
import { validateUserRole } from "../middlewares/validateUserRole";

const requestRoutes = express.Router();

requestRoutes
  .route("/createRequest/:formId")
  .post(authenticateUserMiddleware, createRequest);

requestRoutes
  .route("/getRequests")
  .get(authenticateUserMiddleware, validateUserRole, getRequests);

requestRoutes
  .route("/requestResponse/:requestId/:response")
  .put(authenticateUserMiddleware, requestResponse);

export default requestRoutes;
