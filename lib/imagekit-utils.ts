// File: lib/imagekit-utils.ts

export async function deleteCoverPhotos(userId: string, memorialId: number) {
	const folder = `${userId}/${memorialId}/cover-photo`;

	try {
		const response = await fetch(
			`/api/cover-photo?folder=${encodeURIComponent(folder)}`,
			{
				method: 'DELETE',
			}
		);

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || 'Failed to delete cover photos');
		}

		const result = await response.json();
		return result;
	} catch (error) {
		console.error('Error deleting cover photos:', error);
		throw error;
	}
}
