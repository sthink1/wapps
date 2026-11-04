const { createLogger, format, transports } = require('winston');
const path = require('path');
const fs = require('fs');

// Define log format (ordinary, explicitly authored application messages only).
const logFormat = format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)
);

// Keep existing ordinary logging behavior and destinations.
const logger = createLogger({
    level: 'info',
    format: logFormat,
    transports: [
        new transports.File({ filename: path.join(__dirname, 'logs', 'error.log'), level: 'error' }),
        new transports.File({ filename: path.join(__dirname, 'logs', 'combined.log') }),
        new transports.Console({ format: format.combine(format.colorize(), logFormat) }),
    ],
});

// Stage 6 R16: Never pass an unhandled exception or rejection object to Winston,
// JSON.stringify, console, or other automatic formatters. Such objects may include
// passwords, JWTs, URLs containing tokens, private data, or stack traces.
// Synchronous fixed-message writes ensure a diagnostic survives fatal termination.
// This intentionally preserves the previous fatal exit behavior (exit code 1).
let handlingFatal = false;
function recordFatal(kind, fileName) {
    if (handlingFatal) return;
    handlingFatal = true;
    const timestamp = new Date().toISOString();
    const line = `${timestamp} [ERROR]: ${kind} (details omitted)\n`;
    try {
        const directory = path.join(__dirname, 'logs');
        fs.mkdirSync(directory, { recursive: true });
        fs.appendFileSync(path.join(directory, fileName), line, { encoding: 'utf8', mode: 0o600 });
    } catch (_) {
        // Do not print the filesystem exception; it may contain sensitive details.
    }
    try {
        process.stderr.write(line);
    } catch (_) {
        // Never rethrow while handling a fatal error.
    }
    process.exit(1);
}

process.on('uncaughtException', () => {
    recordFatal('Uncaught exception', 'exceptions.log');
});
process.on('unhandledRejection', () => {
    recordFatal('Unhandled promise rejection', 'rejections.log');
});

module.exports = logger;
