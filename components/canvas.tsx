// File: @/components/canvas.tsx
'use client';
import { useThemedCanvas } from '@/hooks/useThemedCanvas';
import { useState, useEffect, useCallback } from 'react';
import SaveCanvasButton from './SaveCanvasButton';
import { useSearchParams } from 'next/navigation';
import { getMemorialProductData } from '@/data/getMemorialProductData';
import { Button } from './ui/button';
import DeleteObject from './DeleteObjectButton';
import TextSettings from './TextSettings';

interface Theme {
	id: number;
	name: string;
	type: 'trifold' | 'bifold';
	description: string;
	data: {
		pages: Array<{
			objects: string[];
			version: string;
			background?: string;
			backgroundImage?: string;
		}>;
	};
	isActive?: boolean;
}

interface Memorial {
	id: number;
	userId: string;
	deceasedName: string;
	deceasedPhotoUrl: string;
	quantity: string;
	sunriseDate: string;
	sunsetDate: string;
	serviceDate: string;
	serviceTime: string;
	serviceLocation: string;
	serviceAddress: string;
	themeId: number;
}

interface CanvasCopilotProps {
	theme: Theme;
	memorial: Memorial;
}

type CanvasData = Theme['data'];

const Canvas = ({ theme, memorial }: CanvasCopilotProps) => {
	const searchParams = useSearchParams();
	const productId = searchParams.get('product');
	const [savedData, setSavedData] = useState<CanvasData | null>(null);
	const [isLoadingSavedData, setIsLoadingSavedData] = useState(true);

	// Fetch saved data on mount
	useEffect(() => {
		const fetchSavedData = async () => {
			if (!productId) {
				setIsLoadingSavedData(false);
				return;
			}

			try {
				const data = await getMemorialProductData(memorial.id, productId);

				if (
					!data.error &&
					data.saved_data &&
					Object.keys(data.saved_data).length > 0
				) {
					setSavedData(data.saved_data as CanvasData);
				}
			} catch (error) {
				console.error('Error fetching saved data:', error);
			} finally {
				setIsLoadingSavedData(false);
			}
		};

		fetchSavedData();
	}, [memorial.id, productId]);

	// Determine which data to use for the canvas
	const canvasData = savedData || theme.data;

	const {
		canvasRef,
		currentPage,
		totalPages,
		isLoading,
		dimensions,
		previousPage,
		nextPage,
		canHavePreviousPage,
		canHaveNextPage,
		fabricCanvas,
	} = useThemedCanvas({
		theme: { ...theme, data: canvasData }, // Use saved data if available, otherwise theme data
		memorial,
		onPageLoad: useCallback((pageIndex: number) => {
			console.log(`Canvas component: Page ${pageIndex + 1} loaded`);
		}, []),
	});

	const [isInitialLoad, setIsInitialLoad] = useState(true);

	useEffect(() => {
		if (!isLoading && !isLoadingSavedData && isInitialLoad) {
			setIsInitialLoad(false);
		}
	}, [isLoading, isLoadingSavedData, isInitialLoad]);

	const showLoading = (isLoading || isLoadingSavedData) && isInitialLoad;

	return (
		<div className='canvas-container'>
			{/* Toolbar */}
			<div className='flex align-center justify-center border-b-2 p-6 space-x-16'>
				{/* Settings panel */}
				<div>
					<TextSettings canvas={fabricCanvas} />
				</div>
				<div className='flex gap-2'>
					<Button variant='outline' className='cursor-pointer'>
						Add Photos
					</Button>
					<Button variant='outline' className='cursor-pointer'>
						Select a Background
					</Button>
					<Button variant='outline' className='cursor-pointer'>
						Select a Poem
					</Button>
					<DeleteObject canvas={fabricCanvas} />
				</div>
				<div className='flex gap-2'>
					<SaveCanvasButton
						fabricCanvas={fabricCanvas}
						memorialId={memorial.id}
						disabled={isLoading || isLoadingSavedData}
						currentPageIndex={currentPage}
						existingData={canvasData}
					/>
					<Button variant='outline' className='cursor-pointer'>
						Load Design
					</Button>
				</div>
			</div>
			<div className='flex flex-col justify-start items-center top-0'>
				<div
					className='canvas-wrapper flex justify-center p-6'
					style={{ position: 'relative' }}>
					{showLoading && (
						<div
							style={{
								position: 'absolute',
								top: 0,
								left: 0,
								width: '100%',
								height: '100%',
								backgroundColor: 'rgba(255, 255, 255, 0.9)',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								zIndex: 10,
							}}>
							<div
								style={{
									textAlign: 'center',
									padding: '20px',
								}}>
								<div style={{ marginBottom: '10px' }}>
									{isLoadingSavedData
										? 'Loading saved design...'
										: 'Loading theme...'}
								</div>
								<div
									style={{
										width: '40px',
										height: '40px',
										border: '3px solid #f3f3f3',
										borderTop: '3px solid #3498db',
										borderRadius: '50%',
										animation: 'spin 1s linear infinite',
										margin: '0 auto',
									}}
								/>
							</div>
						</div>
					)}
					<canvas
						ref={canvasRef}
						width={dimensions.width}
						height={dimensions.height}
						style={{
							border: '1px solid #ccc',
							borderRadius: '4px',
							boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
						}}
					/>
				</div>
			</div>

			{totalPages > 1 && (
				<div
					className='page-controls pb-4'
					style={{
						display: 'flex',
						gap: '10px',
						alignItems: 'center',
						justifyContent: 'center',
					}}>
					<Button
						onClick={previousPage}
						disabled={!canHavePreviousPage || isLoading}
						style={{
							backgroundColor:
								!canHavePreviousPage || isLoading ? '#f5f5f5' : '#fff',
							cursor:
								!canHavePreviousPage || isLoading ? 'not-allowed' : 'pointer',
							opacity: !canHavePreviousPage || isLoading ? 0.5 : 1,
							transition: 'all 0.2s ease',
						}}
						variant={'outline'}>
						← Previous Page
					</Button>

					<span
						style={{
							padding: '8px 16px',
							backgroundColor: '#f0f0f0',
							borderRadius: '4px',
							fontWeight: 500,
						}}>
						Page {currentPage + 1} of {totalPages}
					</span>

					<Button
						onClick={nextPage}
						disabled={!canHaveNextPage || isLoading}
						style={{
							border: '1px solid #ddd',
							backgroundColor:
								!canHaveNextPage || isLoading ? '#f5f5f5' : '#fff',
							cursor: !canHaveNextPage || isLoading ? 'not-allowed' : 'pointer',
							opacity: !canHaveNextPage || isLoading ? 0.5 : 1,
							transition: 'all 0.2s ease',
						}}
						variant={'outline'}>
						Next Page →
					</Button>
				</div>
			)}

			<style jsx>{`
				@keyframes spin {
					0% {
						transform: rotate(0deg);
					}
					100% {
						transform: rotate(360deg);
					}
				}
			`}</style>
		</div>
	);
};

export default Canvas;
