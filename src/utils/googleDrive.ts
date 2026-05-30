export async function findDriveFile(accessToken: string, filename: string): Promise<string | null> {
  const query = encodeURIComponent(`name = '${filename}' and trashed = false`);
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Drive API search failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  const files = data.files || [];
  if (files.length > 0) {
    return files[0].id;
  }
  return null;
}

export async function downloadDriveFile(accessToken: string, fileId: string): Promise<any> {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Drive API download failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return response.json();
}

export async function createDriveFile(accessToken: string, filename: string, content: any): Promise<string> {
  const boundary = 'cricmetrics_multipart_boundary';
  const delimiter = `\r\n--${boundary}\r\n`;
  const close_delim = `\r\n--${boundary}--`;

  const metadata = {
    name: filename,
    mimeType: 'application/json',
  };

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    JSON.stringify(content) +
    close_delim;

  const url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Drive API create failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  return data.id;
}

export async function updateDriveFile(accessToken: string, fileId: string, content: any): Promise<void> {
  const url = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(content),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Drive API update failed: ${response.status} ${response.statusText} - ${errorText}`);
  }
}
