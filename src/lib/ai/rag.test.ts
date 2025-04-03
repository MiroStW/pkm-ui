import { describe, it, expect, beforeEach, spyOn } from "bun:test";
import {
  getRelevantContext,
  createRagSystemMessage,
  createRagOpenAIProvider,
} from "./rag";
import * as vectordb from "./vectordb";
import type { CoreMessage } from "ai";

// Mock data for queryVectorDB
const mockResults = [
  {
    id: "doc1",
    score: 0.95,
    metadata: {
      source: "Example Document",
      text: "This is a sample document for testing RAG functionality.",
    },
    content: "This is a sample document for testing RAG functionality.",
  },
];

describe("RAG (Retrieval Augmented Generation)", () => {
  beforeEach(() => {
    // Set up spy for queryVectorDB
    spyOn(vectordb, "queryVectorDB").mockImplementation(
      async () => mockResults,
    );
  });

  it("should retrieve relevant context based on query", async () => {
    // Act
    const result = await getRelevantContext("test query");

    // Assert
    expect(result).toBeDefined();
    expect(result.documents).toHaveLength(1);
    expect(result.contextText).toContain("This is a sample document");
    expect(result.contextText).toContain("Source: Example Document");
  });

  it("should create a system message with context", () => {
    // Arrange
    const contextText = "Sample context for testing";

    // Act
    const systemMessage = createRagSystemMessage(contextText);

    // Assert
    expect(systemMessage.role).toBe("system");
    expect(systemMessage.content).toContain("Sample context for testing");
    expect(systemMessage.id).toBeDefined();
  });

  it("should create a RAG-enhanced provider with context", async () => {
    // Arrange
    const queryText = "test query";
    const messages: CoreMessage[] = [
      {
        role: "user",
        content: "test query",
      },
    ];

    // Act
    const result = await createRagOpenAIProvider(queryText, messages);

    // Assert
    expect(result.provider).toBeDefined();
    expect(result.messages).toHaveLength(2); // System message + user message

    // Safely access message properties with optional chaining
    expect(result.messages[0]?.role).toBe("system");
    expect(result.messages[1]?.role).toBe("user");
    expect(result.messages[1]?.content).toBe("test query");

    // Check content of system message contains our mock data
    const systemContent = result.messages[0]?.content;
    expect(typeof systemContent === "string" && systemContent).toContain(
      "This is a sample document",
    );
  });
});
