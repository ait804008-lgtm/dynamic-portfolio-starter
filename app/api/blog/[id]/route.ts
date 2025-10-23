import { NextRequest } from 'next/server';
import { db } from '@/db';
import { blogPosts, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { withErrorHandler, requireAuth, validateMethod, parseRequestBody, createApiResponse, blogSchemas } from '@/lib/api-utils';

export const GET = withErrorHandler(async (req: NextRequest, context: { params?: Promise<{ id: string }> | { id: string } }) => {
  const params = await (context?.params || {});
  const id = params.id;

  const result = await db
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
    .leftJoin(users, eq(blogPosts.authorId, users.id))
    .where(eq(blogPosts.id, id));

  if (result.length === 0) {
    return createApiResponse(null, 'Blog post not found', 404);
  }

  const post = result[0];

  // Check if user can access this post
  const session = await requireAuth(req);
  if (!post.published && (!session || post.authorId !== session.user.id)) {
    return createApiResponse(null, 'Blog post not found', 404);
  }

  // Increment view count for public posts
  if (post.published && !session) {
    await db
      .update(blogPosts)
      .set({ views: sql`${blogPosts.views} + 1` })
      .where(eq(blogPosts.id, id));
  }

  return createApiResponse(post);
});

export const PUT = withErrorHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
  // Validate method
  const methodValidation = validateMethod(req, ['PUT']);
  if (methodValidation) return methodValidation;

  // Require authentication
  const session = await requireAuth(req);
  if (!session) {
    return createApiResponse(null, 'Unauthorized', 401);
  }

  const { id } = params;

  // Check if post exists and user has permission
  const existingPost = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.id, id));

  if (existingPost.length === 0) {
    return createApiResponse(null, 'Blog post not found', 404);
  }

  if (existingPost[0].authorId !== session.user.id) {
    return createApiResponse(null, 'Forbidden', 403);
  }

  // Parse and validate request body
  const { data: updateData, error: validationError } = await parseRequestBody(req, blogSchemas.update);
  if (validationError) {
    return createApiResponse(null, validationError, 400);
  }

  // Update post
  const updateFields = {
    ...updateData,
    updatedAt: new Date(),
    // Set publishedAt if post is being published for the first time
    ...(updateData.published && !existingPost[0].published && { publishedAt: new Date() }),
  };

  try {
    const result = await db
      .update(blogPosts)
      .set(updateFields)
      .where(eq(blogPosts.id, id))
      .returning();

    return createApiResponse(result[0]);
  } catch (error) {
    if (error instanceof Error && error.message.includes('unique constraint')) {
      return createApiResponse(null, 'A blog post with this slug already exists', 409);
    }
    throw error;
  }
});

export const DELETE = withErrorHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
  // Validate method
  const methodValidation = validateMethod(req, ['DELETE']);
  if (methodValidation) return methodValidation;

  // Require authentication
  const session = await requireAuth(req);
  if (!session) {
    return createApiResponse(null, 'Unauthorized', 401);
  }

  const { id } = params;

  // Check if post exists and user has permission
  const existingPost = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.id, id));

  if (existingPost.length === 0) {
    return createApiResponse(null, 'Blog post not found', 404);
  }

  if (existingPost[0].authorId !== session.user.id) {
    return createApiResponse(null, 'Forbidden', 403);
  }

  // Delete post
  await db.delete(blogPosts).where(eq(blogPosts.id, id));

  return createApiResponse({ success: true });
});