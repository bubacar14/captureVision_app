import { Request } from 'express';

// Define the type for your user object
export interface CustomUser {
  _id: string;
  email: string;
  // Add other user properties as needed
}

// Extend the Express Request interface to include the user property
declare global {
  namespace Express {
    interface Request {
      user?: CustomUser;
    }
  }
}
