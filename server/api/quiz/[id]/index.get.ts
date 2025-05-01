import { db } from "~~/server/db/client";
import { quizzes } from "~~/server/db/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  // Validate quiz ID
  if (!id) {
    throw createError({
      statusCode: 400,
      message: "ID quiz tidak valid",
    });
  }

  // Query database for specific quiz
  const quiz = await db.query.quizzes.findFirst({
    where: eq(quizzes.id, id),
  });

  if (!quiz) {
    throw createError({
      statusCode: 404,
      message: "Quiz tidak ditemukan",
    });
  }

  setResponseStatus(event, 200);
  return {
    statusCode: 200,
    message: "Data quiz berhasil diambil",
    data: quiz,
  };
});
