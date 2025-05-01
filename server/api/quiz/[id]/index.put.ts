import { db } from "~~/server/db/client";
import { quizzes, learningMaterials } from "~~/server/db/schema";
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

  // Read request body
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

  // Validate Material ID exists
  const material = await db.query.learningMaterials.findFirst({
    where: eq(learningMaterials.id, materialId),
  });

  if (!material) {
    throw createError({
      statusCode: 400,
      message: "Material ID tidak ditemukan",
    });
  }

  // Perform the update
  const [updatedQuiz] = await db
    .update(quizzes)
    .set({
      question,
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer,
      materialId,
      updatedAt: new Date(),
    })
    .where(eq(quizzes.id, id))
    .returning();

  if (!updatedQuiz) {
    throw createError({
      statusCode: 500,
      message: "Gagal memperbarui quiz",
    });
  }

  setResponseStatus(event, 200);
  return {
    statusCode: 200,
    message: "Quiz berhasil diperbarui",
    data: updatedQuiz,
  };
});
