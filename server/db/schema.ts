import {
  pgTable,
  varchar,
  uuid,
  pgEnum,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { authUsers } from "drizzle-orm/supabase";
import { relations } from "drizzle-orm";

export const userRole = pgEnum("user_role", ["admin", "student"]);
export const answerOption = pgEnum("answer_option", ["a", "b", "c", "d"]);

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
