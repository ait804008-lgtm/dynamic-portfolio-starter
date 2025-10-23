import { NextRequest } from 'next/server';
import { db } from '@/db';
import { personalInfo, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { withErrorHandler, requireAuth, validateMethod, parseRequestBody, createApiResponse, personalInfoSchemas } from '@/lib/api-utils';

export const GET = withErrorHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);

  // Check if user wants public information
  const publicOnly = searchParams.get('public') === 'true';

  // Build query
  let query = db
    .select({
      id: personalInfo.id,
      userId: personalInfo.userId,
      firstName: personalInfo.firstName,
      lastName: personalInfo.lastName,
      title: personalInfo.title,
      bio: personalInfo.bio,
      avatar: personalInfo.avatar,
      location: personalInfo.location,
      website: personalInfo.website,
      socialLinks: personalInfo.socialLinks,
      skills: personalInfo.skills,
      languages: personalInfo.languages,
      interests: personalInfo.interests,
      isPublic: personalInfo.isPublic,
      createdAt: personalInfo.createdAt,
      updatedAt: personalInfo.updatedAt,
      author: {
        id: users.id,
        name: users.name,
      },
    })
    .from(personalInfo)
    .leftJoin(users, eq(personalInfo.userId, users.id));

  // Filter based on public status and authentication
  const session = await requireAuth(req);

  if (publicOnly || !session) {
    query = query.where(eq(personalInfo.isPublic, true));
  } else if (session) {
    // Authenticated user can see their own info or public info
    query = query.where(sql`${personalInfo.isPublic} = true OR ${personalInfo.userId} = ${session.user.id}`);
  }

  const result = await query.limit(1); // There should only be one personal info record

  if (result.length === 0) {
    return createApiResponse(null, 'Personal information not found', 404);
  }

  // Remove sensitive fields for public requests
  if (publicOnly || !session) {
    const { id, userId, author, ...publicInfo } = result[0];
    return createApiResponse(publicInfo);
  }

  return createApiResponse(result[0]);
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

  // Check if personal info already exists for this user
  const existingInfo = await db
    .select()
    .from(personalInfo)
    .where(eq(personalInfo.userId, session.user.id));

  if (existingInfo.length > 0) {
    return createApiResponse(null, 'Personal information already exists. Use PUT to update.', 409);
  }

  // Parse and validate request body
  const { data: personalData, error: validationError } = await parseRequestBody(req, personalInfoSchemas.update);
  if (validationError) {
    return createApiResponse(null, validationError, 400);
  }

  // Create personal info
  const newPersonalInfo = {
    id: nanoid(),
    userId: session.user.id,
    ...personalData,
  };

  const result = await db.insert(personalInfo).values(newPersonalInfo).returning();
  return createApiResponse(result[0], undefined, 201);
});

export const PUT = withErrorHandler(async (req: NextRequest) => {
  // Validate method
  const methodValidation = validateMethod(req, ['PUT']);
  if (methodValidation) return methodValidation;

  // Require authentication
  const session = await requireAuth(req);
  if (!session) {
    return createApiResponse(null, 'Unauthorized', 401);
  }

  // Parse and validate request body
  const { data: updateData, error: validationError } = await parseRequestBody(req, personalInfoSchemas.update);
  if (validationError) {
    return createApiResponse(null, validationError, 400);
  }

  // Update personal info
  const updateFields = {
    ...updateData,
    updatedAt: new Date(),
  };

  const result = await db
    .update(personalInfo)
    .set(updateFields)
    .where(eq(personalInfo.userId, session.user.id))
    .returning();

  if (result.length === 0) {
    return createApiResponse(null, 'Personal information not found', 404);
  }

  return createApiResponse(result[0]);
});