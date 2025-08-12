# UIGen 🎨

**AI-powered React component generator with live preview and virtual file system**

UIGen is a sophisticated web application that allows developers to generate React components through natural language conversations with Claude AI. Features real-time preview, syntax highlighting, and a complete virtual file system - all without writing files to disk.

## ✨ Key Features

- 🤖 **AI-Powered Generation**: Natural language to React components using Claude AI
- 👀 **Live Preview**: Real-time component rendering with hot reload
- 💾 **Virtual File System**: Complete in-memory file system with persistence
- 🎯 **Smart Code Editor**: Monaco editor with syntax highlighting and IntelliSense
- 🔄 **Iterative Development**: Continue conversations to refine components
- 👤 **User Management**: Anonymous users for quick testing, authenticated users for persistence
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🏗️ Architecture Overview

### Core Components

- **Virtual File System**: In-memory file system (`VirtualFileSystem` class) that enables real-time code generation without disk I/O
- **AI Integration**: Anthropic Claude via Vercel AI SDK with streaming responses and custom tool calling
- **Live Preview**: Client-side JSX transformation using Babel standalone with iframe-based component rendering
- **Data Persistence**: SQLite database via Prisma ORM storing projects as serialized JSON
- **Authentication**: Custom JWT implementation for session management

### Tech Stack

### Prerequisites

- Node.js 18+ 
- npm or yarn
- (Optional) Anthropic API key for AI functionality

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd uigen
   ```

2. **Install dependencies and setup database**
   ```bash
   npm run setup
   ```
   This command will:
   - Install all dependencies
   - Generate Prisma client
   - Run database migrations

3. **Configure AI (Optional)**
   
   Create a `.env.local` file and add your Anthropic API key:
   ```env
   ANTHROPIC_API_KEY=your-api-key-here
   ```
   
   > **Note**: The project will run without an API key using mock responses for development and testing.

### Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## 📖 Usage Guide

### Getting Started

1. **Choose Authentication**
   - **Anonymous**: Quick start with temporary projects
   - **Sign Up**: Persistent projects and history

2. **Create Components**
   - Describe your component in natural language
   - Example: *"Create a modern card component with hover effects"*
   - The AI will generate React code with TypeScript and Tailwind CSS

3. **Live Preview**
   - Switch between **Chat** and **Preview** tabs
   - See your components render in real-time
   - Hot reload on code changes

4. **Code Editor**
   - View and edit generated files in the **Code** tab
   - Full Monaco editor with syntax highlighting
   - File tree navigation for multi-file projects

5. **Iterate and Refine**
   - Continue the conversation to modify components
   - Add features, fix bugs, or change styling
   - Export final code when satisfied

### Example Prompts

```
"Create a responsive navigation header with a logo and menu items"
"Build a product card with image, title, price, and add to cart button"
"Make a loading spinner with smooth animations"
"Create a form with validation for user registration"
```

## 🛠️ Development

### Available Scripts

```bash
# Development with Turbopack
npm run dev

# Production build
npm run build

# Run tests
npm run test

# Run specific test file
npm run test -- src/components/chat/__tests__/ChatInterface.test.tsx

# Lint code
npm run lint

# Database operations
npm run db:reset        # Reset database
npx prisma migrate dev  # Create/apply migrations
npx prisma generate     # Regenerate Prisma client
```

### Project Structure

```
src/
├── actions/           # Server actions for database operations
├── app/              # Next.js app router pages
├── components/       # React components
│   ├── auth/        # Authentication components
│   ├── chat/        # Chat interface components
│   ├── editor/      # Code editor components
│   ├── preview/     # Live preview components
│   └── ui/          # Reusable UI components
├── contexts/         # React contexts for state management
├── lib/             # Utility functions and configurations
│   ├── auth.ts      # JWT authentication
│   ├── file-system.ts # Virtual file system
│   ├── provider.ts   # AI provider configuration
│   └── transform/    # Code transformation utilities
└── tools/           # AI tools for code generation
```

### Key Design Patterns

- **Virtual File System**: All code generation happens in memory
- **Context-based State**: File system and chat state managed via React contexts
- **Server Actions**: Database operations using Next.js server actions
- **Tool Pattern**: AI tools follow builder pattern for dependency injection
- **Streaming Responses**: Real-time AI responses with progress indicators

## 🧪 Testing

The project uses **Vitest** with **React Testing Library** for comprehensive testing:

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test -- --watch

# Run tests with coverage
npm run test -- --coverage
```

Tests are located in `__tests__` folders adjacent to components.

## 🚀 Deployment

### Environment Variables

For production deployment, ensure these environment variables are set:

```env
# Required for AI functionality
ANTHROPIC_API_KEY=your-api-key

# Database (automatically configured for SQLite)
DATABASE_URL="file:./dev.db"

# JWT Secret (auto-generated if not provided)
JWT_SECRET=your-secret-key
```

### Build and Deploy

```bash
# Build for production
npm run build

# Start production server
npm start
```

The application is ready for deployment on Vercel, Netlify, or any Node.js hosting platform.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Built with ❤️ using Next.js, React, and Claude AI**

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4, Radix UI components
- **AI**: Anthropic Claude AI, Vercel AI SDK with streaming
- **Database**: Prisma ORM with SQLite
- **Code Processing**: Babel standalone, Monaco Editor
- **Testing**: Vitest, React Testing Library
- **Build Tools**: Turbopack for fast development builds

## 🚀 Quick Start
