const mongoose = require('mongoose');

const USE_MOCK_DB = process.env.USE_MOCK_DB === 'true';

const connectDB = async () => {
  if (USE_MOCK_DB) {
    console.log('Using in-memory mock database (no MongoDB required)');
    console.log('Test user: test@example.com / password123');
    return;
  }

  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not set in environment variables');
    console.log('Falling back to in-memory mock database');
    process.env.USE_MOCK_DB = 'true';
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.error('Falling back to in-memory mock database');
    console.log('Test user: test@example.com / password123');
    process.env.USE_MOCK_DB = 'true';
  }
};

module.exports = connectDB;

