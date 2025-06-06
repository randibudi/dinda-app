import { db } from "~~/server/db/client";
import { assignments, assignmentSubmissions } from "~~/server/db/schema";
import { asc, desc } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  // Fetch assignments with ascending order by creation date
  const assignmentsList = await db.query.assignments.findMany({
    orderBy: [asc(assignments.createdAt)],
    with: {
      submissions: {
        orderBy: [desc(assignmentSubmissions.createdAt)],
        limit: 1,
      },
    },
  });

  setResponseStatus(event, 200);
  return {
    statusCode: 200,
    message: "Successfully retrieved assignments",
    data: assignmentsList,
  };
});
