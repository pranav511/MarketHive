const validate = (schema) => (req, res, next) => {

  const { error } = schema.validate(req.body);

  if (error) {
    return next({
      status: 400,
      message: String(error.details[0].message)
    });
  }

  next();
};

module.exports = validate;