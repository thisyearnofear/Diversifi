# Code Style Guidelines

## General Principles

1. **Readability**
   - Write code that is easy to read and understand
   - Use meaningful variable and function names
   - Keep functions small and focused
   - Use comments to explain complex logic

2. **Consistency**
   - Follow established patterns in the codebase
   - Use consistent naming conventions
   - Use consistent formatting
   - Use consistent error handling

3. **Maintainability**
   - Write code that is easy to maintain
   - Avoid duplication
   - Use abstraction to hide implementation details
   - Write tests for critical functionality

4. **Performance**
   - Write efficient code
   - Optimize for common use cases
   - Use appropriate data structures
   - Avoid premature optimization

## TypeScript Guidelines

1. **Type Safety**
   - Use TypeScript for type safety
   - Define interfaces for complex objects
   - Use type inference where appropriate
   - Avoid using `any` type

2. **Type Definitions**
   - Define types for function parameters and return values
   - Use union types for variables that can have multiple types
   - Use generics for reusable components
   - Use type guards for runtime type checking

3. **Null and Undefined**
   - Use optional chaining (`?.`) for nullable properties
   - Use nullish coalescing (`??`) for default values
   - Use non-null assertion (`!`) only when necessary
   - Initialize variables with appropriate default values

## React Guidelines

1. **Component Structure**
   - Use functional components with hooks
   - Keep components small and focused
   - Use composition over inheritance
   - Separate UI from business logic

2. **Props**
   - Define prop types using TypeScript interfaces
   - Use destructuring for props
   - Provide default values for optional props
   - Validate props with PropTypes in non-TypeScript code

3. **State Management**
   - Use React Context for global state
   - Use `useState` for local state
   - Use `useReducer` for complex state logic
   - Use SWR for data fetching and caching

4. **Hooks**
   - Follow the rules of hooks
   - Create custom hooks for reusable logic
   - Use memoization hooks (`useMemo`, `useCallback`) for performance
   - Use `useEffect` for side effects

## Next.js Guidelines

1. **Routing**
   - Use the App Router for routing
   - Use dynamic routes for variable paths
   - Use route groups for organization
   - Use loading and error states

2. **Data Fetching**
   - Use server components for data fetching
   - Use SWR for client-side data fetching
   - Implement proper error handling
   - Show loading states during data fetching

3. **API Routes**
   - Use Next.js API routes for backend functionality
   - Implement proper error handling
   - Validate input data
   - Return consistent response formats

4. **Optimization**
   - Use Image component for images
   - Use font optimization
   - Implement proper caching
   - Use server components where appropriate

## CSS Guidelines

1. **Styling Approach**
   - Use Tailwind CSS for styling
   - Use CSS modules for component-specific styles
   - Use CSS variables for theming
   - Use responsive design principles

2. **Class Names**
   - Use kebab-case for CSS class names
   - Use BEM naming convention for custom CSS
   - Use descriptive class names
   - Avoid using inline styles

3. **Layout**
   - Use Flexbox and Grid for layout
   - Use responsive units (rem, em, %) for sizing
   - Use media queries for responsive design
   - Use container queries for component-specific responsiveness

4. **Accessibility**
   - Use semantic HTML elements
   - Provide appropriate ARIA attributes
   - Ensure sufficient color contrast
   - Support keyboard navigation
