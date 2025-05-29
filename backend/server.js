require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

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

const usersRouter = require('./src/routes/users');
const companiesRouter = require('./src/routes/companies');
const ridersRouter = require('./src/routes/riders');
const storesRouter = require('./src/routes/stores');
const loginRoute = require('./src/routes/login');
const riderDocumentsRouter = require('./src/routes/rider_documents');
const riderAssignmentsRouter = require('./src/routes/rider_assignments');
const attendanceRouter = require('./src/routes/attendance');

app.use('/api/users', usersRouter);
app.use('/api/companies', companiesRouter);
app.use('/api/riders', ridersRouter);
app.use('/api/stores', storesRouter);
app.use('/api/login', loginRoute);
app.use('/api/rider-documents', riderDocumentsRouter);
app.use('/api/rider-assignments', riderAssignmentsRouter);
app.use('/api/attendance', attendanceRouter);
// app.use('/api', ordersRoutes); // Commented out because ordersRoutes is not a valid router

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
