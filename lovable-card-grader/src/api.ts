export async function uploadImage(uri: string) {
  const formData = new FormData();
  formData.append('file', {
    uri,
    name: 'photo.jpg',
    type: 'image/jpeg',
  } as any);

  const response = await fetch('http://127.0.0.1:8000/analyze', {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (!response.ok) throw new Error('Failed to upload image');

  return await response.json();
}
