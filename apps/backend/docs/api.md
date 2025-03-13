# Perpetua API Documentation

## Overview

The Perpetua API provides endpoints for managing assets, investments, referrals, and transactions. This document describes the available endpoints, request parameters, and response formats.

## Base URL

```
https://api.perpetua.ltd/api/v1
```

## Authentication

Most endpoints require authentication. To authenticate, include a bearer token in the Authorization header:

```
Authorization: Bearer <token>
```

The token can be obtained from the `/auth/login` endpoint.

## Endpoints

### Authentication

#### Login with Wallet

```
POST /auth/login
```

Login using a wallet signature.

**Request Body:**

```json
{
  "walletAddress": "0x1234567890123456789012345678901234567890",
  "signature": "0x..."
}
```

**Response:**

```json
{
  "status": "success",
  "message": "Authentication successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-id",
      "walletAddress": "0x1234567890123456789012345678901234567890",
      "username": "user1",
      "role": "user"
    }
  }
}
```

### Assets

#### Get All Assets

```
GET /assets
```

Retrieve a list of all available assets with optional filtering.

**Query Parameters:**

- `type` (string, optional): Filter by asset type (e.g., "real_estate", "agriculture")
- `location` (string, optional): Filter by location
- `minValue` (number, optional): Minimum total value
- `maxValue` (number, optional): Maximum total value
- `status` (string, optional): Filter by status (e.g., "active", "inactive", "completed")
- `page` (integer, optional): Page number for pagination (default: 1)
- `limit` (integer, optional): Number of items per page (default: 10, max: 100)

**Response:**

```json
{
  "status": "success",
  "data": {
    "assets": [
      {
        "id": "asset-id-1",
        "name": "Luxury Villa in Bali",
        "type": "real_estate",
        "location": "Bali, Indonesia",
        "description": "A luxury villa located in the heart of Bali with ocean view.",
        "totalValue": 500000,
        "availableAmount": 400000,
        "minInvestment": 1000,
        "expectedReturn": 12.5,
        "duration": 60,
        "imageUrl": "https://example.com/assets/villa-bali.jpg",
        "risk": "medium",
        "status": "active",
        "createdAt": "2023-01-01T00:00:00.000Z",
        "updatedAt": "2023-01-01T00:00:00.000Z"
      },
      // More assets...
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 10,
      "pages": 10
    }
  }
}
```

#### Get Asset by ID

```
GET /assets/:id
```

Retrieve detailed information about a specific asset.

**Response:**

```json
{
  "status": "success",
  "data": {
    "asset": {
      "id": "asset-id-1",
      "name": "Luxury Villa in Bali",
      "type": "real_estate",
      "location": "Bali, Indonesia",
      "description": "A luxury villa located in the heart of Bali with ocean view.",
      "totalValue": 500000,
      "availableAmount": 400000,
      "minInvestment": 1000,
      "expectedReturn": 12.5,
      "duration": 60,
      "imageUrl": "https://example.com/assets/villa-bali.jpg",
      "risk": "medium",
      "status": "active",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  }
}
```

#### Create Asset (Admin only)

```
POST /assets
```

Create a new asset.

**Request Body:**

```json
{
  "name": "Luxury Villa in Bali",
  "type": "real_estate",
  "location": "Bali, Indonesia",
  "description": "A luxury villa located in the heart of Bali with ocean view.",
  "totalValue": 500000,
  "availableAmount": 400000,
  "minInvestment": 1000,
  "expectedReturn": 12.5,
  "duration": 60,
  "imageUrl": "https://example.com/assets/villa-bali.jpg",
  "risk": "medium"
}
```

**Response:**

```json
{
  "status": "success",
  "message": "Asset created successfully",
  "data": {
    "asset": {
      "id": "new-asset-id",
      "name": "Luxury Villa in Bali",
      // Other asset fields...
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  }
}
```

#### Update Asset (Admin only)

```
PUT /assets/:id
```

Update an existing asset.

**Request Body:**

```json
{
  "name": "Updated Villa Name",
  "status": "inactive",
  // Other fields to update...
}
```

**Response:**

```json
{
  "status": "success",
  "message": "Asset updated successfully",
  "data": {
    "asset": {
      "id": "asset-id",
      "name": "Updated Villa Name",
      "status": "inactive",
      // Other asset fields...
      "updatedAt": "2023-01-02T00:00:00.000Z"
    }
  }
}
```

