import { eq } from "drizzle-orm";
import { db } from "~~/server/db/client";
import { users, userRole } from "~~/server/db/schema";

export default defineEventHandler(async (event) => {
  // Fetch all students ordered by name
  const students = await db.query.users.findMany({
    where: eq(users.role, userRole.enumValues[1]), // enumValues[1] = 'student'
    orderBy: (users, { asc }) => [asc(users.fullname)],
  });

  setResponseStatus(event, 200);
  return {
    statusCode: 200,
    message: "Data siswa berhasil diambil",
    data: students,
  };
});
