import { db } from "~~/server/db/client";
import { comments, discussions } from "~~/server/db/schema";
import { serverSupabaseUser } from "#supabase/server";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  const body = await readBody(event);

  // Validate user authentication: Must be logged in to create a comment
  if (!user?.id) {
    throw createError({ statusCode: 401, statusMessage: "Login diperlukan" });
  }

  // Validate required fields
  const { content, discussionId } = body;
  if (!content || content.trim() === "") {
    throw createError({
      statusCode: 400,
      statusMessage: "Konten komentar tidak boleh kosong",
    });
  }

  if (!discussionId) {
    throw createError({
      statusCode: 400,
      statusMessage: "discussionId harus disertakan",
    });
  }

  // Verify discussion exists in the database
  const discussion = await db.query.discussions.findFirst({
    where: eq(discussions.id, discussionId),
  });

  if (!discussion) {
    throw createError({
      statusCode: 404,
      statusMessage: "Diskusi tidak ditemukan",
    });
  }

  // Save new comment to the database
  const newComment = await db
    .insert(comments)
    .values({
      content: content.trim(),
      authorId: user.id,
      discussionId,
    })
    .returning();

  setResponseStatus(event, 201);
  return {
    statusCode: 201,
    message: "Komentar berhasil dibuat",
    data: newComment[0],
  };
});
