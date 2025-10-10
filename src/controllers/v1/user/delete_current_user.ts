import { logger } from '@/lib/winston';

// Models
import User from '@/models/user';

// Types
import type { Request, Response } from 'express';

const deleteCurrentUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.userId;

    await User.deleteOne({ _id: userId });

    logger.info('A user account has been deleted', userId);

    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error: error,
    });

    logger.error('Error while deleting current user', error);
  }
};

export default deleteCurrentUser;
