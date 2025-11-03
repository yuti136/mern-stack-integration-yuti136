// middleware/validateRequest.js
const { validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // return first error or all errors
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

module.exports = validateRequest;
