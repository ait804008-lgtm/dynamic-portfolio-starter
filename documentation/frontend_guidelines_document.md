# Frontend Guideline Document

This document outlines the frontend setup for the Dynamic Portfolio Starter. It explains the architecture, design principles, styling, component structure, state management, routing, performance strategies, and testing approaches in plain language so anyone can understand how the frontend is organized and works.

## 1. Frontend Architecture

### 1.1 Overview

- **Framework**: We use Next.js (v15) with its built-in App Router. This gives us file-based routing for both pages and API routes in one codebase.
- **Language**: React + TypeScript for building UI components with type safety.
- **UI Library**: `shadcn/ui` provides accessible, pre-built components built on Tailwind CSS.
- **Styling**: Tailwind CSS for utility-first styles.
- **Theming**: `next-themes` for light/dark mode handling.

### 1.2 Scalability & Maintainability

- **File-Based Organization**: The `/app` directory holds routes and their components, `/components` holds shared UI pieces, `/lib` holds helper functions, and `/db/schema` holds Drizzle ORM models. This clear separation makes it easy to find and update code.
- **Type Safety**: Using TypeScript and Drizzle ORM schemas ensures that data shapes are consistent from the database all the way to UI props.
- **Composable Components**: Small, reusable components (buttons, cards, tables) can be used across pages, reducing duplication.

### 1.3 Performance

- **Server & Client Components**: Next.js lets us fetch data on the server for faster first paints and use client components only when interactivity is needed.
- **Built-In Code Splitting**: Next.js automatically splits code by route.
- **Optimized Images**: The Next.js `<Image>` component optimizes images and lazy loads by default.

## 2. Design Principles

### 2.1 Usability

- **Consistent Layouts**: Shared header and footer components ensure users always know how to navigate.
- **Clear Calls to Action**: Buttons and links follow a consistent style and placement.

### 2.2 Accessibility

- **Semantic HTML**: We use proper `<button>`, `<nav>`, `<label>`, and ARIA attributes from `shadcn/ui` to support screen readers.
- **Color Contrast**: Our color palette meets WCAG AA standards for text and background contrast.

### 2.3 Responsiveness

- **Mobile-First**: Tailwind CSS utilities handle breakpoints, ensuring layouts adapt from mobile to desktop.
- **Flex & Grid**: We use CSS flexbox and grid utilities for fluid, adaptable designs.

## 3. Styling and Theming

### 3.1 Styling Approach

- **Tailwind CSS**: Utility classes (`p-4`, `text-lg`, `bg-primary`) for rapid styling.
- **No Custom Preprocessors**: We rely on Tailwind’s configuration rather than SASS or Less.

### 3.2 Theming

- **next-themes**: A React context that toggles between `light` and `dark` modes and saves preference in `localStorage`.
- **Configurable in tailwind.config.js**: Extend color palette under `theme.extend.colors`.

### 3.3 Visual Style

- **Overall Style**: Modern flat design with subtle shadows—leaning toward Material Design simplicity.
- **Color Palette**:
  • Primary: #3B82F6 (blue)
  • Secondary: #10B981 (green)
  • Accent: #F59E0B (amber)
  • Background (light): #FFFFFF
  • Background (dark): #1F2937
  • Text (light): #111827
  • Text (dark): #F9FAFB

### 3.4 Typography

- **Font Family**: `Inter`, a modern, highly legible sans-serif.
- **Fallbacks**: `sans-serif`.
- **Sizes**: Defined via Tailwind’s `text-sm` to `text-2xl` scale.

## 4. Component Structure

### 4.1 Organization

- `/components/ui`: Basic building blocks from `shadcn/ui` (Button, Modal, Card).
- `/components/layout`: Header, Footer, Sidebar.
- `/components/forms`: Input, Textarea, FormWrapper.

### 4.2 Reusability

- Each component has its own folder with an optional `styles.module.css` (if needed) and a test file.
- Props are strongly typed so usage across the project remains consistent.

### 4.3 Benefits of Component-Based Architecture

- **Isolation**: Changes in one component don’t unexpectedly affect others.
- **Speed**: Reusing tested components speeds up development.
- **Consistency**: Uniform look and behavior across the application.

## 5. State Management

### 5.1 Local State

- **React `useState` & `useEffect`** for simple, component-level state.

### 5.2 Global or Shared State

- **Context API** for theme switching (`next-themes` handles this internally).

### 5.3 Data Fetching & Cache

- **Optional**: TanStack Query (React Query) can be added to manage server data, caching, and background refetching, especially in the admin panel for CRUD operations.

## 6. Routing and Navigation

### 6.1 Next.js App Router

- **File-Based**: Folders in `/app` map directly to URL routes (e.g., `/app/projects/page.tsx` → `/projects`).
- **Nested Layouts**: Shared layouts via `layout.tsx` files let you define header/footer around multiple pages.

### 6.2 Navigation Components

- **Link**: Next.js `<Link>` for client-side transitions.
- **Active State**: We style active links via Tailwind’s utilities and Next.js’ `usePathname` hook.

## 7. Performance Optimization

- **Lazy Loading**: Use `next/dynamic` to load heavy components (charts, maps) only when needed.
- **Image Optimization**: Next.js `<Image>` with automatic resizing and lazy loading.
- **Code Splitting**: Handled automatically by Next.js per route.
- **Minification & Compression**: Enabled by default in production builds.
- **Font Optimization**: Use Next.js `@next/font` or self-hosted fonts to reduce layout shifts.

## 8. Testing and Quality Assurance

### 8.1 Unit Tests

- **Jest** with `ts-jest` for testing pure functions and small components.
- **React Testing Library** to render components and assert on DOM output.

### 8.2 Integration Tests

- Combine multiple components or a page layout to test user flows (forms, modals).

### 8.3 End-to-End Tests

- **Playwright** or **Cypress** to simulate real user interactions across the app (navigation, form submissions).

### 8.4 Linting & Formatting

- **ESLint** with Next.js and TypeScript plugins.
- **Prettier** for consistent code style.
- **Husky** + **lint-staged** to run checks before commits.

## 9. Conclusion and Overall Frontend Summary

This setup leverages modern tools—Next.js App Router, React, TypeScript, Tailwind CSS, and `shadcn/ui`—to deliver a scalable, maintainable, and performant portfolio starter. Key takeaways:

- **Unified Codebase**: Frontend and backend API routes live together in `/app`, streamlining development.
- **Type Safety**: Drizzle ORM and TypeScript cover database to UI.
- **Reusability**: A component-driven approach codifies design patterns as shareable pieces.
- **Performance**: Server components, image optimization, and built-in code splitting ensure fast load times.
- **Quality**: A solid testing strategy paired with linting guarantees reliable, maintainable code.

With these guidelines, any developer—regardless of their background—can understand how to extend, maintain, and customize the frontend of the Dynamic Portfolio Starter with confidence.