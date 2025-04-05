# Starter Kit Implementation Guidelines

## Purpose

The starter kit system is designed to provide users with resources to learn and interact with Web3. It allows users to create, claim, and use starter kits to access premium features and content.

## Core Components

1. **Database Schema**
   - `starterKit` table in `lib/db/schema.ts`
   - `charge` table for payment tracking
   - Relationships with `user` table

2. **API Routes**
   - `/api/starter-kit/available` - Lists all unclaimed starter kits
   - `/api/starter-kit/claimed/list` - Lists starter kits claimed by the authenticated user
   - `/api/starter-kit/created/list` - Lists starter kits created by the authenticated user
   - `/api/starter-kit/claim/[kitId]` - Allows a user to claim a specific starter kit
   - `/api/starter-kit/give/[kitId]/[recipientId]` - Allows a user to give a starter kit to another user
   - `/api/admin/create-starter-kit` - Admin endpoint for creating starter kits

3. **UI Components**
   - `StarterKitCheckout` - Component for purchasing starter kits
   - `useStarterKit` hook - Provides data about available, claimed, and created starter kits
   - Starter kits page - Displays claimed and created starter kits
   - Admin page - Interface for creating and managing starter kits

4. **Authentication Flow**
   - Users connect their wallet using ConnectKit
   - They authenticate using Sign-In with Ethereum (SIWE)
   - This creates a session that allows them to access protected features

## Implementation Guidelines

1. **Authentication**
   - Always check for authentication in protected API routes
   - Use the `auth()` function to get the current session
   - Return 401 Unauthorized if the user is not authenticated
   - Provide clear error messages for authentication failures

2. **Database Operations**
   - Use transactions for operations that modify multiple tables
   - Include proper error handling for database operations
   - Validate input data before performing database operations
   - Return appropriate error responses for database failures

3. **UI Components**
   - Provide clear instructions for users on how to get and use starter kits
   - Show loading states during data fetching
   - Handle error states gracefully
   - Use toast notifications for user feedback

4. **Testing**
   - Write unit tests for critical functionality
   - Test authentication flows
   - Test database operations
   - Test UI components

## Future Enhancements

1. **Action Completion Tracking**
   - Track which actions users have completed
   - Associate completed actions with starter kits
   - Provide rewards for completing actions

2. **Reward Distribution**
   - Implement a system for distributing rewards to users
   - Associate rewards with completed actions
   - Allow users to claim rewards using their starter kits

3. **Enhanced User Experience**
   - Add more detailed instructions for users
   - Create a dashboard for tracking progress
   - Implement notifications for important events
