import { db } from "~~/server/db/client";
import { exerciseAttempts } from "~~/server/db/schema";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { userId, exerciseId, score, totalQuestions } = body;

  // Validasi input
  if (
    !userId ||
    !exerciseId ||
    score === undefined ||
    totalQuestions === undefined
  ) {
    throw createError({
      statusCode: 400,
      message: "Semua field harus diisi",
    });
  }

  const [attempt] = await db
    .insert(exerciseAttempts)
    .values({
      userId,
      exerciseId,
      score,
      totalQuestions,
    })
    .returning();

  setResponseStatus(event, 201);
  return {
    statusCode: 201,
    message: "Hasil latihan berhasil disimpan",
    data: attempt,
  };
});
