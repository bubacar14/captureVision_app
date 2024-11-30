import dotenv from 'dotenv';

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
dotenv.config({ path: envFile });

// MongoDB configuration
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://capturevision:capturevision@cluster0.7pdqi.mongodb.net/wedding-planner';

// Server configuration
export const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
export const NODE_ENV = process.env.NODE_ENV || 'development';

// CORS configuration
export const CORS_ORIGIN = process.env.NODE_ENV === 'production'
  ? 'https://capturevision-app.onrender.com'
  : 'http://localhost:5173';

// JWT configuration
export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
export const JWT_EXPIRES_IN = '24h';

// Logging configuration
export const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// Export all configurations
export default {
  mongodb: {
    uri: MONGODB_URI,
  },
  server: {
    port: PORT,
    env: NODE_ENV,
  },
  cors: {
    origin: CORS_ORIGIN,
  },
  jwt: {
    secret: JWT_SECRET,
    expiresIn: JWT_EXPIRES_IN,
  },
  logging: {
    level: LOG_LEVEL,
  },
};
