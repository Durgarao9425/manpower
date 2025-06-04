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
const allowedOrigins = [
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:5177',
  'http://localhost:5178',
  'http://localhost:5179',
  'http://localhost:5180',
  'http://localhost:5181'
];

const corsOptions = {
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

console.log('CORS configured with origins:', allowedOrigins);

// Apply middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// Serve static files for images with proper headers
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, path) => {
    // Set CORS headers for images
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    
    // Set appropriate cache headers
    if (path.endsWith('.jpg') || path.endsWith('.jpeg') || path.endsWith('.png') || path.endsWith('.gif') || path.endsWith('.webp')) {
      res.set('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
    }
    
    console.log(`Serving static file: ${path}`);
  }
}));

// Create a route to debug image paths
app.get('/api/debug-image/:filename', (req, res) => {
  const { filename } = req.params;
  const possiblePaths = [
    path.join(__dirname, 'uploads', 'sliders', filename),
    path.join(__dirname, 'uploads', filename),
    path.join(__dirname, 'images', filename),
    path.join(__dirname, 'assets', filename)
  ];
  
  console.log(`Debugging image: ${filename}`);
  
  // Check each possible path
  const results = possiblePaths.map(p => {
    const exists = fs.existsSync(p);
    return { path: p, exists };
  });
  
  // If any path exists, serve the first one found
  const existingPath = results.find(r => r.exists);
  if (existingPath) {
    console.log(`Found image at: ${existingPath.path}`);
    return res.sendFile(existingPath.path);
  }
  
  // Otherwise return debug info
  res.json({
    filename,
    results,
    message: 'Image not found in any expected location'
  });
});

// Additional static file serving for different image directories
app.use('/images', express.static(path.join(__dirname, 'images'), {
  setHeaders: (res, path) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// Serve any other static assets
app.use('/assets', express.static(path.join(__dirname, 'assets'), {
  setHeaders: (res, path) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

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
  
  // Initialize database tables
  const { initializeDatabase } = require('./src/config/init-db');
  initializeDatabase().catch(err => {
    console.error('Failed to initialize database:', err);
  });
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
const customFieldsRoutes = require('./src/routes/customFields');
const companyPaymentsRouter = require('./src/routes/company_payments');
const sliderImagesRoutes = require('./src/routes/sliderImages');
const fieldMappingsRouter = require('./src/routes/field_mappings');

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
app.use('/api/custom-fields', customFieldsRoutes);
app.use('/api', companyPaymentsRouter);
app.use('/api/company_payments', companyPaymentsRouter);
app.use('/api/slider-images', sliderImagesRoutes);
app.use('/api/field_mappings', fieldMappingsRouter);

// Image proxy endpoint to help with CORS issues
app.get('/api/image-proxy', (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'URL parameter required' });
  }
  
  console.log(`Image proxy requested for: ${url}`);
  
  // Check if this is a local file path
  if (url.includes('/uploads/') || url.includes('/images/') || url.includes('/assets/')) {
    try {
      // Extract the path after the domain
      let localPath = url;
      
      // If it's a full URL, extract just the path
      if (url.includes('://')) {
        const urlObj = new URL(url);
        localPath = urlObj.pathname;
      }
      
      // Remove any leading slash and api prefix
      localPath = localPath.replace(/^\/+/, '').replace(/^api\/+/, '');
      
      // Construct the absolute path
      const filePath = path.join(__dirname, localPath);
      console.log(`Serving local file: ${filePath}`);
      
      // Check if file exists
      if (fs.existsSync(filePath)) {
        // Set appropriate headers
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Cross-Origin-Resource-Policy', 'cross-origin');
        
        // Serve the file
        return res.sendFile(filePath);
      } else {
        console.error(`File not found: ${filePath}`);
      }
    } catch (error) {
      console.error('Error serving local file:', error);
    }
  }
  
  // If not a local file or error occurred, redirect to the URL
  console.log(`Redirecting to: ${url}`);
  res.redirect(url);
});

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

// Test image endpoint
app.get('/api/test-image', (req, res) => {
  // Create a simple test image response
  const testImagePath = path.join(__dirname, 'uploads');
  console.log('Test image directory:', testImagePath);
  
  // List files in uploads directory
  const fs = require('fs');
  try {
    // Check uploads directory
    let files = [];
    if (fs.existsSync(testImagePath)) {
      files = fs.readdirSync(testImagePath);
    }
    
    // Check uploads/sliders directory
    const slidersPath = path.join(__dirname, 'uploads', 'sliders');
    let sliderFiles = [];
    if (fs.existsSync(slidersPath)) {
      sliderFiles = fs.readdirSync(slidersPath).map(f => `sliders/${f}`);
    }
    
    // Combine all files
    const allFiles = [...files, ...sliderFiles];
    
    res.json({ 
      message: 'Image directory accessible',
      files: allFiles.filter(f => f.match(/\.(jpg|jpeg|png|gif|webp)$/i)),
      uploads_path: testImagePath,
      sliders_path: slidersPath,
      server_url: `${req.protocol}://${req.get('host')}`
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Cannot access uploads directory',
      path: testImagePath,
      message: error.message
    });
  }
});

// Direct image serving endpoint
app.get('/api/direct-image/:path(*)', (req, res) => {
  const imagePath = req.params.path;
  console.log(`Direct image request for: ${imagePath}`);
  
  // Construct the full path
  const fullPath = path.join(__dirname, imagePath);
  
  // Check if file exists
  if (fs.existsSync(fullPath)) {
    console.log(`Serving image from: ${fullPath}`);
    
    // Set CORS headers
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    
    // Serve the file
    return res.sendFile(fullPath);
  }
  
  // If file doesn't exist, return error
  console.error(`Image not found: ${fullPath}`);
  res.status(404).json({ 
    error: 'Image not found',
    requested_path: imagePath,
    full_path: fullPath
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

const PORT = process.env.PORT || 4003;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Static files served from: ${path.join(__dirname, 'uploads')}`);
});