import { NextRequest } from 'next/server';
import { db } from '@/db';
import { projects, users, projectSkills, skills } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { withErrorHandler, requireAuth, validateMethod, parseRequestBody, createApiResponse, projectSchemas } from '@/lib/api-utils';

export const GET = withErrorHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const result = await db
    .select({
      id: projects.id,
      title: projects.title,
      slug: projects.slug,
      description: projects.description,
      longDescription: projects.longDescription,
      imageUrl: projects.imageUrl,
      images: projects.images,
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
    .leftJoin(users, eq(projects.authorId, users.id))
    .where(eq(projects.id, id));

  if (result.length === 0) {
    return createApiResponse(null, 'Project not found', 404);
  }

  const project = result[0];

  // Check if user can access this project
  const session = await requireAuth(req);
  if (!project.published && (!session || project.authorId !== session.user.id)) {
    return createApiResponse(null, 'Project not found', 404);
  }

  // Get skills for this project
  const projectSkillsData = await db
    .select({
      skill: {
        id: skills.id,
        name: skills.name,
        category: skills.category,
        proficiency: skills.proficiency,
        description: skills.description,
      },
    })
    .from(projectSkills)
    .leftJoin(skills, eq(projectSkills.skillId, skills.id))
    .where(eq(projectSkills.projectId, id));

  const projectWithSkills = {
    ...project,
    skills: projectSkillsData.map(item => item.skill).filter(Boolean),
  };

  return createApiResponse(projectWithSkills);
});

export const PUT = withErrorHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  // Validate method
  const methodValidation = validateMethod(req, ['PUT']);
  if (methodValidation) return methodValidation;

  // Require authentication
  const session = await requireAuth(req);
  if (!session) {
    return createApiResponse(null, 'Unauthorized', 401);
  }

  const { id } = await params;

  // Check if project exists and user has permission
  const existingProject = await db
    .select()
    .from(projects)
    .where(eq(projects.id, id));

  if (existingProject.length === 0) {
    return createApiResponse(null, 'Project not found', 404);
  }

  if (existingProject[0].authorId !== session.user.id) {
    return createApiResponse(null, 'Forbidden', 403);
  }

  // Parse and validate request body
  const { data: updateData, error: validationError } = await parseRequestBody(req, projectSchemas.update);
  if (validationError) {
    return createApiResponse(null, validationError, 400);
  }

  // Update project
  const updateFields = {
    ...updateData,
    updatedAt: new Date(),
  };

  try {
    const result = await db
      .update(projects)
      .set(updateFields)
      .where(eq(projects.id, id))
      .returning();

    // Handle skills if provided
    if (updateData.skillIds !== undefined) {
      // Remove existing skill relations
      await db.delete(projectSkills).where(eq(projectSkills.projectId, id));

      // Add new skill relations if any
      if (updateData.skillIds.length > 0) {
        const skillRelations = updateData.skillIds.map((skillId: string) => ({
          id: nanoid(),
          projectId: id,
          skillId,
        }));

        await db.insert(projectSkills).values(skillRelations);
      }
    }

    return createApiResponse(result[0]);
  } catch (error) {
    if (error instanceof Error && error.message.includes('unique constraint')) {
      return createApiResponse(null, 'A project with this slug already exists', 409);
    }
    throw error;
  }
});

export const DELETE = withErrorHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  // Validate method
  const methodValidation = validateMethod(req, ['DELETE']);
  if (methodValidation) return methodValidation;

  // Require authentication
  const session = await requireAuth(req);
  if (!session) {
    return createApiResponse(null, 'Unauthorized', 401);
  }

  const { id } = await params;

  // Check if project exists and user has permission
  const existingProject = await db
    .select()
    .from(projects)
    .where(eq(projects.id, id));

  if (existingProject.length === 0) {
    return createApiResponse(null, 'Project not found', 404);
  }

  if (existingProject[0].authorId !== session.user.id) {
    return createApiResponse(null, 'Forbidden', 403);
  }

  // Delete project (cascade will handle project_skills)
  await db.delete(projects).where(eq(projects.id, id));

  return createApiResponse({ success: true });
});