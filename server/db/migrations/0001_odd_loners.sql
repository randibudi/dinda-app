CREATE TYPE "public"."answer_option" AS ENUM('a', 'b', 'c', 'd');--> statement-breakpoint
CREATE TABLE "learning_materials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"document_url" varchar(1024),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quizzes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question" text NOT NULL,
	"option_a" varchar(255) NOT NULL,
	"option_b" varchar(255) NOT NULL,
	"option_c" varchar(255) NOT NULL,
	"option_d" varchar(255) NOT NULL,
	"correct_answer" "answer_option" NOT NULL,
	"material_id" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_material_id_learning_materials_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."learning_materials"("id") ON DELETE cascade ON UPDATE no action;