import { NextResponse } from 'next/server';

import { isPlatformId, PLATFORMS, type PlatformId } from '@/types/platforms';
import type { PlatformContent } from '@/types';
import type { PlatformPrompt } from '@/types/templates';

interface GenerateRequestBody {
	rawContent?: string;
	platforms?: PlatformId[];
	templateId?: string | null;
	templatePrompts?: PlatformPrompt[];
	image?: {
		url?: string;
		dataUrl?: string;
	};
}

interface OpenAIResponse {
	choices?: {
		message?: { content?: string | null };
	}[];
}

const PLATFORM_STYLE_HINTS: Record<PlatformId, string> = {
	[PLATFORMS.LINKEDIN]:
		'Professional, actionable, slightly longer form. Include a hook and a clear takeaway.',
	[PLATFORMS.X]:
		'Concise, high-signal. Keep under 240 characters. Aim for scannable lines.',
};

function buildPrompt({
	rawContent,
	platforms,
	templatePrompts,
	image,
}: Required<Pick<GenerateRequestBody, 'rawContent' | 'platforms'>> &
	Pick<GenerateRequestBody, 'templatePrompts' | 'image'>) {
	const promptLines = [
		'You are a social media copywriter. Generate platform-specific posts.',
		'Return a JSON object where each key is the platform id and each value is the post text.',
		`Platforms requested: ${platforms.join(', ')}`,
		`Raw content: ${rawContent}`,
	];

	if (templatePrompts?.length) {
		const promptDetails = templatePrompts
			.map(
				(p) =>
					`- ${p.platformId}: ${p.prompt || 'No prompt provided (use defaults)'}`
			)
			.join('\n');
		promptLines.push('Template prompts (use when available):', promptDetails);
	}

	promptLines.push('Default style hints when template prompt is missing:');
	platforms.forEach((platform) => {
		const hint = PLATFORM_STYLE_HINTS[platform];
		if (hint) {
			promptLines.push(`- ${platform}: ${hint}`);
		}
	});

	if (image?.url || image?.dataUrl) {
		promptLines.push(
			'An image is attached. Mention or allude to the visual only if it adds clarity.'
		);
	}

	promptLines.push(
		'Output only valid JSON. Example shape: {"linkedin":"...","x":"..."}'
	);

	return promptLines.join('\n');
}

function validateRequest(body: GenerateRequestBody) {
	if (!body.rawContent || !body.rawContent.trim()) {
		return 'rawContent is required';
	}

	if (!Array.isArray(body.platforms) || body.platforms.length === 0) {
		return 'platforms array is required';
	}

	const invalid = body.platforms.filter((p) => !isPlatformId(p));
	if (invalid.length > 0) {
		return `Invalid platforms: ${invalid.join(', ')}`;
	}

	return null;
}

function mapPlatformContent(
	raw: unknown,
	platforms: PlatformId[]
): PlatformContent {
	const result: PlatformContent = {};

	if (!raw || typeof raw !== 'object') {
		return result;
	}

	for (const platform of platforms) {
		const value = (raw as Record<string, unknown>)[platform];
		if (typeof value === 'string' && value.trim()) {
			result[platform] = value.trim();
		}
	}

	return result;
}

export async function POST(request: Request) {
	const apiKey = process.env.OPENAI_API_KEY;

	if (!apiKey) {
		return NextResponse.json(
			{ error: { message: 'OpenAI API key is not configured.' } },
			{ status: 500 }
		);
	}

	let body: GenerateRequestBody;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json(
			{ error: { message: 'Invalid JSON body.' } },
			{ status: 400 }
		);
	}

	const validationError = validateRequest(body);
	if (validationError) {
		return NextResponse.json(
			{ error: { message: validationError } },
			{ status: 400 }
		);
	}

	const { rawContent, platforms, templatePrompts, image } = body;

	const prompt = buildPrompt({
		rawContent: rawContent!.trim(),
		platforms: platforms!,
		templatePrompts,
		image,
	});

	let aiResponse: Response;

	try {
		aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${apiKey}`,
			},
			body: JSON.stringify({
				model: 'gpt-4o-mini',
				messages: [
					{
						role: 'system',
						content:
							'You write concise, high-quality social media posts. Respond ONLY with JSON and no other text.',
					},
					{ role: 'user', content: prompt },
				],
				temperature: 0.7,
				max_tokens: 400,
				response_format: { type: 'json_object' },
			}),
		});
	} catch (error) {
		console.error('OpenAI network error', error);
		return NextResponse.json(
			{ error: { message: 'Failed to reach OpenAI.' } },
			{ status: 502 }
		);
	}

	if (!aiResponse.ok) {
		const errorText = await aiResponse.text().catch(() => null);
		return NextResponse.json(
			{
				error: {
					message:
						errorText ||
						`OpenAI returned status ${aiResponse.status.toString()}`,
				},
			},
			{ status: 502 }
		);
	}

	let completion: OpenAIResponse;
	try {
		completion = (await aiResponse.json()) as OpenAIResponse;
	} catch {
		return NextResponse.json(
			{ error: { message: 'Invalid response from OpenAI.' } },
			{ status: 502 }
		);
	}

	const content = completion.choices?.[0]?.message?.content;
	if (!content) {
		return NextResponse.json(
			{ error: { message: 'OpenAI response was empty.' } },
			{ status: 502 }
		);
	}

	let parsed: unknown;
	try {
		parsed = JSON.parse(content);
	} catch (error) {
		console.error('Failed to parse OpenAI JSON', error, content);
		return NextResponse.json(
			{ error: { message: 'OpenAI returned non-JSON content.' } },
			{ status: 502 }
		);
	}

	const platformContent = mapPlatformContent(parsed, platforms!);

	return NextResponse.json(
		{ content: platformContent },
		{
			status: 200,
		}
	);
}

