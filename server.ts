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

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://capturevision-app.onrender.com']
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Routes API
app.use('/api', weddingRoutes);
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
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

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('MongoDB URI is not defined');
    }

    console.log('=== MongoDB Connection Info ===');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('MongoDB URI exists:', !!process.env.MONGODB_URI);
    console.log('MongoDB URI format:', mongoURI.split('@')[1]?.split('/')[0] || 'Invalid URI format');

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    
    const dbName = mongoose.connection.db?.databaseName;
    const collections = await mongoose.connection.db?.listCollections().toArray();
    
    console.log('MongoDB Connected Successfully');
    console.log('Database Name:', dbName);
    console.log('Available Collections:', collections?.map(c => c.name).join(', '));
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

connectDB();

// Démarrage du serveur
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});
console.log('Environment:', process.env.NODE_ENV);
console.log('MongoDB URI:', process.env.MONGODB_URI);
console.log('API URL:', process.env.VITE_API_URL);
