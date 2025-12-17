'use client';

import React, { useEffect, useCallback, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
import { createPost, publishPost, uploadPostImage } from '@/lib/services';
import { toast } from 'sonner';
import type { Template } from '@/types/templates';

export default function EditPostPage() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const [isSaving, setIsSaving] = useState(false);
	const [isPublishing, setIsPublishing] = useState(false);
	const [savedPostId, setSavedPostId] = useState<string | null>(null);
	const [autoSaveTimeout, setAutoSaveTimeout] =
		useState<NodeJS.Timeout | null>(null);

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
		markClean,
	} = usePostEditor();

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
	]);

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			if (autoSaveTimeout) {
				clearTimeout(autoSaveTimeout);
			}
		};
	}, [autoSaveTimeout]);

	// Handle template selection - auto-populate platforms from template
	const handleTemplateChange = useCallback(
		(template: Template | null) => {
			if (template) {
				// Auto-select platforms from the template
				setPlatforms(template.platformSupport);
			} else {
				// Clear platforms if no template selected
				setPlatforms([]);
			}
		},
		[setPlatforms]
	);

	// Handle template query parameter
	useEffect(() => {
		const templateId = searchParams.get('template');
		if (templateId && templateId !== selectedTemplate) {
			setSelectedTemplate(templateId);
		}
	}, [searchParams, selectedTemplate, setSelectedTemplate]);

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
						status: 'draft',
					});
				} else {
					// Otherwise, create a new draft
					const newPost = await createPost({
						rawContent,
						platformContent,
						templateId: selectedTemplate,
						imageUrl: imageUrl,
						status: 'draft',
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
			markClean,
			markContextClean,
		]
	);

	// Handle publish
	const handlePublish = useCallback(async () => {
		if (isPublishing) return;

		try {
			setIsPublishing(true);

			let postId = savedPostId;

			// If no saved post yet, create one first
			if (!postId) {
				const newPost = await createPost({
					rawContent,
					platformContent,
					templateId: selectedTemplate,
					imageUrl: imageUrl,
					status: 'draft',
				});
				postId = newPost.id;
				setSavedPostId(postId);
			} else if (isDirty) {
				// Save as draft first if there are unsaved changes
				await handleSaveDraft(true);
			}

			// Then publish
			await publishPost(postId);

			markClean();
			markContextClean();

			toast.success('Post published', {
				description: `Your post has been published to ${
					selectedPlatforms.length
				} platform${selectedPlatforms.length > 1 ? 's' : ''}.`,
			});

			// Redirect to posts page
			router.push('/posts');
		} catch (error) {
			console.error('Failed to publish post:', error);
			toast.error('Failed to publish post', {
				description:
					error instanceof Error
						? error.message
						: 'Please try again.',
			});
		} finally {
			setIsPublishing(false);
		}
	}, [
		savedPostId,
		isDirty,
		rawContent,
		platformContent,
		selectedTemplate,
		imageUrl,
		selectedPlatforms.length,
		isPublishing,
		handleSaveDraft,
		markClean,
		markContextClean,
		router,
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
											isSaving
										}
										size='lg'
									>
										{isPublishing
											? 'Publishing...'
											: 'Publish'}
									</Button>
								)}
						</div>
					</div>
				</Card>
			</div>
		</MainLayout>
	);
}
