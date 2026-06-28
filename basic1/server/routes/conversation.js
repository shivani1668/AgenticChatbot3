import express from 'express';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import { handleChat } from '../controllers/chatController.js';

const router = express.Router();

// GET all conversations
router.get('/', async (req, res) => {
  try {
    const conversations = await Conversation.find().sort({ updatedAt: -1 });
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create conversation
router.post('/', async (req, res) => {
  try {
    const { title } = req.body;
    const newConv = await Conversation.create({ title: title || 'New Chat' });
    res.json(newConv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET messages for a conversation
router.get('/:id/messages', async (req, res) => {
  try {
    const messages = await Message.find({ conversationId: req.params.id }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST send message to conversation
router.post('/:id/messages', handleChat);

// POST rename conversation
router.post('/:id/rename', async (req, res) => {
  try {
    const { title } = req.body;
    const conv = await Conversation.findByIdAndUpdate(req.params.id, { title, updatedAt: Date.now() }, { new: true });
    res.json(conv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE conversation
router.delete('/:id', async (req, res) => {
  try {
    await Conversation.findByIdAndDelete(req.params.id);
    await Message.deleteMany({ conversationId: req.params.id });
    res.json({ message: 'Conversation deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
