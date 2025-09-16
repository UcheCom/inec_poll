# INEC Polls Application - Development Rules & Guidelines

## Overview
This document outlines the development rules, patterns, and best practices for the INEC Polls Application. These rules ensure code quality, maintainability, security, and consistency across the entire codebase.

---

## Rule 1: Component Architecture & UI Standards

### 1.1 Component Structure
- **Server Components First**: Use Server Components for data fetching and static content. Only use Client Components when interactivity is required.
- **Component Composition**: Break down complex components into smaller, reusable pieces with single responsibilities.
- **Props Interface**: Always define TypeScript interfaces for component props with comprehensive JSDoc documentation.

### 1.2 UI/UX Standards
- **Design System**: Implement a consistent design system using shadcn/ui components and Tailwind CSS.
- **Accessibility**: Ensure all interactive elements are keyboard accessible and screen reader friendly.
- **Responsive Design**: All components must be mobile-first and responsive across all device sizes.
- **Loading States**: Provide clear loading indicators for all async operations.
- **Error Boundaries**: Implement proper error handling with user-friendly error messages.

### 1.3 Component Naming & Organization
```typescript
// ✅ Good: Clear, descriptive naming
components/
├── ui/                    // shadcn/ui components
├── forms/                 // Form-specific components
├── polls/                 // Poll-related components
├── auth/                  // Authentication components
└── layout/                // Layout components

// Component naming convention
PollVotingComponent.tsx    // PascalCase for components
CreatePollForm.tsx         // Action + Entity + Type
```

---

## Rule 2: Data Management & API Patterns

### 2.1 Server Actions Pattern
- **Server Actions Only**: Use Next.js Server Actions for all data mutations (create, update, delete).
- **No API Routes**: Avoid creating separate API route handlers for form submissions.
- **Data Fetching**: Fetch data directly in Server Components, not in Client Components with useEffect.

### 2.2 Function Signatures & Error Handling
```typescript
// ✅ Standard function signature pattern
export async function actionName(
  data: ActionData,
  userId: string,
  additionalParams?: OptionalParams
): Promise<ActionResult> {
  try {
    // Validation
    if (!userId) throw new Error('Authentication required')
    
    // Business logic
    const result = await performAction(data, userId)
    
    // Cache invalidation
    revalidatePath('/relevant-path')
    
    return { success: true, data: result }
  } catch (error) {
    console.error('Action failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Operation failed' 
    }
  }
}

// ✅ Standard result interface
interface ActionResult {
  success: boolean
  data?: any
  error?: string
}
```

### 2.3 Database Operations
- **Transaction Safety**: Use database transactions for multi-table operations.
- **RLS Policies**: Leverage Supabase Row Level Security for data access control.
- **Input Validation**: Validate all inputs on both client and server side.
- **SQL Injection Prevention**: Use parameterized queries exclusively.

---

## Rule 3: Security & Authentication

### 3.1 Authentication Requirements
- **User Context**: All data mutations require authenticated user context.
- **Authorization Checks**: Verify user permissions before allowing data modifications.
- **Session Management**: Use Supabase Auth for session handling and token management.

### 3.2 Data Security
- **Environment Variables**: Never hardcode secrets. Use environment variables for all sensitive data.
- **Input Sanitization**: Sanitize all user inputs to prevent XSS attacks.
- **CSRF Protection**: Leverage Next.js built-in CSRF protection for forms.
- **Rate Limiting**: Implement rate limiting for voting and poll creation endpoints.

### 3.3 Security Headers & Policies
```typescript
// Security middleware pattern
export function securityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  }
}
```

---

## Rule 4: Performance & Optimization

### 4.1 Code Splitting & Loading
- **Dynamic Imports**: Use dynamic imports for heavy components and libraries.
- **Image Optimization**: Use Next.js Image component for all images with proper sizing.
- **Bundle Analysis**: Regularly analyze bundle size and optimize imports.

### 4.2 Caching Strategy
- **Server-Side Caching**: Use Next.js revalidatePath for cache invalidation.
- **Static Generation**: Pre-generate static content where possible.
- **Database Queries**: Optimize database queries with proper indexing and select statements.

### 4.3 Performance Monitoring
```typescript
// Performance monitoring pattern
export function withPerformanceMonitoring<T extends any[]>(
  fn: (...args: T) => Promise<any>,
  operationName: string
) {
  return async (...args: T) => {
    const start = performance.now()
    try {
      const result = await fn(...args)
      const duration = performance.now() - start
      console.log(`${operationName} completed in ${duration}ms`)
      return result
    } catch (error) {
      const duration = performance.now() - start
      console.error(`${operationName} failed after ${duration}ms:`, error)
      throw error
    }
  }
}
```

---

## Rule 5: Code Quality & Maintainability

### 5.1 TypeScript Standards
- **Strict Mode**: Maintain strict TypeScript configuration with no implicit any.
- **Type Definitions**: Define comprehensive types for all data structures.
- **Interface Segregation**: Create focused interfaces rather than large, monolithic ones.

### 5.2 Code Documentation
- **JSDoc Comments**: Document all public functions, interfaces, and complex logic.
- **README Files**: Maintain up-to-date README files for each major component.
- **Code Comments**: Add inline comments for complex business logic.

### 5.3 Testing & Quality Assurance
```typescript
// Testing pattern for Server Actions
export async function testServerAction() {
  // Mock dependencies
  const mockSupabase = createMockSupabaseClient()
  
  // Test happy path
  const result = await actionName(validData, mockUserId)
  expect(result.success).toBe(true)
  
  // Test error cases
  const errorResult = await actionName(invalidData, mockUserId)
  expect(errorResult.success).toBe(false)
  expect(errorResult.error).toBeDefined()
}
```

### 5.4 Error Handling & Logging
- **Centralized Logging**: Use a consistent logging strategy across the application.
- **Error Boundaries**: Implement React Error Boundaries for graceful error handling.
- **User Feedback**: Provide clear, actionable error messages to users.

---

## Implementation Checklist

### Immediate Actions Required:
- [ ] Implement shadcn/ui component library for consistent UI
- [ ] Add comprehensive error boundaries
- [ ] Implement proper loading states for all async operations
- [ ] Add input validation and sanitization
- [ ] Create reusable form components
- [ ] Implement proper TypeScript strict mode
- [ ] Add comprehensive JSDoc documentation
- [ ] Set up performance monitoring
- [ ] Implement proper security headers
- [ ] Add unit tests for critical functions

### Folder Structure Improvements:
```
inec_poll/
├── app/                    # Next.js App Router
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── forms/             # Form components
│   ├── polls/             # Poll-specific components
│   └── layout/            # Layout components
├── lib/
│   ├── actions/           # Server Actions
│   ├── utils/             # Utility functions
│   ├── validations/       # Input validation schemas
│   └── constants/         # Application constants
├── types/                 # TypeScript type definitions
├── hooks/                 # Custom React hooks
└── tests/                 # Test files
```

---

## Conclusion

These rules ensure the INEC Polls Application maintains high standards for security, performance, and maintainability. All team members should follow these guidelines to ensure consistency and quality across the codebase.

For questions or clarifications about these rules, please refer to the development team lead or create an issue in the project repository.
