import { db } from "~~/server/db/client";

export default defineEventHandler(async (event) => {
  const allDiscussions = await db.query.discussions.findMany({
    with: {
      author: true,
      comments: {
        with: {
          author: true,
        },
      },
    },
    orderBy: (discussions, { desc }) => [desc(discussions.createdAt)],
  });

  return {
    statusCode: 200,
    message: "Data diskusi berhasil diambil",
    data: allDiscussions,
  };
});
