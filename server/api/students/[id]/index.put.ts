import { serverSupabaseServiceRole } from "#supabase/server";
import { and, eq, ne } from "drizzle-orm";
import { db } from "~~/server/db/client";
import { users } from "~~/server/db/schema";

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole(event);
  const id = getRouterParam(event, "id");
  const body = await readBody(event);

  // Validate student ID
  if (!id) {
    throw createError({
      statusCode: 400,
      message: "ID siswa tidak valid",
    });
  }

  // Validate required fields
  if (!body.fullname || !body.username || !body.grade) {
    throw createError({
      statusCode: 400,
      message: "Semua field harus diisi",
    });
  }

  // Check username uniqueness
  const existingUser = await db.query.users.findFirst({
    where: and(eq(users.username, body.username), ne(users.id, id)),
  });

  if (existingUser) {
    throw createError({
      statusCode: 409,
      message: "Username sudah digunakan oleh siswa lain",
    });
  }

  // Update password if provided
  if (body.password) {
    const { error } = await supabase.auth.admin.updateUserById(id, {
      password: body.password,
    });

    if (error) {
      throw createError({
        statusCode: 400,
        message: error.message,
      });
    }
  }

  // Update student record
  const [updatedStudent] = await db
    .update(users)
    .set({
      fullname: body.fullname,
      username: body.username,
      grade: body.grade,
    })
    .where(eq(users.id, id))
    .returning();

  setResponseStatus(event, 200);
  return {
    statusCode: 200,
    message: "Data siswa berhasil diperbarui",
    data: updatedStudent,
  };
});
