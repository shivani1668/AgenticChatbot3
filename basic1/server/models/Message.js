import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  userId: { type: String, required: false }, // Optional for guest chat
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('Message', messageSchema);
