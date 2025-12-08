'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { TemplateCard, TemplateForm } from '@/components/templates';
import { Button } from '@/components/ui/button';
import { Plus, Layers, Sparkles } from 'lucide-react';
import { getAllTemplates, defaultTemplate, hasCustomTemplates } from '@/lib/mock-data/templates';
import type { Template, TemplateFormData } from '@/types/templates';

type ViewMode = 'list' | 'create' | 'edit';

export default function TemplatesPage() {
	const [viewMode, setViewMode] = useState<ViewMode>('list');
	const [editingTemplate, setEditingTemplate] = useState<Template | undefined>(undefined);
	const [templates, setTemplates] = useState<Template[]>(getAllTemplates());
	
	const hasTemplates = hasCustomTemplates();

	const handleCreateClick = () => {
		setEditingTemplate(undefined);
		setViewMode('create');
	};

	const handleEditClick = (template: Template) => {
		setEditingTemplate(template);
		setViewMode('edit');
	};

	const handleFormCancel = () => {
		setEditingTemplate(undefined);
		setViewMode('list');
	};

	const handleFormSubmit = (data: TemplateFormData) => {
		if (viewMode === 'edit' && editingTemplate) {
			// Update existing template
			setTemplates(prev =>
				prev.map(t =>
					t.id === editingTemplate.id
						? { ...t, ...data, updatedAt: new Date() }
						: t
				)
			);
		} else {
			// Create new template
			const newTemplate: Template = {
				id: `template-${Date.now()}`,
				name: data.name,
				description: data.description,
				platformSupport: data.platformSupport,
				platformPrompts: data.platformPrompts,
				isDefault: false,
				createdAt: new Date(),
				updatedAt: new Date(),
			};
			setTemplates(prev => [newTemplate, ...prev]);
		}
		
		setEditingTemplate(undefined);
		setViewMode('list');
	};

	return (
		<MainLayout>
			<div className="space-y-8">
				{/* Header Section */}
				<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div className="space-y-1">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
								<Layers className="h-5 w-5 text-accent" />
							</div>
							<h1 className="text-3xl font-bold tracking-tight text-foreground">
								Templates
							</h1>
						</div>
						<p className="text-muted-foreground max-w-xl">
							Create and manage custom prompts for your social media posts. Templates help you maintain consistent formatting and messaging across platforms.
						</p>
					</div>
					
					{viewMode === 'list' && (
						<Button
							onClick={handleCreateClick}
							className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm"
						>
							<Plus className="h-4 w-4" />
							New Template
						</Button>
					)}
				</div>

				{/* Main Content */}
				{viewMode === 'list' ? (
					<div className="space-y-6">
						{/* Default Template Section (shown when no custom templates) */}
						{!hasTemplates && (
							<div className="space-y-4">
								<div className="flex items-center gap-2 text-sm text-muted-foreground">
									<Sparkles className="h-4 w-4 text-accent" />
									<span>Get started with our default template</span>
								</div>
								<TemplateCard template={defaultTemplate} index={0} />
							</div>
						)}

						{/* Templates Grid */}
						{templates.length > 0 ? (
							<div className="grid gap-4">
								{templates.map((template, index) => (
									<TemplateCard
										key={template.id}
										template={template}
										onEdit={handleEditClick}
										index={index}
									/>
								))}
							</div>
						) : (
							<EmptyState onCreateClick={handleCreateClick} />
						)}
					</div>
				) : (
					<TemplateForm
						template={editingTemplate}
						onSubmit={handleFormSubmit}
						onCancel={handleFormCancel}
					/>
				)}
			</div>
		</MainLayout>
	);
}

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
	return (
		<div className="rounded-xl border border-dashed border-border/50 bg-gradient-to-br from-card to-muted/20 p-12 text-center">
			<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 mb-6">
				<Layers className="h-8 w-8 text-accent" />
			</div>
			<h3 className="text-lg font-semibold text-foreground mb-2">
				No templates yet
			</h3>
			<p className="text-muted-foreground max-w-md mx-auto mb-6">
				Create your first template to streamline your content creation process. Templates help you maintain consistent messaging and formatting.
			</p>
			<Button
				onClick={onCreateClick}
				className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
			>
				<Plus className="h-4 w-4" />
				Create Your First Template
			</Button>
		</div>
	);
}
