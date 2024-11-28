import express from 'express';
import type { Request, Response } from 'express';
import Wedding from '../models/Wedding.js';
import mongoose from 'mongoose';

const router = express.Router();

// Middleware de validation des IDs MongoDB
const validateObjectId = (req: Request, res: Response, next: Function) => {
  if (!req.params.id?.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }
  next();
};

// Get all weddings with pagination
router.get('/weddings', async (req: Request, res: Response) => {
  try {
    console.log('GET /weddings - Starting request');
    
    // Vérifier la connexion MongoDB
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB connection is not ready');
      return res.status(500).json({
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
      throw new Error('Invalid data format from database');
    }

    // Transformer et valider chaque mariage
    const formattedWeddings = weddings.map(wedding => {
      try {
        return {
          ...wedding,
          _id: wedding._id.toString(),
          date: new Date(wedding.date).toISOString(),
          createdAt: wedding.createdAt ? new Date(wedding.createdAt).toISOString() : null,
          updatedAt: wedding.updatedAt ? new Date(wedding.updatedAt).toISOString() : null
        };
      } catch (err) {
        console.error('Error formatting wedding:', wedding, err);
        throw new Error(`Error formatting wedding data: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    });

    const response = {
      weddings: formattedWeddings,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: page < Math.ceil(total / limit)
    };

    console.log('Sending response:', {
      totalWeddings: formattedWeddings.length,
      totalPages: response.totalPages,
      currentPage: page
    });

    return res.json(response);

  } catch (err) {
    console.error('Error in GET /weddings:', err);
    
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
    const errorDetails = process.env.NODE_ENV === 'development' ? errorMessage : 'An error occurred';

    return res.status(500).json({
      error: 'Server error',
      details: errorDetails
    });
  }
});

// Create a new wedding
router.post('/weddings', async (req: Request, res: Response) => {
  try {
    const wedding = new Wedding(req.body);
    await wedding.save();
    return res.status(201).json(wedding);
  } catch (err) {
    console.error('Error creating wedding:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
    return res.status(400).json({ 
      error: 'Validation error',
      details: errorMessage
    });
  }
});

// Get a specific wedding
router.get('/weddings/:id', validateObjectId, async (req: Request, res: Response) => {
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
router.put('/weddings/:id', validateObjectId, async (req: Request, res: Response) => {
  try {
    const wedding = await Wedding.findById(req.params.id);
    if (!wedding) {
      return res.status(404).json({ message: 'Wedding not found' });
    }
    Object.assign(wedding, req.body);
    await wedding.save();
    return res.json(wedding);
  } catch (err) {
    console.error('Error updating wedding:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
    return res.status(500).json({ 
      error: 'Server error',
      details: errorMessage
    });
  }
});

// Delete a wedding
router.delete('/weddings/:id', validateObjectId, async (req: Request, res: Response) => {
  try {
    const wedding = await Wedding.findByIdAndDelete(req.params.id);
    if (!wedding) {
      return res.status(404).json({ message: 'Wedding not found' });
    }
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
router.get('/weddings/search', async (req: Request, res: Response) => {
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

export default router;
