import { NextRequest } from 'next/server';
import { db } from '@/db';
import { skills, users } from '@/db/schema';
import { eq, desc, asc, ilike, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { withErrorHandler, requireAuth, validateMethod, parseRequestBody, createApiResponse, skillsSchemas } from '@/lib/api-utils';

export const GET = withErrorHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);

  // Parse pagination parameters
  const paginationParams = {
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '50'), // Higher default limit for skills
    search: searchParams.get('search'),
    category: searchParams.get('category'),
    featured: searchParams.get('featured') === 'true',
    sort: searchParams.get('sort') || 'desc',
  };

  const { page, limit, search, category, featured, sort } = paginationParams;
  const offset = (page - 1) * limit;

  // Build query
  let query = db
    .select({
      id: skills.id,
      name: skills.name,
      category: skills.category,
      proficiency: skills.proficiency,
      description: skills.description,
      icon: skills.icon,
      featured: skills.featured,
      sortOrder: skills.sortOrder,
      tags: skills.tags,
      createdAt: skills.createdAt,
      updatedAt: skills.updatedAt,
      author: {
        id: users.id,
        name: users.name,
      },
    })
    .from(skills)
    .leftJoin(users, eq(skills.authorId, users.id));

  // Apply filters
  const conditions = [];

  if (search) {
    conditions.push(ilike(skills.name, `%${search}%`));
  }

  if (category) {
    conditions.push(eq(skills.category, category));
  }

  if (featured) {
    conditions.push(eq(skills.featured, true));
  }

  if (conditions.length > 0) {
    query = query.where(sql`${conditions.join(' AND ')}`);
  }

  // Apply sorting
  const orderClause = sort === 'asc' ? asc(skills.sortOrder) : desc(skills.sortOrder);
  query = query.orderBy(orderClause);

  // Apply pagination
  const results = await query.limit(limit).offset(offset);

  // Get total count
  const countQuery = db.select({ count: sql<number>`count(*)` }).from(skills);
  if (conditions.length > 0) {
    countQuery.where(sql`${conditions.join(' AND ')}`);
  }
  const totalCount = await countQuery;

  return createApiResponse({
    skills: results,
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
  const { data: skillData, error: validationError } = await parseRequestBody(req, skillsSchemas.create);
  if (validationError) {
    return createApiResponse(null, validationError, 400);
  }

  // Create skill
  const newSkill = {
    id: nanoid(),
    authorId: session.user.id,
    ...skillData,
  };

  try {
    const result = await db.insert(skills).values(newSkill).returning();
    return createApiResponse(result[0], undefined, 201);
  } catch (error) {
    if (error instanceof Error && error.message.includes('unique constraint')) {
      return createApiResponse(null, 'A skill with this name already exists', 409);
    }
    throw error;
  }
});