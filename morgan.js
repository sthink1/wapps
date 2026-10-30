const morgan = require('morgan');
const rfs = require('rotating-file-stream');
const path = require('path');

// Create a rotating write stream for access logs
const accessLogStream = rfs.createStream('access.log', {
    interval: '1d', // Rotate daily
    path: path.join(__dirname, 'logs'),
});

// Setup Morgan middleware
// Keep useful error-request metadata but omit URL paths, query strings,
// referrers and user agents, all of which can carry attacker-supplied tokens.
// Do not use Morgan's 'combined' format for security-sensitive routes.
const safeErrorFormat = ':remote-addr [:date[clf]] ":method [URL_OMITTED] HTTP/:http-version" :status :res[content-length] :response-time ms';
const morganMiddleware = morgan(safeErrorFormat, {
    stream: accessLogStream, // Log to the rotating file
    skip: (req, res) => res.statusCode < 400, // Optional: Skip logging for successful requests
});

module.exports = morganMiddleware;
