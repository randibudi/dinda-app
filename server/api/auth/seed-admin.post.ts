import { serverSupabaseServiceRole } from "#supabase/server";
import { eq } from "drizzle-orm";
import { db } from "~~/server/db/client";
import { users } from "~~/server/db/schema";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const client = serverSupabaseServiceRole(event);
  const adminEmail = `${config.adminUsername}@${config.appDomain}`;

  // Check for existing admin
  const existingAdmin = await db.query.users.findFirst({
    where: eq(users.username, config.adminUsername),
  });

  if (existingAdmin) {
    throw createError({
      statusCode: 409,
      message: "Admin account already exists",
    });
  }

  // Create auth user
  const { data: authUser, error: authError } =
    await client.auth.admin.createUser({
      email: adminEmail,
      password: config.adminPassword,
      email_confirm: true,
      user_metadata: { full_name: "Administrator" },
    });

  if (authError) {
    throw createError({
      statusCode: 400,
      message: `Admin creation failed: ${authError.message}`,
    });
  }

  // Create database record
  const [newAdmin] = await db
    .insert(users)
    .values({
      id: authUser.user.id,
      fullname: "Administrator",
      username: config.adminUsername,
      role: "admin",
    })
    .returning();

  setResponseStatus(event, 201);
  return {
    statusCode: 201,
    message: "Admin account successfully created",
    data: newAdmin,
  };
});
