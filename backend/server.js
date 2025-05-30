require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const path = require('path');

// Import auth middleware
const { auth, adminOnly, riderOnly } = require('./src/middleware/auth');

const app = express();

// Configure CORS with options
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5176',
  credentials: true, // Allow cookies to be sent with requests
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

console.log('CORS configured with origin:', process.env.CORS_ORIGIN || 'http://localhost:5176');

// Apply middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser()); // Parse cookies

// Serve static files if needed
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to database.');
});

// Import routes
const usersRouter = require('./src/routes/users');
const companiesRouter = require('./src/routes/companies');
const ridersRouter = require('./src/routes/riders');
const storesRouter = require('./src/routes/stores');
const loginRoute = require('./src/routes/login');
const riderDocumentsRouter = require('./src/routes/rider_documents');
const riderAssignmentsRouter = require('./src/routes/rider_assignments');
const attendanceRouter = require('./src/routes/attendance');
const ordersRoutes = require('./src/routes/orders');

// Public routes
app.use('/api/login', loginRoute);

// Protected routes
app.use('/api/users', auth, usersRouter);
app.use('/api/companies', auth, adminOnly, companiesRouter);
app.use('/api/riders', auth, ridersRouter);
app.use('/api/stores', auth, storesRouter);
app.use('/api/rider-documents', auth, riderDocumentsRouter);
app.use('/api/rider-assignments', auth, riderAssignmentsRouter);
app.use('/api/attendance', auth, attendanceRouter);
app.use('/api/orders', auth, ordersRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Test endpoint for debugging
app.get('/api/test', (req, res) => {
  console.log('Test endpoint called');
  res.status(200).json({ 
    message: 'API is working', 
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      CORS_ORIGIN: process.env.CORS_ORIGIN
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Log registered routes
app._router.stack.forEach((middleware) => {
  if (middleware.route) {
    console.log(`Registered route: ${Object.keys(middleware.route.methods).join(', ').toUpperCase()} ${middleware.route.path}`);
  }
});

const PORT = process.env.PORT || 4003;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
