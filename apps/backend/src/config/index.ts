import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({
  path: process.env.NODE_ENV === 'production'
    ? path.resolve(process.cwd(), '.env.production')
    : path.resolve(process.cwd(), '.env.development'),
});

interface Config {
  nodeEnv: string;
  port: number;
  databaseUrl: string;
  redisUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  solanaRpcUrl: string;
  solanaNetwork: string;
  programId: string;
  corsOrigin: string | RegExp | Array<string | RegExp>;
  rateLimitWindowMs: number;
  rateLimitMax: number;
}

export const config: Config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/perpetua',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  jwtSecret: process.env.JWT_SECRET || 'dev_jwt_secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  solanaRpcUrl: process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  solanaNetwork: process.env.SOLANA_NETWORK || 'devnet',
  programId: process.env.PROGRAM_ID || '',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
}; 