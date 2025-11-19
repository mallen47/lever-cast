/**
 * Mock LLM content generation function
 * In the prototype phase, this simulates what an LLM would generate
 */

export function generateFormattedContent(rawContent: string): {
	linkedin: string;
	x: string;
} {
	// Simple mock transformation - in production this would call an LLM API
	const trimmed = rawContent.trim();

	if (!trimmed) {
		return {
			linkedin: '',
			x: '',
		};
	}

	// Mock LinkedIn format - more professional, longer form
	const linkedin = `🎉 Exciting News!\n\n${trimmed}\n\nWhat are your thoughts? Let's discuss in the comments below! 👇\n\n#Entrepreneurship #Innovation #Business`;

	// Mock X format - concise, character-conscious
	const x = trimmed.length > 200
		? `${trimmed.substring(0, 197)}...`
		: trimmed;

	return {
		linkedin,
		x,
	};
}

