CREATE TYPE "public"."activity_scope" AS ENUM('COUNCIL', 'REGIONAL', 'NATIONAL');--> statement-breakpoint
ALTER TABLE "activities" ADD COLUMN "scope" "activity_scope" DEFAULT 'COUNCIL' NOT NULL;--> statement-breakpoint
ALTER TABLE "activities" ADD COLUMN "council_id" uuid;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_council_id_users_id_fk" FOREIGN KEY ("council_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;