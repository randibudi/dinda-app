import { serverSupabaseServiceRole } from "#supabase/server";
import { eq } from "drizzle-orm";
import { db } from "~~/server/db/client";
import { learningMaterials } from "~~/server/db/schema";

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole(event);
  const id = getRouterParam(event, "id");
  const formData = await readMultipartFormData(event);

  // Validate learning material ID
  if (!id) {
    throw createError({
      statusCode: 400,
      message: "ID materi tidak valid",
    });
  }

  // Check if learning material exists
  const existingLearningMaterial = await db.query.learningMaterials.findFirst({
    where: eq(learningMaterials.id, id),
  });

  if (!existingLearningMaterial) {
    throw createError({
      statusCode: 404,
      message: "Materi pembelajaran tidak ditemukan",
    });
  }

  // Extract form data
  let title: string | null = existingLearningMaterial.title;
  let content: string | null = existingLearningMaterial.content;
  let documentFile: { filename: string; type: string; data: Buffer } | null =
    null;
  let deleteExistingFile = false;

  // Process form data
  if (formData) {
    for (const part of formData) {
      if (part.name === "title") title = part.data.toString("utf8");
      if (part.name === "content") content = part.data.toString("utf8");
      if (part.name === "documentFile" && part.filename) {
        documentFile = {
          filename: part.filename,
          type: part.type || "application/octet-stream",
          data: part.data,
        };
        deleteExistingFile = true;
      }
    }
  }

  // Validate required fields
  if (!title || !content) {
    throw createError({
      statusCode: 400,
      message: "Judul dan konten materi harus diisi",
    });
  }

  let documentUrl = existingLearningMaterial.documentUrl;

  // Handle document update
  if (documentFile) {
    // Validate new file
    if (!documentFile.type.includes("pdf")) {
      throw createError({
        statusCode: 400,
        message: "Hanya file PDF yang diperbolehkan",
      });
    }

    if (documentFile.data.length > 2 * 1024 * 1024) {
      throw createError({
        statusCode: 413,
        message: "Ukuran file melebihi batas 2MB",
      });
    }

    // Delete existing file if exists
    if (existingLearningMaterial.documentUrl && deleteExistingFile) {
      const oldUrlParts = existingLearningMaterial.documentUrl.split("/");
      const oldFileName = oldUrlParts[oldUrlParts.length - 1];

      const { error: deleteError } = await supabase.storage
        .from("learning-materials")
        .remove([oldFileName]);

      if (deleteError) {
        console.error("Gagal menghapus dokumen lama:", deleteError.message);
      }
    }

    // Upload new file
    const fileName = `doc_${Date.now()}_${documentFile.filename}`;
    const { error: uploadError } = await supabase.storage
      .from("learning-materials")
      .upload(fileName, documentFile.data, {
        contentType: documentFile.type,
        upsert: false,
      });

    if (uploadError) {
      throw createError({
        statusCode: 400,
        message: `Gagal mengunggah dokumen: ${uploadError.message}`,
      });
    }

    // Get new document URL
    const { data: urlData } = supabase.storage
      .from("learning-materials")
      .getPublicUrl(fileName);

    documentUrl = urlData?.publicUrl;
  }

  // Update database record
  const [updatedMaterial] = await db
    .update(learningMaterials)
    .set({
      title,
      content,
      documentUrl,
      updatedAt: new Date(),
    })
    .where(eq(learningMaterials.id, id))
    .returning();

  setResponseStatus(event, 200);
  return {
    statusCode: 200,
    message: "Materi pembelajaran berhasil diperbarui",
    data: updatedMaterial,
  };
});
