# Create T3 App

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

## What's next? How do I make an app with this?

We try to keep this project as simple as possible, so you can start with just the scaffolding we set up for you, and add additional things later when they become necessary.

If you are not familiar with the different technologies used in this project, please refer to the respective docs. If you still are in the wind, please join our [Discord](https://t3.gg/discord) and ask for help.

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Drizzle](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.

## Vector Database Integration

The application uses Pinecone as its vector database for semantic search capabilities. To set up Pinecone:

1. Create a Pinecone account at [pinecone.io](https://www.pinecone.io/)
2. Create a new index with the following settings:

   - Dimensions: 1536 (matches OpenAI's text-embedding-3-small model)
   - Metric: Cosine
   - Pod Type: Starter (for development) or an appropriate size for production

3. Get your API key and index name from the Pinecone dashboard

4. add them to .env

5. Test the integration:
   ```bash
   bun scripts/test-pinecone.ts
   ```

The integration includes:

- Vector storage for document embeddings
- Semantic search using OpenAI embeddings
- Caching layer for improved performance
- Utility functions for querying and storing documents

For more details, see the implementation in `src/lib/ai/vectordb.ts`.

## Implementation Progress

We've completed the following steps from our implementation plan:

1. ✅ Initialize Next.js Project
2. ✅ Configure Authentication
3. ✅ Set Up Supabase for Data Storage
4. ✅ Install Vercel AI SDK
5. ✅ Install UI Component Library
6. ✅ Build Chat Interface with AI SDK
7. ✅ Create API Routes for AI
8. ✅ Implement Vector Database Integration
9. ✅ Implement RAG with AI SDK

### RAG Implementation

The RAG (Retrieval Augmented Generation) functionality has been implemented using:

1. **Context Retrieval** - Using Pinecone vector database to fetch relevant documents based on the user's query.
2. **Context Processing** - Formatting the retrieved documents into a coherent context that can be used by the LLM.
3. **RAG System Prompt** - A tailored system prompt that instructs the LLM to use the provided context.
4. **Enhanced Chat API** - The chat API now retrieves relevant context for each user message.

### Verification

To verify the RAG implementation:

1. Run the unit tests: `bun test src/lib/ai/rag.test.ts`
2. Run the application in development mode: `bun run dev`
3. Navigate to the chat interface and ask a question related to your knowledge base.
4. The response should include information from your vector database rather than general knowledge.

### Implementation Files

- `src/lib/ai/rag.ts` - Core RAG implementation
- `src/app/api/chat/route.ts` - Enhanced chat API endpoint that uses RAG
- `src/lib/ai/rag.test.ts` - Tests for the RAG implementation
