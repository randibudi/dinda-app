import { db } from "~~/server/db/client";
import { exercises, exerciseQuestions } from "~~/server/db/schema";
import { eq } from "drizzle-orm";
import type { ExerciseQuestion } from "~~/server/db/schema";

interface UpdateExerciseBody {
  title: string;
  description?: string;
  grade: string;
  authorId: string;
  questions: ExerciseQuestion[];
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody<UpdateExerciseBody>(event);

  if (!id) {
    throw createError({
      statusCode: 400,
      message: "ID latihan tidak valid",
    });
  }

  await db.transaction(async (tx) => {
    // Update data exercise
    await tx
      .update(exercises)
      .set({
        title: body.title,
        description: body.description || null,
        grade: body.grade,
        updatedAt: new Date(),
      })
      .where(eq(exercises.id, id));

    // Hapus semua pertanyaan yang ada
    await tx
      .delete(exerciseQuestions)
      .where(eq(exerciseQuestions.exerciseId, id));

    // Tambahkan pertanyaan baru
    for (const question of body.questions) {
      await tx.insert(exerciseQuestions).values({
        id: question.id ? question.id : undefined,
        exerciseId: id,
        question: question.question,
        correctAnswer: question.correctAnswer,
      });
    }
  });

  setResponseStatus(event, 200);
  return {
    statusCode: 200,
    message: "Latihan berhasil diperbarui",
  };
});
