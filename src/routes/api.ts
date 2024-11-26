import express from 'express';
import type { Request, Response } from 'express';
import Wedding from '../models/Wedding.js';

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
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [weddings, total] = await Promise.all([
      Wedding.find()
        .sort({ date: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Wedding.countDocuments()
    ]);

    return res.json({
      weddings,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Error fetching weddings:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new wedding
router.post('/weddings', async (req: Request, res: Response) => {
  try {
    console.log('Received wedding data:', req.body);
    
    const wedding = new Wedding(req.body);
    const validationError = wedding.validateSync();
    if (validationError) {
      return res.status(400).json({ 
        message: 'Validation error',
        errors: Object.values(validationError.errors).map(err => err.message)
      });
    }

    await wedding.save();
    return res.status(201).json(wedding);
  } catch (error) {
    console.error('Error creating wedding:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    return res.status(500).json({ 
      message: 'Error creating wedding',
      error: error instanceof Error ? error.message : 'Unknown error'
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

    // Validate update data
    const validationError = new Wedding(req.body).validateSync();
    if (validationError) {
      return res.status(400).json({ 
        message: 'Validation error',
        errors: Object.values(validationError.errors).map(err => err.message)
      });
    }

    Object.assign(wedding, req.body);
    await wedding.save();
    return res.json(wedding);
  } catch (error) {
    console.error('Error updating wedding:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    return res.status(500).json({ error: 'Internal server error' });
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
  } catch (error) {
    console.error('Error deleting wedding:', error);
    return res.status(500).json({ error: 'Internal server error' });
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
  } catch (error) {
    console.error('Error searching weddings:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
