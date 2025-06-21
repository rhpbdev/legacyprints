// // File: components/memorial-canvas.tsx
'use client';

import { Canvas as FabricCanvas, FabricImage } from 'fabric';
import { useRef, useCallback, useEffect, useState } from 'react';
import { Canvas } from '@/components/canvas';

// Types based on your database structure
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
	is_active?: boolean;
}

interface MemorialCanvasProps {
	memorial: Memorial;
	theme: Theme;
	currentPage?: number;
	is_active?: boolean;
}

// Canvas dimensions based on theme type
const getCanvasDimensions = (themeType: string) => {
	switch (themeType) {
		case 'trifold':
			return { width: 1200, height: 800 }; // Adjust as needed
		case 'bifold':
			return { width: 800, height: 600 }; // Adjust as needed
		default:
			return { width: 800, height: 600 };
	}
};

export const MemorialCanvas: React.FC<MemorialCanvasProps> = ({
	memorial,
	theme,
	currentPage = 0,
}) => {
	const canvasRef = useRef<FabricCanvas>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const loadThemeData = useCallback(
		async (canvas: FabricCanvas) => {
			if (!theme.data?.pages || theme.data.pages.length === 0) {
				setError('No theme data available');
				return;
			}

			setIsLoading(true);
			setError(null);

			try {
				// Get the current page data
				const pageData = theme.data.pages[currentPage];
				if (!pageData) {
					setError(`Page ${currentPage} not found in theme data`);
					return;
				}

				// Clear the canvas
				canvas.clear();

				// Set canvas dimensions based on theme type
				const dimensions = getCanvasDimensions(theme.type);
				canvas.setDimensions(dimensions);

				// Format date helper function
				const formatDate = (dateString: string) => {
					if (!dateString) return '';
					const date = new Date(dateString);
					return date.toLocaleDateString('en-US', {
						year: 'numeric',
						month: 'long',
						day: 'numeric',
					});
				};

				// Process objects and replace template variables
				const processedObjects = pageData.objects.map((obj: any) => {
					// Handle text objects
					if (
						obj.type === 'IText' ||
						obj.type === 'Textbox' ||
						obj.type === 'textbox' ||
						obj.type === 'i-text' ||
						obj.type === 'text'
					) {
						let text = obj.text || '';

						const replacedText = text
							.replace(
								/\{\{deceasedName\}\}/g,
								memorial?.deceasedName || 'Deceased Name'
							)
							.replace(
								/\{\{sunriseDate\}\}/g,
								memorial?.sunriseDate
									? formatDate(memorial.sunriseDate)
									: 'Sunrise Date'
							)
							.replace(
								/\{\{sunsetDate\}\}/g,
								memorial?.sunsetDate
									? formatDate(memorial.sunsetDate)
									: 'Sunset Date'
							)
							.replace(
								/\{\{serviceDate\}\}/g,
								memorial?.serviceDate
									? formatDate(memorial.serviceDate)
									: 'Service Date'
							)
							.replace(
								/\{\{serviceTime\}\}/g,
								memorial?.serviceTime || 'Service Time'
							)
							.replace(
								/\{\{serviceDatetime\}\}/g,
								memorial?.serviceDate && memorial?.serviceTime
									? `${formatDate(memorial.serviceDate)} at ${
											memorial.serviceTime
									  }`
									: 'Service Date/Time'
							)
							.replace(
								/\{\{serviceLocation\}\}/g,
								memorial?.serviceLocation || 'Service Location'
							)
							.replace(
								/\{\{serviceAddress\}\}/g,
								memorial?.serviceAddress || 'Service Address'
							);

						// Remove the 'type' property and return clean object
						const { type, ...cleanObj } = obj;
						return {
							...cleanObj,
							type: 'i-text', // Use lowercase as Fabric expects
							text: replacedText,
							editable: true,
							selectable: true,
							evented: true,
							hasControls: true,
							hasBorders: true,
							lockMovementX: false,
							lockMovementY: false,
							lockRotation: false,
							lockScalingX: false,
							lockScalingY: false,
						};
					}
					// Handle image objects
					else if (obj.type === 'Image' || obj.type === 'image') {
						let imageSrc = obj.src;

						// Replace deceased photo placeholder
						if (
							obj.name === 'deceased_cover_photo' &&
							memorial?.deceasedPhotoUrl
						) {
							imageSrc = memorial.deceasedPhotoUrl;
						}

						// Remove the 'type' property and return clean object
						const { type, ...cleanObj } = obj;
						return {
							...cleanObj,
							type: 'image', // Use lowercase as Fabric expects
							src: imageSrc || '/placeholder-image.jpg', // Add a placeholder if no image
							selectable: true,
							evented: true,
							hasControls: true,
							hasBorders: true,
							crossOrigin: 'anonymous',
						};
					}
					// Handle other object types
					else {
						// For other objects, just remove the type and return the rest
						const { type, ...cleanObj } = obj;
						return {
							...cleanObj,
							type: obj.type.toLowerCase(), // Ensure lowercase type
						};
					}
				});

				// Create JSON data for canvas
				const jsonData = {
					objects: processedObjects,
					background: pageData.background,
				};

				// Load the processed data into canvas using Promise-based API
				try {
					await canvas.loadFromJSON(jsonData);

					// Handle background image if it exists
					if (
						// @ts-expect-error src
						pageData.backgroundImage?.src ||
						(pageData.background && !pageData.background.startsWith('#'))
					) {
						const backgroundSrc =
							// @ts-expect-error src
							pageData.backgroundImage?.src || pageData.background;

						// Use Promise-based FabricImage.fromURL
						const img = await FabricImage.fromURL(backgroundSrc, {
							crossOrigin: 'anonymous',
						});
						canvas.set({
							background: img,
						});
					}

					canvas.renderAll();
				} catch (loadError) {
					console.error('Error during canvas.loadFromJSON:', loadError);
					throw loadError;
				}
			} catch (err) {
				console.error('Error loading theme data:', err);
				setError('Failed to load theme data');
			} finally {
				setIsLoading(false);
			}
		},
		[memorial, theme, currentPage]
	);

	const onCanvasLoad = useCallback(
		(canvas: FabricCanvas) => {
			loadThemeData(canvas);
		},
		[loadThemeData]
	);

	// Reload when currentPage changes
	useEffect(() => {
		if (canvasRef.current) {
			loadThemeData(canvasRef.current);
		}
	}, [currentPage, loadThemeData]);

	return (
		<div className='memorial-canvas-container'>
			{isLoading && (
				<div className='loading-overlay'>
					<p>Loading memorial design...</p>
				</div>
			)}

			{error && (
				<div
					className='error-message'
					style={{ color: 'red', padding: '10px' }}>
					Error: {error}
				</div>
			)}

			<div className='canvas-info' style={{ marginBottom: '10px' }}>
				<h3>{memorial.deceasedName}</h3>
				<p>
					Theme: {theme.name} ({theme.type})
				</p>
				<p>
					Page: {currentPage + 1} of {theme.data?.pages?.length || 0}
				</p>
			</div>

			<Canvas ref={canvasRef} onLoad={onCanvasLoad} />

			{theme.data?.pages && theme.data.pages.length > 1 && (
				<div className='page-navigation' style={{ marginTop: '10px' }}>
					{theme.data.pages.map((_, index) => (
						<button
							key={index}
							onClick={() => {
								// You would implement page changing logic here
								// This would typically update the currentPage prop
								console.log(`Switch to page ${index}`);
							}}
							style={{
								margin: '0 5px',
								padding: '5px 10px',
								backgroundColor: index === currentPage ? '#007bff' : '#f0f0f0',
								color: index === currentPage ? 'white' : 'black',
								border: '1px solid #ccc',
								borderRadius: '4px',
								cursor: 'pointer',
							}}>
							Page {index + 1}
						</button>
					))}
				</div>
			)}
		</div>
	);
};
