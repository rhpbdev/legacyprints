// File: @/components/TextSettings.tsx
import { useState, useEffect, ChangeEvent } from 'react';
import { Input } from './ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from './ui/select';
import * as fabric from 'fabric';
import { getAllAvailableFonts, isFontLoaded } from '@/utils/customFonts';

const normalizeSelectValue = (value: unknown): string => {
	return typeof value === 'string' && value.trim() !== '' ? value : '';
};

// Define text align type
type TextAlign = 'left' | 'center' | 'right' | 'justify';

// Use fabric.js built-in text types
type TextObject = fabric.Text | fabric.IText | fabric.Textbox;

interface TextSettingsProps {
	canvas: fabric.Canvas | null;
}

const TextSettings = ({ canvas }: TextSettingsProps) => {
	const [fontSize, setFontSize] = useState<string>('');
	const [fontFamily, setFontFamily] = useState<string>('');
	const [textAlign, setTextAlign] = useState<TextAlign>('left');
	const [color, setColor] = useState<string>('#000000');
	const [hasActiveTextObject, setHasActiveTextObject] = useState(false);
	const [activeObject, setActiveObject] = useState<TextObject | null>(null);
	const [availableFonts, setAvailableFonts] = useState<string[]>([]);

	// Load available fonts on mount
	useEffect(() => {
		setAvailableFonts(getAllAvailableFonts());
	}, []);

	useEffect(() => {
		if (!canvas) {
			console.log('TextSettings: No canvas available');
			return;
		}

		console.log('TextSettings: Canvas available, setting up listeners');

		const updateTextSettings = () => {
			const obj = canvas.getActiveObject();
			console.log('TextSettings: Selection changed, active object:', obj);

			// Check for all text-based object types
			if (
				obj &&
				(obj.type === 'text' || obj.type === 'i-text' || obj.type === 'textbox')
			) {
				const textObj = obj as TextObject;
				console.log('TextSettings: Text object selected', {
					type: textObj.type,
					text: textObj.text,
					fontSize: textObj.fontSize,
					fontFamily: textObj.fontFamily,
					textAlign: textObj.textAlign,
				});

				setHasActiveTextObject(true);
				setActiveObject(textObj);
				setFontSize(textObj.fontSize?.toString() ?? '20');
				setFontFamily(normalizeSelectValue(textObj.fontFamily));
				setTextAlign((textObj.textAlign as TextAlign) ?? 'left');

				// Handle fill color - check if it's a string
				if (typeof textObj.fill === 'string') {
					setColor(textObj.fill);
				} else {
					setColor('#000000');
				}
			} else {
				console.log('TextSettings: Non-text object or no object selected');
				setHasActiveTextObject(false);
				setActiveObject(null);
			}
		};

		// Update settings when selection changes
		const handleSelectionCreated = () => updateTextSettings();
		const handleSelectionUpdated = () => updateTextSettings();
		const handleSelectionCleared = () => {
			console.log('TextSettings: Selection cleared');
			setHasActiveTextObject(false);
			setActiveObject(null);
		};
		const handleObjectModified = (
			e: fabric.ModifiedEvent<fabric.TPointerEvent>
		) => {
			if (e.target === activeObject) {
				updateTextSettings();
			}
		};

		canvas.on('selection:created', handleSelectionCreated);
		canvas.on('selection:updated', handleSelectionUpdated);
		canvas.on('selection:cleared', handleSelectionCleared);
		canvas.on('object:modified', handleObjectModified);

		// Check initial selection
		updateTextSettings();

		// Cleanup
		return () => {
			console.log('TextSettings: Cleaning up listeners');
			canvas.off('selection:created', handleSelectionCreated);
			canvas.off('selection:updated', handleSelectionUpdated);
			canvas.off('selection:cleared', handleSelectionCleared);
			canvas.off('object:modified', handleObjectModified);
		};
	}, [canvas, activeObject]);

	const handleFontSizeChange = (e: ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setFontSize(value);

		if (activeObject && canvas) {
			const size = parseInt(value, 10);
			if (!isNaN(size) && size > 0) {
				console.log('TextSettings: Changing font size to', size);
				activeObject.set({ fontSize: size } as Partial<TextObject>);
				canvas.requestRenderAll();
			}
		}
	};

	const handleFontFamilyChange = async (value: string) => {
		setFontFamily(value);

		if (activeObject && canvas) {
			console.log('TextSettings: Changing font family to', value);

			// Check if font is already loaded, if not try to load it
			if (!isFontLoaded(value)) {
				try {
					await document.fonts.load(`16px "${value}"`);
				} catch (e) {
					console.warn('Font load error:', e);
				}
			}

			activeObject.set({ fontFamily: value } as Partial<TextObject>);
			canvas.requestRenderAll();
		}
	};

	const handleTextAlignChange = (value: string) => {
		const alignValue = value as TextAlign;
		setTextAlign(alignValue);

		if (activeObject && canvas) {
			console.log('TextSettings: Changing text align to', alignValue);
			activeObject.set({ textAlign: alignValue } as Partial<TextObject>);
			canvas.requestRenderAll();
		}
	};

	const handleColorChange = (e: ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setColor(value);

		if (activeObject && canvas) {
			console.log('TextSettings: Changing color to', value);
			activeObject.set({ fill: value } as Partial<TextObject>);
			canvas.requestRenderAll();
		}
	};

	// Debug info
	console.log('TextSettings render:', {
		hasCanvas: !!canvas,
		hasActiveTextObject,
		activeObject: activeObject?.type,
		textAlign: textAlign,
	});

	// Only show settings when a text object is selected
	if (!canvas || !hasActiveTextObject) {
		return (
			<div className='hidden gap-4 p-4 border rounded-lg opacity-50'>
				<div>
					<span className='font-bold text-gray-500'>Text Settings</span>
					<p className='text-sm text-gray-400 mt-1'>
						Select a text object to edit
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className='flex justify-center gap-2 rounded-lg'>
			<div className='flex flex-col gap-2'>
				<Input
					type='number'
					value={fontSize}
					id='fontSize'
					onChange={handleFontSizeChange}
					placeholder='Font Size'
					min='8'
					max='200'
				/>
			</div>

			<div className='flex flex-col gap-2'>
				<Select value={fontFamily} onValueChange={handleFontFamilyChange}>
					<SelectTrigger className='w-full'>
						<SelectValue placeholder='Select a font family' />
					</SelectTrigger>
					<SelectContent>
						{availableFonts.map((font) => (
							<SelectItem key={font} value={font}>
								{font}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className='flex flex-col gap-2'>
				<Select value={textAlign} onValueChange={handleTextAlignChange}>
					<SelectTrigger className='w-full'>
						<SelectValue placeholder='Text Alignment' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='left'>Left</SelectItem>
						<SelectItem value='center'>Center</SelectItem>
						<SelectItem value='right'>Right</SelectItem>
						<SelectItem value='justify'>Justify</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className='flex flex-col gap-2'>
				<Input
					type='color'
					value={color}
					id='textColor'
					onChange={handleColorChange}
					className='w-10 cursor-pointer'
				/>
			</div>
		</div>
	);
};

export default TextSettings;
