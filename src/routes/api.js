import express from 'express';
import Wedding from '../../models/Wedding.js';
import mongoose from 'mongoose'; // Import mongoose

export const router = express.Router();

// GET all weddings
router.get('/weddings', async (req, res) => {
  try {
    console.log('Fetching weddings...');
    const weddings = await Wedding.find();
    console.log('Weddings found:', weddings.length);
    console.log('First wedding (if any):', weddings[0]);
    res.json(weddings);
  } catch (error) {
    console.error('Error fetching weddings:', error);
    res.status(500).json({ message: 'Error fetching weddings', error: error.message });
  }
});

// GET single wedding
router.get('/weddings/:id', async (req, res) => {
  try {
    const wedding = await Wedding.findById(req.params.id);
    if (!wedding) {
      return res.status(404).json({ message: 'Wedding not found' });
    }
    res.json(wedding);
  } catch (error) {
    console.error('Error fetching wedding:', error);
    res.status(500).json({ message: 'Error fetching wedding' });
  }
});

// POST new wedding
router.post('/weddings', async (req, res) => {
  try {
    const wedding = new Wedding(req.body);
    const validationError = wedding.validateSync();
    if (validationError) {
      return res.status(400).json({ message: validationError.message });
    }
    const newWedding = await wedding.save();
    res.status(201).json(newWedding);
  } catch (error) {
    console.error('Error creating wedding:', error);
    res.status(400).json({ message: error.message });
  }
});

// UPDATE wedding
router.put('/weddings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Updating wedding with ID:', id);
    console.log('Update data received:', req.body);
    
    // First check if the wedding exists
    let wedding = await Wedding.findById(id);
    
    // If not found by _id, try finding by the transformed id
    if (!wedding) {
      console.log('Wedding not found by _id, trying alternative id...');
      wedding = await Wedding.findOne({ _id: id });
    }

    if (!wedding) {
      console.log('Wedding not found with ID:', id);
      // Log all wedding IDs in the database for debugging
      const allWeddings = await Wedding.find({}, '_id clientName');
      console.log('Available weddings:', allWeddings.map(w => ({
        id: w._id.toString(),
        clientName: w.clientName
      })));
      return res.status(404).json({ 
        message: 'Wedding not found',
        requestedId: id,
        availableIds: allWeddings.map(w => w._id.toString())
      });
    }

    console.log('Found wedding:', wedding);

    // Update the wedding
    Object.assign(wedding, req.body);
    
    // Ensure date is a valid Date object
    if (req.body.date) {
      wedding.date = new Date(req.body.date);
    }

    // Save the updated wedding
    const updatedWedding = await wedding.save();
    console.log('Wedding updated successfully:', updatedWedding);
    
    res.json(updatedWedding);
  } catch (error) {
    console.error('Error updating wedding:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: 'Invalid wedding ID format',
        details: error.message,
        requestedId: req.params.id
      });
    }
    res.status(400).json({ message: error.message });
  }
});

// DELETE wedding
router.delete('/weddings/:id', async (req, res) => {
  try {
    const wedding = await Wedding.findByIdAndDelete(req.params.id);
    if (!wedding) {
      return res.status(404).json({ message: 'Wedding not found' });
    }
    res.json({ message: 'Wedding deleted successfully' });
  } catch (error) {
    console.error('Error deleting wedding:', error);
    res.status(500).json({ message: 'Error deleting wedding' });
  }
});

// Test MongoDB connection
router.get('/test-db', async (req, res) => {
  try {
    console.log('Testing MongoDB connection...');
    console.log('MongoDB URI:', process.env.MONGODB_URI ? 'URI is set' : 'URI is missing');
    console.log('Mongoose connection state:', mongoose.connection.readyState);
    
    // Test basic query
    const count = await Wedding.countDocuments();
    console.log('Total weddings in database:', count);
    
    res.json({
      status: 'success',
      mongooseState: mongoose.connection.readyState,
      totalWeddings: count,
      dbName: mongoose.connection.db?.databaseName
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
      mongooseState: mongoose.connection.readyState
    });
  }
});
