import { serverSupabaseServiceRole } from "#supabase/server";
import { eq } from "drizzle-orm";
import { db } from "~~/server/db/client";
import { learningMaterials } from "~~/server/db/schema";

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole(event);
  const id = getRouterParam(event, "id");

  // Validate learning material ID
  if (!id) {
    throw createError({
      statusCode: 400,
      message: "ID materi tidak valid",
    });
  }

  // Check if learning material exists
  const existingMaterial = await db.query.learningMaterials.findFirst({
    where: eq(learningMaterials.id, id),
  });

  if (!existingMaterial) {
    throw createError({
      statusCode: 404,
      message: "Materi pembelajaran tidak ditemukan",
    });
  }

  // Delete document from storage if exists
  if (existingMaterial.documentUrl) {
    const urlParts = existingMaterial.documentUrl.split("/");
    const fileName = urlParts[urlParts.length - 1];

    const { error: storageError } = await supabase.storage
      .from("learning-materials")
      .remove([fileName]);

    if (storageError) {
      console.error("Gagal menghapus dokumen:", storageError.message);
    }
  }

  // Delete from database
  await db.delete(learningMaterials).where(eq(learningMaterials.id, id));

  setResponseStatus(event, 200);
  return {
    statusCode: 200,
    message: "Materi pembelajaran berhasil dihapus",
  };
});
