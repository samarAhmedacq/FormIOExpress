import express from "express";
const { createRequest } = require("../controllers/requests");
import { authenticateUserMiddleware } from "../middlewares/authUser";

const requestRoutes = express.Router();

requestRoutes
  .route("/createRequest/:formId")
  .post(authenticateUserMiddleware, createRequest);

export default requestRoutes;