#### Delete Asset (Admin only)

```
DELETE /assets/:id
```

Delete an asset (mark as inactive).

**Response:**

```json
{
  "status": "success",
  "message": "Asset deleted successfully"
}
```

#### Get Asset Investors (Admin only)

```
GET /assets/:id/investors
```

Get a list of investors for a specific asset.

**Query Parameters:**

- `page` (integer, optional): Page number for pagination (default: 1)
- `limit` (integer, optional): Number of items per page (default: 10, max: 100)

**Response:**

```json
{
  "status": "success",
  "data": {
    "investors": [
      {
        "id": "user-id-1",
        "username": "investor1",
        "investment": {
          "id": "investment-id-1",
          "amount": 5000,
          "status": "active",
          "createdAt": "2023-01-15T00:00:00.000Z"
        }
      },
      // More investors...
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "pages": 5
    }
  }
}
```

#### Get Asset Performance

```
GET /assets/:id/performance
```

Get performance metrics for an asset over time.

**Query Parameters:**

- `period` (string, optional): Predefined period ("1m", "3m", "6m", "1y", "all")
- `from` (ISO date, optional): Start date for custom range
- `to` (ISO date, optional): End date for custom range

**Response:**

```json
{
  "status": "success",
  "data": {
    "performance": [
      {
        "id": "perf-id-1",
        "date": "2023-01-01T00:00:00.000Z",
        "value": 500000,
        "growth": 0,
        "yield": 0
      },
      {
        "id": "perf-id-2",
        "date": "2023-02-01T00:00:00.000Z",
        "value": 505000,
        "growth": 1.0,
        "yield": 0.8
      },
      // More performance data points...
    ]
  }
}
```

### Investments

#### Create Investment

```
POST /investments
```

Create a new investment in an asset.

**Request Body:**

```json
{
  "assetId": "asset-id",
  "amount": 5000
}
```

**Response:**

```json
{
  "status": "success",
  "message": "Investment created successfully",
  "data": {
    "investment": {
      "id": "investment-id",
      "assetId": "asset-id",
      "userId": "user-id",
      "amount": 5000,
      "status": "active",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    },
    "transaction": {
      "id": "transaction-id",
      "type": "invest",
      "amount": 5000,
      "status": "pending",
      "createdAt": "2023-01-01T00:00:00.000Z"
    }
  }
}
```

#### Get Investment by ID

```
GET /investments/:id
```

Get details of a specific investment.

**Response:**

```json
{
  "status": "success",
  "data": {
    "investment": {
      "id": "investment-id",
      "assetId": "asset-id",
      "userId": "user-id",
      "amount": 5000,
      "status": "active",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z",
      "asset": {
        "id": "asset-id",
        "name": "Luxury Villa in Bali",
        // Basic asset info...
      }
    }
  }
}
```

#### Get Investment Earnings

```
GET /investments/:id/earnings
```

Get earnings history for a specific investment.

**Query Parameters:**

- `page` (integer, optional): Page number for pagination (default: 1)
- `limit` (integer, optional): Number of items per page (default: 10, max: 100)

**Response:**

```json
{
  "status": "success",
  "data": {
    "earnings": [
      {
        "id": "earning-id-1",
        "amount": 50,
        "date": "2023-02-01T00:00:00.000Z",
        "status": "paid"
      },
      {
        "id": "earning-id-2",
        "amount": 50,
        "date": "2023-03-01T00:00:00.000Z",
        "status": "pending"
      },
      // More earnings...
    ],
    "pagination": {
      "total": 12,
      "page": 1,
      "limit": 10,
      "pages": 2
    }
  }
}
```

#### Withdraw Earnings

```
POST /investments/:id/withdraw
```

Withdraw available earnings from an investment.

**Response:**

```json
{
  "status": "success",
  "message": "Earnings withdrawn successfully",
  "data": {
    "transaction": {
      "id": "transaction-id",
      "type": "withdraw_earnings",
      "amount": 150,
      "status": "pending",
      "createdAt": "2023-01-01T00:00:00.000Z"
    }
  }
}
```

#### Redeem Investment

```
POST /investments/:id/redeem
```

