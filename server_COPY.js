// Load environment variables
require('dotenv').config();

// Import required modules
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { sendEmail } = require('./send_email');
const morganMiddleware = require('./morgan');
const logger = require('./logger');
const weightsRoutes = require('./routes/weights');
const activitiesRoutes = require('./routes/activities');
const weightActivitiesRoutes = require('./routes/weightActivities');
const userRoutes = require('./routes/users');
const trackRoutes = require('./routes/track');
const interestEarnedRoutes = require('./routes/interestEarned');
const etfRoutes = require('./routes/etf');
const budgetRoutes = require('./routes/budget');
const familyTreeRoutes = require('./routes/familyTree');
const subscriptionRoutes = require('./routes/subscriptions');
const { authenticateToken, requireAppAccess } = require('./middleware/subscriptionAccess');

const app = express();
const port = process.env.PORT || 8080;

// Ensure the logs directory exists
const logDirectory = path.join(__dirname, 'logs');
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

// Middleware Configuration
app.use(cors({
  origin: ['http://localhost', 'http://localhost:8080', 'https://wapps.helioho.st', 'https://wapps-ypez.onrender.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const multipartNone = multer().none();
app.use((req, res, next) => {
  // FamilyTree profile upload uses its own multer middleware.
  if (req.path.startsWith('/familytree/') && req.is('multipart/form-data')) return next();
  return multipartNone(req, res, next);
});

// Serve static files with cache control
app.use(express.static(path.join(__dirname, 'httpdocs'), {
  maxAge: '1d', // Keep caching for ordinary static assets
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      // Always revalidate HTML so development changes appear on normal refresh.
      res.set('Cache-Control', 'no-cache');
    } else if (filePath.endsWith('manifest.json')) {
      res.set('Content-Type', 'application/manifest+json');
    } else if (filePath.endsWith('sw.js')) {
      res.set('Content-Type', 'application/javascript');
      res.set('Cache-Control', 'no-cache'); // Prevent caching service worker
    }
  }
}));
app.use(morganMiddleware);

logger.info('Middleware setup complete: CORS, JSON parsing, URL-encoded parsing, multipart parsing, static file serving with cache control, Morgan logging');

// Send Email Endpoint
app.post('/send-email', async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  try {
    const response = await sendEmail({ name, email, phone, subject, message });
    res.json(response);
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
});

// Root route to serve home.html for PWA
app.get('/', (req, res) => {
  logger.info('Root endpoint hit, serving home.html');
  res.sendFile(path.join(__dirname, 'httpdocs', 'home.html'));
});

// API routes
app.use('/users', userRoutes);
app.use('/subscriptions', subscriptionRoutes);
app.use('/track', trackRoutes);

// Subscription-protected data/API applications.  The browser UI also disables
// unavailable buttons, but these server checks are the actual cost/security gate.
app.use('/weights', authenticateToken, requireAppAccess('weigh_in'), weightsRoutes);
app.use('/activities', authenticateToken, requireAppAccess('weigh_in'), activitiesRoutes);
app.use('/weightActivities', authenticateToken, requireAppAccess('weigh_in'), weightActivitiesRoutes);
app.use('/interestEarned', authenticateToken, requireAppAccess('interest_earned'), interestEarnedRoutes);
app.use('/budget', authenticateToken, requireAppAccess('budget'), budgetRoutes);
app.use('/familytree', authenticateToken, requireAppAccess('family_tree'), familyTreeRoutes);
app.use('/etf', authenticateToken, requireAppAccess('etf_investing'), etfRoutes);

// Property Info is currently classified as Standard/local-low-cost.
// Keep its existing geocode route behavior unchanged until its external cost model is finalized.
app.use('/api/geocode', require('./routes/geocode'));

// Catch-all route for undefined endpoints
app.use((req, res) => {
  const errorMessage = `404 - Not Found - ${req.originalUrl}`;
  logger.error(errorMessage);
  res.status(404).json({ error: 'Endpoint not found' });
});

// Centralized Error-Handling Middleware
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    error: {
      message: err.message || 'Internal Server Error',
    },
  });
});

// Start the server
app.listen(port, () => {
  logger.info(`Server running at http://localhost:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Server is running on port ${port}`);
  console.log(`Server logs are located at: ${logDirectory}`);
});