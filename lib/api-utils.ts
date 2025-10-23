import { NextRequest, NextResponse } from 'next/server';
import { auth } from './auth';
import { z } from 'zod';

// API response helper
export function createApiResponse(data?: any, error?: string, status = 200) {
  return NextResponse.json(
    { data, error },
    { status }
  );
}

// Error handler wrapper
export function withErrorHandler(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      return await handler(req);
    } catch (error) {
      console.error('API Error:', error);
      return createApiResponse(null, error instanceof Error ? error.message : 'Internal server error', 500);
    }
  };
}

// Authentication middleware
export async function requireAuth(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session || !session.user) {
    return null;
  }

  return session;
}

// Method validation helper
export function validateMethod(req: NextRequest, allowedMethods: string[]) {
  if (!allowedMethods.includes(req.method || '')) {
    return createApiResponse(null, `Method ${req.method} not allowed`, 405);
  }
  return null;
}

// Request body parser
export async function parseRequestBody<T>(req: NextRequest, schema: z.ZodType<T>): Promise<{ data?: T; error?: string }> {
  try {
    const body = await req.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return { error: result.error.errors[0].message };
    }

    return { data: result.data };
  } catch (error) {
    return { error: 'Invalid JSON in request body' };
  }
}

// Common validation schemas
export const commonSchemas = {
  id: z.string().min(1, 'ID is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  email: z.string().email('Invalid email address'),
  url: z.string().url('Invalid URL format'),
  pagination: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    search: z.string().optional(),
    sort: z.enum(['asc', 'desc']).default('desc'),
  }),
};

// Project schemas
export const projectSchemas = {
  create: z.object({
    title: z.string().min(1, 'Title is required'),
    slug: commonSchemas.slug,
    description: z.string().min(1, 'Description is required'),
    longDescription: z.string().optional(),
    imageUrl: commonSchemas.url.optional().or(z.literal('')),
    images: z.array(z.string().url()).optional(),
    technologies: z.array(z.string()).optional(),
    projectUrl: commonSchemas.url.optional().or(z.literal('')),
    githubUrl: commonSchemas.url.optional().or(z.literal('')),
    featured: z.boolean().default(false),
    published: z.boolean().default(true),
    sortOrder: z.number().int().min(0).default(0),
    skillIds: z.array(commonSchemas.id).optional(),
  }),
  update: z.object({
    title: z.string().min(1).optional(),
    slug: commonSchemas.slug.optional(),
    description: z.string().min(1).optional(),
    longDescription: z.string().optional(),
    imageUrl: commonSchemas.url.optional().or(z.literal('')),
    images: z.array(z.string().url()).optional(),
    technologies: z.array(z.string()).optional(),
    projectUrl: commonSchemas.url.optional().or(z.literal('')),
    githubUrl: commonSchemas.url.optional().or(z.literal('')),
    featured: z.boolean().optional(),
    published: z.boolean().optional(),
    sortOrder: z.number().int().min(0).optional(),
    skillIds: z.array(commonSchemas.id).optional(),
  }),
};

// Blog post schemas
export const blogSchemas = {
  create: z.object({
    title: z.string().min(1, 'Title is required'),
    slug: commonSchemas.slug,
    excerpt: z.string().optional(),
    content: z.string().min(1, 'Content is required'),
    featuredImage: commonSchemas.url.optional().or(z.literal('')),
    tags: z.array(z.string()).optional(),
    category: z.string().optional(),
    readTime: z.number().int().min(1).optional(),
    featured: z.boolean().default(false),
    published: z.boolean().default(false),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    ogImage: commonSchemas.url.optional().or(z.literal('')),
  }),
  update: z.object({
    title: z.string().min(1).optional(),
    slug: commonSchemas.slug.optional(),
    excerpt: z.string().optional(),
    content: z.string().min(1).optional(),
    featuredImage: commonSchemas.url.optional().or(z.literal('')),
    tags: z.array(z.string()).optional(),
    category: z.string().optional(),
    readTime: z.number().int().min(1).optional(),
    featured: z.boolean().optional(),
    published: z.boolean().optional(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    ogImage: commonSchemas.url.optional().or(z.literal('')),
  }),
};

// Contact form schema
export const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: commonSchemas.email,
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  phone: z.string().optional(),
  company: z.string().optional(),
  website: z.string().optional(),
  newsletter: z.boolean().default(false),
  source: z.string().optional(),
});

