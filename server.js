import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(compression());
app.use(cors());
app.use(express.json());

// MongoDB Connection
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function connectDB() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}

connectDB();

const db = client.db('wedding-planner');
const weddings = db.collection('weddings');

// API Routes
app.get('/api/weddings', async (req, res) => {
  try {
    const result = await weddings.find().sort({ date: 1 }).toArray();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching weddings', error });
  }
});

app.post('/api/weddings', async (req, res) => {
  try {
    const wedding = req.body;
    const result = await weddings.insertOne(wedding);
    res.status(201).json({ ...wedding, _id: result.insertedId });
  } catch (error) {
    res.status(400).json({ message: 'Error creating wedding', error });
  }
});

app.put('/api/weddings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const wedding = req.body;
    const result = await weddings.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: wedding },
      { returnDocument: 'after' }
    );
    if (!result.value) {
      return res.status(404).json({ message: 'Wedding not found' });
    }
    res.json(result.value);
  } catch (error) {
    res.status(400).json({ message: 'Error updating wedding', error });
  }
});

app.delete('/api/weddings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await weddings.findOneAndDelete({ _id: new ObjectId(id) });
    if (!result.value) {
      return res.status(404).json({ message: 'Wedding not found' });
    }
    res.json({ message: 'Wedding deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting wedding', error });
  }
});

// Serve static files from the dist directory
app.use(express.static('dist'));

// Handle client-side routing
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
