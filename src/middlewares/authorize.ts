import { logger } from '@/lib/winston';
import User from '@/models/user';

// Types
import type { Request, Response, NextFunction } from 'express';

export type authRole = 'user' | 'admin';

const authorize = (roles: authRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;

    try {
      const user = await User.findById(userId).select('role').exec();

      if (!user) {
        res.status(400).json({
          code: 'NotFound',
          message: 'User not found',
        });
        return;
      }

      if (!roles.includes(user.role)) {
        res.status(403).json({
          code: 'AuthorizationError',
          message: 'Access denied, insufficient permissions',
        });
        return;
      }

      return next();
    } catch (error) {
      res.status(500).json({
        code: 'ServerError',
        message: 'Internal server error',
        error: error,
      });

      logger.error('Error while authorizing user', error);
    }
  };
};

export default authorize;
