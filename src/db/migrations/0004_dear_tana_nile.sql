CREATE TABLE "activity_registrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scout_id" uuid NOT NULL,
	"activity_id" uuid NOT NULL,
	"registered_at" timestamp DEFAULT now() NOT NULL,
	"remarks" text
);
--> statement-breakpoint
ALTER TABLE "activity_registrations" ADD CONSTRAINT "activity_registrations_scout_id_scouts_id_fk" FOREIGN KEY ("scout_id") REFERENCES "public"."scouts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_registrations" ADD CONSTRAINT "activity_registrations_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE no action ON UPDATE no action;