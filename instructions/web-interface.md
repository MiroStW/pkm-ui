---
id: 78v1pgiwar9dqrjkej4lkj5
title: Web Interface
desc: >-
  Web interface design and technology decisions for personal knowledge
  management chatbot
updated: 1743512001754
created: "2024-06-23T17:25:12.000Z"
---

# PKM Chatbot: Web Interface

## Overview

This document outlines the web interface development decisions for the PKM chatbot. These decisions focus on the technology stack, component libraries, streaming implementations, and data storage approaches.

## Technology Stack Decision

### Decision: Next.js + React

After evaluating multiple technology stack options including:

- Next.js + React
- Flask/FastAPI + Vue/React
- Streamlit

We've chosen **Next.js with React** for the implementation.

### Rationale

- **Unified deployment**: Single codebase for frontend and backend
- **API Routes**: Built-in serverless functions for backend logic
- **Modern React features**: Server components, suspense, etc.
- **Optimized for web interfaces**: Superior UI capabilities for chat experiences
- **Vercel integration**: Excellent performance on Vercel hosting platform

### Considered and Rejected

- **Flask/FastAPI + Vue/React**: Requires managing separate frontend/backend codebases
- **Streamlit**: Less customization capability and potentially less polished UI

## Hosting Decision

### Decision: Vercel

We've selected **Vercel** as our hosting platform for the Next.js application.

### Rationale

- **Next.js optimization**: Purpose-built for Next.js applications
- **Cold start prevention**: Available on paid tier to avoid latency issues
- **Developer experience**: Excellent CI/CD and deployment features
- **Performance**: Edge functions and global CDN for fast response times
- **Integration with chat storage**: Native integration with Vercel KV

## Component Libraries

### Decision: Shadcn/ui

After evaluating multiple component library options:

- Shadcn/ui
- Tailwind + HeadlessUI
- Chakra UI

We've chosen **Shadcn/ui** for the implementation.

### Rationale

- **Copy-paste approach**: No additional dependencies
- **Built on primitives**: Uses Radix UI for accessibility
- **Tailwind integration**: Consistent with styling approach
- **Customizability**: Highly flexible design system

## Streaming Implementation

### Decision: Vercel AI SDK

After evaluating multiple streaming options:

- Server-Sent Events (SSE)
- Vercel AI SDK
- React Server Components with Suspense

We've chosen **Vercel AI SDK** for the implementation.

### Rationale

- **Purpose-built for AI**: Optimized for LLM response streaming
- **Seamless integration**: Works well with OpenAI/Claude
- **React hooks**: Provides useful abstractions for chat UIs
- **Token streaming**: Efficient handling of incremental responses
- **Vercel compatibility**: Designed to work optimally on Vercel hosting

## Chat Storage

### Decision: Supabase PostgreSQL

After evaluating multiple chat storage options:

- Client-side storage (LocalStorage/IndexedDB)
- Serverless database options
- Vector DB extension

We've chosen **Supabase PostgreSQL** for the implementation.

### Rationale

- **Consolidated infrastructure**: Uses the same database as our authentication system
- **Relational capabilities**: Can model conversations with users and messages in a structured way
- **Cross-device access**: Conversations available from any device
- **Persistent storage**: Data remains available long-term
- **Real-time capabilities**: Potential for real-time updates using Supabase's real-time features
- **Simplicity**: Reduces external dependencies by using one database service for multiple needs

### Implementation Details

- **Storage pattern**: Relational tables for users, chat sessions, and messages
- **Data structure**: Normalized database design with appropriate relationships
- **Access pattern**: Server-side access via Supabase client

## Architecture Details

- **Authentication**: NextAuth.js with Supabase credential provider
- **State Management**: React Context with SWR for data fetching
- **Data Flow**: Client → API Routes → Vector DB → LLM → Streaming Response
- **Search Refinement**: Implement filters using Pinecone metadata filtering capabilities

## Key Components

1. **Chat Interface**

   - Chat message display with markdown rendering
   - Input area with send functionality
   - Loading states and error handling

2. **Search Refinement**

   - Date range filters
   - Tag/category filters
   - Search scope adjustments

3. **Authentication System**
   - Simple login screen
   - Session management
   - Secure token handling

## Implementation Phases

1. **Core Chat Functionality**

   - Basic chat interface
   - Integration with vector database
   - LLM query processing

2. **Search Refinement Features**

   - Metadata-based filtering
   - Context control options
   - Result quality improvements

3. **Cross-Device Synchronization**
   - Chat history persistence
   - Settings synchronization
   - Session management

## Related Notes

For the overall project architecture and implementation phases, see:
[[tech.projects.pkm-chatbot]]

For embedding pipeline details, see:
[[tech.projects.pkm-chatbot.embedding-pipeline]]

For cloud infrastructure decisions, see:
[[tech.projects.pkm-chatbot.cloud-infrastructure]]
