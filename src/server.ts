import express from 'express';
import cors from 'cors';
import type { CorsOptions } from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import helmet from 'helmet';

// Custom Module imports
import limiter from '@/lib/express_rate_limit';
import config from '@/config';
import v1Routes from '@/routes/v1';
import { connectToDatabase, disconnectFromDatabase } from '@/lib/mongoose';
import { logger } from '@/lib/winston';

// Initialize Express app
const app = express();

// CORS configuration
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || config.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(
        new Error(`CORS Error: Origin ${origin} not allowed by CORS`),
        false,
      );
    }
    logger.warn(`CORS Error: Origin ${origin} not allowed by CORS`);
  },
};
// Apply CORS middleware
app.use(cors(corsOptions));

// Enabling JSON request body parsing and URL-encoded form data parsing
app.use(express.json());                     
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
// Enable response compression to reduce payload size and improve performance
app.use(
  compression({
    threshold: 1024, // Only Compress responses larger than 1KB
  }),
);

// Use Helmet to enhance API security by setting various HTTP headers
app.use(helmet());

// Apply rate limiting middleware to prevent accessive requests and enhance security
app.use(limiter);

(async () => {
  try {
    await connectToDatabase();
    app.use('/api/v1', v1Routes);

    app.listen(config.PORT, () => {
      logger.info('Server running: http://localhost:' + config.PORT);
    });
  } catch (error) {
    logger.error('Failed to start the server:', error);
    if (config.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
})();

// Handle server shudown gracefully by disconnecting from database and closing server
const serverShutdown = async () => {
  try {
    await disconnectFromDatabase();
   logger.warn('Shutting down server...');
    process.exit(0);
  } catch (error) {
   logger.error('Error during server shutdown:', error);
  }
};

// Listen for termination signals to (`SIGINT`, `SIGTERM`) and initiate server shutdown
// SIGINT - is typically sent when stopping a process from the terminal (Ctrl+C).
// SIGTERM - is a termination signal that can be sent to a process to request its termination.
// When either signal is received, the serverShutdown function is called to handle cleanup and shutdown tasks.
process.on('SIGINT', serverShutdown);
process.on('SIGTERM', serverShutdown);
