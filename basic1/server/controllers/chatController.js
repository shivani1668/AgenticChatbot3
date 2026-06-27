import { ChatGroq } from "@langchain/groq";
import Message from "../models/Message.js";
import { DynamicTool } from "@langchain/core/tools";
import { AgentExecutor, createOpenAIToolsAgent } from "langchain/agents";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { searchDocuments } from "../mcp/rag_tool.js";
import { getMemberContext } from "../mcp/graph_tool.js";
import { sendEmail, listDriveFiles } from "../mcp/google_services.js";
import fs from 'fs';
import path from 'path';

export const handleChat = async (req, res) => {
  const { message, history } = req.body;

  try {
    // Save user message to MongoDB
    await Message.create({ role: 'user', content: message });

    const model = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      modelName: "llama-3.1-8b-instant",
      temperature: 0.7,
    });

    // Define Tools - FIXED: Added clearer descriptions to prevent Groq calling errors
    const tools = [
      new DynamicTool({
        name: "document_search",
        description: "Search technical documents and club rules. Input: a search query string.",
        func: async (query) => await searchDocuments(query),
      }),
      new DynamicTool({
        name: "member_context",
        description: "Fetch member skills and project history. Input: a member name or ID.",
        func: async (input) => await getMemberContext(input),
      }),
      new DynamicTool({
        name: "send_email",
        description: "Send emails via Gmail. Input: a JSON string with to, subject, and body.",
        func: async (input) => await sendEmail(input),
      }),
      new DynamicTool({
        name: "google_drive_files",
        description: "List files in Google Drive. This tool takes NO input. Do not provide any arguments.",
        func: async () => await listDriveFiles(), 
      }),
      new DynamicTool({
        name: "event_reminders",
        description: "Get upcoming club events. This tool takes NO input. Do not provide any arguments.",
        func: async () => {
          const events = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'events.json'), 'utf8'));
          return JSON.stringify(events);
        },
      }),
    ];

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", "You are the Robotics Club Assistant. Use tools to find info. IMPORTANT: If a tool description says it takes NO input, you must call it with an empty object or no arguments. Be technical and precise."],
      new MessagesPlaceholder("chat_history"),
      ["human", "{input}"],
      new MessagesPlaceholder("agent_scratchpad"),
    ]);

    const agent = await createOpenAIToolsAgent({
      llm: model,
      tools,
      prompt,
    });

    const executor = new AgentExecutor({
      agent,
      tools,
      verbose: true,
    });

    const chatHistory = (history || []).map(msg => 
      msg.role === 'user' ? new HumanMessage(msg.content) : new AIMessage(msg.content)
    );

    const result = await executor.invoke({
      input: message,
      chat_history: chatHistory,
    });

    await Message.create({ role: 'assistant', content: result.output });

    res.json({ reply: result.output });
  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ error: "Something went wrong in the agentic loop." });
  }
};
