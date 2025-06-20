export interface ImageKitFile {
	fileId: string;
	name: string;
	filePath: string;
	url: string;
	thumbnailUrl?: string;
	createdAt: string;
	size: number;
	type: 'file' | 'folder';
}
