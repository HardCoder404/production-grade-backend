import { logger } from '@/lib/winston';
import { genUsername } from '@/utils';

// Import Models
import { generateAccessToken, generateRefreshToken } from '@/lib/jwt';
import User from '@/models/user';
import Token from '@/models/token';

// Import Types
import type { Request, Response } from 'express';
import type { IUser } from '@/models/user';
import config from '@/config';

type UserData = Pick<IUser, 'email' | 'password' | 'role'>;

const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password, role } = req.body as UserData;

  if (role === 'admin' && !config.WHITELIST_ADMINS_MAIL?.includes(email)) {
    res.status(403).json({
      code: 'AuthorizationError',
      message: 'You cannot register as an Admin',
    });

    logger.warn(
      `User with this ${email} tried to register as an admin but is not in the whitelist`,
    );
    return;
  }

  try {
    const username = genUsername();

    const newUser = await User.create({
      username,
      email,
      password,
      role,
    });

    // Generate access token and refresh token for new user
    const accessToken = generateAccessToken(newUser._id);
    const refreshToken = generateRefreshToken(newUser._id);

    // Store refresh token in db
    await Token.create({
      token: refreshToken,
      userId: newUser._id,
    });

    logger.info('Refresh token created for user', {
      userId: newUser._id,
      token: refreshToken,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
      accessToken,
    });

    logger.info(`New user registered Successfully:`, {
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
    });
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Internal Server Error',
      error: error,
      code: 'ServerError',
    });

    logger.error(`Error during user registration: ${error}`);
  }
};

export default register;
