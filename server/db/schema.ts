import {
  pgTable,
  varchar,
  uuid,
  pgEnum,
  text,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";
import { authUsers } from "drizzle-orm/supabase";
import { relations } from "drizzle-orm";

export const userRole = pgEnum("user_role", ["admin", "student"]);
export const answerOption = pgEnum("answer_option", ["a", "b", "c", "d"]);
export const assignmentType = pgEnum("assignment_type", ["file", "text"]);
export const submissionStatus = pgEnum("submission_status", [
  "pending",
  "submitted",
  "late",
  "graded",
]);
export const exerciseAnswer = pgEnum("exercise_answer", ["benar", "salah"]);
export type AssignmentType = (typeof assignmentType.enumValues)[number];
export type ExerciseQuestion = typeof exerciseQuestions.$inferSelect;

export const users = pgTable("users", {
  id: uuid("id")
    .primaryKey()
    .references(() => authUsers.id, { onDelete: "cascade" }),
  fullname: varchar("fullname", { length: 255 }).notNull(),
  username: varchar("username", { length: 50 }).unique().notNull(),
  role: userRole("role").default("student"),
  grade: varchar("grade", { length: 10 }).default("IV"),
});

export const usersRelations = relations(users, ({ many }) => ({
  discussions: many(discussions),
  comments: many(comments),
  quizAttempts: many(quizAttempts),
  createdAssignments: many(assignments),
  assignmentSubmissions: many(assignmentSubmissions),
}));

export const learningMaterials = pgTable("learning_materials", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  documentUrl: varchar("document_url", { length: 1024 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const quizzes = pgTable("quizzes", {
  id: uuid("id").primaryKey().defaultRandom(),
  question: text("question").notNull(),
  optionA: varchar("option_a", { length: 255 }).notNull(),
  optionB: varchar("option_b", { length: 255 }).notNull(),
  optionC: varchar("option_c", { length: 255 }).notNull(),
  optionD: varchar("option_d", { length: 255 }).notNull(),
  correctAnswer: answerOption("correct_answer").notNull(),
  materialId: uuid("material_id").references(() => learningMaterials.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const quizAttempts = pgTable("quiz_attempts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  materialId: uuid("material_id")
    .notNull()
    .references(() => learningMaterials.id, { onDelete: "cascade" }),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const quizAttemptsRelations = relations(quizAttempts, ({ one }) => ({
  user: one(users, {
    fields: [quizAttempts.userId],
    references: [users.id],
  }),
  material: one(learningMaterials, {
    fields: [quizAttempts.materialId],
    references: [learningMaterials.id],
  }),
}));

export const discussions = pgTable("discussions", {
  id: uuid("id").primaryKey().defaultRandom(),
  content: text("content").notNull(),
  authorId: uuid("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const discussionsRelations = relations(discussions, ({ one, many }) => ({
  author: one(users, {
    fields: [discussions.authorId],
    references: [users.id],
  }),
  comments: many(comments),
}));

export const comments = pgTable("comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  content: text("content").notNull(),
  authorId: uuid("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  discussionId: uuid("discussion_id")
    .notNull()
    .references(() => discussions.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const commentsRelations = relations(comments, ({ one }) => ({
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
  discussion: one(discussions, {
    fields: [comments.discussionId],
    references: [discussions.id],
  }),
}));

export const assignments = pgTable("assignments", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: assignmentType("type").notNull(),
  question: text("question").notNull(),
  documentUrl: varchar("document_url", { length: 1024 }),
  dueDate: timestamp("due_date").notNull(),
  grade: varchar("grade", { length: 10 }).notNull().default("IV"),
  authorId: uuid("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const assignmentsRelations = relations(assignments, ({ one, many }) => ({
  author: one(users, {
    fields: [assignments.authorId],
    references: [users.id],
  }),
  submissions: many(assignmentSubmissions),
}));

export const assignmentSubmissions = pgTable("assignment_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  assignmentId: uuid("assignment_id")
    .notNull()
    .references(() => assignments.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  fileUrl: varchar("file_url", { length: 1024 }),
  submissionText: text("submission_text"),
  score: integer("score"),
  status: submissionStatus("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const assignmentSubmissionsRelations = relations(
  assignmentSubmissions,
  ({ one }) => ({
    assignment: one(assignments, {
      fields: [assignmentSubmissions.assignmentId],
      references: [assignments.id],
    }),
    user: one(users, {
      fields: [assignmentSubmissions.userId],
      references: [users.id],
    }),
  }),
);

export const exercises = pgTable("exercises", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  authorId: uuid("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  grade: varchar("grade", { length: 10 }).notNull().default("IV"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const exercisesRelations = relations(exercises, ({ one, many }) => ({
  author: one(users, {
    fields: [exercises.authorId],
    references: [users.id],
  }),
  questions: many(exerciseQuestions),
}));

export const exerciseQuestions = pgTable("exercise_questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  exerciseId: uuid("exercise_id")
    .notNull()
    .references(() => exercises.id, { onDelete: "cascade" }),
  question: text("question").notNull(),
  correctAnswer: exerciseAnswer("correct_answer").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const exerciseQuestionsRelations = relations(
  exerciseQuestions,
  ({ one }) => ({
    exercise: one(exercises, {
      fields: [exerciseQuestions.exerciseId],
      references: [exercises.id],
    }),
  }),
);
