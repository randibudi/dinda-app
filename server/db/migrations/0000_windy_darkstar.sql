CREATE TYPE "public"."user_role" AS ENUM('admin', 'student');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"fullname" varchar(255) NOT NULL,
	"username" varchar(50) NOT NULL,
	"role" "user_role" DEFAULT 'student',
	"grade" varchar(10) DEFAULT 'IV',
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;