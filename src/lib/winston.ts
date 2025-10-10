import winston from 'winston';
import config from '@/config';

const { combine, timestamp, json, errors, align, printf, colorize } =
  winston.format;

const transports: winston.transport[] = [];

if (config.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }), // Add color to console output
        timestamp({ format: 'YYYY-MM-DD hh:mm:ss A' }),
        align(),
        printf(({ timestamp, level, message, ...meta }) => {
          const metaString = Object.keys(meta).length
            ? `\n${JSON.stringify(meta)}`
            : '';
          return `[${timestamp}] [${level}]: ${message} ${metaString}`;
        }),
      ),
    }),
  );
}

// create a logger instance using winston
const logger = winston.createLogger({
  level: config.LOG_LEVEL || 'info',
  format: combine(
    timestamp(),
    errors({ stack: true }), // Capture stack trace for errors
    json(), // Log in JSON format for better structure
  ),
  transports,
  silent: config.NODE_ENV === 'test', // Disable logging in test environment
});

export { logger };
