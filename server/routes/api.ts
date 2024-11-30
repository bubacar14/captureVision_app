import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Wedding } from '../models/wedding';
import { auth } from '../../src/middleware/auth';
import '../types';

const router = express.Router();

// Test MongoDB connection
router.get('/test-mongodb', async (req: Request, res: Response) => {
  try {
    const state = mongoose.connection.readyState;
    const stateMap = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };
    
    console.log('MongoDB connection state:', stateMap[state as keyof typeof stateMap]);
    
    if (state === 1) {
      res.json({ 
        success: true, 
        message: 'MongoDB connected successfully',
        state: stateMap[state as keyof typeof stateMap],
        database: mongoose.connection.db?.databaseName || 'Unknown Database'
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'MongoDB not fully connected',
        state: stateMap[state as keyof typeof stateMap]
      });
    }
  } catch (error) {
    console.error('MongoDB test error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error testing MongoDB connection',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all weddings
router.get('/weddings', auth, async (req: Request, res: Response) => {
  console.log('=== GET /weddings ===');
  console.log('User:', req.user);
  
  try {
    // Verify MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB not connected. State:', mongoose.connection.readyState);
      throw new Error('Database connection not ready');
    }

    const weddings = await Wedding.find().sort({ date: 1 });
    console.log(`Found ${weddings.length} weddings`);
    
    res.json({
      success: true,
      data: weddings,
      count: weddings.length
    });
  } catch (error) {
    console.error('Error fetching weddings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching weddings',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create new wedding
router.post('/weddings', auth, async (req: Request, res: Response) => {
  try {
    const wedding = new Wedding(req.body);
    await wedding.save();
    res.status(201).json(wedding);
  } catch (error) {
    console.error('Error creating wedding:', error);
    res.status(400).json({
      message: 'Error creating wedding',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update wedding
router.put('/weddings/:id', auth, async (req: Request, res: Response) => {
  try {
    const wedding = await Wedding.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!wedding) {
      return res.status(404).json({
        message: 'Wedding not found',
        requestedId: req.params.id
      });
    }
    
    res.json(wedding);
  } catch (error) {
    console.error('Error updating wedding:', error);
    res.status(400).json({
      message: 'Error updating wedding',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete wedding
router.delete('/weddings/:id', auth, async (req: Request, res: Response) => {
  try {
    const wedding = await Wedding.findByIdAndDelete(req.params.id);
    
    if (!wedding) {
      return res.status(404).json({
        message: 'Wedding not found',
        requestedId: req.params.id
      });
    }
    
    res.json({ message: 'Wedding deleted successfully' });
  } catch (error) {
    console.error('Error deleting wedding:', error);
    res.status(400).json({
      message: 'Error deleting wedding',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
