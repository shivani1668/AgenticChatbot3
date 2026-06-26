import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import Message from '../models/Message.js';

export const handleChat = async (req, res) => {
  const { message, history = [] } = req.body;

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: 'GROQ_API_KEY is not configured' });
  }

  try {
    // 1. Save user message to DB
    await Message.create({ role: 'user', content: message });

    const model = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      modelName: "llama3-8b-8192",
      temperature: 0.7,
    });

    const messages = [
      new SystemMessage("You are the Robotics Club Assistant. You help with technical queries, document retrieval, and club management."),
      ...history.map(msg => msg.role === 'user' ? new HumanMessage(msg.content) : new AIMessage(msg.content)),
      new HumanMessage(message),
    ];

    const response = await model.invoke(messages);

    // 2. Save assistant response to DB
    await Message.create({ role: 'assistant', content: response.content });

    res.json({ reply: response.content });
  } catch (error) {
    console.error('Chat Controller Error:', error);
    res.status(500).json({ error: 'Failed to process chat' });
  }
};
