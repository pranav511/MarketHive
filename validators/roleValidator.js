const Joi = require("joi");

const roleSchema = Joi.object({
  role_name: Joi.string()
    .min(3)
    .max(20)
    .required()
    .messages({
      "string.empty": "Role name is required",
      "string.min": "Role must be at least 3 characters",
      "string.max": "Role must be less than 20 characters"
    })
});

module.exports = {
  roleSchema
};