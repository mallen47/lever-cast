import { useState, useCallback, useEffect, useRef } from 'react';
import { generateFormattedContent } from '@/lib/services';
import { type PlatformContent, type PlatformId } from '@/types';

/**
 * Options for initializing the post editor hook
 */
interface UsePostEditorOptions {
	/** Initial platforms to select */
	initialPlatforms?: PlatformId[];
	/** Initial raw content */
	initialContent?: string;
}

/**
 * Return type for the usePostEditor hook
 */
interface UsePostEditorReturn {
	// State
	rawContent: string;
	platformContent: PlatformContent;
	selectedPlatforms: PlatformId[];
	selectedTemplate: string;
	imageUrl: string | undefined;
	isGenerating: boolean;
	error: string | null;

	// Actions
	setRawContent: (content: string) => void;
	setSelectedTemplate: (templateId: string) => void;
	togglePlatform: (platformId: PlatformId) => void;
	handleImageChange: (file: File | null) => void;
	clearError: () => void;
	reset: () => void;
}

/**
 * Custom hook to manage post editor state and actions
 * Extracts all state management logic from the EditPostPage component
 */
export function usePostEditor(
	options?: UsePostEditorOptions
): UsePostEditorReturn {
	const [rawContent, setRawContent] = useState(options?.initialContent ?? '');
	const [platformContent, setPlatformContent] = useState<PlatformContent>({});
	const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformId[]>(
		options?.initialPlatforms ?? []
	);
	const [selectedTemplate, setSelectedTemplate] = useState('');
	const [imageUrl, setImageUrl] = useState<string | undefined>();
	const [isGenerating, setIsGenerating] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Use ref to track the current image URL for cleanup
	const imageUrlRef = useRef<string | undefined>(undefined);

	// Update ref whenever imageUrl changes
	useEffect(() => {
		imageUrlRef.current = imageUrl;
	}, [imageUrl]);

	// Cleanup Object URL ONLY on unmount to prevent memory leaks
	useEffect(() => {
		return () => {
			if (imageUrlRef.current) {
				URL.revokeObjectURL(imageUrlRef.current);
			}
		};
	}, []); // Empty deps = only runs on unmount

	const togglePlatform = useCallback((platformId: PlatformId) => {
		setSelectedPlatforms((prev) => {
			const isCurrentlySelected = prev.includes(platformId);
			return isCurrentlySelected
				? prev.filter((id) => id !== platformId)
				: [...prev, platformId];
		});
	}, []);

	const handleImageChange = useCallback((file: File | null) => {
		// Clean up previous URL to prevent memory leak
		if (imageUrlRef.current) {
			URL.revokeObjectURL(imageUrlRef.current);
		}

		if (file) {
			const newUrl = URL.createObjectURL(file);
			setImageUrl(newUrl);
		} else {
			setImageUrl(undefined);
		}
	}, []);

	// Generate content when platforms, rawContent, or template changes
	useEffect(() => {
		// If no platforms selected, clear content
		if (selectedPlatforms.length === 0) {
			setPlatformContent({});
			return;
		}

		// If no content, clear platform content for deselected platforms
		if (!rawContent.trim()) {
			setPlatformContent((prev) => {
				const updated = { ...prev };
				Object.keys(updated).forEach((key) => {
					if (!selectedPlatforms.includes(key as PlatformId)) {
						delete updated[key as PlatformId];
					}
				});
				return updated;
			});
			return;
		}

		// Generate content for selected platforms
		let cancelled = false;

		const generateContent = async () => {
			try {
				setError(null);
				setIsGenerating(true);

				const content = await generateFormattedContent(
					rawContent,
					selectedPlatforms,
					selectedTemplate || undefined
				);

				if (!cancelled) {
					setPlatformContent((prev) => {
						const updated = { ...prev };
						// Update content for selected platforms
						selectedPlatforms.forEach((platformId) => {
							if (content[platformId]) {
								updated[platformId] = content[platformId];
							}
						});
						// Remove content for platforms that are no longer selected
						Object.keys(updated).forEach((key) => {
							if (!selectedPlatforms.includes(key as PlatformId)) {
								delete updated[key as PlatformId];
							}
						});
						return updated;
					});
				}
			} catch (e) {
				if (!cancelled) {
					const message =
						e instanceof Error
							? e.message
							: 'Failed to generate content';
					setError(message);
				}
			} finally {
				if (!cancelled) {
					setIsGenerating(false);
				}
			}
		};

		generateContent();

		return () => {
			cancelled = true;
		};
	}, [selectedPlatforms, rawContent, selectedTemplate]);

	const clearError = useCallback(() => setError(null), []);

	const reset = useCallback(() => {
		// Clean up image URL before resetting
		if (imageUrlRef.current) {
			URL.revokeObjectURL(imageUrlRef.current);
		}

		setRawContent(options?.initialContent ?? '');
		setPlatformContent({});
		setSelectedPlatforms(options?.initialPlatforms ?? []);
		setSelectedTemplate('');
		setImageUrl(undefined);
		setIsGenerating(false);
		setError(null);
	}, [options?.initialContent, options?.initialPlatforms]);

	return {
		// State
		rawContent,
		platformContent,
		selectedPlatforms,
		selectedTemplate,
		imageUrl,
		isGenerating,
		error,

		// Actions
		setRawContent,
		setSelectedTemplate,
		togglePlatform,
		handleImageChange,
		clearError,
		reset,
	};
}
