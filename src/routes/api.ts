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

    // Utiliser une promesse pour gérer les timeouts
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database query timeout')), 10000);
    });

    const queryPromise = Promise.all([
      Wedding.find()
        .sort({ date: 1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Wedding.countDocuments()
    ]);

    const [weddings, total] = await Promise.race([queryPromise, timeoutPromise]) as [any[], number];

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
      } catch (error) {
        console.error('Error formatting wedding:', wedding, error);
        throw new Error(`Error formatting wedding data: ${error.message}`);
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

  } catch (error) {
    console.error('Error in GET /weddings:', error);
    
    // Déterminer le type d'erreur et envoyer une réponse appropriée
    if (error.name === 'MongoError' || error.name === 'MongooseError') {
      return res.status(500).json({
        error: 'Database error',
        details: process.env.NODE_ENV === 'development' ? error.message : 'A database error occurred'
      });
    }

    if (error.message === 'Database query timeout') {
      return res.status(504).json({
        error: 'Request timeout',
        details: 'The request took too long to process'
      });
    }

    return res.status(500).json({
      error: 'Server error',
      details: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
    });
  }
});

// Create a new wedding
router.post('/weddings', async (req: Request, res: Response) => {
  try {
    console.log('Received wedding data:', req.body);
    
    // Vérifier que tous les champs requis sont présents
    const requiredFields = ['clientName', 'partnersName', 'date', 'venue', 'phoneNumber', 'guestCount', 'budget', 'ceremonyType'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: `Missing fields: ${missingFields.join(', ')}`
      });
    }

    // Vérifier que la date est valide
    const weddingDate = new Date(req.body.date);
    if (isNaN(weddingDate.getTime())) {
      return res.status(400).json({
        error: 'Invalid date format',
        details: 'The provided date is not valid'
      });
    }

    // Créer le mariage avec les valeurs par défaut si nécessaire
    const weddingData = {
      ...req.body,
      date: weddingDate,
      status: req.body.status || 'planned',
      notifications: {
        oneWeek: true,
        threeDays: true,
        oneDay: true,
        ...req.body.notifications
      }
    };

    const wedding = new Wedding(weddingData);
    const validationError = wedding.validateSync();
    if (validationError) {
      return res.status(400).json({ 
        error: 'Validation error',
        details: Object.values(validationError.errors).map(err => err.message)
      });
    }

    await wedding.save();
    console.log('Wedding saved successfully:', wedding);
    return res.status(201).json(wedding);
  } catch (error) {
    console.error('Error creating wedding:', error);
    if (error instanceof Error) {
      res.status(400).json({ 
        error: 'Validation error',
        details: error.message
      });
    } else {
      res.status(500).json({ 
        error: 'Unknown error',
        details: String(error)
      });
    }
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
    if (error instanceof Error) {
      res.status(500).json({ 
        error: 'Server error',
        details: error.message
      });
    } else {
      res.status(500).json({ 
        error: 'Unknown error',
        details: String(error)
      });
    }
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
    if (error instanceof Error) {
      res.status(500).json({ 
        error: 'Server error',
        details: error.message
      });
    } else {
      res.status(500).json({ 
        error: 'Unknown error',
        details: String(error)
      });
    }
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
    if (error instanceof Error) {
      res.status(500).json({ 
        error: 'Server error',
        details: error.message
      });
    } else {
      res.status(500).json({ 
        error: 'Unknown error',
        details: String(error)
      });
    }
  }
});

export default router;
