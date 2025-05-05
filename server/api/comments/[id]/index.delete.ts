import { db } from "~~/server/db/client";
import { comments } from "~~/server/db/schema";
import { serverSupabaseUser } from "#supabase/server";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  const commentId = getRouterParam(event, "id") as string;

  // Validate user authentication: Must be authenticated to delete a comment
  if (!user?.id) {
    throw createError({ statusCode: 401, statusMessage: "Login diperlukan" });
  }

  // Verify comment exists in the database
  const comment = await db.query.comments.findFirst({
    where: eq(comments.id, commentId),
  });

  if (!comment) {
    throw createError({
      statusCode: 404,
      statusMessage: "Komentar tidak ditemukan",
    });
  }

  // Verify user ownership to ensure authorization
  if (comment.authorId !== user.id) {
    throw createError({
      statusCode: 403,
      statusMessage: "Anda tidak memiliki akses untuk menghapus komentar ini",
    });
  }

  // Delete the comment from the database
  await db.delete(comments).where(eq(comments.id, commentId));

  setResponseStatus(event, 200);
  return {
    statusCode: 200,
    message: "Komentar berhasil dihapus",
  };
});
