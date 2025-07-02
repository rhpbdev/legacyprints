// @/hooks/useThemedCanvas.ts
import { useEffect, useRef, useState, useCallback } from 'react';
import * as fabric from 'fabric';
import { loadCustomFonts } from '@/utils/customFonts';

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

interface UseThemedCanvasOptions {
	theme: Theme;
	onPageLoad?: (pageIndex: number) => void;
	memorial: Memorial;
}

// Type for fabric object with custom properties
interface FabricObjectWithCustomProps {
	text?: string;
	type: string;
	name?: string;
	src?: string;
	scaleX?: number;
	scaleY?: number;
	clipPath?: string;
	hasControls?: boolean;
	hasBorders?: boolean;
	lockScalingFlip?: boolean;
}

export const useThemedCanvas = ({
	theme,
	onPageLoad,
	memorial,
}: UseThemedCanvasOptions) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
	const [currentPage, setCurrentPage] = useState(0);
	const [totalPages, setTotalPages] = useState(0);
	const [isLoading, setIsLoading] = useState(true);
	const [fontsLoaded, setFontsLoaded] = useState(false);
	const isInitializedRef = useRef(false);
	const loadingRef = useRef(false);
	const isDisposedRef = useRef(false);

	// Memoize dimensions based on theme type only
	const dimensions =
		theme.type === 'trifold'
			? { width: 1100, height: 760 }
			: { width: 800, height: 600 };

	const replacePlaceholdersInJson = (
		json: {
			objects: FabricObjectWithCustomProps[];
			version: string;
			background?: string;
			backgroundImage?: string;
		},
		memorial: Memorial
	): typeof json => {
		const placeholderMap: Record<string, string> = {
			'{{deceasedName}}': memorial.deceasedName,
			'{{sunriseDate}}': memorial.sunriseDate,
			'{{sunsetDate}}': memorial.sunsetDate,
			'{{serviceDatetime}}': memorial.serviceDate,
			'{{serviceLocation}}': memorial.serviceLocation,
		};

		const deepClone = structuredClone(json);

		deepClone.objects = deepClone.objects.map(
			(obj: FabricObjectWithCustomProps) => {
				// Replace text fields
				if (typeof obj.text === 'string') {
					Object.entries(placeholderMap).forEach(([key, value]) => {
						obj.text = obj.text!.replaceAll(key, value);
					});
				}

				// Replace image source based on name and scale it
				if (
					obj.type?.toLowerCase() === 'image' &&
					obj.name === 'deceased_cover_photo'
				) {
					obj.src = memorial.deceasedPhotoUrl;
				}

				return obj;
			}
		);

		return deepClone;
	};

	// Load custom fonts before initializing canvas
	useEffect(() => {
		const loadFonts = async () => {
			try {
				console.log('Loading custom fonts...');
				await loadCustomFonts();
				setFontsLoaded(true);
				console.log('Custom fonts loaded successfully');
			} catch (error) {
				console.error('Error loading custom fonts:', error);
				// Still set as loaded to not block canvas initialization
				setFontsLoaded(true);
			}
		};

		loadFonts();
	}, []);

	// Initialize canvas - only after fonts are loaded
	useEffect(() => {
		// Early return if no canvas ref, theme data, or fonts not loaded
		if (!canvasRef.current || !theme?.data?.pages || !fontsLoaded) return;

		// Prevent re-initialization
		if (isInitializedRef.current) return;

		console.log('Initializing canvas with loaded fonts');
		isInitializedRef.current = true;
		isDisposedRef.current = false;

		// Create canvas with proper initialization
		const initCanvas = new fabric.Canvas(canvasRef.current, {
			width: dimensions.width,
			height: dimensions.height,
			backgroundColor: '#ffffff',
			renderOnAddRemove: true,
			selection: true,
			preserveObjectStacking: true,
		});

		// Render initial state
		initCanvas.renderAll();

		// Add ID tracking to objects
		const objectAddedHandler = (e: {
			target: fabric.Object & { id?: string };
		}) => {
			if (!e.target.id) {
				e.target.id = `obj_${Date.now()}_${Math.random()
					.toString(36)
					.substr(2, 9)}`;
			}
		};

		initCanvas.on('object:added', objectAddedHandler);

		// Store canvas reference
		fabricCanvasRef.current = initCanvas;
		setTotalPages(theme.data.pages.length);

		// Cleanup function - matches the example pattern
		return () => {
			console.log('Cleaning up canvas');
			isDisposedRef.current = true;

			// Remove event listeners before disposal
			initCanvas.off('object:added', objectAddedHandler);

			// Dispose the canvas
			initCanvas.dispose();

			// Clear references
			fabricCanvasRef.current = null;
			isInitializedRef.current = false;
		};
	}, [dimensions.width, dimensions.height, theme.data.pages, fontsLoaded]); // Added fontsLoaded dependency

	// Load page effect - with proper dependency management
	useEffect(() => {
		if (
			!fabricCanvasRef.current ||
			!theme?.data?.pages ||
			loadingRef.current ||
			isDisposedRef.current ||
			!fontsLoaded // Don't load pages until fonts are ready
		)
			return;

		const loadPageData = async () => {
			// Prevent concurrent loads
			if (loadingRef.current || isDisposedRef.current) return;
			loadingRef.current = true;

			const canvas = fabricCanvasRef.current;
			if (!canvas || !theme.data.pages[currentPage]) {
				loadingRef.current = false;
				return;
			}

			setIsLoading(true);

			try {
				const pageData = theme.data.pages[currentPage];
				console.log(`Loading page ${currentPage + 1} with custom fonts`);

				// Clear existing content
				canvas.clear();

				// Prepare the JSON data
				const rawJsonData = {
					version: pageData.version || '6.7.0',
					objects:
						(pageData.objects as unknown as FabricObjectWithCustomProps[]) ||
						[],
					background: pageData.background,
					backgroundImage: pageData.backgroundImage,
				};

				// Replace placeholders **before** loading into Fabric
				const jsonData = replacePlaceholdersInJson(rawJsonData, memorial);

				// Create a promise to handle the async loading
				await new Promise<void>((resolve) => {
					let resolved = false;

					// Set up timeout first
					const timeoutId = setTimeout(() => {
						if (!resolved) {
							resolved = true;
							console.log('Loading completed via timeout');
							resolve();
						}
					}, 300);

					// Load JSON
					canvas.loadFromJSON(jsonData, () => {
						// Check if canvas was disposed during loading
						if (isDisposedRef.current) {
							clearTimeout(timeoutId);
							resolved = true;
							resolve();
							return;
						}

						// This callback is called after all objects are added to canvas
						// Handle any images that need special treatment
						canvas.getObjects().forEach((object) => {
							if (object.type === 'image' || object.type === 'Image') {
								const img = object as fabric.Image;
								console.log('image', img);
								// Ensure image is rendered
								if (img.getElement && !img.getElement()) {
									console.log('image', img);
									canvas.requestRenderAll();
								}
							}
							// Ensure coordinates are set
							object.setCoords();
						});

						canvas.requestRenderAll();

						// Clear timeout and resolve
						clearTimeout(timeoutId);
						if (!resolved) {
							resolved = true;
							// Small delay to ensure rendering is complete
							setTimeout(() => {
								resolve();
							}, 50);
						}
					});
				});

				// Final render to ensure everything is visible
				// Only call calcOffset if canvas hasn't been disposed and has a valid element
				if (!isDisposedRef.current && canvas.getElement()) {
					canvas.calcOffset();
					canvas.requestRenderAll();
				}

				// Call the callback if provided
				if (onPageLoad && !isDisposedRef.current) {
					onPageLoad(currentPage);
				}

				console.log(`Page ${currentPage + 1} loaded successfully with fonts`);
			} catch (error) {
				console.error('Error loading page:', error);
			} finally {
				setIsLoading(false);
				loadingRef.current = false;
			}
		};

		// Small delay to debounce rapid changes
		const timeoutId = setTimeout(() => {
			loadPageData();
		}, 10);

		return () => {
			clearTimeout(timeoutId);
		};
	}, [
		currentPage,
		theme.id,
		theme.data.pages,
		onPageLoad,
		memorial,
		fontsLoaded,
	]);

	// Navigation functions
	const goToPage = useCallback(
		(pageIndex: number) => {
			if (pageIndex >= 0 && pageIndex < totalPages && !loadingRef.current) {
				setCurrentPage(pageIndex);
			}
		},
		[totalPages]
	);

	const nextPage = useCallback(() => {
		if (currentPage < totalPages - 1 && !loadingRef.current) {
			setCurrentPage((prev) => prev + 1);
		}
	}, [currentPage, totalPages]);

	const previousPage = useCallback(() => {
		if (currentPage > 0 && !loadingRef.current) {
			setCurrentPage((prev) => prev - 1);
		}
	}, [currentPage]);

	return {
		canvasRef,
		fabricCanvas: fabricCanvasRef.current,
		currentPage,
		totalPages,
		isLoading: isLoading || !fontsLoaded, // Include font loading in isLoading state
		dimensions,
		goToPage,
		nextPage,
		previousPage,
		canHavePreviousPage: currentPage > 0,
		canHaveNextPage: currentPage < totalPages - 1,
	};
};
