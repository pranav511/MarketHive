const Joi = require("joi");

const registerSchema = Joi.object({
  name: Joi.string().min(3).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 3 characters"
  }),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().length(10).required(),
  role_id: Joi.number()
  .integer()
  .valid(1,2,3)
  .optional()
});

const verifyOtpSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

module.exports = { registerSchema, verifyOtpSchema, loginSchema };