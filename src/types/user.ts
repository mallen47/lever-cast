/**
 * User profile data
 */
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  /** Platform-specific profile information */
  platforms: UserPlatformProfiles;
}

/**
 * Platform-specific profile data
 */
export interface UserPlatformProfiles {
  linkedin?: LinkedInProfile;
  x?: XProfile;
}

export interface LinkedInProfile {
  headline: string;
  profileUrl?: string;
}

export interface XProfile {
  handle: string;
  profileUrl?: string;
}
