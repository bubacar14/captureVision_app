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
    console.log('GET /weddings - Fetching weddings');
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    console.log('Query parameters:', { page, limit, skip });

    const [weddings, total] = await Promise.all([
      Wedding.find()
        .sort({ date: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Wedding.countDocuments()
    ]);

    console.log(`Found ${weddings.length} weddings out of ${total} total`);

    // Transformer les dates en format ISO pour une meilleure compatibilité
    const formattedWeddings = weddings.map(wedding => ({
      ...wedding,
      date: new Date(wedding.date).toISOString()
    }));

    return res.json({
      weddings: formattedWeddings,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error in GET /weddings:', error);
    return res.status(500).json({
      error: 'Error fetching weddings',
      details: error instanceof Error ? error.message : String(error)
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
