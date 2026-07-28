CREATE TYPE "public"."admin_scope" AS ENUM('COUNCIL', 'REGIONAL', 'NATIONAL');--> statement-breakpoint
ALTER TYPE "public"."announcement_visibility" ADD VALUE 'REGIONAL';--> statement-breakpoint
ALTER TABLE "admin_users" ALTER COLUMN "council_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "activities" ADD COLUMN "region_id" uuid;--> statement-breakpoint
ALTER TABLE "admin_users" ADD COLUMN "scope" "admin_scope" DEFAULT 'COUNCIL' NOT NULL;--> statement-breakpoint
ALTER TABLE "admin_users" ADD COLUMN "region_id" uuid;--> statement-breakpoint
ALTER TABLE "announcements" ADD COLUMN "region_id" uuid;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "region_id" uuid;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE no action ON UPDATE no action;