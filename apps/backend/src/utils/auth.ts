import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config';

/**
 * Generate JWT token for a user
 * @param user User object containing id, walletAddress, and role
 * @returns JWT token string
 */
export const generateToken = (user: { id: string; walletAddress: string; role: string }) => {
  return jwt.sign(
    { 
      id: user.id, 
      walletAddress: user.walletAddress, 
      role: user.role 
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn } as SignOptions
  );
};

/**
 * Verify JWT token
 * @param token JWT token string
 * @returns Decoded token payload or null if invalid
 */
export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (error) {
    return null;
  }
}; 