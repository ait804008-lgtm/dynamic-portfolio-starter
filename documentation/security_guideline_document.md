# Security Guidelines for Dynamic Portfolio Starter

This document provides actionable security best practices tailored to the **Dynamic Portfolio Starter** codebase. It aligns with Security by Design principles and covers authentication, input validation, data protection, API security, web hygiene, infrastructure, and dependency management.

---

## 1. Authentication & Access Control

- **Secure Better Auth Configuration**
  - Rotate and store your authentication keys in a secrets management system (e.g., AWS Secrets Manager, HashiCorp Vault). Do not commit them to source control.
  - Enforce strong password policies: minimum length of 12 characters, require uppercase, lowercase, digits, and special characters.
  - Use a modern password-hashing algorithm (e.g., Argon2 or bcrypt) with a unique salt per user.

- **Session Management**
  - Configure idle and absolute session timeouts. For example, idle timeout = 15 minutes, absolute timeout = 8 hours.
  - Regenerate session identifiers after login to prevent session fixation.
  - Set session cookies with `HttpOnly`, `Secure`, and `SameSite=Strict` attributes.
  - Ensure logout fully destroys the session on both client and server.

- **Role-Based Access Control (RBAC)**
  - Define an `admin` role for the `/app/admin` routes. Store role information in the session token.
  - In every API route under `/app/api/*`, verify the user’s role via `auth()` helper before performing CRUD operations.
  - Deny-by-default: any new endpoint must explicitly allow only authenticated or admin roles.

- **Multi-Factor Authentication (MFA)** (Optional)
  - Consider integrating an MFA factor (SMS, TOTP) for admin accounts.
  - Use a well-maintained library (e.g., `otplib`) and provide recovery codes.

---

## 2. Input Handling & Processing

- **Server-Side Validation**
  - Use a runtime schema validation library like Zod for all API route inputs (e.g., `app/api/projects/route.ts`).
  - Reject any request missing required fields or containing extra properties.

- **Prevent Injection Attacks**
  - Interact with PostgreSQL exclusively via Drizzle ORM’s parameterized queries. Never interpolate user input into raw SQL.
  - Sanitize file paths on upload to prevent path traversal.

- **Cross-Site Scripting (XSS) Mitigation**
  - Escape or encode all dynamic data rendered in React components. Use `{/* React escapes by default */}` for text nodes.
  - Avoid using `dangerouslySetInnerHTML`. If needed, sanitize input HTML with a library like DOMPurify.

- **Cross-Site Request Forgery (CSRF)**
  - For any state-changing request made from the browser, include and validate an anti-CSRF token. Leverage Next.js’s built-in CSRF solutions or a library such as `csurf`.

- **File Upload Security**
  - Restrict accepted MIME types and maximum file size for image uploads (e.g., 5 MB / file).
  - Scan uploads for malware using a service or library (e.g., ClamAV).
  - Store files outside the public directory and serve them through a signed, time-limited URL if necessary.

---

## 3. Data Protection & Privacy

- **Encryption in Transit & at Rest**
  - Enforce HTTPS with TLS 1.2+ for all requests. Redirect HTTP to HTTPS in production.
  - Enable encryption at rest on the PostgreSQL instance and any object storage service.

- **Secret Management**
  - Do not store API keys, database credentials, or JWT secrets in `.env` files committed to the repo.
  - Use environment-specific secret stores and inject secrets via CI/CD pipelines.

- **Sensitive Data in Logs & Errors**
  - Sanitize logs: omit PII (emails, phone numbers) and internal stack traces.
  - Use structured logging solutions (e.g., Winston or Pino) at appropriate log levels.
  - In production, return generic error messages (e.g., “Internal Server Error”) with a unique error ID.

- **Privacy Compliance**
  - Only collect and store necessary data in your `ContactMessage` model.
  - Provide a data retention policy and deletion endpoint if subject to GDPR/CCPA.

---

## 4. API & Service Security

- **HTTPS & HSTS**
  - Configure a strong HSTS header (`Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`).

- **Rate Limiting & Throttling**
  - Employ rate limiting on public API routes (`/app/api/contact`) to prevent spam.
  - Use a Redis or in-memory store to track IP-based request counts.

- **CORS Configuration**
  - Restrict `access-control-allow-origin` to your production domains only.
  - Disallow wildcard origins in production environments.

- **Least Privilege for Service Accounts**
  - The database user should have only the necessary `SELECT`, `INSERT`, `UPDATE`, `DELETE` permissions on specific tables.

- **API Versioning**
  - Prefix your routes with `/api/v1/…`. Document breaking changes before rolling out v2.

---

## 5. Web Application Security Hygiene

- **Security Headers**
  - `Content-Security-Policy`: restrict sources for scripts, styles, images, and fonts.
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`

- **Secure Cookies**
  - Set all cookies serving auth tokens as `HttpOnly; Secure; SameSite=Strict`.

- **Subresource Integrity (SRI)**
  - For any third-party script or stylesheet, include an `integrity` attribute to verify file hashes.

---

## 6. Infrastructure & Configuration Management

- **Container Hardening**
  - Use a minimal base image (e.g., `node:18-alpine`) and regularly update it.
  - Run the app as a non-root user inside the container.

- **Environment Separation**
  - Maintain separate configurations for development, staging, and production.
  - Enforce firewall rules or security groups to limit access to your database and admin interfaces.

- **TLS Configuration**
  - Disable TLS 1.0/1.1 and weak ciphers in your load balancer or reverse proxy (e.g., Nginx).

- **Disable Debug in Production**
  - Ensure `NEXT_PUBLIC_VERCEL_ENV` or `NODE_ENV`=production disables verbose error pages and telemetry.

---

## 7. Dependency Management

- **Lockfile & Reproducible Builds**
  - Commit `pnpm-lock.yaml` to guarantee deterministic dependency versions.

- **Vulnerability Scanning**
  - Integrate an SCA tool (e.g., GitHub Dependabot, Snyk) into your CI pipeline.
  - Monitor transitive dependencies for known CVEs and apply patches promptly.

- **Minimal Dependency Footprint**
  - Audit your `package.json` to remove unused packages.

---

By adhering to these security guidelines, you will strengthen the Dynamic Portfolio Starter’s resilience against common threats and ensure a secure foundation for your custom portfolio application. Regularly review and update these practices as both your codebase and the threat landscape evolve.