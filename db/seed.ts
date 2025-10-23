import { db } from './index';
import { users, projects, experience, education, skills, projectSkills, blogPosts, contactMessages, personalInfo, siteSettings } from './schema';
import { nanoid } from 'nanoid';

async function seed() {
  console.log('🌱 Starting database seeding...');

  try {
    // Create admin user
    console.log('Creating admin user...');
    const adminUser = await db.insert(users).values({
      id: nanoid(),
      email: 'admin@portfolio.com',
      name: 'Portfolio Admin',
      password: '$2a$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ', // hashed 'password'
      role: 'admin',
      bio: 'Full Stack Developer passionate about creating amazing web applications',
    }).returning();

    const userId = adminUser[0].id;

    // Create personal info
    console.log('Creating personal info...');
    await db.insert(personalInfo).values({
      id: nanoid(),
      userId,
      firstName: 'John',
      lastName: 'Doe',
      title: 'Full Stack Developer',
      bio: 'Passionate developer with expertise in modern web technologies',
      location: 'San Francisco, CA',
      email: 'john.doe@example.com',
      website: 'https://johndoe.dev',
      socialLinks: JSON.stringify({
        github: 'https://github.com/johndoe',
        linkedin: 'https://linkedin.com/in/johndoe',
        twitter: 'https://twitter.com/johndoe'
      }),
      languages: JSON.stringify(['English', 'Spanish']),
    });

    // Create skills
    console.log('Creating skills...');
    const frontendSkills = await db.insert(skills).values([
      { id: nanoid(), name: 'React', category: 'Frontend', proficiency: 5, authorId: userId },
      { id: nanoid(), name: 'TypeScript', category: 'Frontend', proficiency: 5, authorId: userId },
      { id: nanoid(), name: 'Next.js', category: 'Frontend', proficiency: 5, authorId: userId },
      { id: nanoid(), name: 'Tailwind CSS', category: 'Frontend', proficiency: 4, authorId: userId },
    ]).returning();

    const backendSkills = await db.insert(skills).values([
      { id: nanoid(), name: 'Node.js', category: 'Backend', proficiency: 5, authorId: userId },
      { id: nanoid(), name: 'PostgreSQL', category: 'Backend', proficiency: 4, authorId: userId },
      { id: nanoid(), name: 'Drizzle ORM', category: 'Backend', proficiency: 4, authorId: userId },
      { id: nanoid(), name: 'Express.js', category: 'Backend', proficiency: 4, authorId: userId },
    ]).returning();

    const toolSkills = await db.insert(skills).values([
      { id: nanoid(), name: 'Git', category: 'Tools', proficiency: 5, authorId: userId },
      { id: nanoid(), name: 'Docker', category: 'Tools', proficiency: 3, authorId: userId },
      { id: nanoid(), name: 'AWS', category: 'Tools', proficiency: 3, authorId: userId },
    ]).returning();

    // Create experience
    console.log('Creating experience entries...');
    await db.insert(experience).values([
      {
        id: nanoid(),
        company: 'Tech Company Inc.',
        position: 'Senior Full Stack Developer',
        location: 'San Francisco, CA',
        description: 'Led development of scalable web applications using React and Node.js',
        responsibilities: JSON.stringify([
          'Architected and implemented microservices-based applications',
          'Mentored junior developers and conducted code reviews',
          'Collaborated with product managers to define project requirements'
        ]),
        companyLogo: 'https://example.com/company-logo.png',
        currentJob: true,
        authorId: userId,
        startDate: new Date('2022-01-15'),
      },
      {
        id: nanoid(),
        company: 'Startup LLC',
        position: 'Full Stack Developer',
        location: 'Austin, TX',
        description: 'Developed and maintained full-stack applications',
        companyLogo: 'https://example.com/startup-logo.png',
        currentJob: false,
        authorId: userId,
        startDate: new Date('2020-06-01'),
        endDate: new Date('2021-12-31'),
      },
    ]);

    // Create education
    console.log('Creating education entries...');
    await db.insert(education).values([
      {
        id: nanoid(),
        institution: 'University of Technology',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        location: 'Boston, MA',
        description: 'Graduated with honors',
        gpa: '3.8',
        currentStudent: false,
        authorId: userId,
        startDate: new Date('2016-09-01'),
        endDate: new Date('2020-05-31'),
      },
    ]);

    // Create projects
    console.log('Creating projects...');
    const portfolioProject = await db.insert(projects).values({
      id: nanoid(),
      title: 'Dynamic Portfolio Website',
      slug: 'dynamic-portfolio-website',
      description: 'A modern portfolio website built with Next.js and Drizzle ORM',
      longDescription: 'A full-featured portfolio website with admin dashboard, blog functionality, and contact form.',
      imageUrl: 'https://example.com/portfolio-thumb.png',
      technologies: JSON.stringify(['Next.js', 'TypeScript', 'Drizzle ORM', 'Tailwind CSS']),
      projectUrl: 'https://portfolio.example.com',
      githubUrl: 'https://github.com/johndoe/portfolio',
      featured: true,
      published: true,
      authorId: userId,
    }).returning();

    const todoProject = await db.insert(projects).values({
      id: nanoid(),
      title: 'Task Management App',
      slug: 'task-management-app',
      description: 'A collaborative task management application',
      technologies: JSON.stringify(['React', 'Node.js', 'PostgreSQL', 'Socket.io']),
      projectUrl: 'https://tasks.example.com',
      githubUrl: 'https://github.com/johndoe/task-app',
      featured: false,
      published: true,
      authorId: userId,
    }).returning();

    // Link skills to projects
    console.log('Linking skills to projects...');
    const allSkills = [...frontendSkills, ...backendSkills, ...toolSkills];

    for (const project of [portfolioProject[0], todoProject[0]]) {
      const skillsToAdd = allSkills.slice(0, Math.floor(Math.random() * 4) + 2); // 2-5 skills per project
      for (const skill of skillsToAdd) {
        await db.insert(projectSkills).values({
          id: nanoid(),
          projectId: project.id,
          skillId: skill.id,
        });
      }
    }

    // Create blog posts
    console.log('Creating blog posts...');
    await db.insert(blogPosts).values([
      {
        id: nanoid(),
        title: 'Getting Started with Drizzle ORM',
        slug: 'getting-started-with-drizzle-orm',
        excerpt: 'Learn how to set up and use Drizzle ORM in your Next.js applications.',
        content: `# Getting Started with Drizzle ORM

Drizzle ORM is a modern TypeScript ORM for Node.js that provides type-safe database access.

## Installation

\`\`\`bash
npm install drizzle-orm drizzle-kit
npm install pg # for PostgreSQL
\`\`\`

## Setup

1. Create your schema
2. Configure drizzle.config.ts
3. Generate migrations
4. Run migrations

This is a sample blog post for demonstration purposes.`,
        featuredImage: 'https://example.com/drizzle-thumb.png',
        authorId: userId,
        tags: JSON.stringify(['TypeScript', 'Database', 'ORM', 'Next.js']),
        category: 'Development',
        readTime: 5,
        featured: true,
        published: true,
        metaTitle: 'Getting Started with Drizzle ORM - Complete Guide',
        metaDescription: 'Learn how to set up and use Drizzle ORM in your Next.js applications with this comprehensive guide.',
      },
      {
        id: nanoid(),
        title: 'Building Responsive Layouts with Tailwind CSS',
        slug: 'responsive-layouts-tailwind-css',
        excerpt: 'Tips and tricks for creating beautiful responsive layouts.',
        content: `# Building Responsive Layouts with Tailwind CSS

Tailwind CSS makes it easy to create responsive designs without writing custom CSS.

## Responsive Breakpoints

- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px

## Grid System

Use the grid utilities to create responsive layouts...`,
        featuredImage: 'https://example.com/tailwind-thumb.png',
        authorId: userId,
        tags: JSON.stringify(['CSS', 'Tailwind', 'Responsive Design', 'Frontend']),
        category: 'Frontend',
        readTime: 3,
        featured: false,
        published: true,
      },
    ]);

    // Create site settings
    console.log('Creating site settings...');
    await db.insert(siteSettings).values([
      { id: nanoid(), key: 'site_title', value: 'John Doe - Full Stack Developer', type: 'text', category: 'general', public: true, authorId: userId },
      { id: nanoid(), key: 'site_description', value: 'Personal portfolio showcasing my projects and experience', type: 'text', category: 'general', public: true, authorId: userId },
      { id: nanoid(), key: 'contact_email', value: 'john.doe@example.com', type: 'text', category: 'contact', public: false, authorId: userId },
      { id: nanoid(), key: 'social_links', value: JSON.stringify({ github: 'https://github.com/johndoe', linkedin: 'https://linkedin.com/in/johndoe' }), type: 'json', category: 'social', public: true, authorId: userId },
      { id: nanoid(), key: 'maintenance_mode', value: 'false', type: 'boolean', category: 'general', public: false, authorId: userId },
    ]);

    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seed };