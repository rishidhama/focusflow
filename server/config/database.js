const mongoose = require('mongoose');

const USE_MOCK_DB = process.env.USE_MOCK_DB === 'true';

const connectDB = async () => {
  if (USE_MOCK_DB) {
    console.log('Using in-memory mock database (no MongoDB required)');
    console.log('Test user: test@example.com / password123');
    return;
  }

  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.error('Error details:', error);
    if (process.env.NODE_ENV === 'production') {
      console.error('Falling back to in-memory mock database');
      process.env.USE_MOCK_DB = 'true';
    } else {
      throw error; // Fail fast in development
    }
  }
};

module.exports = connectDB;

