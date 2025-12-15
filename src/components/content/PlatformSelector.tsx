'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { getAllPlatforms } from '@/lib/platforms';
import type { PlatformId } from '@/types';

interface PlatformSelectorProps {
	selectedPlatforms: PlatformId[];
	onToggle: (platformId: PlatformId) => void;
	/** Whether the platform selector is disabled (no template selected) */
	disabled?: boolean;
}

export function PlatformSelector({
	selectedPlatforms,
	onToggle,
	disabled = false,
}: PlatformSelectorProps) {
	const platforms = getAllPlatforms();

	return (
		<div className='space-y-3'>
			<div className='flex items-center gap-2'>
				<Label className='text-base font-semibold'>
					Select Platforms
				</Label>
				{disabled && (
					<span className='text-xs text-muted-foreground'>
						(Select a template first)
					</span>
				)}
			</div>
			<div className='flex flex-wrap gap-3'>
				{platforms.map((platform) => {
					const Icon = platform.icon;
					const isSelected = selectedPlatforms.includes(platform.id);
					return (
						<Button
							key={platform.id}
							type='button'
							variant={isSelected ? 'default' : 'outline'}
							disabled={disabled}
							className={cn(
								'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors',
								isSelected
									? 'bg-accent text-accent-foreground hover:bg-accent/90'
									: 'border-border text-muted-foreground hover:text-foreground',
								disabled && 'cursor-not-allowed opacity-50'
							)}
							onClick={() => onToggle(platform.id)}
							aria-pressed={isSelected}
							aria-label={`${
								isSelected ? 'Deselect' : 'Select'
							} ${platform.name}`}
						>
							<Icon className='h-4 w-4' />
							<span>{platform.name}</span>
						</Button>
					);
				})}
			</div>
		</div>
	);
}
