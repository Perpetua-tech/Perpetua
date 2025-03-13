import { PrismaClient } from '@prisma/client';
import { assetService } from '../assetService';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

// Mock the PrismaClient
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockDeep<PrismaClient>()),
}));

// Create a mock instance of the Prisma client
const prismaMock = new PrismaClient() as unknown as DeepMockProxy<PrismaClient>;

// Reset the mock before each test
beforeEach(() => {
  mockReset(prismaMock);
});

describe('Asset Service', () => {
  describe('createAsset', () => {
    it('should create an asset successfully', async () => {
      // Setup the mock response
      const mockAsset = {
        id: 'test-id',
        name: 'Test Asset',
        type: 'real_estate',
        location: 'Test Location',
        description: 'Test Description',
        totalValue: 100000,
        availableAmount: 80000,
        minInvestment: 1000,
        expectedReturn: 10,
        duration: 36,
        imageUrl: 'https://example.com/image.jpg',
        risk: 'medium',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      prismaMock.asset.create.mockResolvedValue(mockAsset);
      
      // Execute the service method
      const result = await assetService.createAsset({
        name: 'Test Asset',
        type: 'real_estate',
        location: 'Test Location',
        description: 'Test Description',
        totalValue: 100000,
        availableAmount: 80000,
        minInvestment: 1000,
        expectedReturn: 10,
        duration: 36,
        imageUrl: 'https://example.com/image.jpg',
        risk: 'medium',
      });
      
      // Assertions
      expect(result).toEqual(mockAsset);
      expect(prismaMock.asset.create).toHaveBeenCalledTimes(1);
      expect(prismaMock.asset.create).toHaveBeenCalledWith({
        data: {
          name: 'Test Asset',
          type: 'real_estate',
          location: 'Test Location',
          description: 'Test Description',
          totalValue: 100000,
          availableAmount: 80000,
          minInvestment: 1000,
          expectedReturn: 10,
          duration: 36,
          imageUrl: 'https://example.com/image.jpg',
          risk: 'medium',
          status: 'active',
        },
      });
    });
  });

  describe('findById', () => {
    it('should find an asset by ID', async () => {
      // Setup the mock response
      const mockAsset = {
        id: 'test-id',
        name: 'Test Asset',
        type: 'real_estate',
        location: 'Test Location',
        description: 'Test Description',
        totalValue: 100000,
        availableAmount: 80000,
        minInvestment: 1000,
        expectedReturn: 10,
        duration: 36,
        imageUrl: 'https://example.com/image.jpg',
        risk: 'medium',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      prismaMock.asset.findUnique.mockResolvedValue(mockAsset);
      
      // Execute the service method
      const result = await assetService.findById('test-id');
      
      // Assertions
      expect(result).toEqual(mockAsset);
      expect(prismaMock.asset.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaMock.asset.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-id' },
      });
    });

    it('should return null if asset not found', async () => {
      // Setup the mock response
      prismaMock.asset.findUnique.mockResolvedValue(null);
      
      // Execute the service method
      const result = await assetService.findById('non-existent-id');
      
      // Assertions
      expect(result).toBeNull();
      expect(prismaMock.asset.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaMock.asset.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
      });
    });
  });

  describe('getAssetPerformance', () => {
    it('should return performance data for an asset', async () => {
      // Setup the mock response
      const mockPerformance = [
        {
          id: 'perf-1',
          assetId: 'test-id',
          date: new Date(),
          value: 105000,
          growth: 2.5,
          yield: 0.8,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'perf-2',
          assetId: 'test-id',
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          value: 102000,
          growth: 1.5,
          yield: 0.7,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];
      
      prismaMock.performance.findMany.mockResolvedValue(mockPerformance);
      
      // Execute the service method
      const result = await assetService.getAssetPerformance('test-id', {
        from: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        to: new Date(),
      });
      
      // Assertions
      expect(result).toEqual(mockPerformance);
      expect(prismaMock.performance.findMany).toHaveBeenCalledTimes(1);
      expect(prismaMock.performance.findMany).toHaveBeenCalledWith({
        where: {
          assetId: 'test-id',
          date: {
            gte: expect.any(Date),
            lte: expect.any(Date),
          },
        },
        orderBy: {
          date: 'asc',
        },
      });
    });
  });
}); 