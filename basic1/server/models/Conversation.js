import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  title: { type: String, default: 'New Chat' },
  updatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Conversation', conversationSchema);
