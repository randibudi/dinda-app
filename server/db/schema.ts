import { pgTable, varchar, uuid, pgEnum } from "drizzle-orm/pg-core";
import { authUsers } from "drizzle-orm/supabase";

export const userRole = pgEnum("user_role", ["admin", "student"]);

export const users = pgTable("users", {
  id: uuid("id")
    .primaryKey()
    .references(() => authUsers.id, { onDelete: "cascade" }),
  fullname: varchar("fullname", { length: 255 }).notNull(),
  username: varchar("username", { length: 50 }).unique().notNull(),
  role: userRole("role").default("student"),
  grade: varchar("grade", { length: 10 }).default("IV"),
});
