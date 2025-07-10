# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a ChatGPT-style conversational AI web application built with modern web technologies. The application provides an intuitive conversational interface for users to interact with AI through a web browser.

## Commands

```bash
# Development
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema changes to database
npx prisma studio    # Open Prisma Studio for database management
```

## Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router) with TypeScript
- **State Management**: Zustand for client-side state
- **UI Library**: Tailwind CSS with Headless UI components
- **Build Tool**: Turbopack (Next.js dev server)

### Backend
- **Full-stack Framework**: Next.js API routes
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js with multiple providers
- **Real-time Communication**: Socket.io (to be implemented)

### AI Integration
- **APIs**: OpenAI API, Anthropic Claude API
- **Features**: Streaming support, token management, rate limiting (to be implemented)

## Architecture

### Database Schema
The application uses SQLite with the following core tables:
- `User`: User authentication and profile information (NextAuth.js standard)
- `Account`/`Session`: Authentication session management
- `Conversation`: Chat session management with auto-generated titles
- `Message`: Individual messages with role (user/assistant) and content
- `File`: File upload support with metadata

### File Structure
```
src/
├── app/                 # Next.js App Router pages
│   ├── api/auth/       # NextAuth.js API routes
│   ├── layout.tsx      # Root layout with providers
│   └── page.tsx        # Main chat interface
├── components/         # React components
│   ├── chat/          # Chat-specific components
│   ├── layout/        # Layout components (Header, Sidebar)
│   └── ui/            # Reusable UI components
├── lib/               # Utility libraries
│   ├── auth.ts        # NextAuth.js configuration
│   ├── prisma.ts      # Prisma client setup
│   └── store.ts       # Zustand store
└── types/             # TypeScript type definitions
```

## Key Features Implemented

### Core Functionality
- User authentication with NextAuth.js
- Real-time conversational interface with typing indicators
- Conversation history management
- Message display with markdown rendering
- Responsive design for desktop and mobile

### UI Components
- **Header**: User profile menu and navigation
- **Sidebar**: Conversation history with search
- **Chat Area**: Message display with user/assistant distinction
- **Input Area**: Message composition with auto-resize

## Development Notes

- The application uses Turbopack for fast development builds
- Database is SQLite for simplicity but can be changed via Prisma
- Environment variables are configured in `.env` file
- AI integration is currently placeholder - actual API calls need implementation
- Real-time features use client-side state management (Socket.io to be added)

## Development Notes

- The application uses Turbopack for fast development builds
- Database is SQLite for simplicity but can be changed via Prisma
- Environment variables are configured in `.env` file
- AI integration is currently placeholder - actual API calls need implementation
- Real-time features use client-side state management (Socket.io to be added)
- **Guest Access**: Currently allows guest users for testing (userId: 'guest')
- **Dependencies**: `nodemailer` is installed for email provider support

## Common Issues & Solutions

### Build Error: Module not found: Can't resolve 'nodemailer'
**Solution**: Install the required dependency:
```bash
npm install nodemailer @types/nodemailer
```

### Font Loading Issues with Google Fonts
**Problem**: Google Fonts (Geist, Geist_Mono) causing server startup errors
**Solution**: Replaced with system fonts for better performance and reliability:
- Updated `src/app/layout.tsx` to remove Google Font imports
- Updated `src/app/globals.css` to use system font stacks
- System fonts provide better performance and no external dependencies

### Authentication Provider Configuration
The auth system is configured to work with or without provider credentials:
- Google OAuth: Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- Email: Set `EMAIL_SERVER_HOST`, `EMAIL_FROM`, and optional email server auth
- Guest access is enabled by default for development

## OpenAI Integration

### API Routes
- **`/api/chat`**: Standard OpenAI completion endpoint
- **`/api/chat/stream`**: Streaming OpenAI completion endpoint (for real-time responses)

### Configuration
The OpenAI API key should be set in your `.env` file:
```env
OPENAI_API_KEY=your-openai-api-key-here
```

### Features
- **Conversation Context**: Full conversation history is sent to OpenAI for context
- **Error Handling**: Graceful error handling with user-friendly messages
- **GPT-3.5-turbo**: Currently configured to use GPT-3.5-turbo model
- **Streaming Support**: Real-time response streaming available via `/api/chat/stream`

## Next Steps for Implementation

1. ✅ **AI Integration**: OpenAI API integration completed
2. **Real-time Features**: Add Socket.io for live streaming  
3. **File Upload**: Implement file upload and processing
4. **Authentication**: Complete provider setup and remove guest access
5. **Database**: Add conversation persistence to database
6. **Streaming UI**: Implement streaming response in the frontend