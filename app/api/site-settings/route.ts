import { NextRequest } from 'next/server';
import { db } from '@/db';
import { siteSettings, users } from '@/db/schema';
import { eq, desc, asc, ilike, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { withErrorHandler, requireAuth, validateMethod, parseRequestBody, createApiResponse, siteSettingsSchemas } from '@/lib/api-utils';

export const GET = withErrorHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);

  // Parse query parameters
  const category = searchParams.get('category');
  const publicOnly = searchParams.get('public') === 'true';
  const keys = searchParams.get('keys')?.split(',').filter(Boolean);

  // Build query
  let query = db
    .select({
      id: siteSettings.id,
      key: siteSettings.key,
      value: siteSettings.value,
      type: siteSettings.type,
      description: siteSettings.description,
      category: siteSettings.category,
      public: siteSettings.public,
      createdAt: siteSettings.createdAt,
      updatedAt: siteSettings.updatedAt,
      author: {
        id: users.id,
        name: users.name,
      },
    })
    .from(siteSettings)
    .leftJoin(users, eq(siteSettings.authorId, users.id))
    .orderBy(asc(siteSettings.category), asc(siteSettings.key));

  // Apply filters
  const conditions = [];

  if (publicOnly) {
    conditions.push(eq(siteSettings.public, true));
  }

  if (category) {
    conditions.push(eq(siteSettings.category, category));
  }

  if (keys && keys.length > 0) {
    conditions.push(sql`${siteSettings.key} IN ${sql.raw(`('${keys.join("','")}')`)}`);
  }

  if (conditions.length > 0) {
    query = query.where(sql`${conditions.join(' AND ')}`);
  }

  const result = await query;

  // Convert array to object format for easier consumption
  const settingsObject = result.reduce((acc, setting) => {
    acc[setting.key] = {
      id: setting.id,
      value: setting.value,
      type: setting.type,
      description: setting.description,
      category: setting.category,
      public: setting.public,
      updatedAt: setting.updatedAt,
    };
    return acc;
  }, {} as Record<string, any>);

  // Group by category
  const groupedByCategory = result.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = {};
    }
    acc[setting.category][setting.key] = {
      id: setting.id,
      value: setting.value,
      type: setting.type,
      description: setting.description,
      public: setting.public,
      updatedAt: setting.updatedAt,
    };
    return acc;
  }, {} as Record<string, any>);

  return createApiResponse({
    settings: settingsObject,
    groupedByCategory,
    list: result,
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
  const { data: settingData, error: validationError } = await parseRequestBody(req, siteSettingsSchemas.create);
  if (validationError) {
    return createApiResponse(null, validationError, 400);
  }

  // Create site setting
  const newSetting = {
    id: nanoid(),
    authorId: session.user.id,
    ...settingData,
  };

  try {
    const result = await db.insert(siteSettings).values(newSetting).returning();
    return createApiResponse(result[0], undefined, 201);
  } catch (error) {
    if (error instanceof Error && error.message.includes('unique constraint')) {
      return createApiResponse(null, 'A setting with this key already exists', 409);
    }
    throw error;
  }
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

  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key');

  if (!key) {
    return createApiResponse(null, 'Key parameter is required', 400);
  }

  // Check if setting exists and user has permission
  const existingSetting = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.key, key));

  if (existingSetting.length === 0) {
    return createApiResponse(null, 'Setting not found', 404);
  }

  if (existingSetting[0].authorId !== session.user.id) {
    return createApiResponse(null, 'Forbidden', 403);
  }

  // Parse and validate request body
  const { data: updateData, error: validationError } = await parseRequestBody(req, siteSettingsSchemas.update);
  if (validationError) {
    return createApiResponse(null, validationError, 400);
  }

  // Update setting
  const updateFields = {
    ...updateData,
    updatedAt: new Date(),
  };

  const result = await db
    .update(siteSettings)
    .set(updateFields)
    .where(eq(siteSettings.key, key))
    .returning();

  return createApiResponse(result[0]);
});

export const DELETE = withErrorHandler(async (req: NextRequest) => {
  // Validate method
  const methodValidation = validateMethod(req, ['DELETE']);
  if (methodValidation) return methodValidation;

  // Require authentication
  const session = await requireAuth(req);
  if (!session) {
    return createApiResponse(null, 'Unauthorized', 401);
  }

  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key');

  if (!key) {
    return createApiResponse(null, 'Key parameter is required', 400);
  }

  // Check if setting exists and user has permission
  const existingSetting = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.key, key));

  if (existingSetting.length === 0) {
    return createApiResponse(null, 'Setting not found', 404);
  }

  if (existingSetting[0].authorId !== session.user.id) {
    return createApiResponse(null, 'Forbidden', 403);
  }

  // Delete setting
  await db.delete(siteSettings).where(eq(siteSettings.key, key));

  return createApiResponse({ success: true });
});