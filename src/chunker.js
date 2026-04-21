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
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const docs = await splitter.createDocuments([documentContent]);

    const embeddings = new OpenAIEmbeddings({
      modelName: embeddingModel,
      openAIApiKey: openaiApiKey,
      configuration: {
        baseURL: openaiBaseUrl,
      },
    });

    const vectorStore = new Chroma(embeddings, {
      collectionName: collectionName,
      url: `http://${chromaHost}:${chromaPort}`,
      tenant: chromaTenant,
      database: chromaDatabase,
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
        baseURL: openaiBaseUrl,
      },
    });

    const vectorStore = new Chroma(embeddings, {
      collectionName: collectionName,
      url: `http://${chromaHost}:${chromaPort}`,
      tenant: chromaTenant,
      database: chromaDatabase,
    });

    const results = await vectorStore.similaritySearch(queryText, k);

    return results.map(doc => ({
      content: doc.pageContent,
      metadata: doc.metadata
    }));
  } catch (error) {
    console.error("Error querying database:", error);
    throw error;
  }
}

export { chunkAndVectorizeMdDocument, queryChromaDatabase };