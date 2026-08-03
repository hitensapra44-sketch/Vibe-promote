# AI Rules & Tech Stack Guidelines

## Tech Stack Overview
- **Framework**: React 18 with Vite for fast development and bundling.
- **Language**: JavaScript/TypeScript (JSX/TSX) with a focus on functional components and hooks.
- **Styling**: Tailwind CSS for utility-first styling and responsive design.
- **UI Components**: shadcn/ui (built on Radix UI) for accessible, unstyled components.
- **Icons**: Lucide React for a consistent and lightweight icon set.
- **Routing**: React Router DOM (v6) for client-side navigation.
- **State Management**: TanStack Query (React Query) for server state and caching.
- **Backend**: Supabase for Authentication, Database (PostgreSQL), and Storage.
- **Animations**: Framer Motion for smooth, declarative UI transitions.
- **Forms & Validation**: React Hook Form combined with Zod for schema-based validation.

## Library Usage Rules

### 1. UI & Styling
- **Components**: Always check `src/components/ui/` for existing shadcn components before building from scratch.
- **Icons**: Use `lucide-react` exclusively. Do not import icons from other libraries.
- **Class Names**: Use the `cn()` utility from `src/lib/utils.js` for conditional class merging.
- **Responsive Design**: Use Tailwind's mobile-first breakpoints (`sm:`, `md:`, <dyad-write path="AI_RULES.md" description="Completing the AI_RULES.md file with tech stack and library rules.">
# AI Rules & Tech Stack Guidelines

## Tech Stack Overview
- **Framework**: React 18 with Vite for fast development and bundling.
- **Language**: JavaScript/TypeScript (JSX/TSX) with a focus on functional components and hooks.
- **Styling**: Tailwind CSS for utility-first styling and responsive design.
- **UI Components**: shadcn/ui (built on Radix UI) for accessible, unstyled components.
- **Icons**: Lucide React for a consistent and lightweight icon set.
- **Routing**: React Router DOM (v6) for client-side navigation.
- **State Management**: TanStack Query (React Query) for server state and caching.
- **Backend**: Supabase for Authentication, Database (PostgreSQL), and Storage.
- **Animations**: Framer Motion for smooth, declarative UI transitions.
- **Forms & Validation**: React Hook Form combined with Zod for schema-based validation.

## Library Usage Rules

### 1. UI & Styling
- **Components**: Always check `src/components/ui/` for existing shadcn components before building from scratch.
- **Icons**: Use `lucide-react` exclusively. Do not import icons from other libraries.
- **Class Names**: Use the `cn()` utility from `src/lib/utils.js` for conditional class merging.
- **Responsive Design**: Use Tailwind's mobile-first breakpoints (`sm:`, `md:`, `lg:`, `xl:`) for all layouts.

### 2. Data Fetching & State
- **Server State**: Use `useQuery` and `useMutation` from TanStack Query for all API interactions.
- **Supabase**: Use the singleton client from `src/supabaseClient.js` for database and auth operations.
- **Local State**: Use standard React `useState` or `useReducer` for simple UI state.

### 3. Navigation & Routing
- **Routes**: Define all routes in `src/App.jsx`.
- **Links**: Use the `Link` component from `react-router-dom` for internal navigation to avoid full page reloads.

### 4. Best Practices
- **File Structure**: Keep components in `src/components/` and pages in `src/pages/`.
- **Naming**: Use PascalCase for components and camelCase for hooks and utilities.
- **Performance**: Use `useCallback` and `useMemo` only when necessary for expensive computations or preventing unnecessary re-renders of memoized components.
- **Feedback**: Use `sonner` or `react-hot-toast` for user notifications and feedback.