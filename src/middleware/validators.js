import { body, oneOf, param, validationResult } from 'express-validator';

export const validateSignUp = [
  body('email')
    .isString()
    .withMessage('Email must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .bail()
    .isEmail()
    .withMessage('Email is not valid')
    .bail()
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .bail()
    .isLength({ min: 8, max: 64 })
    .withMessage(
      'Password must contain at least 8 characters and at most 64 characters',
    ),

  body('role')
    .optional()
    .isIn(['USER', 'ADMIN'])
    .withMessage('Role must be either USER or ADMIN'),

  handleValidationErrors,
];

export const validateLogIn = [
  body('email')
    .isString()
    .withMessage('Email must be a string')
    .bail()
    .notEmpty()
    .withMessage('Email is required')
    .bail()
    .normalizeEmail(),

  body('password')
    .isString()
    .withMessage('Password must be a string')
    .bail()
    .notEmpty()
    .withMessage('Password is required'),

  handleValidationErrors,
];

export const validateId = [
  param('id').isInt({ min: 1 }).withMessage('Id must be a positive integer'),

  handleValidationErrors,
];

export const validateCreateTask = [
  body('title')
    .isString()
    .withMessage('Title must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .bail()
    .isLength({ min: 5 })
    .withMessage('Title Must be at least 5 characters long')
    .escape(),

  body('completed').isBoolean().withMessage('completed must be a boolean'),

  handleValidationErrors,
];

export const validateUpdateTask = [
  oneOf([body('title').exists(), body('completed').exists()], {
    message: 'At least one field (name, or completed) must be provided',
  }),
  body('title')
    .optional()
    .isString()
    .withMessage('Title must be a string')
    .bail()
    .trim()
    .isLength({ min: 5 })
    .withMessage('Title must be at least 5 characters long')
    .escape(),

  body('completed')
    .optional()
    .isBoolean({ strict: true })
    .withMessage('completed must be a boolean'),

  handleValidationErrors,
];

export function validateCompletedQuery(req, res, next) {
  const completed = req.query.completed;

  if (completed !== undefined && completed !== 'true' && completed !== 'false') {
    return res.status(400).json({ errors: ['completed must be true or false'] });
  }

  next();
}

export function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ errors: errors.array().map((err) => err.msg) });
  }
  next();
}
