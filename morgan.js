const morgan = require('morgan');
const rfs = require('rotating-file-stream');
const path = require('path');

// Create a rotating write stream for access logs
const accessLogStream = rfs.createStream('access.log', {
    interval: '1d', // Rotate daily
    path: path.join(__dirname, 'logs'),
});

// Setup Morgan middleware
const morganMiddleware = morgan('combined', {
    stream: accessLogStream, // Log to the rotating file
    skip: (req, res) => res.statusCode < 400, // Optional: Skip logging for successful requests
});

module.exports = morganMiddleware;
