// File: components/upload-file.tsx
'use client';

import {
	ImageKitAbortError,
	ImageKitInvalidRequestError,
	ImageKitServerError,
	ImageKitUploadNetworkError,
	upload,
	UploadResponse,
	Image,
} from '@imagekit/next';
import { useRef, useState } from 'react';

export default function UploadFile() {
	const [progress, setProgress] = useState(0);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadStatus, setUploadStatus] = useState('');
	const [uploadedImage, setUploadedImage] = useState<UploadResponse>();

	const fileInputRef = useRef<HTMLInputElement>(null); // Create a ref for the file input element to access its files easily

	const abortController = new AbortController(); // Create an AbortController instance to provide an option to cancel the upload if needed.

	const authenticator = async () => {
		try {
			// Perform the request to the upload authentication endpoint.
			const response = await fetch('/api/upload-auth');
			if (!response.ok) {
				// If the server response is not successful, extract the error text for debugging.
				const errorText = await response.text();
				throw new Error(
					`Request failed with status ${response.status}: ${errorText}`
				);
			}

			// Parse and destructure the response JSON for upload credentials.
			const data = await response.json();
			const { signature, expire, token, publicKey } = data;
			return { signature, expire, token, publicKey };
		} catch (error) {
			// Log the original error for debugging before rethrowing a new error.
			console.error('Authentication error:', error);
			throw new Error('Authentication request failed');
		}
	};

	const handleUpload = async () => {
		const fileInput = fileInputRef.current; // Access the file input element using the ref
		if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
			alert('Please select a file to upload');
			return;
		}
		const file = fileInput.files[0]; // Extract the first file from the file input
		setIsUploading(true);
		setProgress(0);
		setUploadStatus('Authenticating...');

		let authParams; // Retrieve authentication parameters for the upload.
		try {
			authParams = await authenticator();
		} catch (authError) {
			console.error('Failed to authenticate for upload:', authError);
			setUploadStatus('Authentication failed. Please try again.');
			setIsUploading(false);
			return;
		}
		const { signature, expire, token, publicKey } = authParams;

		// Call the ImageKit SDK upload function with the required parameters and callbacks.
		try {
			setUploadStatus('Uploading...');
			const uploadResponse = await upload({
				// Authentication parameters
				expire,
				token,
				signature,
				publicKey,
				file,
				fileName: file.name, // Optionally set a custom file name
				// Progress callback to update upload progress state
				onProgress: (event) => {
					setProgress((event.loaded / event.total) * 100);
				},
				// Abort signal to allow cancellation of the upload if needed.
				abortSignal: abortController.signal,
			});
			// console.log('Upload response:', uploadResponse);
			setUploadStatus('Upload completed successfully!');
			setUploadedImage(uploadResponse);
		} catch (error) {
			// Handle specific error types provided by the ImageKit SDK.
			if (error instanceof ImageKitAbortError) {
				console.error('Upload aborted:', error.reason);
			} else if (error instanceof ImageKitInvalidRequestError) {
				console.error('Invalid request:', error.message);
			} else if (error instanceof ImageKitUploadNetworkError) {
				console.error('Network error:', error.message);
			} else if (error instanceof ImageKitServerError) {
				console.error('Server error:', error.message);
			} else {
				// Handle any other errors that may occur.
				console.error('Upload error:', error);
			}
		} finally {
			setIsUploading(false);
		}
	};

	return (
		<div className='max-w-2xl mx-auto p-5'>
			<div className='mb-4'>
				<input
					type='file'
					ref={fileInputRef}
					className='w-full p-2 border border-gray-300 rounded text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100'
				/>
			</div>
			<button
				type='button'
				onClick={handleUpload}
				disabled={isUploading}
				className={`w-full py-3 px-4 rounded text-sm font-medium transition-colors ${
					isUploading
						? 'bg-gray-400 cursor-not-allowed text-white'
						: 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
				}`}>
				{isUploading ? 'Uploading...' : 'Upload File'}
			</button>

			{isUploading && (
				<div className='mt-4'>
					<div className='w-full bg-gray-200 rounded-full h-2 overflow-hidden'>
						<div
							className='bg-blue-600 h-full transition-all duration-300 ease-out'
							style={{ width: `${progress}%` }}
						/>
					</div>
					<div className='mt-2 text-xs text-gray-600 text-center'>
						{Math.round(progress)}%
					</div>
				</div>
			)}

			{uploadStatus && (
				<div
					className={`mt-3 p-2 text-xs text-center rounded ${
						uploadStatus.includes('success')
							? 'text-green-700 bg-green-50'
							: uploadStatus.includes('failed') ||
							  uploadStatus.includes('error')
							? 'text-red-700 bg-red-50'
							: 'text-gray-600 bg-gray-50'
					}`}>
					{uploadStatus}
				</div>
			)}

			{uploadedImage && (
				<div className='mt-6'>
					<h3 className='text-sm font-medium text-gray-700 mb-2'>
						Uploaded Image:
					</h3>
					<div className='border border-gray-200 rounded-lg overflow-hidden'>
						<Image
							urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}
							src={uploadedImage.filePath ?? ''}
							// add image over image
							// src="/tr:l-image,i-imagekit.png,h-bh_div_8,w-iw_div_2,cm-pad_resize,lx-35,l-end/image1_-p3xg62-v.jpg"
							// add text over image
							// src="/tr:l-text,i-Hello%20World,bg-white,pa-100,co-black,fs-300,l-end/image1_-p3xg62-v.jpg"
							width={300}
							height={200}
							alt='Uploaded image'
							className='w-full h-auto object-cover'
						/>
					</div>
					<p className='text-xs text-gray-500 mt-2'>
						File: {uploadedImage.name}
					</p>
				</div>
			)}
		</div>
	);
}
