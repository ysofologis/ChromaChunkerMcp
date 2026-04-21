# Chroma Chunker MCP

MCP tool for chunking and vectorizing markdown documents and adding them to a Chroma database.

## Features

- Uses Langchain's markdown text splitter for intelligent document chunking
- Supports configurable chunk size and overlap
- Integrates with OpenAI API for generating embeddings
- Configurable OpenAI base URL, API key, and embedding model
- Connects to Chroma database with host, port, tenant, and database parameters
- Command-line interface for easy usage

## Installation

```bash
npm install
```

## Usage

### Command Line Interface

```bash
npx chroma-chunker-mcp \
  --chroma-host localhost \
  --chroma-port 8000 \
  --chroma-tenant default_tenant \
  --chroma-database default_database \
  --openai-base-url https://api.openai.com/v1 \
  --openai-api-key YOUR_API_KEY \
  --embedding-model text-embedding-ada-002 \
  --document-path ./path/to/document.md \
  --collection-name my_collection
```

### Programmatic Usage

```javascript
import { chunkAndVectorizeMdDocument } from "chroma-chunker-mcp";

await chunkAndVectorizeMdDocument({
  chromaHost: "localhost",
  chromaPort: 8000,
  chromaTenant: "default_tenant",
  chromaDatabase: "default_database",
  openaiBaseUrl: "https://api.openai.com/v1",
  openaiApiKey: "YOUR_API_KEY",
  embeddingModel: "text-embedding-ada-002",
  documentPath: "./path/to/document.md",
  collectionName: "my_collection"
});
```

## Configuration Options

| Option | Description | Default Value |
|--------|-------------|---------------|
| `--chroma-host` | Chroma database host | `localhost` |
| `--chroma-port` | Chroma database port | `8000` |
| `--chroma-tenant` | Chroma database tenant | `default_tenant` |
| `--chroma-database` | Chroma database name | `default_database` |
| `--openai-base-url` | OpenAI API base URL | `https://api.openai.com/v1` |
| `--openai-api-key` | OpenAI API key | (required) |
| `--embedding-model` | Embedding model to use | `text-embedding-ada-002` |
| `--document-path` | Path to the markdown document | (required) |
| `--collection-name` | Name of the Chroma collection | `documents` |

## Dependencies

- [Langchain](https://js.langchain.com/)
- [ChromaDB](https://github.com/chroma-core/chroma)
- [OpenAI](https://github.com/openai/openai-node)
- [Commander](https://github.com/tj/commander.js/)

## License

MIT