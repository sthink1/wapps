// Load environment variables
require('dotenv').config();
// Test-only Group 0d guard: execute before importing any routes or opening MySQL.
const stage6Env = require('./services/stage6Environment');

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
const ftPrivacy = require('./routes/ftPrivacy');
const subscriptionRoutes = require('./routes/subscriptions');
const notificationRoutes = require('./routes/notifications');
const tnnaRoutes = require('./routes/tnna');
const adminManagementRoutes = require('./routes/adminManagement');
const { authenticateToken, requireAppAccess } = require('./middleware/subscriptionAccess');
const usageActivity = require('./middleware/usageActivity');

const { pool: rateCleanupPool, ready: dbReady } = require('./dbConnection');
const resetRateCleanup = require('./services/passwordResetRateCleanup');

const app = express();
const port = process.env.PORT || 8080;

// Ensure the logs directory exists
const logDirectory = path.join(__dirname, 'logs');
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

// Middleware Configuration
// Existing public/native CORS origins remain readable, but credentialed browser
// requests are authorized only from the ONE explicitly configured WA origin.
app.use(cors((req, callback) => {
  const origin = req.get('Origin');
  const browserAllowed = Boolean(origin && stage6Env.current.allowedOrigins.includes(origin));
  const legacyAllowed = Boolean(origin && stage6Env.LEGACY_CORS_ORIGINS.includes(origin));
  callback(null, {
    origin: browserAllowed || legacyAllowed ? origin : false,
    credentials: browserAllowed,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-FT-Page-Token'],
  });
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
  // Validate form input before invoking the email template or delivery service.
  // The public response shape remains {status, message} for Contact Us.
  const input = req.body || {};
  const { name, email, phone, subject, message } = input;
  const required = [name, email, subject, message];
  if (required.some(value => typeof value !== 'string' || !value.trim()) ||
      (phone != null && typeof phone !== 'string')) {
    return res.status(400).json({
      status: 'error',
      message: 'All required fields must be filled.',
    });
  }

  try {
    const response = await sendEmail({ name, email, phone, subject, message });
    res.json(response);
  } catch (_) {
    // Do not expose unexpected JavaScript, transport, or provider error messages.
    logger.error('Contact form request failed (details omitted)');
    res.status(400).json({
      status: 'error',
      message: 'Unable to send your message at this time.',
    });
  }
});

// Root route to serve home.html for PWA
app.get('/', (req, res) => {
  logger.info('Root endpoint hit, serving home.html');
  res.sendFile(path.join(__dirname, 'httpdocs', 'home.html'));
});

// API routes
// Stage 6 R08/R16: prevent storage of authentication and account responses,
// including failures returned before individual route handlers execute.
app.use('/users', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
}, userRoutes);
// Stage 6 R16: subscription/account entitlement responses must not be stored,
// including authentication and authorization failures.
app.use('/subscriptions', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
}, subscriptionRoutes);
// Stage 6 administrator designations and one-time transfer completion.
// The transfer routes enforce their own signed-session and origin requirements.
app.use('/admin-management', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
}, adminManagementRoutes);
// Stage 6 R16: prevent storage of personal, admin, and native API responses.
// Apply before the routers so their 200/401/403/error responses are covered.
// Keep static assets and unrelated public routes on their existing cache policy.
app.use([
  '/notifications',
  '/track',
  '/tnna',
  '/weights',
  '/activities',
  '/weightActivities',
  '/interestEarned',
  '/budget',
  '/familytree',
  '/etf'
], (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});
app.use('/notifications', notificationRoutes);
app.use('/track', trackRoutes);
app.use('/tnna', tnnaRoutes);

// Subscription-protected data/API applications.  The browser UI also disables
// unavailable buttons, but these server checks are the actual cost/security gate.
app.use('/weights', authenticateToken, requireAppAccess('weigh_in'), usageActivity('weigh_in'), weightsRoutes);
app.use('/activities', authenticateToken, requireAppAccess('weigh_in'), usageActivity('weigh_in'), activitiesRoutes);
app.use('/weightActivities', authenticateToken, requireAppAccess('weigh_in'), usageActivity('weigh_in'), weightActivitiesRoutes);
app.use('/interestEarned', authenticateToken, requireAppAccess('interest_earned'), usageActivity('interest_earned'), interestEarnedRoutes);
app.use('/budget', authenticateToken, requireAppAccess('budget'), usageActivity('budget'), budgetRoutes);
// Email ownership confirmation is a one-time public-token workflow. A recipient
// may open the emailed link without having logged into Wonderful Apps.
// Only these exact GET/POST paths bypass authentication; all other Family Tree
// endpoints remain subject to the existing subscription and login protections.
app.use('/familytree', (req, res, next) => {
  const isEmailVerification =
    (req.method === 'GET' || req.method === 'POST') &&
    /^\/contact-email-verification\/[0-9a-f]{64}$/i.test(req.path);
  if (isEmailVerification) return familyTreeRoutes(req, res, next);
  next();
});
// Token-based approval must be reachable from email without a login. This is limited to one public endpoint.
app.use('/familytree/privacy-verify', ftPrivacy.publicRouter);
app.use('/familytree/privacy', authenticateToken, requireAppAccess('family_tree'), ftPrivacy.privateRouter);
// Full Family Tree stays protected by existing auth and subscription access.
app.use('/familytree', authenticateToken, requireAppAccess('family_tree'), usageActivity('family_tree'), ftPrivacy.protection, familyTreeRoutes);

app.use('/etf', authenticateToken, requireAppAccess('etf_investing'), usageActivity('etf_investing'), etfRoutes);

// Property Info is currently classified as Standard/local-low-cost.
// Keep its existing geocode route behavior unchanged until its external cost model is finalized.
app.use('/api/geocode', require('./routes/geocode'));

// Catch-all route for undefined endpoints
app.use((req, res) => {
  // Do not log raw URLs: query strings and path segments may contain security tokens.
  logger.error('404 - Not Found (request URL omitted)');
  res.status(404).json({ error: 'Endpoint not found' });
});

// Centralized Error-Handling Middleware
app.use((err, req, res, next) => {
  // Error messages can contain URLs, tokens, or other untrusted details.
  // Preserve the HTTP status for diagnostics without persisting the message.
  const statusCode = Number.isInteger(err && err.status) && err.status >= 400 && err.status <= 599
    ? err.status
    : 500;
  // Preserve explicitly supplied client-error messages, but never expose an
  // unexpected exception's message or stack trace to the HTTP caller.
  const publicMessage = statusCode >= 500
    ? 'Internal Server Error'
    : (typeof err.message === 'string' && err.message ? err.message : 'Request failed');
  logger.error(`Request error (HTTP ${statusCode}; message omitted)`);
  res.status(statusCode).json({
    error: {
      message: publicMessage,
    },
  });
});

// Do not listen or start maintenance until connected DB identity and UTC are proven.
async function start() {
  await dbReady;
  await stage6Env.verifyDatabaseIdentity(rateCleanupPool);
  app.listen(port, () => {
    resetRateCleanup.start(rateCleanupPool, logger);
    logger.info(`Server running at http://localhost:${port} (WA_ENV=${stage6Env.current.mode}; test DB verified)`);
    console.log(`Stage 6 environment: ${stage6Env.current.mode}; test DB verified`);
  });
}
start().catch(err => {
  console.error(`Stage 6 startup refused: ${err.message}`);
  rateCleanupPool.end().catch(()=>{}).finally(()=>{ process.exitCode=1; });
});
