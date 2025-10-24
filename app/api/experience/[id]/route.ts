import { NextRequest } from 'next/server';
import { db } from '@/db';
import { experience } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { withErrorHandler, requireAuth, validateMethod, parseRequestBody, createApiResponse, experienceSchemas } from '@/lib/api-utils';

export const GET = withErrorHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const result = await db
    .select()
    .from(experience)
    .where(eq(experience.id, id));

  if (result.length === 0) {
    return createApiResponse(null, 'Experience entry not found', 404);
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

  // Check if experience exists and user has permission
  const existingExperience = await db
    .select()
    .from(experience)
    .where(eq(experience.id, id));

  if (existingExperience.length === 0) {
    return createApiResponse(null, 'Experience entry not found', 404);
  }

  if (existingExperience[0].authorId !== session.user.id) {
    return createApiResponse(null, 'Forbidden', 403);
  }

  // Parse and validate request body
  const { data: updateData, error: validationError } = await parseRequestBody(req, experienceSchemas.update);
  if (validationError) {
    return createApiResponse(null, validationError, 400);
  }

  // Update experience
  const updateFields = {
    ...updateData,
    updatedAt: new Date(),
    startDate: updateData.startDate ? new Date(updateData.startDate) : existingExperience[0].startDate,
    endDate: updateData.endDate ? new Date(updateData.endDate) : existingExperience[0].endDate,
  };

  const result = await db
    .update(experience)
    .set(updateFields)
    .where(eq(experience.id, id))
    .returning();

  return createApiResponse(result[0]);
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

  // Check if experience exists and user has permission
  const existingExperience = await db
    .select()
    .from(experience)
    .where(eq(experience.id, id));

  if (existingExperience.length === 0) {
    return createApiResponse(null, 'Experience entry not found', 404);
  }

  if (existingExperience[0].authorId !== session.user.id) {
    return createApiResponse(null, 'Forbidden', 403);
  }

  // Delete experience
  await db.delete(experience).where(eq(experience.id, id));

  return createApiResponse({ success: true });
});