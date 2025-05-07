import { db } from "~~/server/db/client";
import { quizAttempts } from "~~/server/db/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const userId = getRouterParam(event, "id");

  if (!userId) {
    throw createError({
      statusCode: 400,
      message: "User ID tidak valid",
    });
  }

  const attempts = await db.query.quizAttempts.findMany({
    where: eq(quizAttempts.userId, userId),
  });

  setResponseStatus(event, 200);
  return {
    statusCode: 200,
    data: attempts,
  };
});
