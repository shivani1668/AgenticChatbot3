import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import Message from '../models/Message.js';

export const handleChat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    // 1. Basic validation
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // 2. Save user message to MongoDB (Chat History)
    try {
      await Message.create({ role: 'user', content: message });
    } catch (dbError) {
      console.error('Database Error (User Message):', dbError);
      // We continue even if DB fails so the user still gets an AI reply
    }

    // 3. Initialize the Groq Model (Using the latest Llama 3.3 model)
    const model = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      modelName: "llama-3.3-70b-versatile", 
      temperature: 0.7,
    });

    // 4. Construct the message context for the AI
    const messages = [
      new SystemMessage("You are the Robotics Club Assistant. You help with technical queries, document retrieval, and club management."),
      ...history.map(msg => 
        msg.role === 'user' ? new HumanMessage(msg.content) : new AIMessage(msg.content)
      ),
      new HumanMessage(message),
    ];

    // 5. Get the response from Groq
    const response = await model.invoke(messages);

    // 6. Save assistant response to MongoDB
    try {
      await Message.create({ role: 'assistant', content: response.content });
    } catch (dbError) {
      console.error('Database Error (AI Response):', dbError);
    }

    // 7. Return the reply to the frontend
    res.json({ reply: response.content });

  } catch (error) {
    console.error('Chat Controller Error:', error);
    res.status(500).json({ 
      error: "Failed to process chat request", 
      details: error.message 
    });
  }
};