Redeem an investment (withdraw principal).

**Response:**

```json
{
  "status": "success",
  "message": "Investment redeemed successfully",
  "data": {
    "transaction": {
      "id": "transaction-id",
      "type": "redeem_investment",
      "amount": 5000,
      "status": "pending",
      "createdAt": "2023-01-01T00:00:00.000Z"
    }
  }
}
```

### Referrals

#### Generate Referral Link

```
POST /referrals/generate
```

Generate a new referral link/code.

**Response:**

```json
{
  "status": "success",
  "data": {
    "referralLink": "https://perpetua.ltd/ref/abc123",
    "referralCode": "abc123"
  }
}
```

#### Use Referral Code

```
POST /referrals/use
```

Use a referral code (typically during registration).

**Request Body:**

```json
{
  "code": "abc123"
}
```

**Response:**

```json
{
  "status": "success",
  "message": "Referral code applied successfully",
  "data": {
    "valid": true,
    "referrer": {
      "username": "user1"
    }
  }
}
```

#### Get Referral Rewards

```
GET /referrals/rewards
```

Get rewards earned from referrals.

**Response:**

```json
{
  "status": "success",
  "data": {
    "total": 250,
    "available": 150,
    "withdrawn": 100,
    "rewards": [
      {
        "id": "reward-id-1",
        "amount": 50,
        "type": "signup",
        "status": "paid",
        "createdAt": "2023-01-15T00:00:00.000Z"
      },
      {
        "id": "reward-id-2",
        "amount": 100,
        "type": "investment",
        "status": "pending",
        "createdAt": "2023-01-20T00:00:00.000Z"
      },
      // More rewards...
    ]
  }
}
```

#### Withdraw Referral Rewards

```
POST /referrals/rewards/withdraw
```

Withdraw available referral rewards.

**Response:**

```json
{
  "status": "success",
  "message": "Rewards withdrawn successfully",
  "data": {
    "transaction": {
      "id": "transaction-id",
      "type": "withdraw_rewards",
      "amount": 150,
      "status": "pending",
      "createdAt": "2023-01-01T00:00:00.000Z"
    }
  }
}
```

### Transactions

#### Get Transaction History

```
GET /transactions
```

Get user's transaction history.

**Query Parameters:**

- `type` (string, optional): Filter by transaction type
- `status` (string, optional): Filter by status
- `from` (ISO date, optional): Start date
- `to` (ISO date, optional): End date
- `page` (integer, optional): Page number for pagination (default: 1)
- `limit` (integer, optional): Number of items per page (default: 10, max: 100)

**Response:**

```json
{
  "status": "success",
  "data": {
    "transactions": [
      {
        "id": "transaction-id-1",
        "type": "invest",
        "amount": 5000,
        "status": "completed",
        "txHash": "0x...",
        "createdAt": "2023-01-01T00:00:00.000Z",
        "updatedAt": "2023-01-01T00:00:00.000Z"
      },
      {
        "id": "transaction-id-2",
        "type": "withdraw_earnings",
        "amount": 150,
        "status": "pending",
        "createdAt": "2023-01-15T00:00:00.000Z",
        "updatedAt": "2023-01-15T00:00:00.000Z"
      },
      // More transactions...
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 10,
      "pages": 5
    }
  }
}
```

#### Get Transaction by ID

```
GET /transactions/:id
```

Get details of a specific transaction.

**Response:**

```json
{
  "status": "success",
  "data": {
    "transaction": {
      "id": "transaction-id",
      "type": "invest",
      "amount": 5000,
      "status": "completed",
      "txHash": "0x...",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  }
}
```

## Error Responses

All endpoints use a standard error response format:

```json
{
  "status": "error",
  "message": "Error message describing what went wrong",
  "error": {
    "code": "ERROR_CODE",
    "details": {
      // Additional error details, if available
    }
  }
}
```

## HTTP Status Codes

- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required or failed
- `403 Forbidden`: Permission denied
- `404 Not Found`: Resource not found
- `422 Unprocessable Entity`: Validation errors
- `500 Internal Server Error`: Server error

## Rate Limiting

API requests are limited to 100 requests per minute per API key. Rate limit information is included in the response headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1625097600
```

When the rate limit is exceeded, the API will return a `429 Too Many Requests` status code. 