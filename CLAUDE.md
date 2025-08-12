# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Commands
```bash
# Initial setup (installs dependencies, generates Prisma client, runs migrations)
npm run setup

# Development server with Turbopack (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Run all tests
npm run test

# Run specific test file
npm run test -- src/components/chat/__tests__/ChatInterface.test.tsx

# Run tests matching pattern
npm run test -- -t "ChatInterface"

# Database reset (clears all data)
npm run db:reset

# Prisma migrations
npx prisma migrate dev    # Create/apply migrations
npx prisma generate       # Regenerate Prisma client
```

## Architecture Overview

This is an AI-powered React component generator with live preview capabilities. The application allows users to generate React components through chat interactions with Claude AI.

### Core Architecture

1. **Virtual File System**: The application uses an in-memory virtual file system (`VirtualFileSystem` class in `src/lib/file-system.ts`) that allows real-time code generation without writing to disk. Files are serialized/deserialized for persistence.

2. **AI Integration**: 
   - Uses Anthropic Claude via Vercel AI SDK (`src/lib/provider.ts`)
   - Streaming responses with tool calling support
   - Custom tools: `str_replace_editor` for code editing and `file_manager` for file operations
   - Falls back to mock provider when no API key is configured

3. **Real-time Preview**:
   - JSX transformation happens client-side using Babel standalone (`src/lib/transform/jsx-transformer.ts`)
   - Components are rendered in isolated iframe (`src/components/preview/PreviewFrame.tsx`)
   - Hot reload on file changes via context updates

4. **Data Persistence**:
   - SQLite database via Prisma ORM
   - Projects store serialized messages and virtual file system data as JSON
   - Anonymous users get temporary projects, authenticated users get persistent storage

### Key Design Patterns

- **Context-based State Management**: File system and chat state managed via React contexts
- **Server Actions**: Database operations use Next.js server actions (`src/actions/`)
- **JWT Authentication**: Custom JWT implementation for session management (`src/lib/auth.ts`)
- **Tool Pattern**: AI tools follow a builder pattern for dependency injection

### Testing Strategy

- Unit tests using Vitest with React Testing Library
- Tests located in `__tests__` folders adjacent to components
- Mock providers for testing without API dependencies
- Use comments sparingly. Only comment complex code step by step.
- Use comments sparingly. Only comment complex code step by step.
- The database schema is defined in the @prisma\schema.prisma file. Reference it anytime you need to understand the structure of data stored in the database.