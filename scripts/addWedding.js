import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

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

// Sample wedding data
const newWedding = {
  clientName: "Sophie et Thomas",
  partnersName: "Thomas Durant",
  date: new Date("2024-06-15"),
  venue: "Château de Versailles",
  guestCount: 150,
  budget: 35000,
  phoneNumber: "+33 6 12 34 56 78",
  email: "sophie.thomas@email.com",
  notes: "Thème : Élégance romantique, Couleurs : Rose poudré et or",
  status: "Confirmé",
  services: ["Photo", "Vidéo", "Traiteur", "Décoration florale"],
  timeline: [
    { time: "14:00", event: "Cérémonie" },
    { time: "15:30", event: "Cocktail" },
    { time: "19:00", event: "Dîner" },
    { time: "21:00", event: "Soirée dansante" }
  ]
};

async function addWedding() {
  try {
    const wedding = new Wedding(newWedding);
    const savedWedding = await wedding.save();
    console.log('Wedding added successfully:', savedWedding);
    mongoose.connection.close();
  } catch (error) {
    console.error('Error adding wedding:', error);
    mongoose.connection.close();
    process.exit(1);
  }
}

addWedding();
