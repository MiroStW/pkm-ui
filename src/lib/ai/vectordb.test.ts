import { describe, expect, it, beforeEach, spyOn } from "bun:test";
import {
  queryVectorDB,
  insertDocument,
  getPineconeClient,
  getPineconeIndex,
  clearVectorSearchCache,
} from "./vectordb";
import * as embeddingModule from "./embedding";

describe("Vector Database Integration", () => {
  beforeEach(() => {
    clearVectorSearchCache();

    spyOn(embeddingModule, "createEmbedding").mockImplementation(() =>
      Promise.resolve([0.1, 0.2, 0.3]),
    );

    spyOn(embeddingModule, "calculateSimilarity").mockImplementation(() => 0.9);
  });

  it("should have Pinecone client and index", () => {
    const client = getPineconeClient();
    expect(client).toBeDefined();

    const index = getPineconeIndex();
    expect(index).toBeDefined();
  });

  it("should insert and query documents in mock mode", async () => {
    // Insert a document
    const result = await insertDocument("test-doc-1", "Test document content", {
      source: "test",
    });

    expect(result).toBeDefined();
    if (result) {
      expect(result.upsertedCount).toBe(1);
    }

    // Query for documents
    const results = await queryVectorDB("test query");

    expect(results).toBeDefined();
    expect(Array.isArray(results)).toBe(true);
  });

  it("should cache repeated queries", async () => {
    await queryVectorDB("same query");
    await queryVectorDB("same query");

    // Second query should use the cache
    await queryVectorDB("different query");

    // Verify createEmbedding was called exactly twice (once for each unique query)
    expect(embeddingModule.createEmbedding).toHaveBeenCalledTimes(2);
  });
});
