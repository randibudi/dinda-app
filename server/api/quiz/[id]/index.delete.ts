import { eq } from "drizzle-orm";
import { db } from "~~/server/db/client";
import { quizzes } from "~~/server/db/schema";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  // Validate quiz ID
  if (!id) {
    throw createError({
      statusCode: 400,
      message: "ID quiz tidak valid",
    });
  }

  // Check if quiz exists in the database
  const existingQuiz = await db.query.quizzes.findFirst({
    where: eq(quizzes.id, id),
  });

  if (!existingQuiz) {
    throw createError({
      statusCode: 404,
      message: "Quiz tidak ditemukan",
    });
  }

  // Delete from database
  await db.delete(quizzes).where(eq(quizzes.id, id));

  setResponseStatus(event, 200);
  return {
    statusCode: 200,
    message: "Quiz berhasil dihapus",
  };
});
