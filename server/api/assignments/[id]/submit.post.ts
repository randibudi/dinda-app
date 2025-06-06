import {
  serverSupabaseServiceRole,
  serverSupabaseUser,
} from "#supabase/server";
import { db } from "~~/server/db/client";
import { assignments, assignmentSubmissions, users } from "~~/server/db/schema";
import { eq, and } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole(event);
  const user = await serverSupabaseUser(event);

  // Authentication check
  if (!user) {
    throw createError({
      statusCode: 401,
      message: "Authentication required",
    });
  }

  // Validate assignment ID
  const assignmentId = getRouterParam(event, "id");
  if (!assignmentId) {
    throw createError({
      statusCode: 400,
      message: "Invalid assignment ID",
    });
  }

  // Check user existence and role
  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, user.id),
  });

  if (!dbUser) {
    throw createError({
      statusCode: 404,
      message: "User not found",
    });
  }

  if (dbUser.role !== "student") {
    throw createError({
      statusCode: 403,
      message: "Only students can submit assignments",
    });
  }

  // Get assignment details
  const assignment = await db.query.assignments.findFirst({
    where: eq(assignments.id, assignmentId),
  });

  if (!assignment) {
    throw createError({
      statusCode: 404,
      message: "Assignment not found",
    });
  }

  // Check due date
  const currentDate = new Date();
  const dueDate = new Date(assignment.dueDate);

  if (currentDate > dueDate) {
    throw createError({
      statusCode: 400,
      message: "Submission deadline has passed",
    });
  }

  // Parse form data
  const formData = await readMultipartFormData(event);
  if (!formData) {
    throw createError({
      statusCode: 400,
      message: "Invalid form data",
    });
  }

  // Process form data
  let file: { filename: string; type: string; data: Buffer } | null = null;
  let submissionText: string | null = null;

  for (const part of formData) {
    if (part.name === "file" && part.filename) {
      file = {
        filename: part.filename,
        type: part.type || "application/octet-stream",
        data: part.data,
      };
    } else if (part.name === "submissionText") {
      submissionText = part.data.toString("utf8");
    }
  }

  // Validate submission based on type
  if (assignment.type === "file" && !file) {
    throw createError({
      statusCode: 400,
      message: "File required for file type assignment",
    });
  }

  if (
    assignment.type === "text" &&
    (!submissionText || !submissionText.trim())
  ) {
    throw createError({
      statusCode: 400,
      message: "Text submission cannot be empty",
    });
  }

  // Handle file upload
  let fileUrl: string | null = null;
  if (assignment.type === "file" && file) {
    // Validate file
    const allowedExtensions = ["pdf", "doc", "docx"];
    const fileExtension = file.filename.split(".").pop()?.toLowerCase();

    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      throw createError({
        statusCode: 400,
        message: "Only PDF, DOC, and DOCX files are allowed",
      });
    }

    // Check file size
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.data.length > maxSize) {
      throw createError({
        statusCode: 413,
        message: "File size exceeds 5MB limit",
      });
    }

    // Upload file
    const fileName = `submissions/${user.id}/${assignmentId}/${Date.now()}_${file.filename}`;
    const { error: uploadError } = await supabase.storage
      .from("submissions")
      .upload(fileName, file.data, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      throw createError({
        statusCode: 500,
        message: `File upload failed: ${uploadError.message}`,
      });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("submissions")
      .getPublicUrl(fileName);
    fileUrl = urlData.publicUrl;
  }

  // Check for existing submission
  const existingSubmission = await db.query.assignmentSubmissions.findFirst({
    where: and(
      eq(assignmentSubmissions.assignmentId, assignmentId),
      eq(assignmentSubmissions.userId, user.id),
    ),
  });

  // Determine status based on due date
  const status = currentDate > dueDate ? "late" : "submitted";

  let submission;

  if (existingSubmission) {
    // Update existing submission
    [submission] = await db
      .update(assignmentSubmissions)
      .set({
        fileUrl: assignment.type === "file" ? fileUrl : null,
        submissionText: assignment.type === "text" ? submissionText : null,
        updatedAt: new Date(),
        status: status,
      })
      .where(eq(assignmentSubmissions.id, existingSubmission.id))
      .returning();
  } else {
    // Create new submission
    [submission] = await db
      .insert(assignmentSubmissions)
      .values({
        assignmentId,
        userId: user.id,
        fileUrl: assignment.type === "file" ? fileUrl : null,
        submissionText: assignment.type === "text" ? submissionText : null,
        score: null,
        status: status,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
  }

  setResponseStatus(event, 200);
  return {
    statusCode: 200,
    message: existingSubmission
      ? "Submission updated successfully"
      : "Submission created successfully",
    data: {
      ...submission,
      createdAt: submission.createdAt!.toISOString(),
      updatedAt: submission.updatedAt!.toISOString(),
    },
  };
});
