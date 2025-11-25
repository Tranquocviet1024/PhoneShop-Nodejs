const { validationResult } = require('express-validator');
const { ApiError } = require('./apiResponse');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new ApiError(
        400,
        'Validation Error',
        errors.array().map((err) => ({
          field: err.param,
          message: err.msg,
        }))
      )
    );
  }
  next();
};

module.exports = {
  handleValidationErrors,
};
