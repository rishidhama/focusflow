const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Health check - ABSOLUTE FIRST - before ANY middleware
// Railway checks this immediately on startup
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.head('/health', (req, res) => {
  res.status(200).end();
});

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

// Request logging middleware
app.use((req, res, next) => {
  if (req.path !== '/health') {
    console.log(`${req.method} ${req.path}`);
  }
  next();
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

// Routes - wrap in try-catch to prevent crashes
try {
  app.use('/api/auth', require('./routes/auth'));
  console.log('✓ Auth routes loaded');
} catch (error) {
  console.error('Error loading auth routes:', error);
}

try {
  app.use('/api/tasks', require('./routes/tasks'));
  console.log('✓ Task routes loaded');
} catch (error) {
  console.error('Error loading task routes:', error);
}

try {
  app.use('/api/subjects', require('./routes/subjects'));
  console.log('✓ Subject routes loaded');
} catch (error) {
  console.error('Error loading subject routes:', error);
}

try {
  app.use('/api/sessions', require('./routes/sessions'));
  console.log('✓ Session routes loaded');
} catch (error) {
  console.error('Error loading session routes:', error);
}

try {
  app.use('/api/analytics', require('./routes/analytics'));
  console.log('✓ Analytics routes loaded');
} catch (error) {
  console.error('Error loading analytics routes:', error);
}

try {
  app.use('/api/sync', require('./routes/sync'));
  console.log('✓ Sync routes loaded');
} catch (error) {
  console.error('Error loading sync routes:', error);
}

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
console.log('All environment variables:', Object.keys(process.env).filter(k => k.includes('PORT') || k.includes('RAILWAY')));

// Make sure we're listening on all interfaces for Railway
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✓ Health check: http://0.0.0.0:${PORT}/health`);
  console.log(`✓ Server is ready to accept connections`);
  console.log(`✓ Listening on 0.0.0.0:${PORT} (all interfaces)`);
  
  // Test that server is actually listening
  const address = server.address();
  console.log(`✓ Server address:`, address);
});

// Ensure server doesn't crash on errors
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

// Handle server errors
server.on('error', (err) => {
  console.error('Server error:', err);
});