// Experience schema
export const experienceSchemas = {
  create: z.object({
    company: z.string().min(1, 'Company is required'),
    position: z.string().min(1, 'Position is required'),
    location: z.string().optional(),
    description: z.string().min(1, 'Description is required'),
    responsibilities: z.array(z.string()).optional(),
    achievements: z.string().optional(),
    companyLogo: commonSchemas.url.optional().or(z.literal('')),
    currentJob: z.boolean().default(false),
    sortOrder: z.number().int().min(0).default(0),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
  update: z.object({
    company: z.string().min(1).optional(),
    position: z.string().min(1).optional(),
    location: z.string().optional(),
    description: z.string().min(1).optional(),
    responsibilities: z.array(z.string()).optional(),
    achievements: z.string().optional(),
    companyLogo: commonSchemas.url.optional().or(z.literal('')),
    currentJob: z.boolean().optional(),
    sortOrder: z.number().int().min(0).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
};

// Education schema
export const educationSchemas = {
  create: z.object({
    institution: z.string().min(1, 'Institution is required'),
    degree: z.string().min(1, 'Degree is required'),
    field: z.string().min(1, 'Field of study is required'),
    location: z.string().optional(),
    description: z.string().optional(),
    gpa: z.string().optional(),
    honors: z.string().optional(),
    institutionLogo: commonSchemas.url.optional().or(z.literal('')),
    currentStudent: z.boolean().default(false),
    sortOrder: z.number().int().min(0).default(0),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
  update: z.object({
    institution: z.string().min(1).optional(),
    degree: z.string().min(1).optional(),
    field: z.string().min(1).optional(),
    location: z.string().optional(),
    description: z.string().optional(),
    gpa: z.string().optional(),
    honors: z.string().optional(),
    institutionLogo: commonSchemas.url.optional().or(z.literal('')),
    currentStudent: z.boolean().optional(),
    sortOrder: z.number().int().min(0).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
};

// Skills schema
export const skillsSchemas = {
  create: z.object({
    name: z.string().min(1, 'Skill name is required'),
    category: z.string().min(1, 'Category is required'),
    proficiency: z.number().int().min(1).max(5),
    description: z.string().optional(),
    icon: commonSchemas.url.optional().or(z.literal('')),
    featured: z.boolean().default(false),
    sortOrder: z.number().int().min(0).default(0),
    tags: z.array(z.string()).optional(),
  }),
  update: z.object({
    name: z.string().min(1).optional(),
    category: z.string().min(1).optional(),
    proficiency: z.number().int().min(1).max(5).optional(),
    description: z.string().optional(),
    icon: commonSchemas.url.optional().or(z.literal('')),
    featured: z.boolean().optional(),
    sortOrder: z.number().int().min(0).optional(),
    tags: z.array(z.string()).optional(),
  }),
};

// Personal info schema
export const personalInfoSchemas = {
  update: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    title: z.string().optional(),
    bio: z.string().optional(),
    avatar: commonSchemas.url.optional().or(z.literal('')),
    location: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    website: commonSchemas.url.optional().or(z.literal('')),
    resumeUrl: commonSchemas.url.optional().or(z.literal('')),
    socialLinks: z.record(z.string().url().or(z.literal(''))).optional(),
    skills: z.string().optional(),
    languages: z.array(z.string()).optional(),
    interests: z.string().optional(),
    isPublic: z.boolean().optional(),
  }),
};

// Site settings schema
export const siteSettingsSchemas = {
  create: z.object({
    key: z.string().min(1, 'Key is required'),
    value: z.string().min(1, 'Value is required'),
    type: z.enum(['text', 'number', 'boolean', 'json']).default('text'),
    description: z.string().optional(),
    category: z.string().default('general'),
    public: z.boolean().default(false),
  }),
  update: z.object({
    value: z.string().min(1).optional(),
    type: z.enum(['text', 'number', 'boolean', 'json']).optional(),
    description: z.string().optional(),
    category: z.string().optional(),
    public: z.boolean().optional(),
  }),
};