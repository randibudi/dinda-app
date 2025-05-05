import { eq } from "drizzle-orm";
import { db } from "~~/server/db/client";
import { discussions } from "~~/server/db/schema";
import { serverSupabaseUser } from "#supabase/server";

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  const discussionId = getRouterParam(event, "id");

  // Validate user authentication: Must be authenticated to delete a discussion
  if (!user?.id) {
    throw createError({
      statusCode: 401,
      message: "Anda harus login untuk menghapus diskusi",
    });
  }

  // Extract discussion ID from URL parameters
  if (!discussionId) {
    throw createError({
      statusCode: 400,
      message: "Parameter ID diskusi tidak valid",
    });
  }

  // Find discussion by ID to verify existence
  const discussion = await db.query.discussions.findFirst({
    where: eq(discussions.id, discussionId as string),
  });

  if (!discussion) {
    throw createError({
      statusCode: 404,
      message: "Diskusi tidak ditemukan",
    });
  }

  // Verify user ownership to ensure authorization
  if (discussion.authorId !== user.id) {
    throw createError({
      statusCode: 403,
      message: "Anda tidak memiliki akses untuk menghapus diskusi ini",
    });
  }

  // Delete the discussion from the database
  await db
    .delete(discussions)
    .where(eq(discussions.id, discussionId as string));

  setResponseStatus(event, 200);
  return {
    statusCode: 200,
    message: "Diskusi berhasil dihapus",
  };
});
