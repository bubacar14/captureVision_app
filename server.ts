import express, { Request, Response, Express } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Wedding from './src/models/Wedding';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Express = express();

// CORS configuration
const corsOptions = {
  origin: ['https://capturevision-app.onrender.com', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
};

// Middleware
app.use(cors(corsOptions));

// Enable pre-flight requests for all routes
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  throw new Error('MONGODB_URI is not defined in environment variables');
}

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
} as mongoose.ConnectOptions)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
// Get all weddings
app.get('/api/weddings', async (req: Request, res: Response) => {
  try {
    const weddings = await Wedding.find().sort({ date: 1 });
    res.json(weddings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching weddings', error });
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
    const savedWedding = await wedding.save();
    res.status(201).json(savedWedding);
  } catch (error) {
    console.error('Error creating wedding:', error);
    res.status(500).json({ 
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
    res.json(wedding);
  } catch (error) {
    res.status(400).json({ message: 'Error updating wedding', error });
  }
});

// Delete a wedding
app.delete('/api/weddings/:id', async (req: Request, res: Response) => {
  try {
    const wedding = await Wedding.findByIdAndDelete(req.params.id);
    if (!wedding) {
      return res.status(404).json({ message: 'Wedding not found' });
    }
    res.json({ message: 'Wedding deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting wedding', error });
  }
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files and handle client-side routing
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Start server
const server = app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('CORS origins:', corsOptions.origin);
});

// Handle server errors
server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;

  // Handle specific listen errors with friendly messages
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

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
  // Gracefully shutdown
  server.close(() => {
    process.exit(1);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Gracefully shutdown
  server.close(() => {
    process.exit(1);
  });
});
