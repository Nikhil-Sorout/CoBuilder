import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

/**
 * Extended Request interface to include user information
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    type: string;
  };
}

/**
 * Authentication middleware to verify access tokens
 * Supports both web (cookie) and mobile (Authorization header) authentication
 * 
 * For web: Token is expected in req.cookies.access_token
 * For mobile: Token is expected in Authorization header as "Bearer <token>"
 */
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!jwtSecret) {
      res.status(500).json({ error: 'JWT_SECRET environment variable is not set' });
      return;
    }

    let token: string | undefined;

    // Try to get token from cookie (web)
    // Check both access_token and accessToken for compatibility
    token = req.cookies?.access_token || req.cookies?.accessToken;

    // If not in cookie, try to get from Authorization header (mobile)
    if (!token) {
      const authHeader = req.headers?.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7); // Remove 'Bearer ' prefix
      }
    }

    // If no token found, return 401
    if (!token) {
      res.status(401).json({ error: 'Access token is required' });
      return;
    }

    // Verify the token
    try {
      const decoded = jwt.verify(token, jwtSecret) as { userId: string; type: string };
      
      // Verify it's an access token
      if (decoded.type !== 'access') {
        res.status(401).json({ error: 'Invalid token type' });
        return;
      }

      // Attach user information to request object
      req.user = {
        userId: decoded.userId,
        type: decoded.type,
      };

      // Continue to next middleware/route handler
      next();
    } catch (jwtError) {
      // Token verification failed
      if (jwtError instanceof jwt.JsonWebTokenError) {
        res.status(401).json({ error: 'Invalid or malformed token' });
        return;
      }
      
      if (jwtError instanceof jwt.TokenExpiredError) {
        res.status(401).json({ error: 'Token has expired' });
        return;
      }

      res.status(401).json({ error: 'Token verification failed' });
      return;
    }
  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(500).json({ error: 'Internal server error during authentication' });
    return;
  }
};
