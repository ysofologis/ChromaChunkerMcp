#!/usr/bin/env node

import 'dotenv/config';
import { chunkAndVectorizeMdDocument, queryChromaDatabase } from "./chunker.js";
import { program } from "commander";

program
  .name("chroma-chunker-mcp")
  .description("MCP tool for chunking and vectorizing markdown documents and adding them to a Chroma database")
  .version("1.0.0");

program
  .command("chunk")
  .description("Chunk and vectorize a markdown document")
  .option("-h, --chroma-host <host>", "Chroma database host", process.env.CHROMA_HOST || "localhost")
  .option("-p, --chroma-port <port>", "Chroma database port", process.env.CHROMA_PORT || "8000")
  .option("-t, --chroma-tenant <tenant>", "Chroma database tenant", process.env.CHROMA_TENANT || "default_tenant")
  .option("-d, --chroma-database <database>", "Chroma database name", process.env.CHROMA_DATABASE || "default_database")
  .option("-u, --openai-base-url <url>", "OpenAI API base URL", process.env.OPENAI_BASE_URL || "https://api.openai.com/v1")
  .option("-k, --openai-api-key <key>", "OpenAI API key", process.env.OPENAI_API_KEY)
  .option("-m, --embedding-model <model>", "Embedding model to use", process.env.EMBEDDING_MODEL || "text-embedding-ada-002")
  .option("-c, --collection-name <name>", "Name of the Chroma collection", process.env.COLLECTION_NAME || "documents")
  .option("-t, --document-text <text>", "Markdown document content (pass directly from AI)")
  .action(async (options) => {
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

program
  .command("query")
  .description("Query the Chroma database for similar documents")
  .option("-h, --chroma-host <host>", "Chroma database host", process.env.CHROMA_HOST || "localhost")
  .option("-p, --chroma-port <port>", "Chroma database port", process.env.CHROMA_PORT || "8000")
  .option("-t, --chroma-tenant <tenant>", "Chroma database tenant", process.env.CHROMA_TENANT || "default_tenant")
  .option("-d, --chroma-database <database>", "Chroma database name", process.env.CHROMA_DATABASE || "default_database")
  .option("-u, --openai-base-url <url>", "OpenAI API base URL", process.env.OPENAI_BASE_URL || "https://api.openai.com/v1")
  .option("-k, --openai-api-key <key>", "OpenAI API key", process.env.OPENAI_API_KEY)
  .option("-m, --embedding-model <model>", "Embedding model to use", process.env.EMBEDDING_MODEL || "text-embedding-ada-002")
  .option("-c, --collection-name <name>", "Name of the Chroma collection", process.env.COLLECTION_NAME || "documents")
  .option("-q, --query-text <text>", "Query text to search for")
  .option("-k, --k <number>", "Number of results to return", "5")
  .action(async (options) => {
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