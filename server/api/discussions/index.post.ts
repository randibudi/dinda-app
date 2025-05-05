import { db } from "~~/server/db/client";
import { discussions, users } from "~~/server/db/schema";
import { serverSupabaseUser } from "#supabase/server";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  const body = await readBody(event);

  // Validate user authentication: Must be logged in to create a discussion
  if (!user?.id) {
    throw createError({
      statusCode: 401,
      message: "Anda harus login untuk membuat diskusi",
    });
  }

  // Validate required fields
  const { content } = body;
  if (!content || content.trim() === "") {
    throw createError({
      statusCode: 400,
      message: "Konten diskusi tidak boleh kosong",
    });
  }

  // Verify user exists in database
  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, user.id),
  });

  if (!dbUser) {
    throw createError({
      statusCode: 404,
      message: "User tidak ditemukan",
    });
  }

  // Save new discussion to the database
  const [newDiscussion] = await db
    .insert(discussions)
    .values({
      content: content.trim(),
      authorId: user.id,
    })
    .returning();

  setResponseStatus(event, 201);
  return {
    statusCode: 201,
    message: "Diskusi berhasil dibuat",
    data: newDiscussion,
  };
});
