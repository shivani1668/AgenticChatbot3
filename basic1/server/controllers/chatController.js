import { ChatGroq } from "@langchain/groq";
import { DynamicTool } from "@langchain/core/tools";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import * as ragTool from '../mcp/rag_tool.js';
import * as graphTool from '../mcp/graph_tool.js';
import * as googleServices from '../mcp/google_services.js';
import fs from 'fs/promises';
import path from 'path';

export const handleChat = async (req, res) => {
  const { id: conversationId } = req.params;
  const { content: message } = req.body;

  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

    const prevMessages = await Message.find({ conversationId }).sort({ createdAt: 1 }).limit(10);

    // FIXED: Use object format { content: ... } for LangChain messages
    const history = prevMessages.map(msg =>
      msg.role === 'user'
        ? new HumanMessage({ content: msg.content })
        : new AIMessage({ content: msg.content })
    );

    await Message.create({ conversationId, role: 'user', content: message });

    // FIXED: Using llama-3.1-8b-instant (llama3-8b-8192 is decommissioned)
    const model = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      modelName: "llama-3.1-8b-instant",
      temperature: 0.1,
    });

    const tools = [
      new DynamicTool({
        name: "general_search",
        description: "Search for technical documents and club rules. Input: search query.",
        func: async (query) => {
          try {
            return await ragTool.searchDocuments(query);
          } catch (e) {
            return "Search tool currently unavailable. Answering from general knowledge.";
          }
        },
      }),
      new DynamicTool({
        name: "member_context",
        description: "Get member skills from Neo4j. Input: email.",
        func: async (email) => JSON.stringify(await graphTool.getMemberContext(email)),
      }),
      new DynamicTool({
        name: "send_email",
        description: "Send emails via Gmail. Input: JSON {to, subject, body}.",
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
        description: "List files from Google Drive. Takes no input.",
        func: async () => JSON.stringify(await googleServices.listDriveFiles()),
      })
    ];

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", "You are the Robotics Club Assistant. Provide natural language answers. NEVER show raw tool calls or tags like <function> to the user."],
      new MessagesPlaceholder("chat_history"),
      ["human", "{input}"],
      new MessagesPlaceholder("agent_scratchpad"),
    ]);

    // FIXED: Using createToolCallingAgent for better Llama 3 support
    const agent = await createToolCallingAgent({
      llm: model,
      tools,
      prompt,
    });

    const agentExecutor = new AgentExecutor({
      agent,
      tools,
      verbose: false,
    });

    const result = await agentExecutor.invoke({
      input: message,
      chat_history: history,
    });

    const assistantMsg = await Message.create({ conversationId, role: 'assistant', content: result.output });
    await Conversation.findByIdAndUpdate(conversationId, { updatedAt: Date.now() });

    res.json(assistantMsg);
  } catch (error) {
    console.error('Chat Error:', error);
    res.status(500).json({ error: 'Agent execution failed' });
  }
};
