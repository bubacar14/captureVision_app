import express from 'express';
import type { Request, Response } from 'express';
import Wedding from '../models/Wedding.js';
import mongoose from 'mongoose';
import { auth, AuthRequest } from '../middleware/auth';

export const router = express.Router();

// Middleware de validation des IDs MongoDB
const validateObjectId = (req: Request, res: Response, next: Function) => {
  if (!req.params.id?.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }
  next();
};

// Get all weddings with pagination
router.get('/weddings', auth, async (req: AuthRequest, res: Response) => {
  try {
    console.log('GET /weddings - Starting request');
    console.log('User:', req.user);
    
    // Vérifier la connexion MongoDB
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB connection is not ready');
      return res.status(500).json({
        success: false,
        error: 'Database connection error',
        details: 'The database connection is not ready'
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    console.log('Query parameters:', { page, limit, skip });

    const [weddings, total] = await Promise.all([
      Wedding.find()
        .sort({ date: 1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Wedding.countDocuments()
    ]);

    console.log(`Found ${weddings.length} weddings out of ${total} total`);

    if (!Array.isArray(weddings)) {
      console.error('Weddings is not an array:', weddings);
      return res.status(500).json({
        success: false,
        error: 'Invalid data format from database'
      });
    }

    // Transform dates to ISO string format
    const formattedWeddings = weddings.map(wedding => ({
      ...wedding,
      date: wedding.date instanceof Date ? wedding.date.toISOString() : wedding.date,
      _id: wedding._id.toString()
    }));

    console.log('Sending response with weddings:', formattedWeddings.length);

    return res.status(200).json({
      success: true,
      data: formattedWeddings,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error in GET /weddings:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create a new wedding
router.post('/weddings', auth, async (req: AuthRequest, res: Response) => {
  try {
    const wedding = new Wedding(req.body);
    await wedding.save();
    res.status(201).json(wedding);
  } catch (err) {
    console.error('Error creating wedding:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
    res.status(400).json({ 
      error: 'Invalid wedding data',
      details: errorMessage
    });
  }
});

// Get a specific wedding
router.get('/weddings/:id', [auth, validateObjectId], async (req: AuthRequest, res: Response) => {
  try {
    const wedding = await Wedding.findById(req.params.id);
    if (!wedding) {
      return res.status(404).json({ message: 'Wedding not found' });
    }
    return res.json(wedding);
  } catch (err) {
    console.error('Error fetching wedding:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
    return res.status(500).json({ 
      error: 'Server error',
      details: errorMessage
    });
  }
});

// Update a wedding
router.put('/weddings/:id', [auth, validateObjectId], async (req: AuthRequest, res: Response) => {
  try {
    const wedding = await Wedding.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!wedding) {
      return res.status(404).json({ message: 'Wedding not found' });
    }
    res.json(wedding);
  } catch (err) {
    console.error('Error updating wedding:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
    res.status(400).json({ 
      error: 'Invalid update data',
      details: errorMessage
    });
  }
});

// Delete a wedding
router.delete('/weddings/:id', [auth, validateObjectId], async (req: AuthRequest, res: Response) => {
  try {
    console.log('Attempting to delete wedding with ID:', req.params.id);
    
    // First check if the wedding exists
    const existingWedding = await Wedding.findById(req.params.id);
    if (!existingWedding) {
      console.log('Wedding not found with ID:', req.params.id);
      return res.status(404).json({ message: 'Wedding not found' });
    }

    // Proceed with deletion
    const result = await Wedding.findByIdAndDelete(req.params.id);
    console.log('Deletion result:', result);
    
    return res.status(204).send();
  } catch (err) {
    console.error('Error deleting wedding:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
    return res.status(500).json({ 
      error: 'Server error',
      details: errorMessage
    });
  }
});

// Search weddings
router.get('/weddings/search', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { query, startDate, endDate, status } = req.query;
    const searchQuery: any = {};

    if (query) {
      searchQuery.$text = { $search: query as string };
    }

    if (startDate || endDate) {
      searchQuery.date = {};
      if (startDate) searchQuery.date.$gte = new Date(startDate as string);
      if (endDate) searchQuery.date.$lte = new Date(endDate as string);
    }

    if (status) {
      searchQuery.status = status;
    }

    const weddings = await Wedding.find(searchQuery)
      .sort({ date: 1 })
      .lean();

    return res.json(weddings);
  } catch (err) {
    console.error('Error searching weddings:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
    return res.status(500).json({ 
      error: 'Server error',
      details: errorMessage
    });
  }
});
