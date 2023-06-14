const Joi = require("joi");

const validDepartments = ["finance", "administration", "operations", "All"];
const validDepartmentRoles = ["member", "admin"];
const roles = ["super admin", "user"];
const userSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")).required(),
  role: Joi.string()
    .valid(...roles)
    .required(),
  department: Joi.object({
    departmentName: Joi.string()
      .valid(...validDepartments)
      .required(),
    departmentRole: Joi.string()
      .valid(...validDepartmentRoles)
      .required(),
  }).required(),
});

export default userSchema;
