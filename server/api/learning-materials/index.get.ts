import { db } from "~~/server/db/client";

export default defineEventHandler(async (event) => {
  // Fetch all learning materials ordered by oldest first
  const learningMaterials = await db.query.learningMaterials.findMany({
    orderBy: (learningMaterials, { asc }) => [asc(learningMaterials.createdAt)],
  });

  setResponseStatus(event, 200);
  return {
    statusCode: 200,
    message: "Data materi pembelajaran berhasil diambil",
    data: learningMaterials,
  };
});
