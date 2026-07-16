CREATE TYPE "public"."activity_category" AS ENUM('CAMPING', 'TRAINING', 'COMMUNITY_SERVICE', 'SEMINAR', 'COMPETITION', 'CEREMONY', 'MEETING', 'OTHER');--> statement-breakpoint
ALTER TABLE "activities" RENAME COLUMN "activity_date" TO "start_date";--> statement-breakpoint
ALTER TABLE "activities" ALTER COLUMN "description" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "activities" ALTER COLUMN "location" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "activities" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "activities" ADD COLUMN "end_date" timestamp;--> statement-breakpoint
ALTER TABLE "activities" ADD COLUMN "registration_deadline" timestamp;--> statement-breakpoint
ALTER TABLE "activities" ADD COLUMN "category" "activity_category" NOT NULL;--> statement-breakpoint
ALTER TABLE "activities" ADD COLUMN "max_participants" integer;--> statement-breakpoint
ALTER TABLE "activities" ADD COLUMN "is_published" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "activities" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;