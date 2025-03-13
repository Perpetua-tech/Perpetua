import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { assetService } from '../services/assetService';
import { AppError } from '../middleware/errorHandler';

// Asset controller with implemented business logic
export const assetController = {
  // Get all assets
  getAllAssets: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { 
        type, 
        location, 
        page, 
        limit, 
        sortBy, 
        order,
        minValue,
        maxValue,
        status
      } = req.query;

      // Convert query parameters
      const queryParams: any = {};
      
      if (type) queryParams.type = type as string;
      if (location) queryParams.location = location as string;
      if (page) queryParams.page = parseInt(page as string);
      if (limit) queryParams.limit = parseInt(limit as string);
      if (sortBy) queryParams.sortBy = sortBy as string;
      if (order) queryParams.order = order as 'asc' | 'desc';
      if (status) queryParams.status = status as string;
      
      // Get assets from service
      const result = await assetService.findAssets(queryParams);

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      logger.error('Failed to get all assets', { error });
      next(error);
    }
  },

  // Get single asset details
  getAssetById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      
      // Get asset from service
      const asset = await assetService.findById(id);
      
      if (!asset) {
        return next(new AppError('Asset not found', 404));
      }

      res.status(200).json({
        status: 'success',
        data: {
          asset,
        },
      });
    } catch (error) {
      logger.error('Failed to get asset details', { error });
      next(error);
    }
  },

  // Create new asset
  createAsset: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        name,
        type,
        location,
        description,
        totalValue,
        availableAmount,
        minInvestment,
        expectedReturn,
        duration,
        imageUrl,
        risk
      } = req.body;

      // Create asset using service
      const asset = await assetService.createAsset({
        name,
        type,
        location,
        description,
        totalValue: parseFloat(totalValue),
        availableAmount: parseFloat(availableAmount),
        minInvestment: parseFloat(minInvestment),
        expectedReturn: parseFloat(expectedReturn),
        duration: parseInt(duration),
        imageUrl,
        risk
      });

      res.status(201).json({
        status: 'success',
        message: 'Asset created successfully',
        data: {
          asset,
        },
      });
    } catch (error) {
      logger.error('Failed to create asset', { error });
      next(error);
    }
  },

  // Update asset information
  updateAsset: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updateData: any = { ...req.body };
      
      // Parse numeric values
      if (updateData.totalValue) updateData.totalValue = parseFloat(updateData.totalValue);
      if (updateData.availableAmount) updateData.availableAmount = parseFloat(updateData.availableAmount);
      if (updateData.minInvestment) updateData.minInvestment = parseFloat(updateData.minInvestment);
      if (updateData.expectedReturn) updateData.expectedReturn = parseFloat(updateData.expectedReturn);
      if (updateData.duration) updateData.duration = parseInt(updateData.duration);

      // Update asset using service
      const asset = await assetService.updateAsset(id, updateData);

      res.status(200).json({
        status: 'success',
        message: 'Asset updated successfully',
        data: {
          asset,
        },
      });
    } catch (error) {
      logger.error('Failed to update asset', { error });
      next(error);
    }
  },

  // Delete asset
  deleteAsset: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      
      // Delete asset using service (marks as inactive)
      await assetService.deleteAsset(id);

      res.status(200).json({
        status: 'success',
        message: 'Asset deleted successfully',
      });
    } catch (error) {
      logger.error('Failed to delete asset', { error });
      next(error);
    }
  },

  // Get asset investors list
  getAssetInvestors: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      
      // Get investors using service
      const result = await assetService.getAssetInvestors(id, page, limit);

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      logger.error('Failed to get asset investors', { error });
      next(error);
    }
  },

  // Get asset performance metrics
  getAssetPerformance: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { period } = req.query;
      
      // Get performance metrics using service
      const result = await assetService.getAssetPerformance(id, period as string);

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      logger.error('Failed to get asset performance metrics', { error });
      next(error);
    }
  },

  // Add asset performance data
  addPerformanceData: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { date, value, growth, yield: yieldValue } = req.body;
      
      // Add performance data using service
      const performance = await assetService.addPerformanceData(id, {
        date: new Date(date),
        value: parseFloat(value),
        growth: parseFloat(growth),
        yield: parseFloat(yieldValue),
      });

      res.status(201).json({
        status: 'success',
        message: 'Performance data added successfully',
        data: {
          performance,
        },
      });
    } catch (error) {
      logger.error('Failed to add asset performance data', { error });
      next(error);
    }
  },
}; 