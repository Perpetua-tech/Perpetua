import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, authorize, validate } from '../middleware';
import { userController } from '../controllers/userController';

const router = Router();

// Register user
router.post(
  '/register',
  [
    body('username').isString().notEmpty().withMessage('Username is required'),
    body('email').isString().isEmail().withMessage('Valid email is required'),
    body('password').isString().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('walletAddress').optional().isString().withMessage('Wallet address must be a valid string'),
  ],
  validate,
  userController.register
);

// User login
router.post(
  '/login',
  [
    body('email').isString().isEmail().withMessage('Valid email is required'),
    body('password').isString().notEmpty().withMessage('Password is required'),
  ],
  validate,
  userController.login
);

// Get user profile
router.get(
  '/profile',
  authenticate,
  userController.getProfile
);

// Update user profile
router.put(
  '/profile',
  authenticate,
  [
    body('username').optional().isString().isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters'),
    body('email').optional().isEmail().withMessage('Please provide a valid email address'),
    body('walletAddress').optional().isString().withMessage('Wallet address must be a valid string'),
  ],
  validate,
  userController.updateProfile
);

// Change password
router.post(
  '/change-password',
  authenticate,
  [
    body('currentPassword').isString().notEmpty().withMessage('Current password is required'),
    body('newPassword').isString().isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  validate,
  userController.changePassword
);

// Get user dashboard
router.get(
  '/dashboard',
  authenticate,
  userController.getDashboard
);

// Admin only: Get all users
router.get(
  '/admin/users',
  authenticate,
  authorize(['admin']),
  userController.getAllUsers
);

// Admin only: Get user by ID
router.get(
  '/admin/users/:id',
  authenticate,
  authorize(['admin']),
  userController.getUserById
);

// Admin only: Update user
router.put(
  '/admin/users/:id',
  authenticate,
  authorize(['admin']),
  userController.updateUser
);

export default router; 