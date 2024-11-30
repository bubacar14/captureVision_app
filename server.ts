import express, { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import des routes et modèles
import Wedding from './models/Wedding.js';
import { router as weddingRoutes } from './src/routes/api.js';
import { router as authRoutes } from './src/routes/auth.js';
import { requestLogger, errorLogger } from './src/middleware/logging.js';

// Load environment variables
if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env.production' });
} else {
  dotenv.config();
}

const app = express();
const port: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

console.log('Environment:', process.env.NODE_ENV);
console.log('MongoDB URI:', process.env.MONGODB_URI);
console.log('API URL:', process.env.VITE_API_URL);

// Middleware de logging
app.use(requestLogger);

// Middleware standard
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration CORS
const allowedOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000', 'https://capturevision-app.onrender.com'];

console.log('Allowed CORS origins:', allowedOrigins);

app.use(cors({
  origin: function(origin, callback) {
    console.log('Incoming request from origin:', origin);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('Allowing request with no origin');
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      console.log('Origin allowed:', origin);
      return callback(null, true);
    } else {
      console.log('Origin not allowed:', origin);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('MongoDB URI is not defined');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

connectDB();

// Routes API
app.use('/api', weddingRoutes);
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, 'dist');
  console.log('Serving static files from:', clientBuildPath);
  
  app.use(express.static(clientBuildPath));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// Error logging middleware
app.use(errorLogger);

// Error handling middleware
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: 500
    }
  });
};

app.use(errorHandler);

// Start server
function startServer() {
  const port = Number(process.env.PORT) || 10000;
  const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log('Environment:', process.env.NODE_ENV);
    console.log('MongoDB URI:', process.env.MONGODB_URI?.substring(0, 20) + '...');
    console.log('CORS Origins:', process.env.CORS_ORIGINS);
  });
  
  return server;
}

startServer();
