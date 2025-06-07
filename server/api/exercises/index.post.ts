import { db } from "~~/server/db/client";
import { exercises, exerciseQuestions } from "~~/server/db/schema";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const { title, description, authorId, grade, questions } = body;

  // Validasi input
  if (!title || title.trim() === "") {
    throw createError({
      statusCode: 400,
      message: "Judul latihan harus diisi",
    });
  }

  if (!authorId) {
    throw createError({
      statusCode: 400,
      message: "Author ID harus diisi",
    });
  }

  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    throw createError({
      statusCode: 400,
      message: "Latihan harus memiliki minimal satu soal",
    });
  }

  // Validasi setiap soal
  for (const [index, question] of questions.entries()) {
    if (!question.question || question.question.trim() === "") {
      throw createError({
        statusCode: 400,
        message: `Soal nomor ${index + 1} harus diisi`,
      });
    }
    if (
      !question.correctAnswer ||
      (question.correctAnswer !== "benar" && question.correctAnswer !== "salah")
    ) {
      throw createError({
        statusCode: 400,
        message: `Jawaban benar untuk soal nomor ${index + 1} harus 'benar' atau 'salah'`,
      });
    }
  }

  // Mulai transaksi
  const newExercise = await db.transaction(async (tx) => {
    // Insert latihan
    const [exercise] = await tx
      .insert(exercises)
      .values({
        title,
        description,
        authorId,
        grade: grade || "IV",
      })
      .returning();

    // Insert soal-soal
    const newQuestions = await Promise.all(
      questions.map(async (q) => {
        const [question] = await tx
          .insert(exerciseQuestions)
          .values({
            exerciseId: exercise.id,
            question: q.question,
            correctAnswer: q.correctAnswer,
          })
          .returning();
        return question;
      }),
    );

    return { ...exercise, questions: newQuestions };
  });

  setResponseStatus(event, 201);
  return {
    statusCode: 201,
    message: "Latihan dan soal berhasil dibuat",
    data: newExercise,
  };
});
