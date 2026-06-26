import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
import chatRoutes from './routes/chat.js';
app.use('/api/chat', chatRoutes);

// Basic Route
app.get('/', (req, res) => {
  res.send('Robotics Club Chatbot API is running...');
});

// Database Connection
const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('MongoDB Connected');
    } else {
      console.warn('MONGODB_URI not found in environment variables. Database connection skipped.');
    }
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
  }
};

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDB();
});
