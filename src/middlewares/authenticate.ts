import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

// Custom modules
import { verifyAccessToken } from '@/lib/jwt';
import { logger } from '@/lib/winston';

// Types
import type { Request, Response, NextFunction } from 'express';
import type { Types } from 'mongoose';

const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeaders = req.headers.authorization;

  if (!authHeaders?.startsWith('Bearer ')) {
    res.status(401).json({
      code: 'AuthenticationError',
      message: 'Access denied, no token provided',
    }); 
    return;
  }


  // Split out the token from 'Bearer' prefix
  const [_, token] = authHeaders.split(' ');

  try {
    // Verify the token and extract the userid from the payload
    const jwtPayload = verifyAccessToken(token) as { userId: Types.ObjectId };
    req.userId = jwtPayload.userId;
    
    return next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      res.status(401).json({
        code: 'AuthenticationError',
        message: 'Access token expired, request a new one with refresh token',
      });
      return; 
    }
    if (error instanceof JsonWebTokenError) {
      res.status(401).json({
        code: 'AuthenticationError',
        message: 'Invalid access token',
      });
      return;
    }

    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error: error,
    });
    logger.warn('Error during authentication', error);
  }
};

export default authenticate;
