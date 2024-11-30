import mongoose, { Connection, Mongoose } from 'mongoose';
import { MONGODB_URI, NODE_ENV } from './config';

// Configure mongoose
mongoose.set('strictQuery', true);

// Connection options
const options: mongoose.ConnectOptions = {
  // No need to specify useNewUrlParser and useUnifiedTopology as they are now default in Mongoose 6+
};

// Connect to MongoDB
export const connectDB = async (): Promise<Mongoose | null> => {
  try {
    console.log('=== Connecting to MongoDB ===');
    console.log('Environment:', NODE_ENV);
    console.log('URI:', MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')); // Hide password in logs
    
    const conn = await mongoose.connect(MONGODB_URI, options);
    
    console.log('MongoDB Connected Successfully');
    
    // Add null check for connection and database
    if (conn.connection && conn.connection.db) {
      console.log('Database:', conn.connection.db.databaseName);
      console.log('Host:', conn.connection.host);
    } else {
      console.warn('Database connection details are not available');
    }

    // Set up connection error handler
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    // Set up disconnection handler
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    // Set up reconnection handler
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected successfully');
    });

    return conn;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

// Disconnect from MongoDB
export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected successfully');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
    process.exit(1);
  }
};

export default { connectDB, disconnectDB };
