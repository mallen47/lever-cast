'use client';

import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface ContentInputProps {
	value: string;
	onChange: (value: string) => void;
	onGenerate: () => void;
	isGenerating?: boolean;
}

export function ContentInput({
	value,
	onChange,
	onGenerate,
	isGenerating = false,
}: ContentInputProps) {
	return (
		<div className='space-y-4'>
			<div className='flex items-center justify-between'>
				<Label htmlFor='content-input' className='text-base font-semibold'>
					Enter your content idea
				</Label>
				<Button
					onClick={onGenerate}
					disabled={!value.trim() || isGenerating}
					size="sm"
				>
					<Sparkles className='h-4 w-4' />
					{isGenerating ? 'Generating...' : 'Generate Content'}
				</Button>
			</div>
			<Textarea
				id='content-input'
				placeholder='Type your raw content ideas here... e.g., "Just launched my new SaaS product! Excited to share this with everyone."'
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className='min-h-[200px] resize-none text-base'
			/>
			<p className='text-sm text-muted-foreground'>
				Enter your ideas and click "Generate Content" to create platform-specific
				formats.
			</p>
		</div>
	);
}

