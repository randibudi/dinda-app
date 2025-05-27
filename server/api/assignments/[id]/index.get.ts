import { db } from "~~/server/db/client";
import { assignments } from "~~/server/db/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  // Validate assignment ID
  if (!id) {
    throw createError({
      statusCode: 400,
      message: "ID tugas tidak valid",
    });
  }

  // Fetch the assignment by ID
  const assignment = await db.query.assignments.findFirst({
    where: eq(assignments.id, id),
  });

  if (!assignment) {
    throw createError({
      statusCode: 404,
      message: "Tugas tidak ditemukan",
    });
  }

  setResponseStatus(event, 200);
  return {
    statusCode: 200,
    message: "Data tugas berhasil diambil",
    data: assignment,
  };
});
