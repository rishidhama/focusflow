const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to database (non-blocking)
connectDB().catch((error) => {
  console.error('Database connection failed:', error);
  // Server will continue to run even if DB connection fails
});

// CORS - MUST be first middleware, before anything else
app.use((req, res, next) => {
  const origin = req.headers.origin;
  res.header('Access-Control-Allow-Origin', origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Also use cors middleware as backup
app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check - MUST be before routes for Railway health checks
// Simple, fast response for Railway health checks (no DB dependency)
app.get('/health', (req, res) => {
  res.status(200).set('Content-Type', 'text/plain').send('OK');
});

// Also respond to root for Railway
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'FocusFlow API is running',
    version: '1.0.0'
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'FocusFlow API is running' });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/subjects', require('./routes/subjects'));
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/sync', require('./routes/sync'));

// Error handler
app.use(errorHandler);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Don't exit, let the server continue running
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Don't exit, let the server continue running
});

// Start server
const PORT = process.env.PORT || 5000;

// Log port info for debugging
console.log('PORT from environment:', process.env.PORT);
console.log('Using PORT:', PORT);

// Make sure we're listening on all interfaces for Railway
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✓ Health check: http://0.0.0.0:${PORT}/health`);
  console.log(`✓ Server is ready to accept connections`);
});

// Ensure server doesn't crash on errors
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

// Handle server errors
server.on('error', (err) => {
  console.error('Server error:', err);
});

