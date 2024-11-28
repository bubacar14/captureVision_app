import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Wedding from './models/Wedding.js';
import rateLimit from 'express-rate-limit';

// Configuration initiale
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://capturevision:capturevision@cluster0.7pdqi.mongodb.net/wedding-planner';

// Middlewares
app.use(helmet({
  contentSecurityPolicy: false
}));

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept']
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use('/api', limiter);

// Middleware pour s'assurer que toutes les réponses sont en JSON
app.use('/api', (req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

// Logging middleware for monitoring responses
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function(data) {
    console.log('Response being sent:', data);
    return originalSend.call(this, data);
  };
  next();
});

// Logging middleware
app.use((req, res, next) => {
  console.log(`\n=== ${req.method} ${req.path} ===`);
  console.log('Time:', new Date().toISOString());
  console.log('Headers:', req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// Routes API
app.get('/api/weddings', async (req, res) => {
  try {
    console.log('\n=== GET /api/weddings ===');
    console.log('Time:', new Date().toISOString());
    console.log('MongoDB connection state:', mongoose.connection.readyState);
    
    // Vérification de l'URI MongoDB
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined');
    }
    
    // Vérification de la connexion MongoDB
    if (mongoose.connection.readyState !== 1) {
      console.log('MongoDB not connected, attempting to reconnect...');
      const connected = await connectWithRetry();
      if (!connected) {
        throw new Error('Failed to establish MongoDB connection');
      }
    }

    // Test de la connexion avec un ping
    try {
      const db = mongoose.connection.db;
      if (!db) {
        throw new Error('Database connection not established');
      }
      await db.command({ ping: 1 });
      console.log('MongoDB ping successful');
    } catch (error: any) {
      console.error('MongoDB ping failed:', error);
      throw new Error(`Failed to ping database: ${error.message}`);
    }

    // Vérification que la collection existe
    const collections = await mongoose.connection.db.listCollections().toArray();
    const weddingCollection = collections.find(c => c.name === 'weddings');
    if (!weddingCollection) {
      console.log('Wedding collection does not exist, creating...');
      await mongoose.connection.db.createCollection('weddings');
    }

    // Récupération des données avec plus de détails
    console.log('Executing Wedding.find()...');
    const weddings = await Wedding.find()
      .lean()
      .exec();
    
    console.log(`Found ${weddings.length} weddings:`, weddings);
    
    res.json(weddings);
    console.log('Response sent successfully');
    
  } catch (error) {
    console.error('\n=== Error in GET /api/weddings ===');
    console.error('Time:', new Date().toISOString());
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    console.error('MongoDB State:', mongoose.connection.readyState);
    
    // Envoi d'une réponse d'erreur plus détaillée
    res.status(500).json({
      error: error.message,
      name: error.name,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      mongoState: mongoose.connection.readyState,
      time: new Date().toISOString()
    });
  }
});

app.post('/api/weddings', async (req, res) => {
  console.log('\n=== POST /api/weddings Started ===');
  console.log('Time:', new Date().toISOString());
  
  // Wrap in try-catch to ensure we always send a response
  try {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Content-Type:', req.headers['content-type']);
    console.log('MongoDB connection state:', mongoose.connection.readyState);

    // Check MongoDB connection first
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database not connected');
    }

    // Validate required fields
    const requiredFields = ['clientName', 'date', 'venue', 'phoneNumber'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Prepare wedding data
    const weddingData = {
      ...req.body,
      date: new Date(req.body.date),
      notifications: {
        oneWeek: true,
        threeDays: true,
        oneDay: true,
        ...req.body.notifications
      }
    };

    console.log('Données du mariage à sauvegarder:', JSON.stringify(weddingData, null, 2));
    console.log('Validation des champs...');
    const newWedding = new Wedding(weddingData);
    
    console.log('Tentative de sauvegarde...');
    try {
      const savedWedding = await newWedding.save();
      console.log('Sauvegarde réussie:', savedWedding._id);
      res.status(201).json(savedWedding);
    } catch (error) {
      console.error('Erreur de sauvegarde:', error);
      if (error instanceof Error) {
        console.error('Message d\'erreur:', error.message);
        if ('errors' in (error as any)) {
          console.error('Erreurs de validation:', JSON.stringify((error as any).errors, null, 2));
        }
      }
      throw error;
    }
  } catch (error: any) {
    console.error('\n=== Error in POST /api/weddings ===');
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });

    // Send appropriate error response
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Connexion MongoDB avec retry
async function connectWithRetry(retries = 5, delay = 5000) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`\n=== MongoDB Connection Attempt ${i + 1}/${retries} ===`);
      console.log('Time:', new Date().toISOString());
      console.log('URI:', mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//<credentials>@'));
      
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 30000,
        keepAlive: true,
        keepAliveInitialDelay: 300000
      });
      
      console.log('MongoDB connected successfully');
      console.log('Connection state:', mongoose.connection.readyState);
      
      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected, attempting to reconnect...');
        setTimeout(() => connectWithRetry(), 5000);
      });
      
      return true;
    } catch (error: any) {
      console.error(`Connection attempt ${i + 1} failed:`, error.message);
      if (i < retries - 1) {
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  return false;
}

// Démarrage du serveur
async function startServer() {
  try {
    await connectWithRetry();
    
    // Add error handling for uncaught exceptions
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      console.error('\n=== Unhandled Error in Express ===');
      console.error('Time:', new Date().toISOString());
      console.error('Error:', err);
      
      // Ensure we send a response even in case of errors
      if (!res.headersSent) {
        res.status(500).send(JSON.stringify({
          error: 'Internal server error',
          message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
        }));
      }
    });

    // Add a test endpoint to verify server is responding
    app.get('/api/health', (req, res) => {
      res.send(JSON.stringify({ status: 'ok', time: new Date().toISOString() }));
    });

    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`\n=== Server Started ===`);
      console.log(`Time: ${new Date().toISOString()}`);
      console.log(`Port: ${port}`);
      console.log(`MongoDB State: ${mongoose.connection.readyState}`);
    });

    // Add server error handling
    server.on('error', (error) => {
      console.error('\n=== Server Error ===');
      console.error('Time:', new Date().toISOString());
      console.error('Error:', error);
    });

  } catch (error) {
    console.error('\n=== Failed to Start Server ===');
    console.error('Time:', new Date().toISOString());
    console.error('Error:', error);
    process.exit(1);
  }
}

// Ensure all promises are handled
process.on('unhandledRejection', (reason, promise) => {
  console.error('\n=== Unhandled Promise Rejection ===');
  console.error('Time:', new Date().toISOString());
  console.error('Reason:', reason);
  console.error('Promise:', promise);
});

process.on('uncaughtException', (error) => {
  console.error('\n=== Uncaught Exception ===');
  console.error('Time:', new Date().toISOString());
  console.error('Error:', error);
});

// Handle all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

startServer();
