import { db } from "~~/server/db/client";
import { quizAttempts } from "~~/server/db/schema";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { userId, materialId, score, totalQuestions } = body;

  // Validate input
  if (
    !userId ||
    !materialId ||
    score === undefined ||
    totalQuestions === undefined
  ) {
    throw createError({
      statusCode: 400,
      message: "Input data tidak valid",
    });
  }

  // Calculate final score as a percentage (0-100)
  const finalScore = (score / totalQuestions) * 100;

  // Insert quiz attempt into the database
  const insertedAttempt = await db.insert(quizAttempts).values({
    userId,
    materialId,
    score: finalScore,
    totalQuestions,
  });

  setResponseStatus(event, 201);
  return {
    statusCode: 201,
    message: "Nilai quiz berhasil disimpan",
    data: insertedAttempt,
  };
});
