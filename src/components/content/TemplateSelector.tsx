'use client';

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { mockTemplates, type Template } from '@/lib/mock-data/templates';

interface TemplateSelectorProps {
	value?: string;
	onValueChange: (value: string) => void;
}

export function TemplateSelector({
	value,
	onValueChange,
}: TemplateSelectorProps) {
	return (
		<div className='space-y-2'>
			<Label htmlFor='template-select' className='text-base font-semibold'>
				Select Template
			</Label>
			<Select value={value} onValueChange={onValueChange}>
				<SelectTrigger id='template-select' className='w-full'>
					<SelectValue placeholder='Choose a template (optional)' />
				</SelectTrigger>
				<SelectContent>
					{mockTemplates.map((template) => (
						<SelectItem key={template.id} value={template.id}>
							<div className='flex flex-col'>
								<span className='font-medium'>{template.name}</span>
								<span className='text-xs text-muted-foreground'>
									{template.description}
								</span>
							</div>
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<p className='text-sm text-muted-foreground'>
				Select a template to format your content. You can create custom templates
				on the Templates page.
			</p>
		</div>
	);
}

