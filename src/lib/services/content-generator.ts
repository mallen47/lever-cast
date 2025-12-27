/**
 * Content generation service
 * Abstracts content generation logic from components
 * In production, this will call an LLM API
 */

import { PLATFORMS, type PlatformContent, type PlatformId } from '@/types';
import { CONTENT_GENERATION_DELAY_MS } from '@/lib/constants';

/**
 * Generate formatted content for selected platforms
 * @param rawContent - The original user content
 * @param platforms - Platforms to generate content for
 * @param templateId - Optional template to apply (for future use)
 * @returns Promise resolving to platform-specific content
 */
export async function generateFormattedContent(
	rawContent: string,
	platforms: PlatformId[],
	templateId?: string
): Promise<PlatformContent> {
	// Simulate API delay
	await new Promise((resolve) =>
		setTimeout(resolve, CONTENT_GENERATION_DELAY_MS)
	);

	const trimmed = rawContent.trim();

	if (!trimmed) {
		return {};
	}

	const content: PlatformContent = {};

	for (const platform of platforms) {
		content[platform] = formatForPlatform(trimmed, platform, templateId);
	}

	return content;
}

/**
 * Format content for a specific platform
 * In production, this logic would be handled by the LLM
 */
function formatForPlatform(
	content: string,
	platform: PlatformId,
	templateId?: string
): string {
	void templateId;
	// TODO: Use templateId to modify formatting when template system is implemented

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
