import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

async function checkRenderConfig() {
  console.log('\n🔍 Checking Render Configuration...\n');

  // Check environment variables
  console.log('Environment Variables:');
  console.log('---------------------');
  console.log('NODE_ENV:', process.env.NODE_ENV || 'Not set');
  console.log('PORT:', process.env.PORT || 'Not set');
  console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set (hidden)' : 'Not set');
  console.log('VITE_API_URL:', process.env.VITE_API_URL || 'Not set');
  console.log('CORS_ORIGINS:', process.env.CORS_ORIGINS || 'Not set');

  // Check MongoDB connection
  try {
    console.log('\nTesting MongoDB Connection...');
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connection successful');

    // Check collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nAvailable Collections:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
  } finally {
    await mongoose.disconnect();
  }

  // Check required build files
  console.log('\nChecking Build Configuration:');
  console.log('---------------------------');
  console.log('Required environment variables for build:');
  console.log('- VITE_API_URL');
  console.log('- NODE_ENV');
  
  console.log('\nRequired scripts in package.json:');
  console.log('- build');
  console.log('- start');

  console.log('\n📋 Render Deployment Checklist:');
  console.log('1. Set all environment variables in Render dashboard');
  console.log('2. Ensure build command is set to "npm install && npm run build"');
  console.log('3. Ensure start command is set to "npm start"');
  console.log('4. Check that the MongoDB URI is correctly formatted');
  console.log('5. Verify CORS_ORIGINS includes the Render deployment URL');
  console.log('6. Ensure PORT is set to process.env.PORT in server.ts');
}

checkRenderConfig().catch(console.error);
