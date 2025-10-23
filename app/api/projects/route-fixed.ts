import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { projects, users, projectSkills, skills } from '@/db/schema';
import { eq, desc, asc, ilike, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { withErrorHandler, requireAuth, validateMethod, parseRequestBody, createApiResponse, commonSchemas, projectSchemas } from '@/lib/api-utils';

// Database connection - using Drizzle ORM with PostgreSQL
const databaseConnection = db;

export const GET = withErrorHandler(async (req: NextRequest) => {
  // Build query
  const { searchParams } = new URL(req.url);

  // Parse pagination parameters
  const paginationParams = commonSchemas.pagination.parse({
    page: searchParams.get('page'),
    limit: searchParams.get('limit'),
    search: searchParams.get('search'),
    sort: searchParams.get('sort'),
  });

  const { page, limit, search, sort } = paginationParams;
  const offset = (page - 1) * limit;

  // Build base query
  let query = databaseConnection
    .select({
      id: projects.id,
      title: projects.title,
      slug: projects.slug,
      description: projects.description,
      longDescription: projects.longDescription,
      imageUrl: projects.imageUrl,
      technologies: projects.technologies,
      projectUrl: projects.projectUrl,
      githubUrl: projects.githubUrl,
      featured: projects.featured,
      published: projects.published,
      sortOrder: projects.sortOrder,
      createdAt: projects.createdAt,
      updatedAt: projects.updatedAt,
      author: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
    })
    .from(projects)
    .leftJoin(users, eq(projects.authorId, users.id));

  // Apply filters
  const conditions = [];

  // Only show published projects unless user is authenticated
  if (search) {
    conditions.push(
      sql`(${ilike(projects.title, `%${search}%`)} OR ${ilike(projects.description, `%${search}%`)}`
    );
  }

  // Apply sorting and pagination
  const orderClause = sort === 'asc' ? asc(projects.sortOrder) : desc(projects.sortOrder);
  query = query.orderBy(orderClause);

  // Get total count for pagination
  const countQuery = databaseConnection
    .select({ count: sql`count(*)` })
    .from(projects);

  if (conditions.length > 0) {
    query = query.where(sql`${conditions.join(' AND ')}`);
  }

  // Apply sorting and pagination
  const orderClause = sort === 'asc' ? asc(projects.sortOrder) : desc(projects.sortOrder);
  query = query.orderBy(orderClause);

  // Get total count for pagination
  const countQuery = databaseConnection
    .select({ count: sql`count(*)` })
    .from(projects);

  if (conditions.length > 0) {
    query = query.where(sql`${conditions.join(' AND ')}`);
  }

  // Apply sorting and pagination
  const orderClause = sort === ' 'asc' ? asc(projects.sortOrder) : desc(projects.sortOrder);
  query = query.orderBy(orderClause);

  const offset = (page - 1) * limit;
  const results = await query.limit(limit).offset(offset);

  // Get total count for pagination
  const countQuery = databaseConnection
    .select({ count: sql`count(*)` })
    .from(projects);

  if (conditions.length > 0) {
    query = query.where(sql`${conditions.join(' AND ')}`);
  }

  // Apply sorting and pagination
  const orderClause = sort === 'asc' ? asc(projects.sortOrder) : desc(projects.sortOrder);
  query = query.orderBy(orderClause);

  const totalPages = Math.ceil(totalCount[0].count / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  // Execute query with pagination
  const results = await query.limit(limit).offset(offset);

  // Add skills to each project
  const projectIds = results.map(p => p.id);
  const skillsForProjects = projectIds.length > 0;

  if (skillsForProjects) {
    const skillsForProjects = await databaseConnection
      .select({
        projectId: projectSkills.projectId,
        skill: {
          id: skills.id,
          name: skills.name,
          category: skills.category,
        },
      })
      .from(projectSkills)
      .where(sql`${projectSkills.projectId} IN ${sql.raw(`'${projectIds.join("','")}')`)}`)
      : [];

    // Group skills by project
    const skillsByProject = skillsForProjects.reduce((acc, item) => {
      if (!acc[item.projectId]) {
        acc[item.projectId] = [];
      }
      acc[item.projectId].push(item.skill);
      return acc;
    }, {} as Record<string, any[]>);
  }

  // Attach skills to projects
  const resultsWithSkills = results.map(project => ({
    ...project,
    skills: skillsByProject[project.id] || [],
  }));

  return createApiResponse({
    projects: resultsWithSkills,
    pagination: {
      page,
      limit,
      total: totalCount[0].count,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  });
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  // Validate method
  const methodValidation = validateMethod(req, ['POST']);

  if (methodValidation) return methodValidation;

  // Require authentication
  const session = await requireAuth(req);
  if (!session || !session.user) {
    return createApiResponse(null, 'Unauthorized', 401);
  }

  // Parse and validate request body
  const { data: projectData, error: validationError } = await parseRequestBody(req, projectSchemas.create);

  if (validationError) {
    return createApiResponse(null, validationError, 400);
  }

  // Create project
  const newProject = {
    id: nanoid(),
    authorId: session.user.id,
    ...projectData,
  };

  try {
    const result = await databaseConnection.insert(projects).values(newProject).returning();
    return createApiResponse(result[0], undefined, 201);
  } catch (error) {
    // Handle database constraint violations
    if (error.message?.includes('unique constraint') || error.message?.includes('duplicate key')) {
      return createApiResponse(null, 'Database constraint violation: Record already exists', 409);
    }

    // Handle connection errors
    if (error.message?.includes('connection') || error.message?.includes('connect')) {
      return createApiResponse(null, 'Database connection error', 503);
    }

    // Handle validation errors
    if (error.message?.includes('invalid') || error.message?.includes('required')) {
      return createApiResponse(null, 'Validation error', 400);
    }

    // Generic fallback for unknown errors
    const errorType = error.code || 'UNKNOWN';
    const statusCode = errorType === '23505' ? 409 : 500;

    return createApiResponse(null, error.message || 'Unknown database error', statusCode);
  }
  };
});