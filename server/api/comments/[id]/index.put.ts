import { db } from "~~/server/db/client";
import { comments } from "~~/server/db/schema";
import { serverSupabaseUser } from "#supabase/server";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  const commentId = getRouterParam(event, "id") as string;
  const body = await readBody(event);

  // Validate user authentication: Must be authenticated to update a comment
  if (!user?.id) {
    throw createError({ statusCode: 401, statusMessage: "Login diperlukan" });
  }

  // Validate request body
  const { content } = body;
  if (!content || content.trim() === "") {
    throw createError({
      statusCode: 400,
      statusMessage: "Konten komentar tidak boleh kosong",
    });
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
      statusMessage: "Anda tidak memiliki akses untuk mengedit komentar ini",
    });
  }

  // Update the comment record in the database
  const updatedComment = await db
    .update(comments)
    .set({
      content: content.trim(),
      updatedAt: new Date(),
    })
    .where(eq(comments.id, commentId))
    .returning();

  setResponseStatus(event, 200);
  return {
    statusCode: 200,
    message: "Komentar berhasil diperbarui",
    data: updatedComment[0],
  };
});
