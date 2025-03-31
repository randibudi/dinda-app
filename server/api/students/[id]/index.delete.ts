import { serverSupabaseServiceRole } from "#supabase/server";
import { eq } from "drizzle-orm";
import { db } from "~~/server/db/client";
import { users } from "~~/server/db/schema";

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole(event);
  const id = getRouterParam(event, "id");

  // Validate student ID
  if (!id) {
    throw createError({
      statusCode: 400,
      message: "ID siswa tidak valid",
    });
  }

  // Check student existence
  const existingUser = await db.query.users.findFirst({
    where: eq(users.id, id),
  });

  if (!existingUser) {
    throw createError({
      statusCode: 404,
      message: "Siswa tidak ditemukan",
    });
  }

  // Delete from authentication service
  const { error: deleteError } = await supabase.auth.admin.deleteUser(id);
  if (deleteError) {
    throw createError({
      statusCode: deleteError.status || 400,
      message: `Gagal menghapus siswa: ${deleteError.message}`,
    });
  }

  setResponseStatus(event, 200);
  return {
    statusCode: 200,
    message: "Siswa berhasil dihapus",
  };
});
