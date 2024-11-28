import express, { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Wedding = require('./models/Wedding.ts');
const weddingRoutes = require('./src/routes/api');
const authRoutes = require('./src/routes/auth');
const { requestLogger, errorLogger } = require('./src/middleware/logging');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de logging
app.use(requestLogger);

// Middleware standard
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration CORS
const allowedOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',')
  : [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://capturevision-app.onrender.com',
      'https://capturevision-app.onrender.com/'
    ];

console.log('Configured CORS origins:', allowedOrigins);

app.use(cors({
  origin: function(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    console.log('Request origin:', origin);
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.warn('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// MongoDB Connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wedding-planner';
    if (!mongoURI) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoURI);

    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Handle MongoDB connection events
mongoose.connection.on('error', (err: Error) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected. Attempting to reconnect...');
  connectDB();
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
});

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
  console.log('Server is ready to accept requests');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', weddingRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, 'dist');
  
  app.use(express.static(clientBuildPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// Error logging middleware
app.use(errorLogger);

// Error handling middleware
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error('Server error:', {
    message: err.message,
    stack: err.stack
  });

  res.status(500).json({
    message: 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
};

app.use(errorHandler);

// Catch-all route for undefined routes
app.use('*', (req, res) => {
  console.warn(`Route not found: ${req.originalUrl}`);
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log('Environment:', process.env.NODE_ENV);
      console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
      console.log('CORS origins:', allowedOrigins);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
