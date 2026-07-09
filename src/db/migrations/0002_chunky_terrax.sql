ALTER TABLE "administrators" DROP CONSTRAINT "administrators_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "administrators" ADD COLUMN "role_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "administrators" ADD CONSTRAINT "administrators_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "administrators" ADD CONSTRAINT "administrators_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;