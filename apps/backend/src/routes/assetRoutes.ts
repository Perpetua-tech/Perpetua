import express from 'express';
import { body, param, query } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth';
import { assetController } from '../controllers/assetController';
import { isAdmin } from '../middleware/auth';
import { validateAssetCreate, validateAssetUpdate, validate } from '../middleware/validator';

const router = express.Router();

/**
 * @swagger
 * /assets:
 *   get:
 *     summary: Get all assets
 *     description: Retrieve a list of all assets with optional filtering
 *     tags: [Assets]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by asset type
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by asset location
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by asset status
 *       - in: query
 *         name: minValue
 *         schema:
 *           type: number
 *         description: Minimum asset value
 *       - in: query
 *         name: maxValue
 *         schema:
 *           type: number
 *         description: Maximum asset value
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: A list of assets
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 assets:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Asset'
 *                 total:
 *                   type: integer
 *                   description: Total number of assets matching the criteria
 *                 page:
 *                   type: integer
 *                   description: Current page number
 *                 limit:
 *                   type: integer
 *                   description: Number of items per page
 *                 totalPages:
 *                   type: integer
 *                   description: Total number of pages
 *       500:
 *         description: Server error
 */
router.get(
  '/',
  [
    query('type').optional().isString().withMessage('Asset type must be a string'),
    query('location').optional().isString().withMessage('Location must be a string'),
    query('minValue').optional().isNumeric().withMessage('Minimum value must be a number'),
    query('maxValue').optional().isNumeric().withMessage('Maximum value must be a number'),
    query('status').optional().isString().withMessage('Status must be a string'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],
  validate,
  assetController.getAllAssets
);

/**
 * @swagger
 * /assets/{id}:
 *   get:
 *     summary: Get asset by ID
 *     description: Retrieve a single asset by its ID
 *     tags: [Assets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Asset ID
 *     responses:
 *       200:
 *         description: Asset details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Asset'
 *       404:
 *         description: Asset not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 */
router.get(
  '/:id',
  [
    param('id').isString().withMessage('Asset ID must be a string')
  ],
  validate,
  assetController.getAssetById
);

/**
 * @swagger
 * /assets:
 *   post:
 *     summary: Create a new asset
 *     description: Create a new investment asset
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *               - location
 *               - value
 *               - yield
 *             properties:
 *               name:
 *                 type: string
 *                 description: Asset name
 *               description:
 *                 type: string
 *                 description: Asset description
 *               type:
 *                 type: string
 *                 enum: [REAL_ESTATE, AGRICULTURE, RENEWABLE_ENERGY, INFRASTRUCTURE, COMMERCIAL]
 *                 description: Asset type
 *               location:
 *                 type: string
 *                 description: Asset location
 *               value:
 *                 type: number
 *                 description: Asset value in USD
 *               yield:
 *                 type: number
 *                 description: Expected annual yield percentage
 *               minimumInvestment:
 *                 type: number
 *                 description: Minimum investment amount in USD
 *               imageUrl:
 *                 type: string
 *                 description: URL to asset image
 *     responses:
 *       201:
 *         description: Asset created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Asset'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have admin privileges
 *       500:
 *         description: Server error
 */
router.post(
  '/',
  authenticate,
  authorize(['ADMIN']),
  validateAssetCreate,
  assetController.createAsset
);

/**
 * @swagger
 * /assets/{id}:
 *   put:
 *     summary: Update an asset
 *     description: Update an existing asset by ID
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Asset ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Asset name
 *               description:
 *                 type: string
 *                 description: Asset description
 *               type:
 *                 type: string
 *                 enum: [REAL_ESTATE, AGRICULTURE, RENEWABLE_ENERGY, INFRASTRUCTURE, COMMERCIAL]
 *                 description: Asset type
 *               location:
 *                 type: string
 *                 description: Asset location
 *               value:
 *                 type: number
 *                 description: Asset value in USD
 *               yield:
 *                 type: number
 *                 description: Expected annual yield percentage
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, FUNDING, COMPLETED]
 *                 description: Asset status
 *               minimumInvestment:
 *                 type: number
 *                 description: Minimum investment amount in USD
 *               imageUrl:
 *                 type: string
 *                 description: URL to asset image
 *     responses:
 *       200:
 *         description: Asset updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Asset'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have admin privileges
 *       404:
 *         description: Asset not found
 *       500:
 *         description: Server error
 */
router.put(
  '/:id',
  authenticate,
  authorize(['ADMIN']),
  validateAssetUpdate,
  assetController.updateAsset
);

/**
 * @swagger
 * /assets/{id}:
 *   delete:
 *     summary: Delete an asset
 *     description: Mark an asset as inactive (soft delete)
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Asset ID
 *     responses:
 *       200:
 *         description: Asset deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have admin privileges
 *       404:
 *         description: Asset not found
 *       500:
 *         description: Server error
 */
router.delete(
  '/:id',
  authenticate,
  authorize(['ADMIN']),
  [
    param('id').isString().withMessage('Asset ID must be a string')
  ],
  validate,
  assetController.deleteAsset
);

/**
 * @swagger
 * /assets/{id}/investors:
 *   get:
 *     summary: Get asset investors
 *     description: Retrieve a list of investors for a specific asset
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Asset ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: A list of investors for the asset
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 investors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userId:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       investmentAmount:
 *                         type: number
 *                       investmentDate:
 *                         type: string
 *                         format: date-time
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have admin privileges
 *       404:
 *         description: Asset not found
 *       500:
 *         description: Server error
 */
router.get(
  '/:id/investors',
  authenticate,
  authorize(['ADMIN']),
  [
    param('id').isString().withMessage('Asset ID must be a string'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],
  validate,
  assetController.getAssetInvestors
);

/**
 * @swagger
 * /assets/{id}/performance:
 *   get:
 *     summary: Get asset performance
 *     description: Retrieve performance metrics for an asset
 *     tags: [Assets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Asset ID
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, quarter, year, all]
 *           default: month
 *         description: Time period for performance data
 *     responses:
 *       200:
 *         description: Asset performance data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 assetId:
 *                   type: string
 *                 assetName:
 *                   type: string
 *                 period:
 *                   type: string
 *                 performanceData:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                       value:
 *                         type: number
 *                       growth:
 *                         type: number
 *                       yield:
 *                         type: number
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalGrowth:
 *                       type: number
 *                     averageYield:
 *                       type: number
 *                     startValue:
 *                       type: number
 *                     currentValue:
 *                       type: number
 *       404:
 *         description: Asset not found
 *       500:
 *         description: Server error
 */
router.get(
  '/:id/performance',
  [
    param('id').isString().withMessage('Asset ID must be a string'),
    query('period').optional().isString().withMessage('Period must be a string'),
    query('from').optional().isISO8601().withMessage('From date must be a valid ISO date'),
    query('to').optional().isISO8601().withMessage('To date must be a valid ISO date')
  ],
  validate,
  assetController.getAssetPerformance
);

/**
 * @swagger
 * /assets/{id}/performance:
 *   post:
 *     summary: Add performance data
 *     description: Add new performance data for an asset
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Asset ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - value
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Date of the performance data
 *               value:
 *                 type: number
 *                 description: Asset value on the given date
 *               growth:
 *                 type: number
 *                 description: Growth percentage since last data point
 *               yield:
 *                 type: number
 *                 description: Yield percentage on the given date
 *     responses:
 *       201:
 *         description: Performance data added successfully
 *       400:
 *         description: Validation error
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User does not have admin privileges
 *       404:
 *         description: Asset not found
 *       500:
 *         description: Server error
 */
router.post(
  '/:id/performance',
  authenticate,
  authorize(['ADMIN']),
  [
    param('id').isString().withMessage('Asset ID must be a string'),
    body('date').isISO8601().withMessage('Date must be a valid ISO date'),
    body('value').isNumeric().withMessage('Value must be a number'),
    body('growth').isNumeric().withMessage('Growth must be a number'),
    body('yield').isNumeric().withMessage('Yield must be a number')
  ],
  validate,
  assetController.addPerformanceData
);

export default router; 