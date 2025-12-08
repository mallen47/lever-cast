/**
 * Mock template data
 * In production, these would be fetched from the database
 */

import type { Template } from "@/types";
import { PLATFORMS } from "@/types/platforms";

/**
 * Default template shown when user has no custom templates
 */
export const defaultTemplate: Template = {
	id: 'default',
	name: 'Simple Post',
	description: 'A straightforward template for quick social media posts. Perfect for getting started!',
	category: 'Personal',
	platformSupport: [PLATFORMS.LINKEDIN, PLATFORMS.X],
	platformPrompts: [
		{
			platformId: PLATFORMS.LINKEDIN,
			prompt: 'Share your thoughts in a professional tone. Include relevant hashtags and a call-to-action.',
		},
		{
			platformId: PLATFORMS.X,
			prompt: 'Keep it concise and engaging. Use 1-2 relevant hashtags.',
		},
	],
	isDefault: true,
	createdAt: new Date('2024-01-01'),
	updatedAt: new Date('2024-01-01'),
};

/**
 * Mock user-created templates
 */
export const mockTemplates: Template[] = [
	{
		id: '1',
		name: 'Professional Insight',
		description: 'Share professional insights and thought leadership content with your network',
		category: 'Business',
		platformSupport: [PLATFORMS.LINKEDIN, PLATFORMS.X],
		platformPrompts: [
			{
				platformId: PLATFORMS.LINKEDIN,
				prompt: '🎯 Start with a hook question or bold statement\n\n📊 Share 3-5 key insights with bullet points\n\n💡 End with a thought-provoking question\n\n#ThoughtLeadership #BusinessInsights',
			},
			{
				platformId: PLATFORMS.X,
				prompt: '🧵 Thread format:\n1. Hook statement\n2. Key insight\n3. Supporting data\n4. Call to action\n\n#Insights',
			},
		],
		isDefault: false,
		createdAt: new Date('2024-11-15'),
		updatedAt: new Date('2024-11-20'),
	},
	{
		id: '2',
		name: 'Quick Tip',
		description: 'Quick tips and actionable advice for your audience',
		category: 'Tips',
		platformSupport: [PLATFORMS.X],
		platformPrompts: [
			{
				platformId: PLATFORMS.X,
				prompt: '💡 Quick tip:\n\n[Your tip here]\n\n↳ Why it works\n↳ How to apply it\n\nSave this for later! 🔖',
			},
		],
		isDefault: false,
		createdAt: new Date('2024-10-28'),
		updatedAt: new Date('2024-11-10'),
	},
	{
		id: '3',
		name: 'Industry News',
		description: 'Share and comment on industry news and trends',
		category: 'News',
		platformSupport: [PLATFORMS.LINKEDIN],
		platformPrompts: [
			{
				platformId: PLATFORMS.LINKEDIN,
				prompt: '📰 Breaking: [News headline]\n\nMy take:\n\n• What this means for our industry\n• Potential implications\n• What to watch for next\n\nWhat are your thoughts? 👇\n\n#IndustryNews #TrendWatch',
			},
		],
		isDefault: false,
		createdAt: new Date('2024-09-05'),
		updatedAt: new Date('2024-09-05'),
	},
];

/**
 * Get all templates including the default template
 */
export function getAllTemplates(): Template[] {
	return [...mockTemplates].sort(
		(a, b) => b.createdAt.getTime() - a.createdAt.getTime()
	);
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): Template | undefined {
	if (id === 'default') return defaultTemplate;
	return mockTemplates.find((t) => t.id === id);
}

/**
 * Check if user has any custom templates
 */
export function hasCustomTemplates(): boolean {
	return mockTemplates.length > 0;
}

