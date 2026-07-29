ALTER TABLE "admin_users" DROP CONSTRAINT "admin_users_username_unique";--> statement-breakpoint
ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_council_username_unq" UNIQUE("council_id","username");--> statement-breakpoint
ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_region_username_unq" UNIQUE("region_id","username");