import { db } from "~~/server/db/client";
import { assignments } from "~~/server/db/schema";
import { eq } from "drizzle-orm";
import { serverSupabaseUser } from "#supabase/server";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      message: "ID tugas tidak valid",
    });
  }

  const user = await serverSupabaseUser(event);
  const userId = user?.id;

  const assignment = await db.query.assignments.findFirst({
    where: eq(assignments.id, id),
    with: {
      author: true,
      submissions: {
        where: (submission, { eq }) =>
          userId ? eq(submission.userId, userId) : undefined,
        orderBy: (submission, { desc }) => [desc(submission.createdAt)],
        limit: 1,
      },
    },
  });

  if (!assignment) {
    throw createError({
      statusCode: 404,
      message: "Tugas tidak ditemukan",
    });
  }

  const submission =
    assignment.submissions.length > 0 ? assignment.submissions[0] : null;

  setResponseStatus(event, 200);
  return {
    statusCode: 200,
    message: "Data tugas berhasil diambil",
    data: {
      ...assignment,
      submission,
    },
  };
});
