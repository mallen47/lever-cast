import type { PlatformId } from "./platforms";

/**
 * Content formatted for each platform
 * Using Partial<Record<>> allows dynamic platform support
 */
export type PlatformContent = Partial<Record<PlatformId, string>>;

/**
 * A post with content formatted for multiple platforms
 */
export interface Post {
  id: string;
  rawContent: string;
  platformContent: PlatformContent;
  templateId?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  status: PostStatus;
}

/**
 * Post lifecycle status
 */
export type PostStatus = "draft" | "scheduled" | "published" | "failed";

/**
 * Draft post data (before saving)
 */
export interface DraftPost {
  rawContent: string;
  platformContent: PlatformContent;
  selectedPlatforms: PlatformId[];
  templateId?: string;
  imageUrl?: string;
}
