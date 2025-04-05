# Hello World Computer Architecture Guidelines

## Core Architecture Principles

1. **Clean Separation of Concerns**
   - UI components should be in the `components/` directory
   - API routes should be in the `app/api/` directory
   - Database models and queries should be in the `lib/db/` directory
   - Authentication logic should be in the `app/auth/` directory
   - Web3 integrations should be in the `lib/web3/` directory

2. **Component Structure**
   - Components should be small, focused, and reusable
   - Use composition over inheritance
   - Separate UI from business logic
   - Use hooks for shared functionality

3. **State Management**
   - Use React Context for global state
   - Use SWR for data fetching and caching
   - Prefer server components where possible
   - Keep state as close to where it's used as possible

4. **API Design**
   - RESTful API endpoints for CRUD operations
   - Use Next.js API routes with proper error handling
   - Return consistent response formats
   - Validate input data

5. **Database Access**
   - Use Drizzle ORM for database access
   - Keep database queries in the `lib/db/queries.ts` file
   - Define schemas in the `lib/db/schema.ts` file
   - Use transactions for operations that modify multiple tables

6. **Authentication**
   - Use Sign-In with Ethereum (SIWE) for Web3 authentication
   - Store session data in cookies
   - Protect API routes with authentication middleware
   - Handle authentication errors gracefully

7. **Error Handling**
   - Use try/catch blocks for error handling
   - Log errors with appropriate context
   - Return user-friendly error messages
   - Use toast notifications for user feedback

## File Organization

- `app/` - Next.js app router pages and layouts
- `components/` - Reusable UI components
- `lib/` - Shared utilities and business logic
- `public/` - Static assets
- `styles/` - Global styles
- `hooks/` - Custom React hooks
- `contexts/` - React context providers

## Naming Conventions

- Use PascalCase for component files and React components
- Use camelCase for utility functions and variables
- Use kebab-case for CSS class names
- Use UPPER_CASE for constants

## Code Style

- Use TypeScript for type safety
- Use ESLint and Prettier for code formatting
- Write meaningful comments for complex logic
- Use JSDoc for function documentation
- Keep functions small and focused
