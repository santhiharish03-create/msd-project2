const { body, validationResult } = require('express-validator');

const validateTimetable = [
  body('section').notEmpty().withMessage('Section is required'),
  body('roomNumber').notEmpty().withMessage('Room number is required'),
  body('schedule').isObject().withMessage('Schedule must be an object')
];

const validateUser = [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const validateRoom = [
  body('roomNumber').notEmpty().withMessage('Room number is required'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be a positive number')
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

module.exports = {
  validateTimetable,
  validateUser,
  validateRoom,
  handleValidationErrors
};