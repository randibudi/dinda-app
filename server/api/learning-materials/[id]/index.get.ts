import { db } from "~~/server/db/client";
import { learningMaterials } from "~~/server/db/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  // Validate learning material ID
  if (!id) {
    throw createError({
      statusCode: 400,
      message: "ID materi pembelajaran tidak valid",
    });
  }

  // Query database for specific learning material
  const learningMaterial = await db.query.learningMaterials.findFirst({
    where: eq(learningMaterials.id, id),
  });

  if (!learningMaterial) {
    throw createError({
      statusCode: 404,
      message: "Materi pembelajaran tidak ditemukan",
    });
  }

  setResponseStatus(event, 200);
  return {
    statusCode: 200,
    message: "Data materi pembelajaran berhasil diambil",
    data: learningMaterial,
  };
});
