// server/api/assignments/[id]/index.delete.ts
import { serverSupabaseServiceRole } from "#supabase/server";
import { eq } from "drizzle-orm";
import { db } from "~~/server/db/client";
import { assignments } from "~~/server/db/schema";

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole(event);
  const id = getRouterParam(event, "id");

  // Validate assignment ID
  if (!id) {
    throw createError({
      statusCode: 400,
      message: "ID tugas tidak valid",
    });
  }

  // Check if assignment exists
  const existingAssignment = await db.query.assignments.findFirst({
    where: eq(assignments.id, id),
  });

  if (!existingAssignment) {
    throw createError({
      statusCode: 404,
      message: "Tugas tidak ditemukan",
    });
  }

  // Delete document from storage if exists
  if (existingAssignment.documentUrl) {
    const urlParts = existingAssignment.documentUrl.split("/");
    const fileName = urlParts[urlParts.length - 1];

    const { error: storageError } = await supabase.storage
      .from("assignments")
      .remove([fileName]);

    if (storageError) {
      console.error("Gagal menghapus dokumen:", storageError.message);
    }
  }

  // Delete from database
  await db.delete(assignments).where(eq(assignments.id, id));

  setResponseStatus(event, 200);
  return {
    statusCode: 200,
    message: "Tugas berhasil dihapus",
  };
});
