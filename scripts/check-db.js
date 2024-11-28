import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkDatabaseConnection() {
  try {
    console.log('Checking MongoDB connection...');
    console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Successfully connected to MongoDB');
    
    // Vérifier que nous pouvons effectuer des opérations
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    // Vérifier les indexes
    const indexes = await mongoose.connection.db.collection('weddings').indexes();
    console.log('Wedding collection indexes:', indexes);

  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

checkDatabaseConnection();
