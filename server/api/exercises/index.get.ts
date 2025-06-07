import { db } from "~~/server/db/client";

export default defineEventHandler(async (event) => {
  const exercisesList = await db.query.exercises.findMany({
    orderBy: (exercise, { asc }) => [asc(exercise.createdAt)],
    with: {
      author: true,
      questions: true,
    },
  });

  setResponseStatus(event, 200);
  return {
    statusCode: 200,
    message: "Daftar latihan berhasil diambil",
    data: exercisesList,
  };
});
