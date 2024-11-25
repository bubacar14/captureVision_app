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
  origin: function(origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) {
    // En développement ou pour les requêtes sans origine (comme Postman)
    if (!origin || process.env.NODE_ENV === 'development') {
      callback(null, true);
      return;
    }
    
    // En production, accepter toutes les origines
    callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
  credentials: true,
  preflightContinue: true,
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

    // Ensure date is valid
    const date = new Date(req.body.date);
    if (isNaN(date.getTime())) {
      return res.status(400).json({ 
        message: 'Invalid date format',
        errors: { date: 'Invalid date format' }
      });
    }

    // Create and save the wedding
    const wedding = new Wedding({
      ...req.body,
      date: date,
      guestCount: parseInt(req.body.guestCount) || 0,
      notifications: {
        oneWeek: Boolean(req.body.notifications?.oneWeek),
        threeDays: Boolean(req.body.notifications?.threeDays),
        oneDay: Boolean(req.body.notifications?.oneDay)
      }
    });

    const savedWedding = await wedding.save();
    console.log('Wedding saved successfully:', savedWedding);
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
  res.json({ status: 'ok' });
});

// Serve static files and handle client-side routing
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
