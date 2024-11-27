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
const newWedding = new Wedding({
  clientName: "John Doe",
  partnersName: "Jane Smith",
  date: new Date("2024-06-15"),
  venue: "Grand Plaza Hotel",
  guestCount: 150,
  budget: 25000,
  phoneNumber: "+1234567890",
  email: "john.doe@example.com",
  notes: "Outdoor ceremony preferred",
  status: "confirmed",
  services: ["photography", "catering", "decoration"],
  timeline: [
    { time: "14:00", event: "Ceremony" },
    { time: "15:30", event: "Reception" },
    { time: "18:00", event: "Dinner" }
  ]
});

// Save the wedding
async function addWedding() {
  try {
    const savedWedding = await newWedding.save();
    console.log('Wedding added successfully:', savedWedding);
  } catch (error) {
    console.error('Error adding wedding:', error);
  } finally {
    mongoose.connection.close();
  }
}

addWedding();
