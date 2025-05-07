import { db } from "~~/server/db/client";
import { quizzes } from "~~/server/db/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const materialId = getRouterParam(event, "id");

  // Validate material ID
  if (!materialId) {
    throw createError({
      statusCode: 400,
      message: "ID materi tidak valid",
    });
  }

  // Query database for quizzes related to the material
  const quizzesData = await db.query.quizzes.findMany({
    where: eq(quizzes.materialId, materialId),
    orderBy: (quiz, { asc }) => [asc(quiz.createdAt)],
  });

  setResponseStatus(event, 200);
  return {
    statusCode: 200,
    message: "Data quiz berhasil diambil",
    data: quizzesData,
  };
});
