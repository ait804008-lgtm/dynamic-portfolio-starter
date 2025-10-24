import { NextRequest } from 'next/server';
import { db } from '@/db';
import { skills } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { withErrorHandler, requireAuth, validateMethod, parseRequestBody, createApiResponse, skillsSchemas } from '@/lib/api-utils';

export const GET = withErrorHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const result = await db
    .select()
    .from(skills)
    .where(eq(skills.id, id));

  if (result.length === 0) {
    return createApiResponse(null, 'Skill not found', 404);
  }

  return createApiResponse(result[0]);
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

  // Check if skill exists and user has permission
  const existingSkill = await db
    .select()
    .from(skills)
    .where(eq(skills.id, id));

  if (existingSkill.length === 0) {
    return createApiResponse(null, 'Skill not found', 404);
  }

  if (existingSkill[0].authorId !== session.user.id) {
    return createApiResponse(null, 'Forbidden', 403);
  }

  // Parse and validate request body
  const { data: updateData, error: validationError } = await parseRequestBody(req, skillsSchemas.update);
  if (validationError) {
    return createApiResponse(null, validationError, 400);
  }

  // Update skill
  const updateFields = {
    ...updateData,
    updatedAt: new Date(),
  };

  try {
    const result = await db
      .update(skills)
      .set(updateFields)
      .where(eq(skills.id, id))
      .returning();

    return createApiResponse(result[0]);
  } catch (error) {
    if (error instanceof Error && error.message.includes('unique constraint')) {
      return createApiResponse(null, 'A skill with this name already exists', 409);
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

  // Check if skill exists and user has permission
  const existingSkill = await db
    .select()
    .from(skills)
    .where(eq(skills.id, id));

  if (existingSkill.length === 0) {
    return createApiResponse(null, 'Skill not found', 404);
  }

  if (existingSkill[0].authorId !== session.user.id) {
    return createApiResponse(null, 'Forbidden', 403);
  }

  // Delete skill
  await db.delete(skills).where(eq(skills.id, id));

  return createApiResponse({ success: true });
});