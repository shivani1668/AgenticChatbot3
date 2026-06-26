# Robotics Club Agentic Chatbot

An intelligent assistant for the Robotics Club built with the MERN stack.

## Structure
- `/server`: Node.js/Express backend with LangChain, Groq, MongoDB, and Neo4j.
- `/client`: React/Vite frontend with Tailwind CSS.

## Setup
1. Clone the repository.
2. In `/server`:
   - Create a `.env` file based on `.env.example`.
   - Run `npm install` and `npm start`.
3. In `/client`:
   - Run `npm install` and `npm run dev`.

## Features
- AI-powered Q&A (Groq/Llama 3).
- Document Retrieval (RAG via MongoDB Vector Search).
- Google Service Integration (Gmail, Drive).
- Member Context Mapping (Neo4j).
