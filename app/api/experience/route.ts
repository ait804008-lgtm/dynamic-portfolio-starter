import { NextRequest } from 'next/server';
import { db } from '@/db';
import { experience, users } from '@/db/schema';
import { eq, desc, asc, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { withErrorHandler, requireAuth, validateMethod, parseRequestBody, createApiResponse, experienceSchemas } from '@/lib/api-utils';

export const GET = withErrorHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);

  // Parse pagination parameters
  const paginationParams = {
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '10'),
    sort: searchParams.get('sort') || 'desc',
  };

  const { page, limit, sort } = paginationParams;
  const offset = (page - 1) * limit;

  // Build query
  const query = db
    .select({
      id: experience.id,
      company: experience.company,
      position: experience.position,
      location: experience.location,
      description: experience.description,
      responsibilities: experience.responsibilities,
      achievements: experience.achievements,
      companyLogo: experience.companyLogo,
      currentJob: experience.currentJob,
      sortOrder: experience.sortOrder,
      startDate: experience.startDate,
      endDate: experience.endDate,
      createdAt: experience.createdAt,
      updatedAt: experience.updatedAt,
      author: {
        id: users.id,
        name: users.name,
      },
    })
    .from(experience)
    .leftJoin(users, eq(experience.authorId, users.id))
    .orderBy(sort === 'asc' ? asc(experience.sortOrder) : desc(experience.sortOrder));

  // Apply pagination
  const results = await query.limit(limit).offset(offset);

  // Get total count
  const totalCount = await db.select({ count: sql<number>`count(*)` }).from(experience);

  return createApiResponse({
    experience: results,
    pagination: {
      page,
      limit,
      total: totalCount[0].count,
      totalPages: Math.ceil(totalCount[0].count / limit),
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
  const { data: experienceData, error: validationError } = await parseRequestBody(req, experienceSchemas.create);
  if (validationError) {
    return createApiResponse(null, validationError, 400);
  }

  // Create experience entry
  const newExperience = {
    id: nanoid(),
    authorId: session.user.id,
    startDate: experienceData.startDate ? new Date(experienceData.startDate) : new Date(),
    endDate: experienceData.endDate ? new Date(experienceData.endDate) : null,
    ...experienceData,
  };

  const result = await db.insert(experience).values(newExperience).returning();
  return createApiResponse(result[0], undefined, 201);
});