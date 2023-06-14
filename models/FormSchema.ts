const Joi = require("joi");
export const FormCode = Joi.string().required();

export const FormSchema = Joi.object({
  formName: Joi.string().required(),
  formCode: Joi.string().required(),
  ReferenceNumber: Joi.string().required(),
  department: Joi.array().items(Joi.string()).required(),
  jsonSchema: Joi.object({
    components: Joi.array().items(Joi.object()),
  }).required(),
});

export const shareSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  departmentName: Joi.string().required(),
  departmentRole: Joi.string().required(),
  role: Joi.string().required(),
});

export const statusSchema = Joi.string()
  .valid("draft", "published", "archived")
  .required();

export const updateFormSchema = Joi.object({
  jsonSchema: Joi.object({
    components: Joi.array().items(Joi.object()),
  }).required(),
});
export default FormSchema;
