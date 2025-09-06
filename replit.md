# Excel Data Analysis Assistant

## Overview

This is a full-stack web application that allows users to upload Excel files and interact with their data through an AI-powered chat interface. The application parses Excel data into structured tables and provides intelligent analysis, visualizations, and insights through natural language conversations. Users can select specific tables from their Excel files to analyze and receive AI-generated responses including charts, summaries, and data insights.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The client-side is built with **React 18** using modern hooks and functional components. The application uses **Vite** as the build tool for fast development and optimized production builds. The UI is constructed with **shadcn/ui** components built on top of **Radix UI primitives**, providing accessible and customizable interface elements styled with **Tailwind CSS**.

Key frontend architectural decisions:
- **Single Page Application (SPA)** with client-side routing using **wouter** for lightweight navigation
- **Component-based architecture** with reusable UI components organized in a clear hierarchy
- **State management** through React hooks and TanStack Query for server state management
- **Real-time updates** and optimistic UI updates for better user experience

### Backend Architecture

The server is built with **Express.js** running on Node.js with TypeScript for type safety. The application follows a **RESTful API** design pattern with clear separation of concerns.

Core backend components:
- **Express server** with middleware for JSON parsing, CORS handling, and request logging
- **File upload handling** using **Multer** middleware for processing Excel files
- **In-memory storage** with a storage abstraction layer that can be easily replaced with database persistence
- **AI integration** service layer for processing natural language queries and generating insights

The server uses a **layered architecture**:
- **Route handlers** for HTTP request/response management
- **Service layer** for business logic and external API integration
- **Storage layer** with interface abstraction for data persistence

### Data Storage Solutions

Currently implements **in-memory storage** using Map data structures for development and testing. The storage layer is designed with an interface pattern to support easy migration to persistent databases.

Data models include:
- **Excel Files** with parsed table data stored as JSON
- **Chat Sessions** linking conversations to specific files
- **User management** structure (prepared for future authentication)

Database schema is defined using **Drizzle ORM** with **PostgreSQL** dialect, indicating the intended production database solution.

### Authentication and Authorization

The application includes a prepared authentication structure with user models and session management using **connect-pg-simple** for PostgreSQL session storage. Currently operates without authentication for development purposes, but the foundation is established for implementing secure user authentication.

### AI Integration Architecture

The application integrates with **OpenAI's API** (configured for GPT-5) to provide intelligent data analysis capabilities. The AI service:
- Processes natural language queries about Excel data
- Generates contextual responses with insights and analysis
- Creates structured data for visualizations (charts and tables)
- Provides intelligent suggestions for further analysis

## External Dependencies

### Third-Party Services
- **OpenAI API** - Powers the AI chat interface and data analysis capabilities
- **Neon Database** - Serverless PostgreSQL database service (configured via `@neondatabase/serverless`)

### UI and Styling Framework
- **shadcn/ui** - Component library built on Radix UI primitives
- **Radix UI** - Comprehensive set of accessible UI components
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Lucide React** - Icon library for consistent iconography

### Data Visualization
- **Recharts** - React charting library for rendering interactive charts and graphs

### Development and Build Tools
- **Vite** - Fast build tool and development server
- **TypeScript** - Type safety and enhanced developer experience
- **Drizzle ORM** - Type-safe database toolkit with PostgreSQL support
- **ESBuild** - Fast JavaScript bundler for production builds

### File Processing
- **Multer** - Middleware for handling multipart/form-data file uploads
- Excel parsing capabilities prepared for libraries like **xlsx** (referenced in mock implementation)

### State Management and HTTP
- **TanStack Query** - Server state management and caching
- **React Hook Form** with **Hookform Resolvers** - Form handling and validation
- **Zod** - Schema validation library integrated with Drizzle ORM

The application is configured for deployment on **Replit** with specific plugins for development experience enhancement and error handling.