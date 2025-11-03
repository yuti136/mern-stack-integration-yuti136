// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// ✅ Clerk backend SDK
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

const postRoutes = require('./routes/posts');
const categoryRoutes = require('./routes/categories');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS setup
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('CORS policy: This origin is not allowed'));
    },
    credentials: true,
  })
);

// ✅ Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Development logging
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`[DEV LOG] ${req.method} ${req.url}`);
    next();
  });
}

// ✅ Routes
// Note: Controller handles Clerk auth manually
app.use('/api/posts', postRoutes);
app.use('/api/categories', categoryRoutes);

// ✅ Example route with Clerk auth middleware
app.get('/api/test-auth', ClerkExpressRequireAuth(), (req, res) => {
  res.json({
    message: 'Authenticated!',
    userId: req.auth.userId,
    orgId: req.auth.organizationId || null,
  });
});

// ✅ Root route
app.get('/', (req, res) =>
  res.send('✅ MERN Blog API is running and Clerk is configured!')
);

// ✅ Global error handler
app.use(errorHandler);

// ✅ MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ Failed to connect to MongoDB', err);
    process.exit(1);
  });

// ✅ Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

module.exports = app;
