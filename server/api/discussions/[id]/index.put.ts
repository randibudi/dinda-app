import { eq } from "drizzle-orm";
import { db } from "~~/server/db/client";
import { discussions } from "~~/server/db/schema";
import { serverSupabaseUser } from "#supabase/server";

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  const discussionId = getRouterParam(event, "id");
  const body = await readBody(event);

  // Validate user authentication: Must be authenticated to update a discussion
  if (!user?.id) {
    throw createError({
      statusCode: 401,
      message: "Anda harus login untuk mengupdate diskusi",
    });
  }

  // Validate request body: Content must be provided
  if (!body.content || body.content.trim() === "") {
    throw createError({
      statusCode: 400,
      message: "Konten diskusi tidak boleh kosong",
    });
  }

  // Verify discussion exists in the database
  const existingDiscussion = await db.query.discussions.findFirst({
    where: eq(discussions.id, discussionId as string),
  });

  if (!existingDiscussion) {
    throw createError({
      statusCode: 404,
      message: "Diskusi tidak ditemukan",
    });
  }

  // Verify user ownership to ensure authorization
  if (existingDiscussion.authorId !== user.id) {
    throw createError({
      statusCode: 403,
      message: "Anda tidak memiliki akses untuk mengupdate diskusi ini",
    });
  }

  // Update the discussion record in the database
  const [updatedDiscussion] = await db
    .update(discussions)
    .set({
      content: body.content.trim(),
      updatedAt: new Date(),
    })
    .where(eq(discussions.id, discussionId as string))
    .returning();

  setResponseStatus(event, 200);
  return {
    statusCode: 200,
    message: "Diskusi berhasil diperbarui",
    data: updatedDiscussion,
  };
});
