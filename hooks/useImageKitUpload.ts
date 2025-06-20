// hooks/useImageKitUpload.ts
import { upload, UploadResponse } from '@imagekit/next';
import {
	ImageKitAbortError,
	ImageKitInvalidRequestError,
	ImageKitServerError,
	ImageKitUploadNetworkError,
} from '@imagekit/next';
import { useCallback, useState } from 'react';

export function useImageKitUpload() {
	const [progress, setProgress] = useState(0);
	const [status, setStatus] = useState<
		'idle' | 'authenticating' | 'uploading' | 'error' | 'success'
	>('idle');
	const [errorMsg, setErrorMsg] = useState<string | undefined>();
	const [response, setResponse] = useState<UploadResponse>();

	const authenticate = useCallback(async () => {
		setStatus('authenticating');
		const res = await fetch('/api/upload-auth');
		if (!res.ok) throw new Error(await res.text());
		return res.json();
	}, []);

	const doUpload = useCallback(
		async (file: File, fileName: string, userId: string) => {
			setStatus('uploading');
			setProgress(0);
			try {
				const { token, expire, signature, publicKey } = await authenticate();
				const result = await upload({
					file,
					fileName,
					folder: `${userId}/cover-photo`,
					token,
					expire,
					signature,
					publicKey,
					onProgress: ({ loaded, total }) =>
						setProgress((loaded / total) * 100),
				});
				setResponse(result);
				setStatus('success');
				console.log(userId);

				return result;
			} catch (err) {
				setStatus('error');
				if (err instanceof ImageKitAbortError) setErrorMsg('Upload aborted');
				else if (err instanceof ImageKitInvalidRequestError)
					setErrorMsg('Invalid upload request');
				else if (err instanceof ImageKitUploadNetworkError)
					setErrorMsg('Network error');
				else if (err instanceof ImageKitServerError)
					setErrorMsg('Server error');
				else setErrorMsg((err as Error).message);
				throw err;
			}
		},
		[authenticate]
	);

	return { progress, status, errorMsg, response, doUpload };
}
