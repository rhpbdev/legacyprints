// components/SaveDesignButton.tsx
'use client';
import { useState } from 'react';
import { Canvas } from 'fabric';
import { useSearchParams } from 'next/navigation';
import { saveDesignData } from '@/data/saveDesignData';
import { Button } from './ui/button';

// Define the structure for page data
interface PageData {
	objects: unknown[];
	version: string;
	background?: string;
	backgroundImage?: string;
	[key: string]: unknown;
}

// Define the structure for existing saved data
interface ExistingDesignData {
	pages: PageData[];
	[key: string]: unknown;
}

interface SaveDesignButtonProps {
	fabricCanvas: Canvas | null;
	memorialId: number;
	currentPageIndex?: number;
	existingData?: ExistingDesignData;
	disabled?: boolean;
}

const SaveDesignButton = ({
	fabricCanvas,
	memorialId,
	currentPageIndex = 0,
	existingData,
	disabled,
}: SaveDesignButtonProps) => {
	const [isSaving, setIsSaving] = useState(false);
	const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>(
		'idle'
	);
	const searchParams = useSearchParams();
	const productId = searchParams.get('product');

	const handleSave = async () => {
		if (!fabricCanvas) {
			console.error('Canvas not available');
			return;
		}

		if (!productId) {
			console.error('Product ID not found in URL');
			setSaveStatus('error');
			return;
		}

		setIsSaving(true);
		setSaveStatus('idle');

		try {
			// Get current design data as JSON
			const currentDesignData = fabricCanvas.toJSON() as PageData;

			// Prepare the data structure with pages array
			let dataToSave: ExistingDesignData;

			if (existingData && existingData.pages) {
				// Update existing pages array
				const updatedPages = [...existingData.pages];

				// Ensure we have enough pages in the array
				while (updatedPages.length <= currentPageIndex) {
					updatedPages.push({
						objects: [],
						version: '6.7.0',
						background: '',
					});
				}

				// Update the current page
				updatedPages[currentPageIndex] = currentDesignData;

				dataToSave = {
					...existingData,
					pages: updatedPages,
				};
			} else {
				// Create new pages structure
				const pages: PageData[] = [];

				// Add empty pages before current index if needed
				for (let i = 0; i < currentPageIndex; i++) {
					pages.push({
						objects: [],
						version: '6.7.0',
						background: '',
					});
				}

				// Add current page
				pages.push(currentDesignData);

				dataToSave = {
					pages: pages,
				};
			}

			// Call server action to save data
			// @ts-expect-error dataToSave error
			const result = await saveDesignData(memorialId, productId, dataToSave);

			if (result.success) {
				setSaveStatus('success');
				console.log('Design saved successfully');
			} else {
				setSaveStatus('error');
				console.error('Failed to save design:', result.error);
			}
		} catch (error) {
			setSaveStatus('error');
			console.error('Error saving design:', error);
		} finally {
			setIsSaving(false);

			// Reset status after 3 seconds
			setTimeout(() => {
				setSaveStatus('idle');
			}, 3000);
		}
	};

	const getButtonText = () => {
		if (isSaving) return 'Saving...';
		if (saveStatus === 'success') return 'Saved!';
		if (saveStatus === 'error') return 'Error - Try Again';
		return 'Save Design';
	};

	const getButtonStyle = (): React.CSSProperties => {
		const baseStyle: React.CSSProperties = {
			cursor: disabled || isSaving ? 'not-allowed' : 'pointer',
			transition: 'all 0.2s ease',
			opacity: disabled || isSaving ? 0.6 : 1,
		};

		if (saveStatus === 'success') {
			return {
				...baseStyle,
				backgroundColor: '#10b981',
				color: 'white',
			};
		}

		if (saveStatus === 'error') {
			return {
				...baseStyle,
				backgroundColor: '#ef4444',
				color: 'white',
			};
		}

		return {
			...baseStyle,
			backgroundColor: '#3b82f6',
			color: 'white',
		};
	};

	// Don't render if no product ID
	if (!productId) {
		return null;
	}

	return (
		<Button
			onClick={handleSave}
			disabled={disabled || isSaving || !fabricCanvas}
			style={getButtonStyle()}
			onMouseOver={(e) => {
				if (!disabled && !isSaving && saveStatus === 'idle') {
					e.currentTarget.style.backgroundColor = '#2563eb';
				}
			}}
			onMouseOut={(e) => {
				if (!disabled && !isSaving && saveStatus === 'idle') {
					e.currentTarget.style.backgroundColor = '#3b82f6';
				}
			}}>
			{getButtonText()}
		</Button>
	);
};

export default SaveDesignButton;
