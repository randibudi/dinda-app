import { db } from "~~/server/db/client";
import { exerciseAttempts } from "~~/server/db/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const userId = getRouterParam(event, "userId");

  if (!userId) {
    throw createError({
      statusCode: 400,
      message: "User ID tidak valid",
    });
  }

  const attempts = await db.query.exerciseAttempts.findMany({
    where: eq(exerciseAttempts.userId, userId),
    with: {
      exercise: true,
    },
  });

  setResponseStatus(event, 200);
  return {
    statusCode: 200,
    message: "Daftar hasil latihan berhasil diambil",
    data: attempts,
  };
});
