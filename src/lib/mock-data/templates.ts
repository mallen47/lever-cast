/**
 * Mock template data
 * In production, these would be fetched from the database
 */

import type { Template } from "@/types";

export const mockTemplates: Template[] = [
	{
		id: '1',
		name: 'Professional Insight',
		description: 'Share professional insights and thought leadership content',
		category: 'Business',
	},
	{
		id: '2',
		name: 'Quick Tip',
		description: 'Quick tips and actionable advice for your audience',
		category: 'Tips',
	},
	{
		id: '3',
		name: 'Industry News',
		description: 'Share and comment on industry news and trends',
		category: 'News',
	},
];

export function getTemplateById(id: string): Template | undefined {
	return mockTemplates.find((t) => t.id === id);
}

