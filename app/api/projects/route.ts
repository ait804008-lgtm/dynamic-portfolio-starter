import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { projects, users, projectSkills, skills } from '@/db/schema';
import { eq, desc, asc, ilike, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { withErrorHandler, requireAuth, validateMethod, parseRequestBody, createApiResponse, commonSchemas, projectSchemas } from '@/lib/api-utils';

export const GET = withErrorHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);

  // Parse pagination parameters
  const paginationParams = commonSchemas.pagination.parse({
    page: searchParams.get('page') || '1',
    limit: searchParams.get('limit') || '10',
    search: searchParams.get('search') || '',
    sort: searchParams.get('sort') || 'desc',
  });

  const { page, limit, search, sort } = paginationParams;
  const offset = (page - 1) * limit;

  // Build query
  let query = db
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
  // Only show published projects unless user is authenticated
  const session = await requireAuth(req);
  if (!session) {
    query = query.where(eq(projects.published, true));
  }

  // Search filter
  if (search) {
    query = query.where(
      sql`(${ilike(projects.title, `%${search}%`)} OR ${ilike(projects.description, `%${search}%`)})`
    );
  }

  // Apply sorting
  const orderClause = sort === 'asc' ? asc(projects.sortOrder) : desc(projects.sortOrder);
  query = query.orderBy(orderClause);

  // Get total count for pagination
  let countQuery = db
    .select({ count: sql<number>`count(*)` })
    .from(projects);

  // Apply same filters as main query
  if (!session) {
    countQuery = countQuery.where(eq(projects.published, true));
  }

  if (search) {
    countQuery = countQuery.where(
      sql`(${ilike(projects.title, `%${search}%`)} OR ${ilike(projects.description, `%${search}%`)})`
    );
  }

  const totalCount = await countQuery;
  const totalPages = Math.ceil(totalCount[0].count / limit);

  // Apply pagination
  const results = await query.limit(limit).offset(offset);

  // Add skills to each project
  const projectIds = results.map(p => p.id);
  const skillsForProjects = projectIds.length > 0
    ? await db
        .select({
          projectId: projectSkills.projectId,
          skill: {
            id: skills.id,
            name: skills.name,
            category: skills.category,
          },
        })
        .from(projectSkills)
        .leftJoin(skills, eq(projectSkills.skillId, skills.id))
        .where(sql`${projectSkills.projectId} IN ${sql.raw(`('${projectIds.join("','")}')`)}`)
    : [];

  // Group skills by project
  const skillsByProject = skillsForProjects.reduce((acc, item) => {
    if (!acc[item.projectId]) {
      acc[item.projectId] = [];
    }
    if (item.skill) {
      acc[item.projectId].push(item.skill);
    }
    return acc;
  }, {} as Record<string, any[]>);

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
  if (!session) {
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
    const result = await db.insert(projects).values(newProject).returning();

    // Handle skills if provided
    if (projectData.skillIds && projectData.skillIds.length > 0) {
      const skillRelations = projectData.skillIds.map((skillId: string) => ({
        id: nanoid(),
        projectId: newProject.id,
        skillId,
      }));

      await db.insert(projectSkills).values(skillRelations);
    }

    return createApiResponse(result[0], undefined, 201);
  } catch (error) {
    if (error instanceof Error && error.message.includes('unique constraint')) {
      return createApiResponse(null, 'A project with this slug already exists', 409);
    }
    throw error;
  }
});