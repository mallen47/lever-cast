import { Linkedin } from "lucide-react";
import { XLogo } from "@/components/icons/XLogo";
import { PLATFORMS, type PlatformConfig, type PlatformId } from "@/types";

/**
 * Platform registry - single source of truth for platform configuration
 *
 * To add a new platform:
 * 1. Add constant to PLATFORMS in src/types/platforms.ts
 * 2. Add config entry here
 * 3. Create preview component if needed
 */
export const platformRegistry: Record<PlatformId, PlatformConfig> = {
  [PLATFORMS.LINKEDIN]: {
    id: PLATFORMS.LINKEDIN,
    name: "LinkedIn",
    icon: Linkedin,
    characterLimit: 3000,
    description: "Professional networking and thought leadership",
  },
  [PLATFORMS.X]: {
    id: PLATFORMS.X,
    name: "X",
    icon: XLogo,
    characterLimit: 280,
    description: "Short-form content and real-time updates",
  },
};

/**
 * Get configuration for a specific platform
 */
export function getPlatformConfig(id: PlatformId): PlatformConfig {
  return platformRegistry[id];
}

/**
 * Get all platform configurations as an array
 */
export function getAllPlatforms(): PlatformConfig[] {
  return Object.values(platformRegistry);
}

/**
 * Get default platforms for new posts
 */
export function getDefaultPlatforms(): PlatformId[] {
  return [PLATFORMS.LINKEDIN, PLATFORMS.X];
}
