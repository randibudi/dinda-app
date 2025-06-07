import { eq } from "drizzle-orm";
import { db } from "~~/server/db/client";
import { exercises, exerciseQuestions } from "~~/server/db/schema";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  // Validasi ID latihan
  if (!id) {
    throw createError({
      statusCode: 400,
      message: "ID latihan tidak valid",
    });
  }

  // Cek apakah latihan ada
  const existingExercise = await db.query.exercises.findFirst({
    where: eq(exercises.id, id),
    with: {
      questions: true,
    },
  });

  if (!existingExercise) {
    throw createError({
      statusCode: 404,
      message: "Latihan tidak ditemukan",
    });
  }

  await db
    .delete(exerciseQuestions)
    .where(eq(exerciseQuestions.exerciseId, id));

  // Hapus latihan dari database
  await db.delete(exercises).where(eq(exercises.id, id));

  setResponseStatus(event, 200);
  return {
    statusCode: 200,
    message: "Latihan berhasil dihapus",
  };
});
