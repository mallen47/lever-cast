/**
 * Mock LLM content generation function
 * In the prototype phase, this simulates what an LLM would generate
 */

import { PLATFORMS, type PlatformContent, type PlatformId } from "@/types";

/**
 * Generate formatted content for selected platforms
 * In production, this would call an LLM API
 */
export function generateFormattedContent(
	rawContent: string,
	platforms: PlatformId[] = [PLATFORMS.LINKEDIN, PLATFORMS.X]
): PlatformContent {
	const trimmed = rawContent.trim();

	if (!trimmed) {
		return {};
	}

	const content: PlatformContent = {};

	for (const platform of platforms) {
		content[platform] = formatForPlatform(trimmed, platform);
	}

	return content;
}

/**
 * Format content for a specific platform
 */
function formatForPlatform(content: string, platform: PlatformId): string {
	switch (platform) {
		case PLATFORMS.LINKEDIN:
			// Mock LinkedIn format - more professional, longer form
			return `🎉 Exciting News!\n\n${content}\n\nWhat are your thoughts? Let's discuss in the comments below! 👇\n\n#Entrepreneurship #Innovation #Business`;

		case PLATFORMS.X:
			// Mock X format - concise, character-conscious
			return content.length > 200
				? `${content.substring(0, 197)}...`
				: content;

		default:
			return content;
	}
}

