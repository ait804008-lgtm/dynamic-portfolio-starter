# Project Requirements Document (PRD)

## 1. Project Overview

Dynamic Portfolio Starter is a full-stack template built to accelerate the creation of modern, dynamic portfolio websites. Out of the box, it offers secure user authentication, a protected admin panel, database integration, UI component library, and theming support. Developers can plug in their content models (projects, blog posts, experiences, contact messages) and have a production-ready portfolio up and running in minutes.

This template is being built to solve the common pain of setting up boilerplate: you don’t need to wire authentication, database, and theming from scratch. The key objectives for this project are:

- Provide a unified codebase (Next.js App Router) for both frontend and backend.  
- Offer prebuilt CRUD interfaces and API routes for managing portfolio data.  
- Ensure a consistent design system with Tailwind CSS, shadcn/ui, and dark-mode theming.  
- Make local development easy with Docker, and production deployment seamless with Vercel.

Success will be measured by how quickly a developer can clone the repo, define their schema, and deploy a live portfolio site without writing boilerplate.

## 2. In-Scope vs. Out-of-Scope

### In-Scope (V1)

- **Next.js App Router**: Single codebase handling pages, layouts, and API routes.  
- **Authentication**: Sign-up/sign-in flows using Better Auth, session management, and route protection.  
- **Admin Panel**: `/admin` area with sidebar, data tables, forms for CRUD on Projects, BlogPosts, Experiences, SiteSettings.  
- **Public Pages**: Home, Projects listing, Blog listing, individual post/project pages, Contact form.  
- **Database**: PostgreSQL integration via Drizzle ORM. Preconfigured `db/schema` folder for models.  
- **UI Components & Theming**: Tailwind CSS + shadcn/ui components (Card, Modal, Table, Chart), `next-themes` for light/dark mode.  
- **Contact Form**: API route to receive submissions, send email via Nodemailer, save to `ContactMessage` table.  
- **File Uploads**: API route using Formidable to handle image uploads and store on a chosen cloud service.  
- **Containerization**: Docker Compose for Next.js app and PostgreSQL.  
- **Deployment**: Vercel configuration for easy production deploy.

### Out-of-Scope (Phase 2 or Later)

- Social login providers (Google, GitHub).  
- Multi-user roles beyond a single admin.  
- Analytics, search indexing, or CMS integrations.  
- Internationalization (i18n) support.  
- Payment processing or e-commerce features.  
- Advanced caching layers, CDN optimizations beyond defaults.  
- Dedicated background job queues or microservices.

## 3. User Flow

A visitor lands on the public home page and sees a hero banner, navigation links (`Home`, `Projects`, `Blog`, `Contact`), and a theme toggle switch. They click on `Projects` to view a responsive grid of project cards. Each card links to a project detail page with images, descriptions, and links. Next, they navigate to `Blog` to browse posts; clicking a post opens the full article. If they want to get in touch, they go to `Contact`, fill out their name, email, and message, then submit. Behind the scenes, the form calls the `/api/contact` endpoint, stores the message in the database, and an email notification is sent.

An admin user goes to `/admin`. If not signed in, they see a login form (email/password). After authentication via Better Auth, they land on the Admin Dashboard. The dashboard has a sidebar (`Projects`, `Blog Posts`, `Experiences`, `Site Settings`, `Logout`). Clicking `Projects` shows a data table with existing items and an “Add New” button. They click it, fill out fields in a modal (title, description, image upload), and save. The UI sends a POST request to `/api/projects`; server validates the session, writes to PostgreSQL via Drizzle, and returns the new record. The table updates instantly. The admin can also edit or delete items, toggle themes, and log out when finished.

## 4. Core Features

- **Authentication & Authorization**  
  • Secure email/password sign-up and sign-in (Better Auth)  
  • Session handling and protected routes for `/admin` pages and API endpoints

- **Admin Dashboard**  
  • Sidebar navigation: Projects, BlogPosts, Experiences, SiteSettings  
  • Data tables with sorting, filtering, pagination  
  • Modal forms for Create, Update, Delete operations

