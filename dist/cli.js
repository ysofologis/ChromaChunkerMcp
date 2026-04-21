#!/usr/bin/env node

// src/cli.js
import "dotenv/config";

// src/chunker.js
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MarkdownTextSplitter } from "langchain/text_splitter";
async function chunkAndVectorizeMdDocument(params) {
  const config = params.chroma ? {
    chromaHost: params.chroma.host,
    chromaPort: params.chroma.port,
    chromaTenant: params.chroma.tenant,
    chromaDatabase: params.chroma.database,
    openaiBaseUrl: params.openai.baseUrl,
    openaiApiKey: params.openai.apiKey,
    embeddingModel: params.openai.embeddingModel,
    documentContent: params.document.content,
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
    documentContent,
    collectionName
  } = config;
  try {
    const splitter = new MarkdownTextSplitter({
      chunkSize: 1e3,
      chunkOverlap: 200
    });
    const docs = await splitter.createDocuments([documentContent]);
    const embeddings = new OpenAIEmbeddings({
      modelName: embeddingModel,
      openAIApiKey: openaiApiKey,
      configuration: {
        baseURL: openaiBaseUrl
      }
    });
    const vectorStore = new Chroma(embeddings, {
      collectionName,
      url: `http://${chromaHost}:${chromaPort}`,
      tenant: chromaTenant,
      database: chromaDatabase
    });
    await vectorStore.addDocuments(docs);
    console.log(`Successfully added ${docs.length} document chunks to Chroma database`);
  } catch (error) {
    console.error("Error processing document:", error);
    throw error;
  }
}
async function queryChromaDatabase(params) {
  const config = params.chroma ? {
    chromaHost: params.chroma.host,
    chromaPort: params.chroma.port,
    chromaTenant: params.chroma.tenant,
    chromaDatabase: params.chroma.database,
    openaiBaseUrl: params.openai.baseUrl,
    openaiApiKey: params.openai.apiKey,
    embeddingModel: params.openai.embeddingModel,
    queryText: params.query.text,
    collectionName: params.query.collectionName,
    k: params.query.k
  } : params;
  const {
    chromaHost,
    chromaPort,
    chromaTenant,
    chromaDatabase,
    openaiBaseUrl,
    openaiApiKey,
    embeddingModel,
    queryText,
    collectionName,
    k
  } = config;
  try {
    const embeddings = new OpenAIEmbeddings({
      modelName: embeddingModel,
      openAIApiKey: openaiApiKey,
      configuration: {
        baseURL: openaiBaseUrl
      }
    });
    const vectorStore = new Chroma(embeddings, {
      collectionName,
      url: `http://${chromaHost}:${chromaPort}`,
      tenant: chromaTenant,
      database: chromaDatabase
    });
    const results = await vectorStore.similaritySearch(queryText, k);
    return results.map((doc) => ({
      content: doc.pageContent,
      metadata: doc.metadata
    }));
  } catch (error) {
    console.error("Error querying database:", error);
    throw error;
  }
}

// src/cli.js
import { program } from "commander";
program.name("chroma-chunker-mcp").description("MCP tool for chunking and vectorizing markdown documents and adding them to a Chroma database").version("1.0.0");
program.command("chunk").description("Chunk and vectorize a markdown document").option("-h, --chroma-host <host>", "Chroma database host", process.env.CHROMA_HOST || "localhost").option("-p, --chroma-port <port>", "Chroma database port", process.env.CHROMA_PORT || "8000").option("-t, --chroma-tenant <tenant>", "Chroma database tenant", process.env.CHROMA_TENANT || "default_tenant").option("-d, --chroma-database <database>", "Chroma database name", process.env.CHROMA_DATABASE || "default_database").option("-u, --openai-base-url <url>", "OpenAI API base URL", process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").option("-k, --openai-api-key <key>", "OpenAI API key", process.env.OPENAI_API_KEY).option("-m, --embedding-model <model>", "Embedding model to use", process.env.EMBEDDING_MODEL || "text-embedding-ada-002").option("-c, --collection-name <name>", "Name of the Chroma collection", process.env.COLLECTION_NAME || "documents").option("-t, --document-text <text>", "Markdown document content (pass directly from AI)").action(async (options) => {
  try {
    if (!options.documentText) {
      console.error("Error: --document-text is required (pass document content directly)");
      process.exit(1);
    }
    if (!options.openaiApiKey) {
      console.error("Error: --openai-api-key is required (or set OPENAI_API_KEY in .env)");
      process.exit(1);
    }
    await chunkAndVectorizeMdDocument({
      chroma: {
        host: options.chromaHost,
        port: parseInt(options.chromaPort),
        tenant: options.chromaTenant,
        database: options.chromaDatabase
      },
      openai: {
        baseUrl: options.openaiBaseUrl,
        apiKey: options.openaiApiKey,
        embeddingModel: options.embeddingModel
      },
      document: {
        content: options.documentText,
        collectionName: options.collectionName
      }
    });
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
});
program.command("query").description("Query the Chroma database for similar documents").option("-h, --chroma-host <host>", "Chroma database host", process.env.CHROMA_HOST || "localhost").option("-p, --chroma-port <port>", "Chroma database port", process.env.CHROMA_PORT || "8000").option("-t, --chroma-tenant <tenant>", "Chroma database tenant", process.env.CHROMA_TENANT || "default_tenant").option("-d, --chroma-database <database>", "Chroma database name", process.env.CHROMA_DATABASE || "default_database").option("-u, --openai-base-url <url>", "OpenAI API base URL", process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").option("-k, --openai-api-key <key>", "OpenAI API key", process.env.OPENAI_API_KEY).option("-m, --embedding-model <model>", "Embedding model to use", process.env.EMBEDDING_MODEL || "text-embedding-ada-002").option("-c, --collection-name <name>", "Name of the Chroma collection", process.env.COLLECTION_NAME || "documents").option("-q, --query-text <text>", "Query text to search for").option("-k, --k <number>", "Number of results to return", "5").action(async (options) => {
  try {
    if (!options.queryText) {
      console.error("Error: --query-text is required");
      process.exit(1);
    }
    if (!options.openaiApiKey) {
      console.error("Error: --openai-api-key is required (or set OPENAI_API_KEY in .env)");
      process.exit(1);
    }
    const results = await queryChromaDatabase({
      chroma: {
        host: options.chromaHost,
        port: parseInt(options.chromaPort),
        tenant: options.chromaTenant,
        database: options.chromaDatabase
      },
      openai: {
        baseUrl: options.openaiBaseUrl,
        apiKey: options.openaiApiKey,
        embeddingModel: options.embeddingModel
      },
      query: {
        text: options.queryText,
        collectionName: options.collectionName,
        k: parseInt(options.k)
      }
    });
    console.log(JSON.stringify(results, null, 2));
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
});
program.parse();
//# sourceMappingURL=cli.js.map
