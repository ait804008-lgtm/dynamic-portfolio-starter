import { db } from './index';
import { users, projects, experience, education, skills, projectSkills, blogPosts, contactMessages, personalInfo, siteSettings } from './schema';
import { nanoid } from 'nanoid';

async function seedComprehensive() {
  console.log('🌱 Starting comprehensive database seeding...');

  try {
    // Create multiple users for realistic data
    console.log('Creating users...');
    const adminUser = await db.insert(users).values({
      id: nanoid(),
      email: 'admin@portfolio.com',
      name: 'Portfolio Admin',
      password: '$2a$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQ', // hashed 'password'
      role: 'admin',
      bio: 'Full Stack Developer passionate about creating amazing web applications',
    }).returning();

    const contentCreator = await db.insert(users).values({
      id: nanoid(),
      email: 'creator@portfolio.com',
      name: 'Content Creator',
      password: '$2a$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQ', // hashed 'password'
      role: 'admin',
      bio: 'Content creator and UX enthusiast with a passion for clean design',
    }).returning();

    const userId = adminUser[0].id;
    const creatorId = contentCreator[0].id;

    // Create comprehensive personal info for main user
    console.log('Creating personal info...');
    await db.insert(personalInfo).values({
      id: nanoid(),
      userId,
      firstName: 'John',
      lastName: 'Doe',
      title: 'Full Stack Developer',
      bio: 'Passionate developer with 8+ years of experience in modern web technologies. I love building scalable applications and sharing knowledge through blog posts and open source contributions.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      location: 'San Francisco, CA',
      phone: '+1 (555) 123-4567',
      email: 'john.doe@example.com',
      website: 'https://johndoe.dev',
      resumeUrl: 'https://johndoe.dev/resume.pdf',
      socialLinks: JSON.stringify({
        github: 'https://github.com/johndoe',
        linkedin: 'https://linkedin.com/in/johndoe',
        twitter: 'https://twitter.com/johndoe',
        devto: 'https://dev.to/johndoe',
        dribbble: 'https://dribbble.com/johndoe'
      }),
      skills: 'React, Node.js, TypeScript, PostgreSQL, AWS',
      languages: JSON.stringify(['English (Native)', 'Spanish (Professional)', 'French (Basic)']),
      interests: 'Web Development, Cloud Architecture, Open Source, Technical Writing',
    });

    // Create additional personal info for content creator
    await db.insert(personalInfo).values({
      id: nanoid(),
      userId: creatorId,
      firstName: 'Jane',
      lastName: 'Smith',
      title: 'UX Designer & Content Creator',
      bio: 'Creative professional focused on user experience and visual design. I believe in the power of clean interfaces and intuitive interactions.',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b812d88d?w=150&h=150&fit=crop&crop=face',
      location: 'Austin, TX',
      email: 'jane.smith@example.com',
      website: 'https://janesmith.design',
      socialLinks: JSON.stringify({
        github: 'https://github.com/janesmith',
        linkedin: 'https://linkedin.com/in/janesmith',
        twitter: 'https://twitter.com/janesmith',
        behance: 'https://behance.net/janesmith'
      }),
      languages: JSON.stringify(['English (Native)', 'Spanish (Conversational)']),
      interests: 'UX Design, Visual Design, Content Strategy, User Research',
    });

    // Create comprehensive skills (15 total)
    console.log('Creating skills...');
    const frontendSkills = await db.insert(skills).values([
      { id: nanoid(), name: 'React', category: 'Frontend', proficiency: 5, authorId: userId, featured: true },
      { id: nanoid(), name: 'Vue.js', category: 'Frontend', proficiency: 4, authorId: userId },
      { id: nanoid(), name: 'TypeScript', category: 'Frontend', proficiency: 5, authorId: userId, featured: true },
      { id: nanoid(), name: 'Next.js', category: 'Frontend', proficiency: 5, authorId: userId, featured: true },
      { id: nanoid(), name: 'Tailwind CSS', category: 'Frontend', proficiency: 4, authorId: userId },
      { id: nanoid(), name: 'SASS/SCSS', category: 'Frontend', proficiency: 4, authorId: userId },
      { id: nanoid(), name: 'Figma', category: 'Design', proficiency: 4, authorId: creatorId, featured: true },
      { id: nanoid(), name: 'Adobe XD', category: 'Design', proficiency: 3, authorId: creatorId },
      { id: nanoid(), name: 'Sketch', category: 'Design', proficiency: 3, authorId: creatorId },
    ]).returning();

    const backendSkills = await db.insert(skills).values([
      { id: nanoid(), name: 'Node.js', category: 'Backend', proficiency: 5, authorId: userId, featured: true },
      { id: nanoid(), name: 'Python', category: 'Backend', proficiency: 4, authorId: userId },
      { id: nanoid(), name: 'PostgreSQL', category: 'Backend', proficiency: 4, authorId: userId, featured: true },
      { id: nanoid(), name: 'MongoDB', category: 'Backend', proficiency: 3, authorId: userId },
      { id: nanoid(), name: 'GraphQL', category: 'Backend', proficiency: 4, authorId: userId },
      { id: nanoid(), name: 'REST APIs', category: 'Backend', proficiency: 5, authorId: userId },
    ]).returning();

    const toolSkills = await db.insert(skills).values([
      { id: nanoid(), name: 'Git', category: 'Tools', proficiency: 5, authorId: userId, featured: true },
      { id: nanoid(), name: 'Docker', category: 'DevOps', proficiency: 3, authorId: userId },
      { id: nanoid(), name: 'Kubernetes', category: 'DevOps', proficiency: 3, authorId: userId },
      { id: nanoid(), name: 'AWS', category: 'DevOps', proficiency: 3, authorId: userId },
      { id: nanoid(), name: 'Vercel', category: 'Tools', proficiency: 4, authorId: userId },
      { id: nanoid(), name: 'Jest', category: 'Tools', proficiency: 4, authorId: userId },
    ]).returning();

    // Create comprehensive experience (5 entries)
    console.log('Creating experience entries...');
    await db.insert(experience).values([
      {
        id: nanoid(),
        company: 'Tech Innovations Inc.',
        position: 'Senior Full Stack Developer',
        location: 'San Francisco, CA',
        description: 'Leading development of enterprise-scale web applications using React, Node.js, and cloud technologies. Mentoring team members and establishing best practices.',
        responsibilities: JSON.stringify([
          'Architected and implemented microservices-based applications serving 1M+ users',
          'Led team of 5 developers in agile development processes',
          'Established CI/CD pipelines reducing deployment time by 60%',
          'Mentored junior developers and conducted comprehensive code reviews',
          'Collaborated with product managers to define technical requirements and timelines'
        ]),
        achievements: 'Successfully launched 3 major products, improved application performance by 40%, and reduced bug reports by 65%',
        companyLogo: 'https://logo.clearbit.com/tech-innovations.com',
        currentJob: true,
        authorId: userId,
        startDate: new Date('2022-01-15'),
      },
      {
        id: nanoid(),
        company: 'Digital Solutions LLC',
        position: 'Full Stack Developer',
        location: 'Austin, TX',
        description: 'Developed and maintained full-stack applications for various clients across different industries.',
        responsibilities: JSON.stringify([
          'Built responsive web applications using React and Node.js',
          'Designed and implemented RESTful APIs',
          'Integrated third-party services and payment gateways',
          'Performed database optimization and performance tuning'
        ]),
        achievements: 'Completed 12+ projects for diverse clients, maintaining 95% client satisfaction rate',
        companyLogo: 'https://logo.clearbit.com/digital-solutions.com',
        currentJob: false,
        authorId: userId,
        startDate: new Date('2020-06-01'),
        endDate: new Date('2021-12-31'),
      },
      {
        id: nanoid(),
        company: 'StartupHub',
        position: 'Frontend Developer',
        location: 'Remote',
        description: 'Focused on creating responsive and accessible user interfaces for startup products.',
        responsibilities: JSON.stringify([
          'Developed React components following accessibility guidelines',
          'Collaborated with UX designers to implement pixel-perfect designs',
          'Optimized application performance and loading times',
          'Participated in code reviews and pair programming sessions'
        ]),
        achievements: 'Improved page load speed by 50% and increased user engagement by 30%',
        companyLogo: 'https://logo.clearbit.com/startuphub.com',
        currentJob: false,
        authorId: userId,
        startDate: new Date('2019-03-15'),
        endDate: new Date('2020-05-31'),
      },
      {
        id: nanoid(),
        company: 'Creative Agency',
        position: 'Junior Developer',
        location: 'New York, NY',
        description: 'Started professional career developing websites for creative agency clients.',
        responsibilities: JSON.stringify([
          'Built WordPress and custom PHP websites',
          'Implemented responsive designs using HTML/CSS/JavaScript',
          'Provided technical support for client projects',
          'Learned modern development frameworks and best practices'
        ]),
        achievements: 'Successfully delivered 20+ client projects while learning new technologies',
        companyLogo: 'https://logo.clearbit.com/creative-agency.com',
        currentJob: false,
        authorId: userId,
        startDate: new Date('2018-07-01'),
        endDate: new Date('2019-02-28'),
      },
      {
        id: nanoid(),
        company: 'Design Studio',
        position: 'UX Designer',
        location: 'Austin, TX',
        description: 'Creating user-centered designs and conducting research for various digital products.',
        responsibilities: JSON.stringify([
          'Conducted user research and usability testing',
          'Created wireframes and high-fidelity prototypes',
          'Designed responsive user interfaces',
          'Collaborated with development teams to implement designs'
        ]),
        achievements: 'Improved user satisfaction scores by 25% and reduced support tickets by 40%',
        companyLogo: 'https://logo.clearbit.com/design-studio.com',
        currentJob: true,
        authorId: creatorId,
        startDate: new Date('2021-09-01'),
      },
    ]);

    // Create comprehensive education (5 entries)
    console.log('Creating education entries...');
    await db.insert(education).values([
      {
        id: nanoid(),
        institution: 'University of California, Berkeley',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        location: 'Berkeley, CA',
        description: 'Graduated magna cum laude with focus on software engineering and computer systems.',
        gpa: '3.8',
        honors: ' magna cum laude, Dean\'s List',
        institutionLogo: 'https://logo.clearbit.com/berkeley.edu',
        currentStudent: false,
        authorId: userId,
        startDate: new Date('2016-09-01'),
        endDate: new Date('2020-05-31'),
      },
      {
        id: nanoid(),
        institution: 'General Assembly',
        degree: 'Full Stack Web Development',
        field: 'Web Development Immersive',
        location: 'San Francisco, CA',
        description: 'Intensive 12-week bootcamp covering modern web development technologies.',
        honors: 'Completed final project with distinction',
        institutionLogo: 'https://logo.clearbit.com/generalassemb.ly',
        currentStudent: false,
        authorId: userId,
        startDate: new Date('2020-06-01'),
        endDate: new Date('2020-08-31'),
      },
      {
        id: nanoid(),
        institution: 'Rhode Island School of Design',
        degree: 'Bachelor of Fine Arts',
        field: 'Graphic Design',
        location: 'Providence, RI',
        description: 'Focused on visual communication, typography, and digital design principles.',
        gpa: '3.6',
        honors: 'Rhode Island State Design Award Winner',
        institutionLogo: 'https://logo.clearbit.com/risd.edu',
        currentStudent: false,
        authorId: creatorId,
        startDate: new Date('2017-09-01'),
        endDate: new Date('2021-05-31'),
      },
      {
        id: nanoid(),
        institution: 'Coursera',
        degree: 'Professional Certificate',
        field: 'Machine Learning',
        location: 'Online',
        description: 'Online specialization in machine learning fundamentals and applications.',
        honors: 'Completed with 95% average',
        currentStudent: false,
        authorId: userId,
        startDate: new Date('2021-01-15'),
        endDate: new Date('2021-04-30'),
      },
      {
        id: nanoid(),
        institution: 'Stanford University',
        degree: 'Master of Science',
        field: 'Human-Computer Interaction',
        location: 'Stanford, CA',
        description: 'Advanced study in user experience research and interface design.',
        currentStudent: true,
        institutionLogo: 'https://logo.clearbit.com/stanford.edu',
        authorId: creatorId,
        startDate: new Date('2023-09-01'),
      },
    ]);

    // Create comprehensive projects (5 diverse projects)
    console.log('Creating projects...');
    const allSkills = [...frontendSkills, ...backendSkills, ...toolSkills];

    const createdProjects = await db.insert(projects).values([
      {
        id: nanoid(),
        title: 'Dynamic Portfolio Website',
        slug: 'dynamic-portfolio-website',
        description: 'A modern portfolio website built with Next.js and Drizzle ORM featuring admin dashboard and blog functionality.',
        longDescription: 'A full-featured portfolio website showcasing advanced web development skills. Includes user authentication, content management system, contact form with email notifications, blog functionality with markdown support, and comprehensive admin dashboard. Built with performance and accessibility in mind.',
        imageUrl: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&h=400&fit=crop',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&h=400&fit=crop',
          'https://images.unsplash.com/photo-1555066931-4368d2beb9e5?w=800&h=400&fit=crop'
        ]),
        technologies: JSON.stringify(['Next.js', 'TypeScript', 'Drizzle ORM', 'Tailwind CSS', 'React Query']),
        projectUrl: 'https://portfolio.example.com',
        githubUrl: 'https://github.com/johndoe/portfolio',
        featured: true,
        published: true,
        sortOrder: 1,
        authorId: userId,
      },
      {
        id: nanoid(),
        title: 'Task Management Platform',
        slug: 'task-management-platform',
        description: 'A collaborative task management application with real-time updates and team collaboration features.',
        longDescription: 'Enterprise-grade task management system featuring real-time collaboration, drag-and-drop interface, kanban boards, time tracking, and advanced filtering. Built for distributed teams with focus on productivity and user experience.',
        imageUrl: 'https://images.unsplash.com/photo-1559027867-8e783803eb2c?w=800&h=400&fit=crop',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1559027867-8e783803eb2c?w=800&h=400&fit=crop'
        ]),
        technologies: JSON.stringify(['React', 'Node.js', 'PostgreSQL', 'Socket.io', 'TypeScript', 'Redis']),
        projectUrl: 'https://tasks.example.com',
        githubUrl: 'https://github.com/johndoe/task-platform',
        featured: true,
        published: true,
        sortOrder: 2,
        authorId: userId,
      },
      {
        id: nanoid(),
        title: 'E-commerce Mobile App',
        slug: 'ecommerce-mobile-app',
        description: 'React Native mobile application for e-commerce with payment integration and real-time inventory.',
        longDescription: 'Cross-platform mobile e-commerce solution with seamless payment integration, real-time inventory management, push notifications, and intuitive shopping experience. Designed for iOS and Android with focus on performance and user engagement.',
        imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6f459?w=800&h=400&fit=crop',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1556742049-0cfed4f6f459?w=800&h=400&fit=crop'
        ]),
        technologies: JSON.stringify(['React Native', 'TypeScript', 'Redux', 'Stripe API', 'Firebase']),
        projectUrl: 'https://apps.apple.com/ecommerce-app',
        githubUrl: 'https://github.com/johndoe/ecommerce-mobile',
        featured: false,
        published: true,
        sortOrder: 3,
        authorId: userId,
      },
      {
        id: nanoid(),
        title: 'Data Analytics Dashboard',
        slug: 'data-analytics-dashboard',
        description: 'Interactive dashboard for data visualization and business intelligence with real-time metrics.',
        longDescription: 'Advanced analytics dashboard providing real-time business insights, customizable charts, and automated reporting. Integrates with multiple data sources and provides actionable insights through machine learning-powered recommendations.',
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop'
        ]),
        technologies: JSON.stringify(['Vue.js', 'D3.js', 'Python', 'FastAPI', 'PostgreSQL', 'Docker']),
        projectUrl: 'https://analytics.example.com',
        githubUrl: 'https://github.com/johndoe/analytics-dashboard',
        featured: true,
        published: true,
        sortOrder: 4,
        authorId: userId,
      },
      {
        id: nanoid(),
        title: 'Design System Component Library',
        slug: 'design-system-library',
        description: 'Reusable component library with comprehensive documentation and accessibility features.',
        longDescription: 'Enterprise-grade design system featuring 50+ reusable components, comprehensive documentation, storybook integration, and accessibility compliance. Built with TypeScript and includes comprehensive testing suite.',
        imageUrl: 'https://images.unsplash.com/photo-1542831371-77b9b77e8501?w=800&h=400&fit=crop',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1542831371-77b9b77e8501?w=800&h=400&fit=crop'
        ]),
        technologies: JSON.stringify(['React', 'TypeScript', 'Storybook', 'Jest', 'Rollup']),
        githubUrl: 'https://github.com/johndoe/design-system',
        published: true,
        sortOrder: 5,
        authorId: creatorId,
      },
    ]).returning();

    // Link skills to projects
    console.log('Linking skills to projects...');
    for (let i = 0; i < createdProjects.length; i++) {
      const project = createdProjects[i];
      const skillsPerProject = Math.floor(Math.random() * 4) + 3; // 3-6 skills per project
      const selectedSkills = allSkills.slice(i * skillsPerProject, (i + 1) * skillsPerProject);

      for (const skill of selectedSkills) {
        await db.insert(projectSkills).values({
          id: nanoid(),
          projectId: project.id,
          skillId: skill.id,
        });
      }
    }

    // Create comprehensive blog posts (5 diverse posts)
    console.log('Creating blog posts...');
    await db.insert(blogPosts).values([
      {
        id: nanoid(),
        title: 'Advanced TypeScript Patterns for Large Applications',
        slug: 'advanced-typescript-patterns',
        excerpt: 'Explore powerful TypeScript patterns that scale with your application complexity.',
        content: `# Advanced TypeScript Patterns for Large Applications

TypeScript offers powerful features that can significantly improve code quality and maintainability in large applications. Let's explore some advanced patterns.

## 1. Generic Repository Pattern

The repository pattern provides a clean abstraction over data access:

\`\`\`typescript
interface Repository<T> {
  findById(id: string): Promise<T | null>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

class PostRepository implements Repository<Post> {
  constructor(private db: Database) {}

  async findById(id: string): Promise<Post | null> {
    return await this.db.posts.findById(id);
  }
  // ... other methods
}
\`\`\`

## 2. Builder Pattern for Configuration

When dealing with complex configuration objects:

\`\`\`typescript
class ConfigBuilder {
  private config: AppConfig = {};

  setDatabase(config: DatabaseConfig): this {
    this.config.database = config;
    return this;
  }

  setCache(config: CacheConfig): this {
    this.config.cache = config;
    return this;
  }

  build(): AppConfig {
    return this.config;
  }
}

const config = new ConfigBuilder()
  .setDatabase(dbConfig)
  .setCache(cacheConfig)
  .build();
\`\`\`

These patterns help maintain clean architecture and testability in large applications.`,
        featuredImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e404f3?w=800&h=400&fit=crop',
        authorId: userId,
        tags: JSON.stringify(['TypeScript', 'Architecture', 'Patterns', 'Enterprise']),
        category: 'Development',
        readTime: 8,
        featured: true,
        published: true,
        metaTitle: 'Advanced TypeScript Patterns for Large Applications | Complete Guide',
        metaDescription: 'Learn advanced TypeScript patterns for building scalable, maintainable applications with proper architecture and type safety.',
        publishedAt: new Date('2024-01-15'),
      },
      {
        id: nanoid(),
        title: 'Building Accessible Web Applications: A Complete Guide',
        slug: 'building-accessible-web-applications',
        excerpt: 'Learn how to create web applications that work for everyone, regardless of ability.',
        content: `# Building Accessible Web Applications: A Complete Guide

Accessibility is not just about compliance – it's about creating inclusive experiences for all users.

## Understanding WCAG Guidelines

The Web Content Accessibility Guidelines (WCAG) provide four main principles:

1. **Perceivable** - Information must be presentable in ways users can perceive
2. **Operable** - Interface components and navigation must be operable
3. **Understandable** - Information and operation must be understandable
4. **Robust** - Content must be robust enough for various assistive technologies

## Practical Implementation

### Semantic HTML
\`\`\`html
<!-- Use semantic elements -->
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</nav>

<main role="main">
  <section aria-labelledby="about-heading">
    <h2 id="about-heading">About Us</h2>
    <p>Content here...</p>
  </section>
</main>
\`\`\`

### ARIA Attributes
\`\`\`html
<button
  aria-expanded="false"
  aria-controls="menu"
  aria-label="Toggle navigation menu">
  Menu
</button>
\`\`\`

## Testing Your Accessibility

Use these tools to test your applications:
- WAVE Web Accessibility Evaluation Tool
- axe DevTools browser extension
- Screen reader testing with NVDA or VoiceOver

Remember: accessibility is a continuous process, not a one-time task.`,
        featuredImage: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d93?w=800&h=400&fit=crop',
        authorId: creatorId,
        tags: JSON.stringify(['Accessibility', 'WCAG', 'UX Design', 'Inclusive Design']),
        category: 'Design',
        readTime: 12,
        featured: true,
        published: true,
        metaTitle: 'Building Accessible Web Applications: Complete WCAG 2.1 Guide',
        metaDescription: 'Complete guide to building accessible web applications following WCAG 2.1 guidelines with practical examples and testing tools.',
        publishedAt: new Date('2024-01-10'),
      },
      {
        id: nanoid(),
        title: 'Microservices with Node.js and Docker',
        slug: 'microservices-nodejs-docker',
        excerpt: 'Learn how to build and deploy microservices using Node.js and Docker containers.',
        content: `# Microservices with Node.js and Docker

Microservices architecture allows building scalable, maintainable applications. Let's explore how to implement this with Node.js and Docker.

## Microservices Fundamentals

Microservices break down applications into smaller, independent services:

**Benefits:**
- Independent scaling and deployment
- Technology diversity across services
- Fault isolation
- Team autonomy

**Challenges:**
- Network complexity
- Data consistency
- Service discovery
- Monitoring and debugging

## Building a Simple Microservice

### Service Structure
\`\`\`javascript
// user-service/index.js
const express = require('express');
const { Pool } = require('pg');

const app = express();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

app.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(\`User service running on port \${port}\`);
});
\`\`\`

### Docker Configuration
\`\`\`dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

CMD ["node", "index.js"]
\`\`\`

### Docker Compose
\`\`\`yaml
version: '3.8'

services:
  user-service:
    build: ./user-service
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/myapp
    depends_on:
      - postgres
    ports:
      - "3001:3001"

  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
\`\`\`

This foundation allows building complex microservices architectures with proper containerization.`,
        featuredImage: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d93?w=800&h=400&fit=crop',
        authorId: userId,
        tags: JSON.stringify(['Node.js', 'Docker', 'Microservices', 'DevOps']),
        category: 'DevOps',
        readTime: 10,
        featured: false,
        published: true,
        metaTitle: 'Microservices with Node.js and Docker - Complete Implementation Guide',
        metaDescription: 'Learn how to build scalable microservices architecture using Node.js and Docker with practical examples.',
        publishedAt: new Date('2024-01-08'),
      },
      {
        id: nanoid(),
        title: 'React Performance Optimization Techniques',
        slug: 'react-performance-optimization',
        excerpt: 'Master React performance optimization to build lightning-fast applications.',
        content: `# React Performance Optimization Techniques

Performance is crucial for user experience. Here are proven techniques to optimize React applications.

## 1. Component Optimization

### React.memo
\`\`\`jsx
import React from 'react';

const UserProfile = React.memo(({ user, onUpdate }) => {
  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      <button onClick={() => onUpdate(user)}>
        Update
      </button>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function
  return prevProps.user.id === nextProps.user.id;
});
\`\`\`

### useMemo and useCallback
\`\`\`jsx
function ExpensiveComponent({ data, onItemClick }) {
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      computed: expensiveCalculation(item)
    }));
  }, [data]); // Only recompute when data changes

  const handleClick = useCallback((item) => {
    onItemClick(item);
  }, [onItemClick]); // Stable reference

  return (
    <ul>
      {processedData.map(item => (
        <li key={item.id} onClick={() => handleClick(item)}>
          {item.name}
        </li>
      ))}
    </ul>
  );
}
\`\`\`

## 2. Bundle Optimization

### Code Splitting
\`\`\`jsx
import { lazy, Suspense } from 'react';

const AdminPanel = lazy(() => import('./AdminPanel'));
const UserDashboard = lazy(() => import('./UserDashboard'));

function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <div>
      <nav>
        <button onClick={() => setIsAdmin(!isAdmin)}>
          Toggle View
        </button>
      </nav>

      <Suspense fallback={<div>Loading...</div>}>
        {isAdmin ? <AdminPanel /> : <UserDashboard />}
      </Suspense>
    </div>
  );
}
\`\`\`

### Tree Shaking
\`\`\`javascript
// webpack.config.js
module.exports = {
  mode: 'production',
  optimization: {
    usedExports: true,
    sideEffects: false,
  }
};
\`\`\`

## 3. Rendering Optimization

### Virtualization
\`\`\`jsx
import { FixedSizeList as List } from 'react-window';

const BigList = ({ items }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      Row {index}: {items[index].name}
    </div>
  );

  return (
    <List
      height={600}
      itemCount={items.length}
      itemSize={35}
    >
      {Row}
    </List>
  );
};
\`\`\`

## Monitoring Performance

Use these tools to track performance:
- React DevTools Profiler
- Lighthouse audits
- Chrome DevTools Performance tab
- Bundle analyzer (webpack-bundle-analyzer)

Key metrics to monitor:
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)
- Cumulative Layout Shift (CLS)

Performance optimization is an ongoing process. Regular monitoring and optimization ensure the best user experience.`,
        featuredImage: 'https://images.unsplash.com/photo-1553481187-be9c690be2db?w=800&h=400&fit=crop',
        authorId: userId,
        tags: JSON.stringify(['React', 'Performance', 'Optimization', 'JavaScript']),
        category: 'Frontend',
        readTime: 15,
        featured: false,
        published: true,
        metaTitle: 'React Performance Optimization Techniques - Complete Guide',
        metaDescription: 'Master React performance optimization with proven techniques for building lightning-fast applications.',
        publishedAt: new Date('2024-01-05'),
      },
      {
        id: nanoid(),
        title: 'Remote Team Collaboration: Lessons Learned',
        slug: 'remote-team-collaboration-lessons',
        excerpt: 'Sharing insights from years of working with distributed development teams.',
        content: `# Remote Team Collaboration: Lessons Learned

After years of working with distributed teams across different time zones, here are key insights that made our collaboration successful.

## Communication Strategies

### Async Communication
Remote teams thrive with async communication:

**Best Practices:**
- Comprehensive documentation before meetings
- Clear action items and deadlines
- Decision records for major choices
- Regular written updates

**Tools That Work:**
- Slack for quick discussions
- Notion for documentation
- Linear for issue tracking
- Loom for video explanations

### Meeting Protocol
\`\`\`
Team Meeting Guidelines:

1. Always have an agenda
2. Record important meetings for absent team members
3. Use cameras when possible
4. 25-minute meetings by default
5. Follow up with written summary
\`\`\`

## Technical Practices

### Development Workflow

**Git Workflow:**
\`\`\`bash
# Feature branch naming
feature/user-authentication
bugfix/login-validation
hotfix/security-patch

# Pull request template
## Description
## Changes Made
## Testing Instructions
## Screenshots
\`\`\`

**Code Review Standards:**
- At least one reviewer for every PR
- Automated tests must pass
- Documentation updates required
- Security review for sensitive changes

### Documentation Culture
- README for every new feature
- API documentation always up to date
- Architecture decisions recorded
- Onboarding guide for new team members

## Building Team Culture

### Virtual Social Activities
\`\`\`
Weekly Activities:
- Monday: Virtual coffee sync
- Wednesday: Knowledge sharing session
- Friday: Team game or social call
- Monthly: Virtual happy hour

Recognition Programs:
- Team member spotlight
- Best contribution award
- Mentorship program
\`\`\`

## Tools and Infrastructure

### Essential Tools
- **Communication**: Slack, Zoom, Notion
- **Development**: GitHub, Linear, Vercel
- **Monitoring**: Sentry, Analytics
- **Planning**: Miro, Figma

### Infrastructure Setup
\`\`\`yaml
# docker-compose.yml for development
version: '3.8'
services:
  app:
    build: .
    volumes:
      - .:/app
    environment:
      - NODE_ENV=development
    ports:
      - "3000:3000"
\`\`\`

## Key Success Metrics

- Team productivity metrics
- Code quality indicators
- Team satisfaction scores
- Project delivery consistency
- Communication effectiveness

Remote work requires intentional effort in communication and culture building, but the flexibility and global talent access make it worthwhile.`,
        featuredImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e404f3?w=800&h=400&fit=crop',
        authorId: creatorId,
        tags: JSON.stringify(['Remote Work', 'Team Management', 'Productivity', 'Culture']),
        category: 'Management',
        readTime: 7,
        featured: false,
        published: true,
        metaTitle: 'Remote Team Collaboration: Lessons Learned from Distributed Teams',
        metaDescription: 'Insights and best practices for successful remote team collaboration and distributed development workflows.',
        publishedAt: new Date('2024-01-02'),
      },
    ]);

    // Create comprehensive site settings (12+ settings)
    console.log('Creating site settings...');
    await db.insert(siteSettings).values([
      // General settings
      { id: nanoid(), key: 'site_title', value: 'John Doe - Full Stack Developer', type: 'text', category: 'general', public: true, authorId: userId },
      { id: nanoid(), key: 'site_description', value: 'Personal portfolio showcasing my projects, experience, and thoughts on web development', type: 'text', category: 'general', public: true, authorId: userId },
      { id: nanoid(), key: 'site_keywords', value: 'full stack developer, react, node.js, typescript, portfolio', type: 'text', category: 'general', public: true, authorId: userId },
      { id: nanoid(), key: 'maintenance_mode', value: 'false', type: 'boolean', category: 'general', public: false, authorId: userId },

      // Contact settings
      { id: nanoid(), key: 'contact_email', value: 'john.doe@example.com', type: 'text', category: 'contact', public: true, authorId: userId },
      { id: nanoid(), key: 'contact_phone', value: '+1 (555) 123-4567', type: 'text', category: 'contact', public: true, authorId: userId },
      { id: nanoid(), key: 'contact_location', value: 'San Francisco, CA', type: 'text', category: 'contact', public: true, authorId: userId },

      // Social media settings
      { id: nanoid(), key: 'social_links', value: JSON.stringify({
        github: 'https://github.com/johndoe',
        linkedin: 'https://linkedin.com/in/johndoe',
        twitter: 'https://twitter.com/johndoe',
        devto: 'https://dev.to/johndoe'
      }), type: 'json', category: 'social', public: true, authorId: userId },

      // SEO settings
      { id: nanoid(), key: 'meta_description', value: 'Full Stack Developer specializing in React, Node.js, and TypeScript. Building scalable web applications and sharing knowledge through writing.', type: 'text', category: 'seo', public: true, authorId: userId },
      { id: nanoid(), key: 'og_image', value: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=630&fit=crop', type: 'text', category: 'seo', public: true, authorId: userId },
      { id: nanoid(), key: 'google_analytics_id', value: 'GA-XXXXXXXXX', type: 'text', category: 'seo', public: false, authorId: userId },

      // Performance settings
      { id: nanoid(), key: 'enable_comments', value: 'true', type: 'boolean', category: 'general', public: false, authorId: userId },
      { id: nanoid(), key: 'posts_per_page', value: '10', type: 'number', category: 'general', public: false, authorId: userId },
      { id: nanoid(), key: 'enable_analytics', value: 'true', type: 'boolean', category: 'general', public: false, authorId: userId },
    ]);

    // Create sample contact messages (5 messages)
    console.log('Creating sample contact messages...');
    await db.insert(contactMessages).values([
      {
        id: nanoid(),
        name: 'Sarah Johnson',
        email: 'sarah.j@techcorp.com',
        subject: 'Excited about your portfolio!',
        message: 'Hi John, I came across your portfolio and was really impressed with your work, especially the task management platform. I\'d love to discuss potential collaboration opportunities at TechCorp. Are you available for a quick chat next week?',
        phone: '+1 (555) 987-6543',
        company: 'TechCorp',
        website: 'https://techcorp.com',
        newsletter: true,
        source: 'Portfolio Contact Form',
        status: 'pending',
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      {
        id: nanoid(),
        name: 'Michael Chen',
        email: 'm.chen@startup.io',
        subject: 'React Native Developer Opportunity',
        message: 'Hello! I saw your e-commerce mobile app project and was blown away by the implementation. We\'re looking for a senior React Native developer for our fintech startup. Would you be interested in learning more about the role?',
        phone: '+1 (555) 456-7890',
        company: 'StartupIO',
        newsletter: false,
        source: 'LinkedIn',
        status: 'replied',
        ip: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
      {
        id: nanoid(),
        name: 'Emily Rodriguez',
        email: 'emily.r@design.co',
        subject: 'Design System Collaboration',
        message: 'Hi Jane! Your design system work is fantastic. I\'m leading a design team at a growing startup and we\'re looking to implement a comprehensive design system. Would you be interested in consulting or collaboration?',
        company: 'DesignCo',
        newsletter: true,
        source: 'Dribbble',
        status: 'pending',
        ip: '192.168.1.102',
      },
      {
        id: nanoid(),
        name: 'David Thompson',
        email: 'd.thompson@enterprise.com',
        subject: 'Speaking opportunity',
        message: 'Your blog posts on TypeScript patterns have been incredibly helpful for our team. We\'re hosting a tech talk series and would love to have you speak about advanced TypeScript practices. Would you be interested?',
        phone: '+1 (555) 234-5678',
        company: 'Enterprise Solutions',
        newsletter: true,
        source: 'Blog',
        status: 'confirmed',
        ip: '192.168.1.103',
      },
      {
        id: nanoid(),
        name: 'Lisa Park',
        email: 'lisa.park@freelance.io',
        subject: 'Project collaboration inquiry',
        message: 'I\'m a freelance UX designer and I love your approach to accessibility. I have a client looking for both design and development work and thought we might be able to collaborate on the project. Would you be open to discussing this?',
        company: 'Freelance',
        newsletter: false,
        source: 'Referral',
        status: 'pending',
        ip: '192.168.1.104',
      },
    ]);

    console.log('✅ Comprehensive database seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Users: 2`);
    console.log(`   - Personal Info: 2`);
    console.log(`   - Skills: ${allSkills.length}`);
    console.log(`   - Experience: 5`);
    console.log(`   - Education: 5`);
    console.log(`   - Projects: 5`);
    console.log(`   - Blog Posts: 5`);
    console.log(`   - Site Settings: 12`);
    console.log(`   - Contact Messages: 5`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Export the function
export { seedComprehensive };

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedComprehensive()
    .then(() => {
      console.log('🎉 Seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}