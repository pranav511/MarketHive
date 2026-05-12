const Joi = require("joi");

const createCategorySchema = Joi.object({
  name: Joi.string().min(3).required(),
  description: Joi.string().allow("", null),
  status: Joi.string().valid("active", "inactive")
});

const updateCategorySchema = Joi.object({
  name: Joi.string().min(3),
  description: Joi.string().allow("", null),
  status: Joi.string().valid("active", "inactive")
});

module.exports = {
  createCategorySchema,
  updateCategorySchema
};