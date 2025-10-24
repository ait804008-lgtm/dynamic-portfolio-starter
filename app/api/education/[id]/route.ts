import { NextRequest } from 'next/server';
import { db } from '@/db';
import { education } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { withErrorHandler, requireAuth, validateMethod, parseRequestBody, createApiResponse, educationSchemas } from '@/lib/api-utils';

export const GET = withErrorHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const result = await db
    .select()
    .from(education)
    .where(eq(education.id, id));

  if (result.length === 0) {
    return createApiResponse(null, 'Education entry not found', 404);
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

  // Check if education exists and user has permission
  const existingEducation = await db
    .select()
    .from(education)
    .where(eq(education.id, id));

  if (existingEducation.length === 0) {
    return createApiResponse(null, 'Education entry not found', 404);
  }

  if (existingEducation[0].authorId !== session.user.id) {
    return createApiResponse(null, 'Forbidden', 403);
  }

  // Parse and validate request body
  const { data: updateData, error: validationError } = await parseRequestBody(req, educationSchemas.update);
  if (validationError) {
    return createApiResponse(null, validationError, 400);
  }

  // Update education
  const updateFields = {
    ...updateData,
    updatedAt: new Date(),
    startDate: updateData.startDate ? new Date(updateData.startDate) : existingEducation[0].startDate,
    endDate: updateData.endDate ? new Date(updateData.endDate) : existingEducation[0].endDate,
  };

  const result = await db
    .update(education)
    .set(updateFields)
    .where(eq(education.id, id))
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

  // Check if education exists and user has permission
  const existingEducation = await db
    .select()
    .from(education)
    .where(eq(education.id, id));

  if (existingEducation.length === 0) {
    return createApiResponse(null, 'Education entry not found', 404);
  }

  if (existingEducation[0].authorId !== session.user.id) {
    return createApiResponse(null, 'Forbidden', 403);
  }

  // Delete education
  await db.delete(education).where(eq(education.id, id));

  return createApiResponse({ success: true });
});