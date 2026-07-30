ALTER TABLE "scout_applications" ALTER COLUMN "preferred_council_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "scout_applications" ALTER COLUMN "scouting_position" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "scout_applications" ALTER COLUMN "advancement_rank" SET DATA TYPE "public"."scout_rank" USING "advancement_rank"::"public"."scout_rank";--> statement-breakpoint
ALTER TABLE "scout_applications" ALTER COLUMN "advancement_rank" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "scout_applications" ALTER COLUMN "tenure" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "scout_applications" ALTER COLUMN "tenure" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "scout_applications" ALTER COLUMN "region" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "scout_applications" ALTER COLUMN "requested_registration_years" SET DEFAULT 1;--> statement-breakpoint
ALTER TABLE "scout_applications" ADD COLUMN "scout_section" text;--> statement-breakpoint
ALTER TABLE "scout_registrations" ADD COLUMN "application_id" uuid;--> statement-breakpoint
ALTER TABLE "scout_registrations" ADD CONSTRAINT "scout_registrations_application_id_scout_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."scout_applications"("id") ON DELETE no action ON UPDATE no action;