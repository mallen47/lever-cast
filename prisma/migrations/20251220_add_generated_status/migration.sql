-- Add GENERATED status to PostStatus enum
ALTER TYPE "PostStatus" ADD VALUE IF NOT EXISTS 'GENERATED';

