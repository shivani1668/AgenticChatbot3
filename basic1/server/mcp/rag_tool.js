import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { MongoClient } from "mongodb";

/**
 * Tool for Document Retrieval using MongoDB Vector Search
 * This is the "Free Tier" alternative for RAG.
 */
export const getVectorStore = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined");
  }

  const client = new MongoClient(process.env.MONGODB_URI);
  const collection = client.db("robotics_club").collection("documents");

  // Using HuggingFace for 100% free embeddings (No OpenAI key needed)
  const embeddings = new HuggingFaceInferenceEmbeddings({
    apiKey: process.env.HUGGINGFACEHUB_API_TOKEN,
  });

  return new MongoDBAtlasVectorSearch(embeddings, {
    collection,
    indexName: "vector_index",
    textKey: "text",
    embeddingKey: "embedding",
  });
};

export const searchDocuments = async (query) => {
  try {
    const vectorStore = await getVectorStore();
    const results = await vectorStore.similaritySearch(query, 3);
    return results.map(doc => doc.pageContent).join("\n\n");
  } catch (error) {
    console.error("RAG Search Error:", error);
    return "Could not retrieve documents at this time.";
  }
};
