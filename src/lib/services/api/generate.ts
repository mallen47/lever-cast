import type { PlatformContent, PlatformId } from '@/types';
import type { PlatformPrompt } from '@/types/templates';

export interface GeneratePlatformContentPayload {
	rawContent: string;
	platforms: PlatformId[];
	templateId?: string | null;
	templatePrompts?: PlatformPrompt[];
	image?: {
		url?: string;
		dataUrl?: string;
	};
}

interface GenerateResponse {
	content: PlatformContent;
	error?: { message: string };
}

export async function generatePlatformContent(
	payload: GeneratePlatformContentPayload
): Promise<PlatformContent> {
	const response = await fetch('/api/ai/generate', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		const error = (await response
			.json()
			.catch(() => null)) as GenerateResponse | null;
		throw new Error(
			error?.error?.message || 'Failed to generate platform content'
		);
	}

	const data = (await response.json()) as GenerateResponse;

	if (data.error) {
		throw new Error(data.error.message);
	}

	return data.content;
}