- **Public Portfolio Pages**  
  • Projects listing and detail views  
  • Blog listing and article pages  
  • Contact page with form validation and submission

- **API Routes**  
  • `/api/auth/*` for authentication flows  
  • `/api/projects` and `/api/projects/[id]` for CRUD  
  • `/api/blog` and `/api/blog/[id]`  
  • `/api/experience` and `/api/contact`  
  • `/api/uploads` for file/image handling

- **Database Schema**  
  • Drizzle ORM models: User, Project, BlogPost, Experience, ContactMessage, SiteSettings  
  • Automated migrations via `drizzle-kit`

- **UI & Theming**  
  • Tailwind CSS utility-first styling  
  • shadcn/ui components (Card, Modal, Table, Chart, etc.)  
  • Dark/light mode switch with `next-themes` and localStorage persistence

- **Containerization & Deployment**  
  • Docker Compose setup (Next.js + PostgreSQL)  
  • Vercel deployment config

## 5. Tech Stack & Tools

- **Frontend**  
  • Next.js 15 (App Router)  
  • React & TypeScript  
  • Tailwind CSS & shadcn/ui  
  • next-themes (dark/light mode)

- **Backend & Database**  
  • Next.js API Routes (Node.js)  
  • Better Auth library for sessions  
  • PostgreSQL  
  • Drizzle ORM (code-first migrations)
  
- **File Handling & Email**  
  • Formidable (multipart/form-data parsing)  
  • Nodemailer for email notifications

- **Containerization & Deployment**  
  • Docker & Docker Compose  
  • Vercel for production hosting

- **Development & Testing (optional)**  
  • VS Code (recommend extensions: ESLint, Prettier)  
  • Jest, React Testing Library for unit tests  
  • Playwright for end-to-end tests

## 6. Non-Functional Requirements

- **Performance**  
  • Public page load time under 1s on 3G network emulation  
  • API response times under 200ms for basic CRUD

- **Security**  
  • Enforce HTTPS in production  
  • Protect against XSS, CSRF, SQL injection  
  • Secure session cookies (httpOnly, SameSite)
  
- **Accessibility & Usability**  
  • WCAG 2.1 AA compliance for UI components  
  • Responsive design tested on desktop/mobile/tablet

- **Reliability & Availability**  
  • 99.9% uptime on Vercel (SLAs)  
  • Database connection pooling and retry logic

- **Compliance**  
  • GDPR-friendly handling of contact form data  
  • Environment variables for secrets and credentials

## 7. Constraints & Assumptions

- Better Auth and Drizzle ORM support must be available and up-to-date.  
- A single admin user is assumed; no role hierarchy in V1.  
- A PostgreSQL instance (local or hosted) is accessible via environment variables.  
- Developers will have Docker installed for local setup.  
- Cloud storage (S3, Cloudinary) credentials will be provided for file uploads.  
- No external CMS or third-party API rate limits are considered beyond PostgreSQL.

## 8. Known Issues & Potential Pitfalls

- **SSR Hydration Mismatch**: `next-themes` may cause flicker on initial load.  
  • Mitigation: use `ThemeProvider` with `enableSystem={false}` and avoid client/component mismatches.

- **Database Migrations**: Drizzle’s code-first migrations require careful version control.  
  • Mitigation: run `drizzle-kit generate` in CI and review SQL diffs before applying.

- **File Upload Limits**: Large images may exceed default body parser limits.  
  • Mitigation: set file size limits in Formidable config and handle errors gracefully.

- **Docker Performance**: File system volume mounting can be slow on macOS.  
  • Mitigation: use Docker’s `:delegated` flag or run without mounts in CI.

- **Email Deliverability**: Nodemailer default SMTP may hit spam folders.  
  • Mitigation: use a reputable email service (SendGrid, Mailgun) with proper DKIM/SPF records.


---

This PRD provides a clear, unambiguous foundation for your Dynamic Portfolio Starter. Subsequent documents (Tech Stack Detail, Frontend Guidelines, Backend Structure, App Flow, File Structure) can be generated directly from these requirements without guesswork.