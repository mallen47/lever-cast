'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Check, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAllPlatforms, getPlatformConfig } from '@/lib/platforms';
import type { Template, TemplateFormData, PlatformPrompt } from '@/types/templates';
import type { PlatformId } from '@/types/platforms';

interface TemplateFormProps {
	/** Template to edit, or undefined for create mode */
	template?: Template;
	/** Callback when form is submitted */
	onSubmit: (data: TemplateFormData) => void;
	/** Callback when form is cancelled */
	onCancel: () => void;
	/** Whether the form is in a loading state */
	isLoading?: boolean;
}

const initialFormData: TemplateFormData = {
	name: '',
	description: '',
	platformSupport: [],
	platformPrompts: [],
};

export function TemplateForm({ template, onSubmit, onCancel, isLoading = false }: TemplateFormProps) {
	const [formData, setFormData] = useState<TemplateFormData>(initialFormData);
	const [errors, setErrors] = useState<Partial<Record<keyof TemplateFormData, string>>>({});
	
	const isEditMode = !!template;
	const platforms = getAllPlatforms();

	// Initialize form with template data when editing
	useEffect(() => {
		if (template) {
			setFormData({
				name: template.name,
				description: template.description,
				platformSupport: [...template.platformSupport],
				platformPrompts: [...template.platformPrompts],
			});
		} else {
			setFormData(initialFormData);
		}
	}, [template]);

	const handlePlatformToggle = (platformId: PlatformId) => {
		setFormData(prev => {
			const isSelected = prev.platformSupport.includes(platformId);
			
			if (isSelected) {
				// Remove platform and its prompt
				return {
					...prev,
					platformSupport: prev.platformSupport.filter(id => id !== platformId),
					platformPrompts: prev.platformPrompts.filter(p => p.platformId !== platformId),
				};
			} else {
				// Add platform with empty prompt
				return {
					...prev,
					platformSupport: [...prev.platformSupport, platformId],
					platformPrompts: [...prev.platformPrompts, { platformId, prompt: '' }],
				};
			}
		});
		
		// Clear platform error when selection changes
		if (errors.platformSupport) {
			setErrors(prev => ({ ...prev, platformSupport: undefined }));
		}
	};

	const handlePromptChange = (platformId: PlatformId, prompt: string) => {
		setFormData(prev => ({
			...prev,
			platformPrompts: prev.platformPrompts.map(p =>
				p.platformId === platformId ? { ...p, prompt } : p
			),
		}));
	};

	const getPromptForPlatform = (platformId: PlatformId): string => {
		const platformPrompt = formData.platformPrompts.find(p => p.platformId === platformId);
		return platformPrompt?.prompt ?? '';
	};

	const validateForm = (): boolean => {
		const newErrors: Partial<Record<keyof TemplateFormData, string>> = {};

		if (!formData.name.trim()) {
			newErrors.name = 'Template name is required';
		}

		if (!formData.description.trim()) {
			newErrors.description = 'Description is required';
		}

		if (formData.platformSupport.length === 0) {
			newErrors.platformSupport = 'Select at least one platform';
		}

		// Check if all selected platforms have prompts
		const missingPrompts = formData.platformSupport.some(platformId => {
			const prompt = getPromptForPlatform(platformId);
			return !prompt.trim();
		});

		if (missingPrompts) {
			newErrors.platformPrompts = 'All selected platforms must have a prompt';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		
		if (validateForm()) {
			onSubmit(formData);
		}
	};

	return (
		<Card className="animate-in fade-in slide-in-from-top-4 duration-300 border-accent/20">
			<CardHeader className="border-b border-border/50 pb-6">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
						<FileText className="h-5 w-5 text-accent" />
					</div>
					<div>
						<CardTitle className="text-xl">
							{isEditMode ? 'Edit Template' : 'Create New Template'}
						</CardTitle>
						<CardDescription>
							{isEditMode 
								? 'Update your template settings and prompts'
								: 'Define custom prompts for each platform to streamline your content creation'
							}
						</CardDescription>
					</div>
				</div>
			</CardHeader>

			<form onSubmit={handleSubmit}>
				<CardContent className="space-y-8 pt-6">
					{/* Title Field */}
					<div className="space-y-2">
						<Label htmlFor="template-name" className="text-sm font-medium">
							Template Title
						</Label>
						<Input
							id="template-name"
							placeholder="e.g., Professional Announcement"
							value={formData.name}
							onChange={(e) => {
								setFormData(prev => ({ ...prev, name: e.target.value }));
								if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
							}}
							className={cn(errors.name && 'border-destructive')}
							disabled={isLoading}
						/>
						{errors.name && (
							<p className="text-sm text-destructive animate-in fade-in slide-in-from-top-1">
								{errors.name}
							</p>
						)}
					</div>

					{/* Description Field */}
					<div className="space-y-2">
						<Label htmlFor="template-description" className="text-sm font-medium">
							Description
						</Label>
						<Textarea
							id="template-description"
							placeholder="Describe what this template is best used for..."
							value={formData.description}
							onChange={(e) => {
								setFormData(prev => ({ ...prev, description: e.target.value }));
								if (errors.description) setErrors(prev => ({ ...prev, description: undefined }));
							}}
							className={cn('min-h-20 resize-none', errors.description && 'border-destructive')}
							disabled={isLoading}
						/>
						{errors.description && (
							<p className="text-sm text-destructive animate-in fade-in slide-in-from-top-1">
								{errors.description}
							</p>
						)}
					</div>

					{/* Platform Selection */}
					<div className="space-y-3">
						<div>
							<Label className="text-sm font-medium">Platforms</Label>
							<p className="text-sm text-muted-foreground mt-0.5">
								Select the platforms this template will be used for
							</p>
						</div>
						<div className="flex flex-wrap gap-3">
							{platforms.map((platform) => {
								const Icon = platform.icon;
								const isSelected = formData.platformSupport.includes(platform.id);
								return (
									<Button
										key={platform.id}
										type="button"
										variant={isSelected ? 'default' : 'outline'}
										className={cn(
											'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all',
											isSelected
												? 'bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm'
												: 'border-border text-muted-foreground hover:text-foreground hover:border-accent/50'
										)}
										onClick={() => handlePlatformToggle(platform.id)}
										disabled={isLoading}
										aria-pressed={isSelected}
									>
										<Icon className="h-4 w-4" />
										<span>{platform.name}</span>
										{isSelected && <Check className="h-3.5 w-3.5 ml-1" />}
									</Button>
								);
							})}
						</div>
						{errors.platformSupport && (
							<p className="text-sm text-destructive animate-in fade-in slide-in-from-top-1">
								{errors.platformSupport}
							</p>
						)}
					</div>

					{/* Platform-Specific Prompts */}
					{formData.platformSupport.length > 0 && (
						<div className="space-y-4">
							<div>
								<Label className="text-sm font-medium">Platform Prompts</Label>
								<p className="text-sm text-muted-foreground mt-0.5">
									Define a custom prompt for each selected platform
								</p>
							</div>
							
							<div className="space-y-4">
								{formData.platformSupport.map((platformId, index) => {
									const platform = getPlatformConfig(platformId);
									const Icon = platform.icon;
									const prompt = getPromptForPlatform(platformId);
									
									return (
										<div 
											key={platformId}
											className="rounded-lg border border-border/50 bg-muted/30 p-4 space-y-3 animate-in fade-in slide-in-from-left-2"
											style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
										>
											<div className="flex items-center gap-2">
												<Badge 
													variant="outline" 
													className="gap-1.5 py-1.5 px-3 bg-background"
												>
													<Icon className="h-4 w-4" />
													{platform.name}
												</Badge>
												{platform.characterLimit && (
													<span className="text-xs text-muted-foreground">
														{platform.characterLimit} char limit
													</span>
												)}
											</div>
											<Textarea
												placeholder={`Enter your ${platform.name} prompt template...\n\nTip: Include formatting instructions, hashtags, emojis, and structure guidelines.`}
												value={prompt}
												onChange={(e) => handlePromptChange(platformId, e.target.value)}
												className={cn(
													'min-h-32 resize-none bg-background',
													errors.platformPrompts && !prompt.trim() && 'border-destructive'
												)}
												disabled={isLoading}
											/>
										</div>
									);
								})}
							</div>
							
							{errors.platformPrompts && (
								<p className="text-sm text-destructive animate-in fade-in slide-in-from-top-1">
									{errors.platformPrompts}
								</p>
							)}
						</div>
					)}

					{/* Form Actions */}
					<div className="flex items-center justify-end gap-3 pt-4 border-t border-border/50">
						<Button
							type="button"
							variant="ghost"
							onClick={onCancel}
							disabled={isLoading}
							className="gap-2"
						>
							<X className="h-4 w-4" />
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={isLoading}
							className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
						>
							<Check className="h-4 w-4" />
							{isEditMode ? 'Save Changes' : 'Create Template'}
						</Button>
					</div>
				</CardContent>
			</form>
		</Card>
	);
}

