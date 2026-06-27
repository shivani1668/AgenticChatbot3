import { ChatGroq } from "@langchain/groq";
import { Message } from "../models/Message.js";
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

    // Initialize Groq model with a SUPPORTED model name
    const model = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      modelName: "llama-3.1-8b-instant", // FIXED: Updated from decommissioned llama3-8b-8192
      temperature: 0.7,
    });

    // Define Tools
    const tools = [
      new DynamicTool({
        name: "document_search",
        description: "Search technical documents and club rules. Use this for specific club info.",
        func: async (query) => await searchDocuments(query),
      }),
      new DynamicTool({
        name: "member_context",
        description: "Fetch member skills, project history, and relationships from Neo4j.",
        func: async (userId) => await getMemberContext(userId),
      }),
      new DynamicTool({
        name: "send_email",
        description: "Send emails via Gmail API. Input: { to, subject, body }",
        func: async (input) => await sendEmail(input),
      }),
      new DynamicTool({
        name: "google_drive_files",
        description: "List or find files in Google Drive.",
        func: async () => await listDriveFiles(),
      }),
      new DynamicTool({
        name: "event_reminders",
        description: "Get upcoming club events from events.json",
        func: async () => {
          const events = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'events.json'), 'utf8'));
          return JSON.stringify(events);
        },
      }),
    ];

    // Define Prompt
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", "You are the Robotics Club Assistant, an expert in club rules, member skills, and technical projects. Always use the available tools to find information before answering. Be technical and precise."],
      new MessagesPlaceholder("chat_history"),
      ["human", "{input}"],
      new MessagesPlaceholder("agent_scratchpad"),
    ]);

    // Create Agent
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

    // Format history for LangChain
    const chatHistory = (history || []).map(msg => 
      msg.role === 'user' ? new HumanMessage(msg.content) : new AIMessage(msg.content)
    );

    const result = await executor.invoke({
      input: message,
      chat_history: chatHistory,
    });

    // Save assistant reply to MongoDB
    await Message.create({ role: 'assistant', content: result.output });

    res.json({ reply: result.output });
  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ error: "Something went wrong in the agentic loop." });
  }
};
