// Example usage of the chroma-chunker-mcp tool
import { chunkAndVectorizeMdDocument } from "./src/chunker.js";
import config from "./config.json";

// Run the chunking and vectorizing process
async function runExample() {
  try {
    await chunkAndVectorizeMdDocument(config);
    console.log("Document processing completed successfully!");
  } catch (error) {
    console.error("Error processing document:", error);
  }
}

// Uncomment the line below to run the example
// runExample();