import {
  pgTable,
  varchar,
  uuid,
  pgEnum,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { authUsers } from "drizzle-orm/supabase";

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
