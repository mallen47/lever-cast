/**
 * Centralized type exports
 * Import types from here: import { PlatformId, User, Post } from '@/types'
 */

// Platform types
export {
  PLATFORMS,
  type PlatformId,
  type PlatformConfig,
  isPlatformId,
} from "./platforms";

// Content types
export {
  type PlatformContent,
  type Post,
  type PostStatus,
  type DraftPost,
} from "./content";

// Template types
export {
  type Template,
  type TemplateCategory,
} from "./templates";

// User types
export {
  type User,
  type UserPlatformProfiles,
  type LinkedInProfile,
  type XProfile,
} from "./user";
