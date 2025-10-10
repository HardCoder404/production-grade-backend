import { generateAccessToken, generateRefreshToken } from '@/lib/jwt';
import config from '@/config';
import { logger } from '@/lib/winston';

// Models
import User from '@/models/user';
import Token from '@/models/token';

// Types
import { Request, Response } from 'express';
import { IUser } from '@/models/user';

type UserData = Pick<IUser, 'email' | 'password'>;

const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as UserData;
  try {
    const user = await User.findOne({ email })
      .select('username email password role')
      .lean()
      .exec();

    if (!user) {
      res.status(404).json({
        code: 'NotFound',
        message: 'User not found',
      });
      return;
    }

    // Generate access token and refresh token for new user
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Store refresh token in db
    await Token.create({
      token: refreshToken,
      userId: user._id,
    });

    logger.info('Refresh token created for user', {
      userId: user._id,
      token: refreshToken,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(200).json({
      message: 'User logged in successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      accessToken,
    });

    logger.info(`User logged in`, user);
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Internal Server Error',
      error: error,
      code: 'ServerError',
    });

    logger.error(`Error during login: ${error}`);
  }
};

export default login;
