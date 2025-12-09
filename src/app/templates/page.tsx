'use client';

import { useState, useEffect, useCallback } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { TemplateCard, TemplateForm } from '@/components/templates';
import { Button } from '@/components/ui/button';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { Plus, Layers, Loader2, AlertCircle } from 'lucide-react';
import {
	fetchTemplates,
	createTemplate,
	updateTemplate,
	deleteTemplate,
} from '@/lib/services/api/templates';
import type { Template, TemplateFormData } from '@/types/templates';

type ViewMode = 'list' | 'create' | 'edit';

export default function TemplatesPage() {
	const [viewMode, setViewMode] = useState<ViewMode>('list');
	const [editingTemplate, setEditingTemplate] = useState<
		Template | undefined
	>(undefined);
	const [templates, setTemplates] = useState<Template[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Delete confirmation state
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [templateToDelete, setTemplateToDelete] = useState<Template | null>(
		null
	);
	const [isDeleting, setIsDeleting] = useState(false);

	// Load templates on mount
	const loadTemplates = useCallback(async () => {
		try {
			setIsLoading(true);
			setError(null);
			const data = await fetchTemplates();
			setTemplates(data);
		} catch (err) {
			console.error('Failed to load templates:', err);
			setError(
				err instanceof Error ? err.message : 'Failed to load templates'
			);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		loadTemplates();
	}, [loadTemplates]);

	const handleCreateClick = () => {
		setEditingTemplate(undefined);
		setViewMode('create');
	};

	const handleEditClick = (template: Template) => {
		setEditingTemplate(template);
		setViewMode('edit');
	};

	const handleDeleteClick = (template: Template) => {
		setTemplateToDelete(template);
		setDeleteModalOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!templateToDelete) return;

		try {
			setIsDeleting(true);
			await deleteTemplate(templateToDelete.id);
			setTemplates((prev) =>
				prev.filter((t) => t.id !== templateToDelete.id)
			);
			setDeleteModalOpen(false);
			setTemplateToDelete(null);
		} catch (err) {
			console.error('Failed to delete template:', err);
			setError(
				err instanceof Error ? err.message : 'Failed to delete template'
			);
		} finally {
			setIsDeleting(false);
		}
	};

	const handleFormCancel = () => {
		setEditingTemplate(undefined);
		setViewMode('list');
	};

	const handleFormSubmit = async (data: TemplateFormData) => {
		try {
			setIsSaving(true);
			setError(null);

			if (viewMode === 'edit' && editingTemplate) {
				// Update existing template
				const updated = await updateTemplate(editingTemplate.id, data);
				setTemplates((prev) =>
					prev.map((t) => (t.id === editingTemplate.id ? updated : t))
				);
			} else {
				// Create new template
				const created = await createTemplate(data);
				setTemplates((prev) => [created, ...prev]);
			}

			setEditingTemplate(undefined);
			setViewMode('list');
		} catch (err) {
			console.error('Failed to save template:', err);
			setError(
				err instanceof Error ? err.message : 'Failed to save template'
			);
		} finally {
			setIsSaving(false);
		}
	};

	// Separate user templates from system templates
	const userTemplates = templates.filter((t) => !t.isSystem);
	const systemTemplates = templates.filter((t) => t.isSystem);

	return (
		<MainLayout>
			<div className='space-y-8'>
				{/* Header Section */}
				<div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
					<div className='space-y-1'>
						<div className='flex items-center gap-3'>
							<div className='flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10'>
								<Layers className='h-5 w-5 text-accent' />
							</div>
							<h1 className='text-3xl font-bold tracking-tight text-foreground'>
								Templates
							</h1>
						</div>
						<p className='text-muted-foreground max-w-xl'>
							Create and manage custom prompts for your social
							media posts. Templates help you maintain consistent
							formatting and messaging across platforms.
						</p>
					</div>

					{viewMode === 'list' && (
						<Button
							onClick={handleCreateClick}
							className='gap-2 bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm'
						>
							<Plus className='h-4 w-4' />
							New Template
						</Button>
					)}
				</div>

				{/* Error Message */}
				{error && (
					<div className='rounded-lg border border-destructive/50 bg-destructive/10 p-4 flex items-center gap-3'>
						<AlertCircle className='h-5 w-5 text-destructive' />
						<p className='text-sm text-destructive'>{error}</p>
						<Button
							variant='ghost'
							size='sm'
							onClick={() => setError(null)}
							className='ml-auto'
						>
							Dismiss
						</Button>
					</div>
				)}

				{/* Main Content */}
				{viewMode === 'list' ? (
					<div className='space-y-8'>
						{/* Loading State */}
						{isLoading && (
							<div className='flex items-center justify-center py-12'>
								<Loader2 className='h-8 w-8 animate-spin text-accent' />
							</div>
						)}

						{/* Empty State */}
						{!isLoading && templates.length === 0 && (
							<EmptyState onCreateClick={handleCreateClick} />
						)}

						{/* User Templates */}
						{!isLoading && userTemplates.length > 0 && (
							<div className='space-y-4'>
								<h2 className='text-lg font-semibold text-foreground'>
									Your Templates
								</h2>
								<div className='grid gap-4'>
									{userTemplates.map((template, index) => (
										<TemplateCard
											key={template.id}
											template={template}
											onEdit={handleEditClick}
											onDelete={handleDeleteClick}
											index={index}
										/>
									))}
								</div>
							</div>
						)}

						{/* System Templates */}
						{!isLoading && systemTemplates.length > 0 && (
							<div className='space-y-4'>
								<h2 className='text-lg font-semibold text-foreground'>
									System Templates
								</h2>
								<div className='grid gap-4'>
									{systemTemplates.map((template, index) => (
										<TemplateCard
											key={template.id}
											template={template}
											index={index + userTemplates.length}
										/>
									))}
								</div>
							</div>
						)}

						{/* Show create CTA if user has no templates but system templates exist */}
						{!isLoading &&
							userTemplates.length === 0 &&
							systemTemplates.length > 0 && (
								<div className='rounded-xl border border-dashed border-border/50 bg-linear-to-br from-card to-muted/20 p-8 text-center'>
									<h3 className='text-lg font-semibold text-foreground mb-2'>
										Create your first custom template
									</h3>
									<p className='text-muted-foreground max-w-md mx-auto mb-4'>
										Customize prompts for your unique
										content style and brand voice.
									</p>
									<Button
										onClick={handleCreateClick}
										className='gap-2 bg-accent text-accent-foreground hover:bg-accent/90'
									>
										<Plus className='h-4 w-4' />
										Create Template
									</Button>
								</div>
							)}
					</div>
				) : (
					<TemplateForm
						key={editingTemplate?.id ?? 'create'}
						template={editingTemplate}
						onSubmit={handleFormSubmit}
						onCancel={handleFormCancel}
						isLoading={isSaving}
					/>
				)}
			</div>

			{/* Delete Confirmation Modal */}
			<ConfirmationModal
				open={deleteModalOpen}
				onOpenChange={setDeleteModalOpen}
				title='Delete Template'
				description={`Are you sure you want to delete "${templateToDelete?.name}"? This action cannot be undone.`}
				confirmText='Delete'
				cancelText='Cancel'
				onConfirm={handleConfirmDelete}
				isLoading={isDeleting}
				variant='destructive'
			/>
		</MainLayout>
	);
}

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
	return (
		<div className='rounded-xl border border-dashed border-border/50 bg-linear-to-br from-card to-muted/20 p-12 text-center'>
			<div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 mb-6'>
				<Layers className='h-8 w-8 text-accent' />
			</div>
			<h3 className='text-lg font-semibold text-foreground mb-2'>
				No templates yet
			</h3>
			<p className='text-muted-foreground max-w-md mx-auto mb-6'>
				Create your first template to streamline your content creation
				process. Templates help you maintain consistent messaging and
				formatting.
			</p>
			<Button
				onClick={onCreateClick}
				className='gap-2 bg-accent text-accent-foreground hover:bg-accent/90'
			>
				<Plus className='h-4 w-4' />
				Create Your First Template
			</Button>
		</div>
	);
}
