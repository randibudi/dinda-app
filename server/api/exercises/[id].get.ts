import { db } from "~~/server/db/client";
import { exercises } from "~~/server/db/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      message: "ID latihan tidak valid",
    });
  }

  const exercise = await db.query.exercises.findFirst({
    where: eq(exercises.id, id),
    with: {
      questions: true,
    },
  });

  if (!exercise) {
    throw createError({
      statusCode: 404,
      message: "Latihan tidak ditemukan",
    });
  }

  setResponseStatus(event, 200);
  return {
    statusCode: 200,
    message: "Detail latihan berhasil diambil",
    data: exercise,
  };
});
