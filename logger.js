const { createLogger, format, transports } = require('winston');
const path = require('path');

// Define log format
const logFormat = format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Timestamp format
    format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`) // Readable log format
);

// Configure Winston logger
const logger = createLogger({
    level: 'info', // Default logging level
    format: logFormat,
    transports: [
        // Log errors to a specific file
        new transports.File({ filename: path.join(__dirname, 'logs', 'error.log'), level: 'error' }),

        // Log all messages to a combined log file
        new transports.File({ filename: path.join(__dirname, 'logs', 'combined.log') }),

        // Console logging for development purposes
        new transports.Console({
            format: format.combine(format.colorize(), logFormat),
        }),
    ],
    exceptionHandlers: [
        // Handle exceptions by logging them to a separate file
        new transports.File({ filename: path.join(__dirname, 'logs', 'exceptions.log') }),
    ],
    rejectionHandlers: [
        // Handle promise rejections by logging them
        new transports.File({ filename: path.join(__dirname, 'logs', 'rejections.log') }),
    ],
});

// Export the configured logger
module.exports = logger;
