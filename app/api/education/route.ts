import { NextRequest } from 'next/server';
import { db } from '@/db';
import { education, users } from '@/db/schema';
import { eq, desc, asc, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { withErrorHandler, requireAuth, validateMethod, parseRequestBody, createApiResponse, educationSchemas } from '@/lib/api-utils';

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
      id: education.id,
      institution: education.institution,
      degree: education.degree,
      field: education.field,
      location: education.location,
      description: education.description,
      gpa: education.gpa,
      honors: education.honors,
      institutionLogo: education.institutionLogo,
      currentStudent: education.currentStudent,
      sortOrder: education.sortOrder,
      startDate: education.startDate,
      endDate: education.endDate,
      createdAt: education.createdAt,
      updatedAt: education.updatedAt,
      author: {
        id: users.id,
        name: users.name,
      },
    })
    .from(education)
    .leftJoin(users, eq(education.authorId, users.id))
    .orderBy(sort === 'asc' ? asc(education.sortOrder) : desc(education.sortOrder));

  // Apply pagination
  const results = await query.limit(limit).offset(offset);

  // Get total count
  const totalCount = await db.select({ count: sql<number>`count(*)` }).from(education);

  return createApiResponse({
    education: results,
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
  const { data: educationData, error: validationError } = await parseRequestBody(req, educationSchemas.create);
  if (validationError) {
    return createApiResponse(null, validationError, 400);
  }

  // Create education entry
  const newEducation = {
    id: nanoid(),
    authorId: session.user.id,
    startDate: educationData.startDate ? new Date(educationData.startDate) : new Date(),
    endDate: educationData.endDate ? new Date(educationData.endDate) : null,
    ...educationData,
  };

  const result = await db.insert(education).values(newEducation).returning();
  return createApiResponse(result[0], undefined, 201);
});