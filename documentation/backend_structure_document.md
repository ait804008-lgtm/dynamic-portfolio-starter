# Backend Structure Document for Dynamic Portfolio Starter

This document outlines the backend architecture, hosting setup, and infrastructure components of the Dynamic Portfolio Starter. It’s written in plain language so that anyone—technical or not—can understand how the backend is organized, how it works, and how it keeps your data safe and your site running smoothly.

## Backend Architecture

### Overall Design

The backend is built directly into the Next.js application using its App Router and API Routes. Instead of a separate server (like an Express app), we handle all server-side code and API endpoints inside the same project. This unified approach keeps everything in one place, simplifies deployment, and offers a smooth developer experience.

### Frameworks and Patterns

- **Next.js App Router**: Organizes frontend pages and backend API handlers side by side under the `/app` directory.
- **API Routes**: Each endpoint lives in its own folder (for example, `/app/api/projects/route.ts`) and follows RESTful principles for create, read, update, and delete operations.
- **TypeScript Everywhere**: Provides type safety from your database models to your API logic and all the way to your UI.
- **Drizzle ORM**: A code-first, type-safe ORM that defines your database schema in TypeScript and generates migration files automatically.
- **Better Auth**: Handles user sessions, protecting API routes and pages with a simple middleware approach.

### Benefits: Scalability, Maintainability, Performance

- **Scalability**: The API Routes model scales horizontally—each function is stateless and can run on multiple machines or serverless instances.
- **Maintainability**: Clear folder structure (`/app`, `/components`, `/db`, `/lib`) separates concerns so developers can find code quickly and work in parallel.
- **Performance**: Next.js Server Components and edge-ready API handlers reduce load times and let you offload caching to CDNs.

## Database Management

### Technology Choices

- **Database Type**: Relational (SQL)
- **System**: PostgreSQL
- **ORM**: Drizzle ORM (TypeScript-based)

### Data Storage and Access

- **Schema Definition**: Written in TypeScript under `/db/schema`. You define models (tables) in code, then use `drizzle-kit` to generate SQL migrations.
- **Connection Pooling**: Managed by the database driver under the hood, ensuring efficient reuse of database connections.
- **Migrations**: Automatically generated and versioned, so you can track schema changes and roll back if needed.

### Data Management Practices

- Use **migrations** for every schema change to keep development, staging, and production in sync.
- Apply **server-side validation** (e.g., with Zod) in API handlers before reading or writing data.
- Manage **secrets and credentials** via environment variables to keep sensitive information out of the codebase.

## Database Schema

Below is a human-friendly overview of the tables and their columns, followed by the SQL statements you’d run in PostgreSQL.

### Human-Readable Schema Overview

- **users**: Stores admin user accounts.
  - id, name, email, password_hash, created_at
- **projects**: Holds portfolio project details.
  - id, title, description, image_url, link, created_at, updated_at
- **blog_posts**: Contains blog entries.
  - id, title, slug, content, cover_image_url, published_at
- **experiences**: Lists professional or educational experiences.
  - id, title, organization, start_date, end_date, description
- **contact_messages**: Records messages sent via the contact form.
  - id, name, email, message, sent_at
- **site_settings**: Optional single-row table for global settings (e.g., site title, theme defaults).

### SQL Schema (PostgreSQL)

```sql
-- 1. Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Projects table
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Blog posts table
CREATE TABLE blog_posts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  cover_image_url TEXT,
  published_at TIMESTAMPTZ
);

-- 4. Experiences table
CREATE TABLE experiences (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  organization TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  description TEXT
);

-- 5. Contact messages table
CREATE TABLE contact_messages (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Site settings table (single row)
CREATE TABLE site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL
);
```  

## API Design and Endpoints

All backend endpoints live under `/app/api` and follow a RESTful structure. They communicate with the frontend by sending and receiving JSON.

### Authentication Endpoints (`/app/api/auth`)
- POST `/app/api/auth/sign-up`: Create a new user account.
- POST `/app/api/auth/sign-in`: Log in and start a session.
- POST `/app/api/auth/sign-out`: End the user’s session.
- GET `/app/api/auth/session`: Check if a user is logged in and retrieve session info.

### Projects Endpoints (`/app/api/projects`)
- GET `/app/api/projects`: List all projects (public).
- GET `/app/api/projects/:id`: Get one project by ID.
- POST `/app/api/projects`: Create a new project (admin only).
- PUT `/app/api/projects/:id`: Update an existing project (admin only).
- DELETE `/app/api/projects/:id`: Remove a project (admin only).

