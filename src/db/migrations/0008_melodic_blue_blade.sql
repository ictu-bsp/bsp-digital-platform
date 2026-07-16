ALTER TABLE "scout_applications" ADD COLUMN "scouting_position" text NOT NULL;--> statement-breakpoint
ALTER TABLE "scout_applications" ADD COLUMN "advancement_rank" text NOT NULL;--> statement-breakpoint
ALTER TABLE "scout_applications" ADD COLUMN "tenure" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "scout_applications" ADD COLUMN "region" text NOT NULL;--> statement-breakpoint
ALTER TABLE "scout_applications" ADD COLUMN "community_based" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "scout_applications" ADD COLUMN "sponsoring_institution" text;--> statement-breakpoint
ALTER TABLE "scout_applications" ADD COLUMN "requested_registration_years" integer NOT NULL;