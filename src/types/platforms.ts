import type { ComponentType, SVGProps } from "react";

/**
 * Platform constants - single source of truth for platform identifiers
 */
export const PLATFORMS = {
  LINKEDIN: "linkedin",
  X: "x",
} as const;

/**
 * Union type of all valid platform identifiers
 * Derived from PLATFORMS constant for type safety
 */
export type PlatformId = (typeof PLATFORMS)[keyof typeof PLATFORMS];

/**
 * Configuration for a social media platform
 */
export interface PlatformConfig {
  id: PlatformId;
  name: string;
  icon: ComponentType<SVGProps<SVGSVGElement> & { className?: string }>;
  characterLimit?: number;
  description?: string;
}

/**
 * Type guard to check if a string is a valid PlatformId
 */
export function isPlatformId(value: string): value is PlatformId {
  return Object.values(PLATFORMS).includes(value as PlatformId);
}
