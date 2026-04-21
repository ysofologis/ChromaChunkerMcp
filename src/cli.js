#!/usr/bin/env node

import { chunkAndVectorizeMdDocument } from "./chunker.js";
import { program } from "commander";

program
  .name("chroma-chunker-mcp")
  .description("MCP tool for chunking and vectorizing markdown documents and adding them to a Chroma database")
  .version("1.0.0");

program
  .option("-h, --chroma-host <host>", "Chroma database host", "localhost")
  .option("-p, --chroma-port <port>", "Chroma database port", "8000")
  .option("-t, --chroma-tenant <tenant>", "Chroma database tenant", "default_tenant")
  .option("-d, --chroma-database <database>", "Chroma database name", "default_database")
  .option("-u, --openai-base-url <url>", "OpenAI API base URL", "https://api.openai.com/v1")
  .option("-k, --openai-api-key <key>", "OpenAI API key")
  .option("-m, --embedding-model <model>", "Embedding model to use", "text-embedding-ada-002")
  .option("-f, --document-path <path>", "Path to the markdown document")
  .option("-c, --collection-name <name>", "Name of the Chroma collection", "documents")
  .action(async (options) => {
    try {
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
          path: options.documentPath,
          collectionName: options.collectionName
        }
      });
    } catch (error) {
      console.error("Error:", error.message);
      process.exit(1);
    }
  });

program.parse();