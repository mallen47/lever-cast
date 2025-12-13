'use client';

import { useState, useEffect, useCallback } from 'react';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { fetchTemplates } from '@/lib/services/api/templates';
import type { Template } from '@/types/templates';

interface TemplateSelectorProps {
	value?: string;
	onValueChange: (value: string) => void;
	/** Called when template selection changes with the full template object (or null if cleared) */
	onTemplateChange?: (template: Template | null) => void;
}

export function TemplateSelector({
	value,
	onValueChange,
	onTemplateChange,
}: TemplateSelectorProps) {
	const [templates, setTemplates] = useState<Template[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function loadTemplates() {
			try {
				setIsLoading(true);
				setError(null);
				const data = await fetchTemplates();
				setTemplates(data);
			} catch (err) {
				console.error('Failed to load templates:', err);
				setError('Failed to load templates');
			} finally {
				setIsLoading(false);
			}
		}

		loadTemplates();
	}, []);

	const handleValueChange = useCallback(
		(newValue: string) => {
			onValueChange(newValue);

			// Find and pass the full template object
			if (onTemplateChange) {
				const selectedTemplate = templates.find(
					(t) => t.id === newValue
				);
				onTemplateChange(selectedTemplate ?? null);
			}
		},
		[onValueChange, onTemplateChange, templates]
	);

	// Sync template data when value changes externally (e.g., from URL param)
	useEffect(() => {
		if (value && templates.length > 0 && onTemplateChange) {
			const selectedTemplate = templates.find((t) => t.id === value);
			if (selectedTemplate) {
				onTemplateChange(selectedTemplate);
			}
		}
	}, [value, templates, onTemplateChange]);

	if (error) {
		return (
			<div className='space-y-2'>
				<Label className='text-base font-semibold'>
					Select Template
				</Label>
				<p className='text-sm text-destructive'>{error}</p>
			</div>
		);
	}

	const hasTemplates = templates.length > 0;

	return (
		<div className='space-y-2'>
			<Label
				htmlFor='template-select'
				className='text-base font-semibold'
			>
				Select Template
			</Label>
			<Select
				value={value}
				onValueChange={handleValueChange}
				disabled={isLoading || !hasTemplates}
			>
				<SelectTrigger id='template-select' className='w-full'>
					{isLoading ? (
						<div className='flex items-center gap-2'>
							<Loader2 className='h-4 w-4 animate-spin' />
							<span>Loading templates...</span>
						</div>
					) : !hasTemplates ? (
						<span className='text-muted-foreground'>
							No templates available
						</span>
					) : (
						<SelectValue placeholder='Choose a template' />
					)}
				</SelectTrigger>
				<SelectContent>
					{templates.map((template) => (
						<SelectItem key={template.id} value={template.id}>
							<div className='flex flex-col'>
								<span className='font-medium'>
									{template.name}
								</span>
								<span className='text-xs text-muted-foreground'>
									{template.description}
								</span>
							</div>
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			{!isLoading && !hasTemplates && (
				<p className='text-xs text-muted-foreground'>
					Create a template first to start posting.
				</p>
			)}
		</div>
	);
}
