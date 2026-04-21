# Chroma Chunker MCP

MCP tool for chunking and vectorizing markdown documents and adding them to a Chroma database.

## Features

- Uses Langchain's markdown text splitter for intelligent document chunking
- Supports configurable chunk size and overlap
- Integrates with OpenAI API for generating embeddings
- Configurable OpenAI base URL, API key, and embedding model
- Connects to Chroma database with host, port, tenant, and database parameters
- Command-line interface for easy usage
- Loads configuration from `.env` file
- Query Chroma database for similar documents

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file in the project root with your configuration:

```env
# Chroma Configuration
CHROMA_HOST=localhost
CHROMA_PORT=8000
CHROMA_TENANT=default_tenant
CHROMA_DATABASE=default_database
COLLECTION_NAME=documents

# OpenAI Configuration
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_API_KEY=your-api-key-here
EMBEDDING_MODEL=text-embedding-ada-002
```

## Usage

### Chunk Command (Vectorize Document)

Pass the document content directly from the AI assistant:

```bash
npx chroma-chunker-mcp chunk \
  --document-text "# My Document\n\nThis is the content..." \
  --collection-name my_collection
```

### Query Command (Search Documents)

```bash
npx chroma-chunker-mcp query \
  --query-text "search term" \
  --collection-name my_collection \
  --k 5
```

### Programmatic Usage

```javascript
import { chunkAndVectorizeMdDocument, queryChromaDatabase } from "chroma-chunker-mcp";

await chunkAndVectorizeMdDocument({
  chromaHost: "localhost",
  chromaPort: 8000,
  chromaTenant: "default_tenant",
  chromaDatabase: "default_database",
  openaiBaseUrl: "https://api.openai.com/v1",
  openaiApiKey: "YOUR_API_KEY",
  embeddingModel: "text-embedding-ada-002",
  documentContent: "# My Document\n\nContent here...",
  collectionName: "my_collection"
});

const results = await queryChromaDatabase({
  chromaHost: "localhost",
  chromaPort: 8000,
  chromaTenant: "default_tenant",
  chromaDatabase: "default_database",
  openaiBaseUrl: "https://api.openai.com/v1",
  openaiApiKey: "YOUR_API_KEY",
  embeddingModel: "text-embedding-ada-002",
  queryText: "search term",
  collectionName: "my_collection",
  k: 5
});
```

## MCP Server Configuration

### Claude Desktop

Add this to your Claude Desktop settings (settings.json):

```json
{
  "mcpServers": {
    "chroma-chunker": {
      "command": "node",
      "args": ["/absolute/path/to/chroma-chunker-mcp/dist/cli.js"],
      "env": {
        "CHROMA_HOST": "localhost",
        "CHROMA_PORT": "8000",
        "CHROMA_TENANT": "default_tenant",
        "CHROMA_DATABASE": "default_database",
        "OPENAI_BASE_URL": "https://api.openai.com/v1",
        "OPENAI_API_KEY": "your-api-key-here",
        "EMBEDDING_MODEL": "text-embedding-ada-002",
        "COLLECTION_NAME": "documents"
      }
    }
  }
}
```

The AI assistant will call the tool with arguments like:

```json
{
  "name": "chunk",
  "arguments": {
    "document-text": "# My Document\n\nContent here...",
    "collection-name": "my_collection"
  }
}
```

Or for querying:

```json
{
  "name": "query",
  "arguments": {
    "query-text": "search term",
    "collection-name": "my_collection",
    "k": 5
  }
}
```

### Docker-based MCP Server

```json
{
  "mcpServers": {
    "chroma-chunker": {
      "command": "docker",
      "args": [
        "run", "--rm",
        "-v", "/path/to/documents:/documents",
        "chroma-chunker-mcp:latest",
        "chunk",
        "--document-path", "/documents/sample.md",
        "--collection-name", "my_collection"
      ],
      "env": {
        "CHROMA_HOST": "localhost",
        "CHROMA_PORT": "8000",
        "CHROMA_TENANT": "default_tenant",
        "CHROMA_DATABASE": "default_database",
        "OPENAI_BASE_URL": "https://api.openai.com/v1",
        "OPENAI_API_KEY": "your-api-key-here",
        "EMBEDDING_MODEL": "text-embedding-ada-002"
      }
    }
  }
}
```

## Configuration Options

### Chunk Command Options

| Option | Environment Variable | Description | Default Value |
|--------|---------------------|-------------|---------------|
| `--chroma-host` | `CHROMA_HOST` | Chroma database host | `localhost` |
| `--chroma-port` | `CHROMA_PORT` | Chroma database port | `8000` |
| `--chroma-tenant` | `CHROMA_TENANT` | Chroma database tenant | `default_tenant` |
| `--chroma-database` | `CHROMA_DATABASE` | Chroma database name | `default_database` |
| `--openai-base-url` | `OPENAI_BASE_URL` | OpenAI API base URL | `https://api.openai.com/v1` |
| `--openai-api-key` | `OPENAI_API_KEY` | OpenAI API key | (required) |
| `--embedding-model` | `EMBEDDING_MODEL` | Embedding model to use | `text-embedding-ada-002` |
| `--document-text` | - | Markdown document content (pass directly from AI) | (required) |
| `--collection-name` | `COLLECTION_NAME` | Name of the Chroma collection | `documents` |

### Query Command Options

| Option | Environment Variable | Description | Default Value |
|--------|---------------------|-------------|---------------|
| `--chroma-host` | `CHROMA_HOST` | Chroma database host | `localhost` |
| `--chroma-port` | `CHROMA_PORT` | Chroma database port | `8000` |
| `--chroma-tenant` | `CHROMA_TENANT` | Chroma database tenant | `default_tenant` |
| `--chroma-database` | `CHROMA_DATABASE` | Chroma database name | `default_database` |
| `--openai-base-url` | `OPENAI_BASE_URL` | OpenAI API base URL | `https://api.openai.com/v1` |
| `--openai-api-key` | `OPENAI_API_KEY` | OpenAI API key | (required) |
| `--embedding-model` | `EMBEDDING_MODEL` | Embedding model to use | `text-embedding-ada-002` |
| `--query-text` | - | Query text to search for | (required) |
| `--collection-name` | `COLLECTION_NAME` | Name of the Chroma collection | `documents` |
| `--k` | - | Number of results to return | `5` |

## Dependencies

- [Langchain](https://js.langchain.com/)
- [ChromaDB](https://github.com/chroma-core/chroma)
- [OpenAI](https://github.com/openai/openai-node)
- [Commander](https://github.com/tj/commander.js/)
- [Dotenv](https://github.com/motdotla/dotenv)

## License

MIT