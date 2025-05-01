import { db } from "~~/server/db/client";
import { quizzes } from "~~/server/db/schema";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const {
    question,
    optionA,
    optionB,
    optionC,
    optionD,
    correctAnswer,
    materialId,
  } = body;

  // Validate required fields
  if (!question || question.trim() === "") {
    throw createError({
      statusCode: 400,
      message: "Pertanyaan harus diisi",
    });
  }

  if (!optionA || optionA.trim() === "") {
    throw createError({
      statusCode: 400,
      message: "Opsi A harus diisi",
    });
  }

  if (!optionB || optionB.trim() === "") {
    throw createError({
      statusCode: 400,
      message: "Opsi B harus diisi",
    });
  }

  if (!optionC || optionC.trim() === "") {
    throw createError({
      statusCode: 400,
      message: "Opsi C harus diisi",
    });
  }

  if (!optionD || optionD.trim() === "") {
    throw createError({
      statusCode: 400,
      message: "Opsi D harus diisi",
    });
  }

  if (!["a", "b", "c", "d"].includes(correctAnswer)) {
    throw createError({
      statusCode: 400,
      message: "Jawaban benar harus a, b, c, atau d",
    });
  }

  if (!materialId) {
    throw createError({
      statusCode: 400,
      message: "Material ID harus diisi",
    });
  }

  // Check if materialId exists in the database
  const material = await db.query.learningMaterials.findFirst({
    where: (lm, { eq }) => eq(lm.id, materialId),
  });

  if (!material) {
    throw createError({
      statusCode: 400,
      message: "Material ID tidak ditemukan",
    });
  }

  // Save quiz data to the database
  const newQuiz = await db
    .insert(quizzes)
    .values({
      question,
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer,
      materialId,
    })
    .returning();

  setResponseStatus(event, 201);
  return {
    statusCode: 201,
    message: "Quiz berhasil dibuat",
    data: newQuiz,
  };
});
