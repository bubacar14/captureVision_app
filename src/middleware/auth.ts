import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Request type to include user
export interface AuthRequest extends Request {
  user?: any;
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    console.log('Auth middleware - Headers:', req.headers);
    
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log('No authorization header found');
      return res.status(401).json({
        success: false,
        error: 'No authorization token provided'
      });
    }

    if (!authHeader.startsWith('Bearer ')) {
      console.log('Invalid authorization header format');
      return res.status(401).json({
        success: false,
        error: 'Invalid authorization header format'
      });
    }

    const token = authHeader.split(' ')[1];
    console.log('Token received:', token.substring(0, 10) + '...');

    try {
      const decoded = jwt.verify(token, 'your-secret-key');
      console.log('Token decoded successfully:', decoded);
      req.user = decoded;
      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const auth = authenticateToken;
