/**
 * Simple script to test Pinecone integration
 * Run with: bun scripts/test-pinecone.ts
 */
import { queryVectorDB, insertDocument } from "../src/lib/ai/vectordb";
import { createEmbedding, generateChunks } from "../src/lib/ai/embedding";

async function testPineconeIntegration() {
  console.log("--- Testing Pinecone Integration ---");

  try {
    // 1. Test embedding creation
    const text =
      "This is a test document to verify that our vector database integration works correctly.";
    console.log(`Creating embedding for: "${text}"`);
    const embedding = await createEmbedding(text);
    console.log(`Generated embedding with ${embedding.length} dimensions`);

    // 2. Test document insertion
    console.log("\nInserting test document into Pinecone...");
    const docId = `test-doc-${Date.now()}`;
    const insertResult = await insertDocument(docId, text, {
      source: "test-script",
      category: "test",
    });
    console.log("Insert result:", insertResult);

    // 3. Test querying
    console.log("\nQuerying for similar documents...");
    const queryText = "vector database integration test";
    const searchResults = await queryVectorDB(queryText, 5);

    console.log(
      `Found ${searchResults.length} results for query: "${queryText}"`,
    );

    // Display results
    searchResults.forEach((result, index) => {
      console.log(`\nResult ${index + 1}:`);
      console.log(`ID: ${result.id}`);
      console.log(`Score: ${result.score.toFixed(4)}`);
      console.log(`Content: "${result.content?.substring(0, 100)}..."`);
    });

    // 4. Test chunking
    console.log("\nTesting text chunking for large documents...");
    const largeText = `
      This is paragraph one of a larger document. It contains multiple sentences that should be chunked properly.
      This is a second paragraph with even more content. The chunking algorithm should handle this appropriately.
      Here's a third paragraph with additional text. We want to make sure that chunks are created with appropriate sizes.
      This fourth paragraph ensures that we have enough text to create multiple chunks. The implementation should
      divide this text into chunks that are suitable for embedding and storage in the vector database.
    `;

    const chunks = generateChunks(largeText);
    console.log(`Generated ${chunks.length} chunks from sample text`);
    chunks.forEach((chunk, index) => {
      console.log(`\nChunk ${index + 1} (${chunk.length} chars):`);
      console.log(`"${chunk.substring(0, 50)}..."`);
    });

    console.log("\n--- Pinecone Integration Test Completed Successfully ---");
  } catch (error) {
    console.error("Error during Pinecone integration test:", error);
    process.exit(1);
  }
}

// Run the test function and properly handle the promise
void testPineconeIntegration();
