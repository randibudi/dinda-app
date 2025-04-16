import { serverSupabaseServiceRole } from "#supabase/server";
import { db } from "~~/server/db/client";
import { learningMaterials } from "~~/server/db/schema";

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole(event);
  const formData = await readMultipartFormData(event);

  // Validate multipart form data
  if (!formData) {
    throw createError({
      statusCode: 400,
      message: "Format form data tidak valid",
    });
  }

  // Extract form data fields
  let title: string | null = null;
  let content: string | null = null;
  let documentFile: { filename: string; type: string; data: Buffer } | null =
    null;

  for (const part of formData) {
    if (part.name === "title") title = part.data.toString("utf8");
    if (part.name === "content") content = part.data.toString("utf8");
    if (part.name === "documentFile" && part.filename) {
      documentFile = {
        filename: part.filename,
        type: part.type || "application/octet-stream",
        data: part.data,
      };
    }
  }

  // Validate required fields
  if (!title || !content) {
    throw createError({
      statusCode: 400,
      message: "Judul dan konten materi harus diisi",
    });
  }

  let documentUrl = null;

  // Handle document file upload
  if (documentFile) {
    // Validate file type
    if (!documentFile.type.includes("pdf")) {
      throw createError({
        statusCode: 400,
        message: "Hanya file PDF yang diperbolehkan",
      });
    }

    // Validate file size
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (documentFile.data.length > maxSize) {
      throw createError({
        statusCode: 413,
        message: "Ukuran file melebihi batas 2MB",
      });
    }

    // Upload file to storage
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

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("learning-materials")
      .getPublicUrl(fileName);

    documentUrl = urlData?.publicUrl;
  }

  // Create database record
  const [newLearningMaterial] = await db
    .insert(learningMaterials)
    .values({
      title,
      content,
      documentUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  setResponseStatus(event, 201);
  return {
    statusCode: 201,
    message: "Materi pembelajaran berhasil dibuat",
    data: newLearningMaterial,
  };
});
