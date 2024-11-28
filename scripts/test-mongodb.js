import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from parent directory
dotenv.config({ path: join(__dirname, '..', '.env') });

async function testConnection() {
    try {
        console.log('Testing MongoDB connection...');
        console.log('MongoDB URI:', process.env.MONGODB_URI?.substring(0, 20) + '...');

        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        console.log('MongoDB Connected Successfully');
        console.log('Connection state:', mongoose.connection.readyState);

        // Test a simple query
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('\nAvailable collections:');
        collections.forEach(collection => {
            console.log(`- ${collection.name}`);
        });

        // Close the connection
        await mongoose.connection.close();
        console.log('\nConnection closed successfully');
        process.exit(0);
    } catch (error) {
        console.error('\nMongoDB Connection Error:');
        console.error('Error details:', {
            message: error.message,
            name: error.name,
            code: error.code
        });
        process.exit(1);
    }
}

testConnection();