### Blog Posts Endpoints (`/app/api/blog`)
- GET `/app/api/blog`: List all blog posts (public).
- GET `/app/api/blog/:slug`: Fetch a post by its slug.
- POST `/app/api/blog`: Create a new post (admin only).
- PUT `/app/api/blog/:id`: Edit a post (admin only).
- DELETE `/app/api/blog/:id`: Delete a post (admin only).

### Contact Form Endpoint (`/app/api/contact`)
- POST `/app/api/contact`: Receive a contact form submission, send an email via Nodemailer, and save it to the database.

### File Upload Endpoint (`/app/api/uploads`)
- POST `/app/api/uploads`: Handle image and file uploads using `formidable` or similar. Return a public URL to store in your database.

### How Frontend and Backend Talk

- **Client Components** make fetch requests to these endpoints.
- **Server Components** can fetch data directly (no HTTP) by importing Drizzle queries.
- Protected endpoints run a middleware check (`auth()` from Better Auth) before accessing or modifying data.

## Hosting Solutions

### Local Development

- **Docker & Docker Compose**: A `docker-compose.yaml` spins up two containers:
  - Next.js application (Node.js runtime)
  - PostgreSQL database

This setup ensures everyone on the team has the same local environment.

### Production Deployment

- **Vercel**: Ideal for Next.js apps, offering:
  - Automatic builds and zero-config deployments.
  - Global CDN for static assets and edge caching for API routes.
  - Built-in SSL certificates and instant rollbacks.

Alternative options include deploying the Docker containers to a managed Kubernetes or ECS cluster and using a managed Postgres service (e.g., AWS RDS, DigitalOcean Managed Databases).

## Infrastructure Components

### Load Balancer and CDN

- Vercel provides a built-in global load balancer and CDN for all static assets and optimized API edge functions.

### Caching

- Edge caching of API routes and static pages on Vercel.
- Optionally layer in an in-memory cache (like Redis) if you need super-fast lookups or rate limiting.

### Logging and Queues

- **Logging**: Next.js supports custom loggers (e.g., Pino or Winston). Logs appear in both local and Vercel dashboards.
- **Background Jobs**: If you process emails or large file uploads asynchronously, you can add a job queue (e.g., BullMQ) and run workers separately.

## Security Measures

- **Authentication & Authorization**: Better Auth with session cookies. All admin-only endpoints require a valid session.
- **HTTPS Everywhere**: Vercel enforces SSL by default.
- **Input Validation**: Use libraries like Zod to validate and sanitize all incoming data.
- **Environment Variables**: Store secrets (database URL, email credentials, API keys) outside the codebase.
- **Least Privilege**: The database user only has permissions for the necessary tables and operations.
- **Data Encryption**: PostgreSQL at rest and in transit (SSL/TLS).
- **CORS**: Configured to allow only your frontend origin in case you ever separate the API.

## Monitoring and Maintenance

### Monitoring Tools

- **Vercel Analytics**: Tracks request metrics, performance, and errors.
- **Custom Alerts**: Integrate Sentry or LogRocket for error monitoring and alerting.
- **Database Metrics**: Use your Postgres provider’s dashboard to watch connection counts, slow queries, and resource usage.

### Maintenance Strategies

- **Automated Backups**: Ensure daily backups of your production database.
- **Migrations Workflow**: Use `drizzle-kit` in CI to apply and test migrations before merging to main.
- **Dependency Updates**: Run Dependabot or a similar tool to keep dependencies up to date.
- **Scheduled Health Checks**: Ping key endpoints (like `/api/auth/session`) with an uptime monitoring service to catch downtime early.

## Conclusion and Overall Backend Summary

The Dynamic Portfolio Starter’s backend is a cohesive, modern setup built on Next.js API Routes, TypeScript, Better Auth, and Drizzle ORM with PostgreSQL. It runs smoothly in Docker for local development and deploys seamlessly to Vercel in production, benefiting from global CDNs, automatic SSL, and zero-downtime rollouts.

Key strengths:

- Unified codebase for frontend and backend, reducing context switching.
- Type-safe data models and API handlers for fewer runtime errors.
- Solid security practices, including session-based authentication and input validation.
- Scalable architecture with edge-cached functions and optional background workers.

This structure hits the project goals: public portfolio pages, a secure admin panel, a contact form, and an extensible foundation for adding features like image uploads, blog posts, and analytics. With this document, anyone on your team will have a clear understanding of how the backend works and where to add or change functionality.