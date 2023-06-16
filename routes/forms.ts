import express from "express";
const {
  createForm,
  getForm,
  getFormsByStatus,
  editForm,
  createDraft,
  createFlow,
  editFlow,
  getLatestForms,
  SearchFormWithCodeAndVersion,
  shareForm,
  getAllFormsOfUser,
  getDepFormsAdmin,
  getAllDepFormsAdmin,
  getFormsMember,
  publishForm,
  publishContributorForm,
  cloneForm,
  verifyClone,
} = require("../controllers/forms");
import { authenticateUserMiddleware,validateUserRole } from "../middleware/middleware";

const formRoutes = express.Router();
formRoutes
  .route("/createForm")
  .post(authenticateUserMiddleware, validateUserRole, createForm);

formRoutes
  .route("/getForm/:formId")
  .get(authenticateUserMiddleware, validateUserRole, getForm);

  formRoutes
  .route("/getFormsByStatus/:status")
  .get(authenticateUserMiddleware, validateUserRole, getFormsByStatus);

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

formRoutes
  .route("/getAllFormsOfUser")
  .get(authenticateUserMiddleware, getAllFormsOfUser);

formRoutes
  .route("/getDepFormsAdmin")
  .get(authenticateUserMiddleware, validateUserRole, getDepFormsAdmin);

formRoutes
  .route("/getAllDepFormsAdmin/:departmentName")
  .get(authenticateUserMiddleware, validateUserRole, getAllDepFormsAdmin);
formRoutes
  .route("/getFormsMember")
  .get(authenticateUserMiddleware, getFormsMember);
formRoutes
  .route("/publishForm/:formId")
  .patch(authenticateUserMiddleware, validateUserRole, publishForm);
formRoutes
  .route("/publishContributorForm/:formId/:verificationCode")
  .patch(publishContributorForm);
formRoutes
  .route("/cloneForm/:formId")
  .post(authenticateUserMiddleware, validateUserRole, cloneForm);
formRoutes
  .route("/verifyClone/:formId/:verificationCode")
  .post(authenticateUserMiddleware, validateUserRole, verifyClone);

export default formRoutes;
