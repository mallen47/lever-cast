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
	/** Initial image URL */
	initialImageUrl?: string;
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
	/** Whether the form has unsaved changes */
	isDirty: boolean;

	// Actions
	setRawContent: (content: string) => void;
	setSelectedTemplate: (templateId: string) => void;
	togglePlatform: (platformId: PlatformId) => void;
	/** Set all platforms at once (used for template auto-selection) */
	setPlatforms: (platforms: PlatformId[]) => void;
	handleImageChange: (file: File | null) => void;
	/** Set image URL directly (for loading existing posts) */
	setImageUrl: (url: string | undefined) => void;
	clearError: () => void;
	applyPlatformContent: (content: PlatformContent) => void;
	setGeneratingState: (value: boolean) => void;
	reset: () => void;
	/** Mark the form as clean (after saving) */
	markClean: () => void;
}

/**
 * Custom hook to manage post editor state and actions
 * Extracts all state management logic from the EditPostPage component
 */
export function usePostEditor(
	options?: UsePostEditorOptions
): UsePostEditorReturn {
	const [rawContent, setRawContentInternal] = useState(
		options?.initialContent ?? ''
	);
	const [platformContent, setPlatformContent] = useState<PlatformContent>({});
	const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformId[]>(
		options?.initialPlatforms ?? []
	);
	const [selectedTemplate, setSelectedTemplateInternal] = useState('');
	const [imageUrl, setImageUrl] = useState<string | undefined>(
		options?.initialImageUrl
	);
	const [isGenerating, setIsGenerating] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isDirty, setIsDirty] = useState(false);

	// Use ref to track the current image URL for cleanup
	const imageUrlRef = useRef<string | undefined>(undefined);

	// Wrapped setters that mark form as dirty
	const setRawContent = useCallback((content: string) => {
		setRawContentInternal(content);
		if (content.trim()) {
			setIsDirty(true);
		}
	}, []);

	const setSelectedTemplate = useCallback((templateId: string) => {
		setSelectedTemplateInternal(templateId);
		// Don't mark dirty just for template selection - it's part of setup
	}, []);

	const markClean = useCallback(() => {
		setIsDirty(false);
	}, []);

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

	const setPlatforms = useCallback((platforms: PlatformId[]) => {
		setSelectedPlatforms(platforms);
	}, []);

	const handleImageChange = useCallback((file: File | null) => {
		// Clean up previous URL to prevent memory leak (only if it's an object URL)
		if (imageUrlRef.current && imageUrlRef.current.startsWith('blob:')) {
			URL.revokeObjectURL(imageUrlRef.current);
		}

		if (file) {
			const newUrl = URL.createObjectURL(file);
			setImageUrl(newUrl);
			setIsDirty(true);
		} else {
			setImageUrl(undefined);
		}
	}, []);

	const setImageUrlDirect = useCallback((url: string | undefined) => {
		// Clean up previous URL to prevent memory leak (only if it's an object URL)
		if (imageUrlRef.current && imageUrlRef.current.startsWith('blob:')) {
			URL.revokeObjectURL(imageUrlRef.current);
		}
		setImageUrl(url);
	}, []);

	const setGeneratingState = useCallback((value: boolean) => {
		setIsGenerating(value);
	}, []);

	const applyPlatformContent = useCallback((content: PlatformContent) => {
		setPlatformContent((prev) => {
			const next = { ...prev };
			Object.entries(content).forEach(([platformId, value]) => {
				if (typeof value === 'string' && value.trim()) {
					next[platformId as PlatformId] = value.trim();
				}
			});
			return next;
		});
		// New generated content is an unsaved change
		setIsDirty(true);
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
							if (
								!selectedPlatforms.includes(key as PlatformId)
							) {
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

		setRawContentInternal(options?.initialContent ?? '');
		setPlatformContent({});
		setSelectedPlatforms(options?.initialPlatforms ?? []);
		setSelectedTemplateInternal('');
		setImageUrl(undefined);
		setIsGenerating(false);
		setError(null);
		setIsDirty(false);
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
		isDirty,

		// Actions
		setRawContent,
		setSelectedTemplate,
		togglePlatform,
		setPlatforms,
		handleImageChange,
		setImageUrl: setImageUrlDirect,
		clearError,
		applyPlatformContent,
		setGeneratingState,
		reset,
		markClean,
	};
}
