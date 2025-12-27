'use client';

import React, { useEffect, useCallback, useState, useRef } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ContentInput } from '@/components/content/ContentInput';
import { ImageUpload } from '@/components/content/ImageUpload';
import { PlatformSelector } from '@/components/content/PlatformSelector';
import { PreviewContainer } from '@/components/content/PreviewContainer';
import { TemplateSelector } from '@/components/content/TemplateSelector';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePostEditor, useUnsavedChangesWarning } from '@/hooks';
import { useUnsavedChanges } from '@/lib/providers/unsaved-changes-provider';
import {
	createPost,
	updatePost,
	uploadPostImage,
	generatePlatformContent,
} from '@/lib/services';
import { toast } from 'sonner';
import type { GeneratePlatformContentPayload } from '@/lib/services/api/generate';
import type { PlatformId } from '@/types';
import type { Template } from '@/types/templates';

export default function EditPostPage() {
	const [isSaving, setIsSaving] = useState(false);
	const [isPublishing, setIsPublishing] = useState(false);
	const [savedPostId, setSavedPostId] = useState<string | null>(null);
	const [autoSaveTimeout, setAutoSaveTimeout] =
		useState<NodeJS.Timeout | null>(null);
	const [hasGenerated, setHasGenerated] = useState(false);
	const [selectedTemplateData, setSelectedTemplateData] =
		useState<Template | null>(null);
	const lastGenerationPayloadRef =
		useRef<GeneratePlatformContentPayload | null>(null);

	const {
		rawContent,
		platformContent,
		selectedPlatforms,
		selectedTemplate,
		imageUrl,
		isGenerating,
		error,
		isDirty,
		setRawContent,
		setSelectedTemplate,
		togglePlatform,
		setPlatforms,
		handleImageChange,
		setImageUrl,
		applyPlatformContent,
		updatePlatformContent,
		setGeneratingState,
		markClean,
	} = usePostEditor();

	const hasGeneratedContent =
		hasGenerated || Object.keys(platformContent).length > 0;

	// Get the unsaved changes context for client-side navigation blocking
	const { setIsDirty: setContextDirty, markClean: markContextClean } =
		useUnsavedChanges();

	// Warn user if they try to leave with unsaved changes (browser-level)
	useUnsavedChangesWarning(isDirty);

	// Sync dirty state with context for client-side navigation blocking
	useEffect(() => {
		setContextDirty(isDirty);
		// Cleanup: mark as clean when component unmounts
		return () => setContextDirty(false);
	}, [isDirty, setContextDirty]);

	// Handle template selection - auto-populate platforms from template
	const handleTemplateChange = useCallback(
		(template: Template | null) => {
			if (template) {
				// Auto-select platforms from the template
				setPlatforms(template.platformSupport);
				setSelectedTemplateData(template);
			} else {
				// Clear platforms if no template selected
				setPlatforms([]);
				setSelectedTemplateData(null);
			}
		},
		[setPlatforms]
	);

	// Handle save draft (manual or auto-save)
	const handleSaveDraft = useCallback(
		async (isAutoSave = false) => {
			if (isSaving) return;

			try {
				setIsSaving(true);

				// If we already have a saved post, update it
				if (savedPostId) {
					const { updatePost } = await import('@/lib/services');
					await updatePost(savedPostId, {
						rawContent,
						platformContent,
						templateId: selectedTemplate || null,
						imageUrl: imageUrl || null,
						status: hasGenerated ? 'generated' : 'draft',
					});
				} else {
					// Otherwise, create a new draft
					const newPost = await createPost({
						rawContent,
						platformContent,
						templateId: selectedTemplate,
						imageUrl: imageUrl,
						status: hasGenerated ? 'generated' : 'draft',
					});
					setSavedPostId(newPost.id);
				}

				markClean();
				markContextClean();

				if (!isAutoSave) {
					toast.success('Draft saved', {
						description: 'Your changes have been saved.',
					});
				}
			} catch (error) {
				console.error('Failed to save draft:', error);
				toast.error('Failed to save draft', {
					description:
						error instanceof Error
							? error.message
							: 'Please try again.',
				});
			} finally {
				setIsSaving(false);
			}
		},
		[
			savedPostId,
			rawContent,
			platformContent,
			selectedTemplate,
			imageUrl,
			isSaving,
			hasGenerated,
			markClean,
			markContextClean,
		]
	);

	// Auto-save functionality (debounced) - only if we have a saved post
	useEffect(() => {
		if (!isDirty || !savedPostId || isSaving) {
			return;
		}

		// Clear existing timeout
		if (autoSaveTimeout) {
			clearTimeout(autoSaveTimeout);
		}

		// Set new timeout for auto-save (30 seconds after last change)
		const timeout = setTimeout(async () => {
			await handleSaveDraft(true); // true = isAutoSave
		}, 30000);

		setAutoSaveTimeout(timeout);

		return () => {
			if (timeout) {
				clearTimeout(timeout);
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		isDirty,
		savedPostId,
		isSaving,
		rawContent,
		platformContent,
		selectedPlatforms,
		selectedTemplate,
		imageUrl,
		handleSaveDraft,
	]);

	const buildGenerationPayload =
		useCallback((): GeneratePlatformContentPayload | null => {
			if (
				!rawContent.trim() ||
				selectedPlatforms.length === 0 ||
				!selectedTemplate
			) {
				return null;
			}

			return {
				rawContent: rawContent.trim(),
				platforms: selectedPlatforms,
				templateId: selectedTemplate,
				templatePrompts: selectedTemplateData?.platformPrompts?.length
					? selectedTemplateData.platformPrompts.map((prompt) => ({
							platformId: prompt.platformId as PlatformId,
							prompt: prompt.prompt,
					  }))
					: undefined,
				image: imageUrl
					? imageUrl.startsWith('data:')
						? { dataUrl: imageUrl }
						: { url: imageUrl }
					: undefined,
			};
		}, [
			imageUrl,
			rawContent,
			selectedPlatforms,
			selectedTemplate,
			selectedTemplateData,
		]);

	const performGeneration = useCallback(
		async (payload: GeneratePlatformContentPayload) => {
			if (hasGenerated) return;
			setIsPublishing(true);
			setGeneratingState(true);
			lastGenerationPayloadRef.current = payload;

			try {
				const content = await generatePlatformContent(payload);
				applyPlatformContent(content);

				// Persist generated status and content
				try {
					if (savedPostId) {
						const updated = await updatePost(savedPostId, {
							rawContent: rawContent.trim(),
							platformContent: content,
							templateId: selectedTemplate || null,
							imageUrl: imageUrl || null,
							status: 'generated',
						});
						setSavedPostId(updated.id);
					} else {
						const newPost = await createPost({
							rawContent: rawContent.trim(),
							platformContent: content,
							templateId: selectedTemplate || undefined,
							imageUrl: imageUrl || undefined,
							status: 'generated',
						});
						setSavedPostId(newPost.id);
					}
					markClean();
					markContextClean();
					setHasGenerated(true);
				} catch (persistError) {
					console.error(
						'Failed to persist generated status',
						persistError
					);
					toast.error('Saved locally, but DB update failed', {
						description:
							persistError instanceof Error
								? persistError.message
								: 'Please retry saving.',
					});
				}

				toast.success('Platform content generated', {
					description: 'Review and edit before final publish.',
				});
			} catch (error) {
				const message =
					error instanceof Error
						? error.message
						: 'Failed to generate content. Please try again.';

				toast.error('Content generation failed', {
					description: message,
					action: lastGenerationPayloadRef.current
						? {
								label: 'Retry',
								onClick: () => {
									if (lastGenerationPayloadRef.current) {
										void performGeneration(
											lastGenerationPayloadRef.current
										);
									}
								},
						  }
						: undefined,
				});
			} finally {
				setGeneratingState(false);
				setIsPublishing(false);
			}
		},
		[
			applyPlatformContent,
			imageUrl,
			markClean,
			markContextClean,
			rawContent,
			savedPostId,
			selectedTemplate,
			setGeneratingState,
			hasGenerated,
		]
	);

	// Handle publish (phase 1: send to OpenAI for generation)
	const handlePublish = useCallback(async () => {
		if (isPublishing || isGenerating || hasGenerated) return;

		if (!rawContent.trim()) {
			toast.error('Add some content before publishing.');
			return;
		}

		if (!selectedTemplate) {
			toast.error('Select a template before publishing.');
			return;
		}

		if (selectedPlatforms.length === 0) {
			toast.error('Select at least one platform.');
			return;
		}

		const payload = buildGenerationPayload();
		if (!payload) return;

		await performGeneration(payload);
	}, [
		buildGenerationPayload,
		isGenerating,
		isPublishing,
		hasGenerated,
		performGeneration,
		rawContent,
		selectedPlatforms.length,
		selectedTemplate,
	]);

	// Handle image upload - if we have a saved post, upload immediately
	const handleImageUpload = useCallback(
		async (file: File | null) => {
			// Always update local preview (blob URL) for immediate feedback
			handleImageChange(file);

			if (!file) {
				setImageUrl(undefined);
				return;
			}

			// If we have a saved post, upload to server and use returned data URL
			if (savedPostId) {
				try {
					const result = await uploadPostImage(savedPostId, file);
					setImageUrl(result.imageUrl);
					toast.success('Image uploaded', {
						description: 'Your image has been uploaded and saved.',
					});
				} catch (error) {
					console.error('Failed to upload image:', error);
					toast.error('Failed to upload image', {
						description:
							error instanceof Error
								? error.message
								: 'Please try again.',
					});
				}
				return;
			}

			// For unsaved posts, convert to data URL so it persists when saving draft
			const fileToDataUrl = (f: File) =>
				new Promise<string>((resolve, reject) => {
					const reader = new FileReader();
					reader.onload = () => resolve(reader.result as string);
					reader.onerror = () => reject(reader.error);
					reader.readAsDataURL(f);
				});

			try {
				const dataUrl = await fileToDataUrl(file);
				setImageUrl(dataUrl);
			} catch (error) {
				console.error('Failed to read image:', error);
				toast.error('Failed to read image', {
					description:
						error instanceof Error
							? error.message
							: 'Please try again.',
				});
			}
		},
		[savedPostId, handleImageChange, setImageUrl]
	);

	// Show toast notification when error occurs
	useEffect(() => {
		if (error) {
			toast.error('Content generation failed', {
				description: error,
			});
		}
	}, [error]);

	return (
		<MainLayout>
			<div className='container mx-auto max-w-4xl space-y-6'>
				<div>
					<h1 className='text-3xl font-bold text-foreground'>
						New Post
					</h1>
				</div>

				<Card className='p-6'>
					<div className='space-y-8'>
						{/* Input Section */}
						<div className='space-y-8'>
							<TemplateSelector
								value={selectedTemplate}
								onValueChange={setSelectedTemplate}
								onTemplateChange={handleTemplateChange}
							/>

							<ImageUpload onImageChange={handleImageUpload} />

							<ContentInput
								value={rawContent}
								onChange={setRawContent}
							/>

							<PlatformSelector
								selectedPlatforms={selectedPlatforms}
								onToggle={togglePlatform}
								disabled={!selectedTemplate}
							/>
						</div>

						{/* Preview Section */}
						{(selectedPlatforms.length > 0 || imageUrl) && (
							<Card className='p-6'>
								{isGenerating && (
									<div className='mb-4 text-sm text-muted-foreground'>
										Generating preview...
									</div>
								)}
								<PreviewContainer
									content={platformContent}
									imageUrl={imageUrl}
									selectedPlatforms={selectedPlatforms}
									rawContent={rawContent}
									hasGenerated={hasGeneratedContent}
									onEditPlatformContent={
										hasGeneratedContent
											? updatePlatformContent
											: undefined
									}
								/>
							</Card>
						)}

						{/* Action Buttons */}
						<div className='flex justify-end gap-3'>
							{(rawContent.trim() ||
								selectedPlatforms.length > 0) && (
								<Button
									onClick={() => handleSaveDraft(false)}
									disabled={
										!isDirty || isSaving || isPublishing
									}
									variant='outline'
									size='lg'
								>
									{isSaving ? 'Saving...' : 'Save Draft'}
								</Button>
							)}
							{selectedPlatforms.length > 0 &&
								rawContent.trim() && (
									<Button
										onClick={handlePublish}
										disabled={
											isGenerating ||
											isPublishing ||
											isSaving ||
											hasGenerated
										}
										size='lg'
									>
										{isPublishing || isGenerating
											? 'Generating...'
											: hasGenerated
											? 'Publish'
											: 'Generate Content'}
									</Button>
								)}
						</div>
					</div>
				</Card>
			</div>
		</MainLayout>
	);
}
