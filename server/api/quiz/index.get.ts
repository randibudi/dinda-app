import { db } from "~~/server/db/client";

export default defineEventHandler(async (event) => {
  // Fetch all quizzes ordered by oldest first
  const quizzesData = await db.query.quizzes.findMany({
    orderBy: (quiz, { asc }) => [asc(quiz.createdAt)],
  });

  setResponseStatus(event, 200);
  return {
    statusCode: 200,
    message: "Data quiz berhasil diambil",
    data: quizzesData,
  };
});
