import { NextRequest } from 'next/server';
import { db } from '@/db';
import { blogPosts, users } from '@/db/schema';
import { eq, desc, asc, ilike, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { withErrorHandler, requireAuth, validateMethod, parseRequestBody, createApiResponse, commonSchemas, blogSchemas } from '@/lib/api-utils';

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

  // Additional filters
  const published = searchParams.get('published') === 'true';
  const featured = searchParams.get('featured') === 'true';
  const category = searchParams.get('category');

  // Build query
  let query = db
    .select({
      id: blogPosts.id,
      title: blogPosts.title,
      slug: blogPosts.slug,
      excerpt: blogPosts.excerpt,
      content: blogPosts.content,
      featuredImage: blogPosts.featuredImage,
      tags: blogPosts.tags,
      category: blogPosts.category,
      readTime: blogPosts.readTime,
      views: blogPosts.views,
      featured: blogPosts.featured,
      published: blogPosts.published,
      metaTitle: blogPosts.metaTitle,
      metaDescription: blogPosts.metaDescription,
      ogImage: blogPosts.ogImage,
      createdAt: blogPosts.createdAt,
      updatedAt: blogPosts.updatedAt,
      publishedAt: blogPosts.publishedAt,
      author: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
    })
    .from(blogPosts)
    .leftJoin(users, eq(blogPosts.authorId, users.id));

  // Apply filters
  // Only show published posts unless user is authenticated
  const session = await requireAuth(req);
  if (!session) {
    query = query.where(eq(blogPosts.published, true));
  } else if (published) {
    query = query.where(eq(blogPosts.published, published));
  }

  if (featured) {
    query = query.where(eq(blogPosts.featured, true));
  }

  if (category) {
    query = query.where(eq(blogPosts.category, category));
  }

  // Search filter
  if (search) {
    query = query.where(
      sql`(${ilike(blogPosts.title, `%${search}%`)} OR ${ilike(blogPosts.excerpt, `%${search}%`)} OR ${ilike(blogPosts.slug, `%${search}%`)})`
    );
  }

  // Apply sorting
  const orderClause = sort === 'asc' ? asc(blogPosts.createdAt) : desc(blogPosts.createdAt);
  query = query.orderBy(orderClause);

  // Get total count for pagination
  let countQuery = db
    .select({ count: sql<number>`count(*)` })
    .from(blogPosts);

  // Apply same filters as main query
  if (!session) {
    countQuery = countQuery.where(eq(blogPosts.published, true));
  } else if (published) {
    countQuery = countQuery.where(eq(blogPosts.published, published));
  }

  if (featured) {
    countQuery = countQuery.where(eq(blogPosts.featured, true));
  }

  if (category) {
    countQuery = countQuery.where(eq(blogPosts.category, category));
  }

  if (search) {
    countQuery = countQuery.where(
      sql`(${ilike(blogPosts.title, `%${search}%`)} OR ${ilike(blogPosts.excerpt, `%${search}%`)} OR ${ilike(blogPosts.slug, `%${search}%`)})`
    );
  }

  const totalCount = await countQuery;
  const totalPages = Math.ceil(totalCount[0].count / limit);

  // Apply pagination
  const results = await query.limit(limit).offset(offset);

  return createApiResponse({
    posts: results,
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
  const { data: postData, error: validationError } = await parseRequestBody(req, blogSchemas.create);
  if (validationError) {
    return createApiResponse(null, validationError, 400);
  }

  // Create blog post
  const newPost = {
    id: nanoid(),
    authorId: session.user.id,
    publishedAt: postData.published ? new Date() : null,
    ...postData,
  };

  try {
    const result = await db.insert(blogPosts).values(newPost).returning();
    return createApiResponse(result[0], undefined, 201);
  } catch (error) {
    if (error instanceof Error && error.message.includes('unique constraint')) {
      return createApiResponse(null, 'A blog post with this slug already exists', 409);
    }
    throw error;
  }
});