import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Wedding from './src/models/Wedding';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('dist'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || '')
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
    const wedding = new Wedding(req.body);
    await wedding.save();
    res.status(201).json(wedding);
  } catch (error) {
    res.status(400).json({ message: 'Error creating wedding', error });
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
