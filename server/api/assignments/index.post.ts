import {
  serverSupabaseServiceRole,
  serverSupabaseUser,
} from "#supabase/server";
import { db } from "~~/server/db/client";
import { assignments, users } from "~~/server/db/schema";
import { eq } from "drizzle-orm";
import type { AssignmentType } from "~~/server/db/schema";

export default defineEventHandler(async (event) => {
  // Authentication and authorization checks
  const user = await serverSupabaseUser(event);
  if (!user?.id) {
    throw createError({
      statusCode: 401,
      message: "Authentication required",
    });
  }

  // Verify user exists in database
  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, user.id),
  });
  if (!dbUser) {
    throw createError({
      statusCode: 404,
      message: "User not found",
    });
  }

  // Parse multipart form data
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

  // Handle file upload for file type assignments
  let documentUrl: string | null = null;
  const supabase = serverSupabaseServiceRole(event);

  if (type === "file") {
    if (!documentFile) {
      throw createError({
        statusCode: 400,
        message: "Document file required for file type assignments",
      });
    }

    // Validate file properties
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

    // Upload to Supabase Storage
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

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("assignments")
      .getPublicUrl(fileName);

    documentUrl = urlData.publicUrl;
  }

  // Create database record
  const [newAssignment] = await db
    .insert(assignments)
    .values({
      title: fields.title,
      description: fields.description || null,
      type,
      question: fields.question,
      documentUrl,
      dueDate: new Date(fields.dueDate),
      grade: fields.grade,
      authorId: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  setResponseStatus(event, 201);
  return {
    statusCode: 201,
    message: "Assignment created successfully",
    data: newAssignment,
  };
});
