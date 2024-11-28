import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const envPath = join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });

// Wedding Schema
const weddingSchema = new mongoose.Schema({
  clientName: String,
  partnersName: String,
  date: Date,
  venue: String,
  guestCount: Number,
  budget: Number,
  phoneNumber: String,
  email: String,
  notes: String,
  status: String,
  services: [String],
  timeline: [{
    time: String,
    event: String
  }]
});

const Wedding = mongoose.model('Wedding', weddingSchema);

async function listWeddings() {
  try {
    const weddings = await Wedding.find({});
    console.log('Found weddings:', JSON.stringify(weddings, null, 2));
    mongoose.connection.close();
  } catch (error) {
    console.error('Error listing weddings:', error);
    mongoose.connection.close();
    process.exit(1);
  }
}

listWeddings();
