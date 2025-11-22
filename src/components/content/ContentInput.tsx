'use client';

import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ContentInputProps {
	value: string;
	onChange: (value: string) => void;
}

export function ContentInput({ value, onChange }: ContentInputProps) {
	return (
		<div className='space-y-4'>
			<Label htmlFor='content-input' className='text-base font-semibold'>
				Enter your content idea
			</Label>
			<Textarea
				id='content-input'
				placeholder='Type your raw content ideas here... e.g., "Just launched my new SaaS product! Excited to share this with everyone."'
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className='min-h-[200px] resize-none text-base'
			/>
		</div>
	);
}
