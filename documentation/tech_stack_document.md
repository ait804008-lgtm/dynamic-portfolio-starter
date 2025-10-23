# Tech Stack Document for Dynamic Portfolio Starter

This document explains the technologies chosen for the Dynamic Portfolio Starter in everyday language. It shows how each piece fits together to help you build a modern, dynamic portfolio site with minimal fuss.

## Frontend Technologies

These tools power everything users see and interact with.

- **Next.js 15 (App Router)**  
  A framework that handles page routing, server-side rendering, and API routes in one package. This means you don’t need a separate routing library or backend server—everything lives under the `/app` folder.

- **React & TypeScript**  
  React builds the user interface, and TypeScript adds helpful checks so you catch errors early. This duo makes your UI code more reliable and easier to maintain.

- **Tailwind CSS**  
  A utility-first styling system. Instead of writing custom CSS files, you apply small, reusable classes (like `p-4` for padding) directly in your components. This speeds up styling and keeps things consistent.

- **shadcn/ui**  
  A set of pre-built, accessible UI components (cards, modals, tables, etc.) that you can drop into your pages. These components already work with Tailwind, so you can customize them quickly.

- **next-themes**  
  Handles light/dark mode toggling and remembers user preferences via `localStorage`. You get theming support out of the box without extra setup.

- **Optional: TanStack Query**  
  If you want more dynamic data fetching on the client side (especially in the admin panel), TanStack Query makes it easy to manage server state, caching, and background updates.

## Backend Technologies

These tools handle data storage, business logic, and secure user access.

- **Next.js API Routes**  
  Functions living under `/app/api` that respond to HTTP requests. They replace a separate Express server—everything runs in the same project.

- **Better Auth**  
  A ready-made authentication library for handling sign-up, sign-in, session management, and protecting routes. It ensures only logged-in users can access your admin panel.

- **PostgreSQL**  
  A reliable relational database to store users, projects, blog posts, contact messages, and more. It’s a solid choice for structured data and complex queries.

- **Drizzle ORM**  
  A type-safe way to define database schemas and interact with PostgreSQL using TypeScript. You describe your `Project`, `BlogPost`, `Experience`, and other models in code, then generate migration files automatically.

- **Zod (for Validation)**  
  A schema-based validation library. Use it in your API routes to ensure incoming data (like form submissions) meets your requirements before saving to the database.

- **nodemailer**  
  Sends emails from your contact form. You configure it to use SMTP or email-service providers and call it in your `/api/contact` route.

- **formidable**  
  Parses file uploads (images, resumes) in API routes. After parsing, you can upload files to a cloud storage service.

## Infrastructure and Deployment

These tools make development, testing, and deployment smooth and reliable.

- **Docker & Docker Compose**  
  Containerize your Next.js app and PostgreSQL database for consistent local environments. A single `docker-compose.yml` file starts everything you need.

- **Git & GitHub**  
  Version control your code, collaborate with others, and track changes. GitHub also ties into CI/CD workflows.

- **CI/CD Pipelines**  
  Automated testing and deployment. You can use GitHub Actions or Vercel’s built-in pipelines to run tests and push updates whenever you merge code.

- **Vercel**  
  A hosting platform optimized for Next.js. Deploy your site with a single command or via Git integration. Vercel handles SSL, global CDN, and environment variables for you.

## Third-Party Integrations

These services add extra functionality without building it from scratch.

- **Cloud Storage (AWS S3, Cloudinary, etc.)**  
  Store and serve uploaded images or files. After parsing uploads with `formidable`, you can push them to S3 or Cloudinary and save the resulting URLs in your database.

- **Email Service (SMTP, SendGrid, Mailgun)**  
  Backed by `nodemailer`, you can connect to any email provider to send contact form submissions or notifications.

- **Analytics (Google Analytics, Plausible, etc.)**  
  Track visitor behavior on your public pages to understand what content resonates most.

## Security and Performance Considerations

Ensuring your site is safe and fast for users.

- **Authentication & Access Control**  
  Protected routes via Better Auth; only authenticated sessions can call admin APIs.

- **Data Validation**  
  Zod checks incoming data in all API routes to prevent invalid or malicious input.

- **Rate Limiting & CORS**  
  You can add middleware to throttle requests and configure CORS policies to restrict access.

- **Server Components & Code Splitting**  
  Next.js App Router automatically splits code and renders some pages on the server for faster initial load times.

- **Caching & CDN**  
  Vercel’s global CDN caches static assets and pre-rendered pages for quick delivery to users worldwide.

- **Image Optimization**  
  Next.js provides built-in image optimization for faster page loads and lower bandwidth usage.

## Conclusion and Overall Tech Stack Summary

This Dynamic Portfolio Starter brings together a modern, unified stack that lets you focus on building features:

- **Unified Codebase**: Next.js App Router covers both frontend and backend in one project.
- **Rapid UI Development**: React, Tailwind CSS, and shadcn/ui give you beautiful, responsive layouts fast.
- **Type Safety & Reliability**: TypeScript and Drizzle ORM ensure errors are caught early, from database to UI.
- **Secure, Scalable Backend**: Better Auth, PostgreSQL, and Next.js API routes provide a solid foundation for all CRUD operations.
- **Easy Deployment & Maintenance**: Docker for local consistency, Vercel for production, and CI/CD for automated workflows.

With this tech stack, you get a rock-solid starting point that’s ready to customize—whether you’re building public portfolio pages, a secure admin panel, or a contact form with file uploads and email notifications. Happy coding!