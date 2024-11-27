import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Wedding from './src/models/Wedding.js';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration with specific origins
const corsOptions = {
  origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204,
  maxAge: 86400 // 24 hours
};

// Middleware
app.use(cors(corsOptions));
app.use(compression()); // Compress responses
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'dist'), {
  maxAge: '1d',
  etag: true
}));

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(`Error ${req.method} ${req.path}:`, err.stack);
  res.status(500).json({
    error: 'Une erreur est survenue sur le serveur',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Erreur interne'
  });
});

// Connect to MongoDB
console.log('Attempting to connect to MongoDB...');
console.log('MongoDB URI:', process.env.MONGODB_URI?.substring(0, 20) + '...');

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  throw new Error('MONGODB_URI n\'est pas défini dans les variables d\'environnement');
}

mongoose.connect(mongoUri, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  maxPoolSize: 10,
  minPoolSize: 2,
  retryWrites: true,
  retryReads: true,
}).then(() => {
  console.log('Successfully connected to MongoDB.');
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
  process.exit(1);
});

// Add MongoDB connection event handlers
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected successfully');
});

// Start server function
const startServer = () => {
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  
  const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log('Environment:', process.env.NODE_ENV);
    console.log('CORS origins:', corsOptions.origin);
  }).on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use`);
      process.exit(1);
    } else {
      console.error('Server error:', error);
      process.exit(1);
    }
  });

  // Handle server errors
  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.syscall !== 'listen') {
      throw error;
    }

    const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

    switch (error.code) {
      case 'EACCES':
        console.error(bind + ' requires elevated privileges');
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(bind + ' is already in use');
        process.exit(1);
        break;
      default:
        throw error;
    }
  });
};

mongoose.connection.once('connected', () => {
  startServer();
});

// Routes
// Get all weddings
app.get('/api/weddings', async (_req: Request, res: Response) => {
  try {
    const weddings = await Wedding.find().sort({ date: 1 });
    return res.json(weddings);
  } catch (error) {
    console.error('Error fetching weddings:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new wedding
app.post('/api/weddings', async (req: Request, res: Response) => {
  try {
    console.log('Received wedding data:', req.body);
    
    if (!req.body.clientName || !req.body.date || !req.body.venue || !req.body.phoneNumber) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        errors: {
          clientName: !req.body.clientName ? 'Client name is required' : null,
          date: !req.body.date ? 'Date is required' : null,
          venue: !req.body.venue ? 'Venue is required' : null,
          phoneNumber: !req.body.phoneNumber ? 'Phone number is required' : null
        }
      });
    }

    const wedding = new Wedding(req.body);
    await wedding.save();
    return res.status(201).json(wedding);
  } catch (error) {
    console.error('Error creating wedding:', error);
    return res.status(500).json({ 
      message: 'Error creating wedding', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update a wedding
app.put('/api/weddings/:id', async (req: Request, res: Response) => {
  try {
    const wedding = await Wedding.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!wedding) {
      return res.status(404).json({ message: 'Wedding not found' });
    }
    return res.json(wedding);
  } catch (error) {
    console.error('Error updating wedding:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a wedding
app.delete('/api/weddings/:id', async (req: Request, res: Response) => {
  try {
    const wedding = await Wedding.findByIdAndDelete(req.params.id);
    if (!wedding) {
      return res.status(404).json({ message: 'Wedding not found' });
    }
    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting wedding:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files and handle client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
  // Gracefully shutdown
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Gracefully shutdown
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (err) {
    console.error('Error during MongoDB connection closure:', err);
    process.exit(1);
  }
});
