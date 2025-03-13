import { Request, Response, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';
import { AppError } from './errorHandler';

// Validate request data
export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg).join(', ');
    return next(new AppError(errorMessages, 400));
  }
  next();
};

// Asset creation validation rules
export const validateAssetCreate = [
  body('name').isString().notEmpty().withMessage('Asset name cannot be empty'),
  body('type').isString().notEmpty().withMessage('Asset type cannot be empty'),
  body('location').isString().notEmpty().withMessage('Asset location cannot be empty'),
  body('description').isString().withMessage('Description must be a string'),
  body('value').isNumeric().withMessage('Value must be a number'),
  body('yield').isNumeric().withMessage('Yield must be a number'),
  body('minimumInvestment').optional().isNumeric().withMessage('Minimum investment must be a number'),
  body('imageUrl').optional().isURL().withMessage('Image URL must be a valid URL'),
  validate
];

// Asset update validation rules
export const validateAssetUpdate = [
  param('id').isString().withMessage('Asset ID must be a string'),
  body('name').optional().isString().notEmpty().withMessage('Asset name cannot be empty'),
  body('type').optional().isString().notEmpty().withMessage('Asset type cannot be empty'),
  body('location').optional().isString().notEmpty().withMessage('Asset location cannot be empty'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('value').optional().isNumeric().withMessage('Value must be a number'),
  body('yield').optional().isNumeric().withMessage('Yield must be a number'),
  body('status').optional().isString().withMessage('Status must be a string'),
  body('minimumInvestment').optional().isNumeric().withMessage('Minimum investment must be a number'),
  body('imageUrl').optional().isURL().withMessage('Image URL must be a valid URL'),
  validate
];

// Investment creation validation rules
export const validateInvestmentCreate = [
  body('assetId').isString().notEmpty().withMessage('Asset ID cannot be empty'),
  body('amount').isNumeric().withMessage('Investment amount must be a number'),
  validate
];

// User registration validation rules
export const validateUserRegistration = [
  body('name').isString().notEmpty().withMessage('Name cannot be empty'),
  body('email').isEmail().withMessage('Invalid email address'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  validate
];

// User login validation rules
export const validateUserLogin = [
  body('email').isEmail().withMessage('Invalid email address'),
  body('password').notEmpty().withMessage('Password cannot be empty'),
  validate
];

// Password update validation rules
export const validatePasswordUpdate = [
  body('currentPassword').notEmpty().withMessage('Current password cannot be empty'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters long'),
  validate
];

// Profile update validation rules
export const validateProfileUpdate = [
  body('name').optional().isString().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Invalid email address'),
  validate
];

// Governance proposal creation validation rules
export const validateProposalCreate = [
  body('title').isString().notEmpty().withMessage('Proposal title cannot be empty'),
  body('description').isString().notEmpty().withMessage('Proposal description cannot be empty'),
  body('options').isArray({ min: 2 }).withMessage('Proposal must have at least 2 options'),
  body('options.*.text').isString().notEmpty().withMessage('Option text cannot be empty'),
  body('endDate').isISO8601().withMessage('End date must be a valid date'),
  validate
];

// Vote validation rules
export const validateVote = [
  param('proposalId').isString().withMessage('Proposal ID must be a string'),
  body('vote').isString().notEmpty().withMessage('Vote cannot be empty'),
  validate
]; 