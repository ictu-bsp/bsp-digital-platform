CREATE TYPE "public"."notification_visibility" AS ENUM('PUBLIC', 'SCOUTS', 'COUNCIL', 'REGIONAL');--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(150) NOT NULL,
	"message" text NOT NULL,
	"link" text,
	"visibility" "notification_visibility" DEFAULT 'PUBLIC' NOT NULL,
	"council_id" uuid,
	"region_id" uuid,
	"author_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_council_id_councils_id_fk" FOREIGN KEY ("council_id") REFERENCES "public"."councils"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;