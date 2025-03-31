import { serverSupabaseServiceRole } from "#supabase/server";
import { eq } from "drizzle-orm";
import { db } from "~~/server/db/client";
import { users, userRole } from "~~/server/db/schema";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const supabase = serverSupabaseServiceRole(event);
  const body = await readBody(event);

  // Validate required fields
  const { fullname, username, password, grade } = body;
  if (!fullname || !username || !password || !grade) {
    throw createError({
      statusCode: 400,
      message: "Semua field harus diisi",
    });
  }

  // Check for existing username
  const existingUser = await db.query.users.findFirst({
    where: eq(users.username, username),
  });

  if (existingUser) {
    throw createError({
      statusCode: 409,
      message: "Username sudah terdaftar",
    });
  }

  // Create Supabase auth user
  const email = `${username}@${config.public.appDomain}`;
  const { data: authUser, error: authError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullname },
      app_metadata: { role: "student" },
    });

  if (authError) {
    throw createError({
      statusCode: 400,
      message: `Gagal membuat akun: ${authError.message}`,
    });
  }

  // Create database record
  const [newStudent] = await db
    .insert(users)
    .values({
      id: authUser.user.id,
      fullname,
      username,
      role: userRole.enumValues[1], // enumValues[1] = 'student'
      grade,
    })
    .returning();

  setResponseStatus(event, 201);
  return {
    statusCode: 201,
    message: "Akun siswa berhasil dibuat",
    data: newStudent,
  };
});
