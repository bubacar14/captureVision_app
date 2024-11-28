import path from 'path';
import { fileURLToPath } from 'url';
import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import Wedding from './models/Wedding';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Middleware
const corsOptions = {
  origin: process.env.CORS_ORIGINS?.split(',') || [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://capturevision-app.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
};

app.use(cors(corsOptions));
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", ...corsOptions.origin],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "data:", "https:"]
    }
  }
}));
app.use(compression());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wedding-planner';
console.log('Connecting to MongoDB...');

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
} as mongoose.ConnectOptions).then(() => {
  console.log('Successfully connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1); // Arrêter l'application si la connexion échoue
});

const db = mongoose.connection;

db.on('error', (error: Error) => {
  console.error('MongoDB connection error:', error);
});

db.on('disconnected', () => {
  console.log('MongoDB disconnected. Attempting to reconnect...');
});

db.on('reconnected', () => {
  console.log('MongoDB reconnected');
});

db.once('open', () => {
  console.log('Connected to MongoDB');
  console.log('Server is ready to accept requests');
});

// API Routes
app.get('/api/weddings', async (req: Request, res: Response) => {
  try {
    const weddings = await Wedding.find();
    res.json(weddings);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching weddings:', error.message);
      res.status(500).json({ error: error.message });
    } else {
      console.error('Unknown error:', error);
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
});

app.post('/api/weddings', async (req: Request, res: Response) => {
  try {
    const wedding = new Wedding(req.body);
    await wedding.save();
    res.status(201).json(wedding);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error creating wedding:', error.message);
      res.status(400).json({ error: error.message });
    } else {
      console.error('Unknown error:', error);
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
