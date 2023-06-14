import express from "express";
const {
  createForm,
  editForm,
  createDraft,
  createFlow,
  editFlow,
  getLatestForms,
  SearchFormWithCodeAndVersion,
  shareForm,
} = require("../controllers/forms");
import { authenticateUserMiddleware } from "../middlewares/authUser";
import { validateUserRole } from "../middlewares/validateUserRole";
const formRoutes = express.Router();
formRoutes
  .route("/createForm")
  .post(authenticateUserMiddleware, validateUserRole, createForm);
formRoutes
  .route("/editForm/:formId")
  .put(authenticateUserMiddleware, validateUserRole, editForm);
formRoutes
  .route("/createDraft/:formId")
  .post(authenticateUserMiddleware, validateUserRole, createDraft);
formRoutes
  .route("/getLatestForms")
  .get(authenticateUserMiddleware, validateUserRole, getLatestForms);
formRoutes
  .route("/SearchFormWithCodeAndVersion/:formCode/:version")
  .get(
    authenticateUserMiddleware,
    validateUserRole,
    SearchFormWithCodeAndVersion
  );
formRoutes
  .route("/createFlow/:formId")
  .post(authenticateUserMiddleware, validateUserRole, createFlow);
formRoutes
  .route("/editFlow/:formId")
  .put(authenticateUserMiddleware, validateUserRole, editFlow);
formRoutes
  .route("/shareForm/:formId")
  .put(authenticateUserMiddleware, validateUserRole, shareForm);
export default formRoutes;
