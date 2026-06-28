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
import conversationRoutes from './routes/conversation.js';
app.use('/api/chat', chatRoutes);
app.use('/api/conversations', conversationRoutes);

// Health Check for Render
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Basic Route
app.get('/', (req, res) => {
  res.send('Robotics Club Chatbot API is running...');
});

// Database Connection
const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      console.log('Attempting to connect to MongoDB...');
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000 // 5 seconds timeout
      });
      console.log('MongoDB Connected');
    } else {
      console.warn('MONGODB_URI not found in environment variables. Database connection skipped.');
    }
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    // Don't exit process, let the server run so Render can detect the port
  }
};

// Bind to 0.0.0.0 for Render
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  connectDB();
});
