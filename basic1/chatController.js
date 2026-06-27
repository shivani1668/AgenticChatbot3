import { ChatGroq } from "@langchain/groq";
import { DynamicTool } from "@langchain/core/tools";
import { AgentExecutor, createOpenAIToolsAgent } from "langchain/agents";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import Message from '../models/Message.js';
import * as ragTool from '../mcp/rag_tool.js';
import * as graphTool from '../mcp/graph_tool.js';
import * as googleServices from '../mcp/google_services.js';
import fs from 'fs/promises';
import path from 'path';

export const handleChat = async (req, res) => {
  const { message, history = [] } = req.body;

  try {
    // 1. Save user message to DB
    await Message.create({ role: 'user', content: message });

    // Use Groq (Free Tier) with Llama 3
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: 'GROQ_API_KEY is not configured' });
    }

    const model = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      modelName: "llama3-8b-8192",
      temperature: 0.7,
    });

    // 2. Define Tools (Mapping to your requirements)
    const tools = [
      new DynamicTool({
        name: "document_search",
        description: "Search for technical documents and club rules using RAG.",
        func: async (query) => await ragTool.searchDocuments(query),
      }),
      new DynamicTool({
        name: "member_context",
        description: "Get member skills and relationships from the graph database. Input is member email.",
        func: async (email) => JSON.stringify(await graphTool.getMemberContext(email)),
      }),
      new DynamicTool({
        name: "send_email",
        description: "Send email notifications via Gmail. Input: JSON {to, subject, body}.",
        func: async (input) => {
          try {
            const { to, subject, body } = JSON.parse(input);
            await googleServices.sendEmail(to, subject, body);
            return "Email sent successfully";
          } catch (e) {
            return `Email failed: ${e.message}`;
          }
        },
      }),
      new DynamicTool({
        name: "google_drive_files",
        description: "List files from Google Drive.",
        func: async () => JSON.stringify(await googleServices.listDriveFiles()),
      }),
      new DynamicTool({
        name: "event_reminders",
        description: "Get upcoming robotics club events from the system storage.",
        func: async () => {
          try {
            const data = await fs.readFile(path.resolve('data/events.json'), 'utf-8');
            return data;
          } catch (e) {
            return "No upcoming events found.";
          }
        }
      })
    ];

    // 3. Create Agent
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", "You are the Robotics Club Assistant. You use free-tier tools (Groq, MongoDB RAG, Neo4j, Google APIs) to help members. " +
                 "Always use the available tools to find information before answering. Be technical and precise."],
      new MessagesPlaceholder("chat_history"),
      ["human", "{input}"],
      new MessagesPlaceholder("agent_scratchpad"),
    ]);

    const agent = await createOpenAIToolsAgent({
      llm: model,
      tools,
      prompt,
    });

    const agentExecutor = new AgentExecutor({
      agent,
      tools,
    });

    const chatHistory = history.map(msg =>
      msg.role === 'user' ? new HumanMessage(msg.content) : new AIMessage(msg.content)
    );

    const result = await agentExecutor.invoke({
      input: message,
      chat_history: chatHistory,
    });

    // 4. Save assistant response to DB
    await Message.create({ role: 'assistant', content: result.output });

    res.json({ reply: result.output });
  } catch (error) {
    console.error('Chat Error:', error);
    res.status(500).json({ error: 'Agent execution failed' });
  }
};
