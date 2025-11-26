'use client';

import React from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: string;
	confirmText?: string;
	cancelText?: string;
	variant?: 'default' | 'destructive';
	onConfirm: () => void;
}

export function ConfirmationModal({
	open,
	onOpenChange,
	title,
	description,
	confirmText = 'Confirm',
	cancelText = 'Cancel',
	variant = 'default',
	onConfirm,
}: ConfirmationModalProps) {
	const handleConfirm = () => {
		onConfirm();
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='sm:max-w-[425px]' showCloseButton={false}>
				<DialogHeader>
					<div className='flex items-center gap-3'>
						{variant === 'destructive' && (
							<div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10'>
								<AlertTriangle className='h-5 w-5 text-destructive' />
							</div>
						)}
						<div className='flex-1'>
							<DialogTitle>{title}</DialogTitle>
							<DialogDescription className='mt-2'>
								{description}
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>
				<DialogFooter className='gap-3'>
					<Button
						variant='outline'
						onClick={() => onOpenChange(false)}
					>
						{cancelText}
					</Button>
					<Button
						variant={variant === 'destructive' ? 'destructive' : 'default'}
						onClick={handleConfirm}
					>
						{confirmText}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

