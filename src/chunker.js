import { Chroma } from "@langchain/community/vectorstores/chroma";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MarkdownTextSplitter } from "langchain/text_splitter";

/**
 * Chunk and vectorize markdown documents and add them to a Chroma database
 * 
 * @param {Object} params - Configuration parameters
 * @param {string} params.chromaHost - Chroma database host
 * @param {number} params.chromaPort - Chroma database port
 * @param {string} params.chromaTenant - Chroma database tenant
 * @param {string} params.chromaDatabase - Chroma database name
 * @param {string} params.openaiBaseUrl - OpenAI API base URL
 * @param {string} params.openaiApiKey - OpenAI API key
 * @param {string} params.embeddingModel - Embedding model to use
 * @param {string} params.documentPath - Path to the markdown document
 * @param {string} params.collectionName - Name of the Chroma collection
 * @returns {Promise<void>}
 */
async function chunkAndVectorizeMdDocument(params) {
  // Handle both flat params and nested config object
  const config = params.chroma ? {
    chromaHost: params.chroma.host,
    chromaPort: params.chroma.port,
    chromaTenant: params.chroma.tenant,
    chromaDatabase: params.chroma.database,
    openaiBaseUrl: params.openai.baseUrl,
    openaiApiKey: params.openai.apiKey,
    embeddingModel: params.openai.embeddingModel,
    documentPath: params.document.path,
    collectionName: params.document.collectionName
  } : params;

  const {
    chromaHost,
    chromaPort,
    chromaTenant,
    chromaDatabase,
    openaiBaseUrl,
    openaiApiKey,
    embeddingModel,
    documentPath,
    collectionName
  } = config;

  try {
    // Initialize the markdown text splitter
    const splitter = new MarkdownTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    // Read the markdown document
    const fs = await import("fs");
    const path = await import("path");
    const documentContent = fs.readFileSync(path.resolve(documentPath), "utf8");

    // Split the document into chunks
    const docs = await splitter.createDocuments([documentContent]);

    // Initialize OpenAI embeddings
    const embeddings = new OpenAIEmbeddings({
      modelName: embeddingModel,
      openAIApiKey: openaiApiKey,
      configuration: {
        baseURL: openaiBaseUrl,
      },
    });

    // Connect to Chroma database
    const vectorStore = new Chroma(embeddings, {
      collectionName: collectionName,
      url: `http://${chromaHost}:${chromaPort}`,
      tenant: chromaTenant,
      database: chromaDatabase,
    });

    // Add documents to the vector store
    await vectorStore.addDocuments(docs);

    console.log(`Successfully added ${docs.length} document chunks to Chroma database`);
  } catch (error) {
    console.error("Error processing document:", error);
    throw error;
  }
}

export { chunkAndVectorizeMdDocument };