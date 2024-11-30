import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from './db';
import { PORT, CORS_ORIGIN, NODE_ENV } from './config';
import apiRoutes from './routes/api';

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(morgan(NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
  });
});

// API routes
app.use('/api', apiRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.message,
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
      details: 'Invalid token or no token provided',
    });
  }
  
  // Default error response
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`=== Server Started ===`);
  console.log(`Environment: ${NODE_ENV}`);
  console.log(`Port: ${PORT}`);
  console.log(`CORS Origin: ${CORS_ORIGIN}`);
  console.log(`API Base URL: ${NODE_ENV === 'production' ? 'https://capturevision-app.onrender.com' : `http://localhost:${PORT}`}`);
});
