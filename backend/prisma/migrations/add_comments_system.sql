-- Migration: Add Comments System
-- Description: Adds comment system for Tickets and Service Orders

-- Create Comments table
CREATE TABLE "comments" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "resource_type" VARCHAR(50) NOT NULL, -- 'ticket' or 'service_order'
    "resource_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "provider_id" INTEGER NOT NULL,
    "is_internal" BOOLEAN NOT NULL DEFAULT false, -- internal comments vs client-visible
    "is_edited" BOOLEAN NOT NULL DEFAULT false,
    "edited_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- Create indexes for better performance
CREATE INDEX "comments_resource_type_resource_id_idx" ON "comments"("resource_type", "resource_id");
CREATE INDEX "comments_user_id_idx" ON "comments"("user_id");
CREATE INDEX "comments_provider_id_idx" ON "comments"("provider_id");
CREATE INDEX "comments_created_at_idx" ON "comments"("created_at");

-- Add foreign key constraints
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "comments" ADD CONSTRAINT "comments_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;