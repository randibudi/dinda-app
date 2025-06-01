import {
  serverSupabaseServiceRole,
  serverSupabaseUser,
} from "#supabase/server";
import { db } from "~~/server/db/client";
import { assignments } from "~~/server/db/schema";
import { eq } from "drizzle-orm";
import type { AssignmentType } from "~~/server/db/schema";

export default defineEventHandler(async (event) => {
  // Authentication
  const user = await serverSupabaseUser(event);
  if (!user?.id) {
    throw createError({
      statusCode: 401,
      message: "Authentication required",
    });
  }

  // Get assignment ID
  const assignmentId = getRouterParam(event, "id");
  if (!assignmentId) {
    throw createError({
      statusCode: 400,
      message: "Assignment ID is required",
    });
  }

  // Check existing assignment
  const existingAssignment = await db.query.assignments.findFirst({
    where: eq(assignments.id, assignmentId),
  });
  if (!existingAssignment) {
    throw createError({
      statusCode: 404,
      message: "Assignment not found",
    });
  }

  // Authorization check
  if (existingAssignment.authorId !== user.id) {
    throw createError({
      statusCode: 403,
      message: "Unauthorized to update this assignment",
    });
  }

  // Parse form data
  const formData = await readMultipartFormData(event);
  if (!formData) {
    throw createError({
      statusCode: 400,
      message: "Invalid form data format",
    });
  }

  // Extract form fields
  const fields: Record<string, string> = {};
  let documentFile: { filename: string; type: string; data: Buffer } | null =
    null;

  for (const part of formData) {
    if (!part.name) continue;

    if (part.name === "documentFile" && part.filename) {
      documentFile = {
        filename: part.filename,
        type: part.type || "application/octet-stream",
        data: part.data,
      };
    } else {
      fields[part.name] = part.data.toString("utf8").trim();
    }
  }

  // Validate required fields
  const requiredFields = ["title", "type", "question", "dueDate", "grade"];
  const missingFields = requiredFields.filter((field) => !fields[field]);
  if (missingFields.length > 0) {
    throw createError({
      statusCode: 400,
      message: `Missing required fields: ${missingFields.join(", ")}`,
    });
  }

  // Validate assignment type
  const type = fields.type as AssignmentType;
  if (!["file", "text"].includes(type)) {
    throw createError({
      statusCode: 400,
      message: "Invalid assignment type",
    });
  }

  // Validate due date
  const dueDate = new Date(fields.dueDate);
  if (isNaN(dueDate.getTime())) {
    throw createError({
      statusCode: 400,
      message: "Invalid due date format",
    });
  }

  const supabase = serverSupabaseServiceRole(event);
  let documentUrl: string | null = existingAssignment.documentUrl;

  // Handle file operations
  if (type === "file") {
    // Validate when changing from text to file
    if (existingAssignment.type === "text" && !documentFile) {
      throw createError({
        statusCode: 400,
        message: "File required when changing type to file",
      });
    }

    if (documentFile) {
      // Validate file
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (documentFile.data.length > maxSize) {
        throw createError({
          statusCode: 413,
          message: "File size exceeds 2MB limit",
        });
      }

      if (!documentFile.type.includes("pdf")) {
        throw createError({
          statusCode: 400,
          message: "Only PDF files are allowed",
        });
      }

      // Upload new file
      const fileName = `assignments/${user.id}/${Date.now()}_${documentFile.filename}`;
      const { error: uploadError } = await supabase.storage
        .from("assignments")
        .upload(fileName, documentFile.data, {
          contentType: documentFile.type,
          upsert: false,
        });

      if (uploadError) {
        throw createError({
          statusCode: 500,
          message: `File upload failed: ${uploadError.message}`,
        });
      }

      // Get new URL
      const { data: urlData } = supabase.storage
        .from("assignments")
        .getPublicUrl(fileName);
      documentUrl = urlData.publicUrl;

      // Delete old file if exists
      if (existingAssignment.documentUrl) {
        const oldUrlParts = existingAssignment.documentUrl.split("/public/");
        if (oldUrlParts.length === 2) {
          const { error: deleteError } = await supabase.storage
            .from("assignments")
            .remove([oldUrlParts[1]]);

          if (deleteError) {
            console.error("Failed to delete old file:", deleteError);
          }
        }
      }
    }
  } else {
    // Handle type change to text
    documentUrl = null;
    if (existingAssignment.documentUrl) {
      const oldUrlParts = existingAssignment.documentUrl.split("/public/");
      if (oldUrlParts.length === 2) {
        const { error: deleteError } = await supabase.storage
          .from("assignments")
          .remove([oldUrlParts[1]]);

        if (deleteError) {
          console.error("Failed to delete old file:", deleteError);
        }
      }
    }
  }

  // Update database record
  const [updatedAssignment] = await db
    .update(assignments)
    .set({
      title: fields.title,
      description: fields.description || null,
      type,
      question: fields.question,
      documentUrl,
      dueDate,
      grade: fields.grade,
      updatedAt: new Date(),
    })
    .where(eq(assignments.id, assignmentId))
    .returning();

  setResponseStatus(event, 200);
  return {
    message: "Assignment updated successfully",
    data: updatedAssignment,
  };
});
