const supportsFileReader = !!(window.FileReader && window.Blob);

export const imageMimeTypes = ['image/png', 'image/jpeg', 'image/webp'];

export const uploadFile = (account, type, preset, file) => new Promise((resolve, reject) => {
  const url = `https://api.cloudinary.com/v1_1/${account}/${type}/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', preset);
  fetch(url, { method: 'POST', body: formData })
    .then((response) => {
      if (!response.ok) {
        throw new Error();
      }
      return response.json();
    })
    .then((data) => resolve(data))
    .catch(() => reject(new Error(
      `An error occurred while uploading ${type} file. Please try again.`,
    )));
});

export const getImageMimeType = (file) => {
  if (!supportsFileReader) return Promise.resolve(file.type);

  return new Promise((resolve) => {
    // https://stackoverflow.com/a/29672957
    const fileReader = new FileReader();
    fileReader.addEventListener('load', () => {
      const arr = new Uint8Array(fileReader.result);
      const readChars = (start, length) => {
        let chars = '';
        let pos = start;
        while (pos < start + length) {
          chars = `${chars}${arr[pos].toString(16)}`;
          pos += 1;
        }
        return chars;
      };
      const header = readChars(0, 4);
      let type = '';
      switch (header) {
        case '89504e47':
          type = 'image/png';
          break;
        case '47494638':
          type = 'image/gif';
          break;
        case 'ffd8ffe0':
        case 'ffd8ffe1':
        case 'ffd8ffe2':
        case 'ffd8ffe3':
        case 'ffd8ffe8':
          type = 'image/jpeg';
          break;
        case '52494646':
          type = readChars(8, 4) === '57454250' ? 'image/webp' : 'unknown';
          break;
        default:
          type = 'unknown'; // Or you can use the blob.type as fallback
          break;
      }
      resolve(type);
    }, false);
    fileReader.readAsArrayBuffer(file);
  });
};

/**
 * @param {File} file
 * @returns {Promise<boolean>}
 */
export const isImage = (file) => new Promise((resolve) => (
  getImageMimeType(file)
    .then((type) => {
      if (imageMimeTypes.includes(type)) {
        resolve(true);
      } else {
        resolve(false);
      }
    })
    .catch(() => resolve(false))
));

export const fileSize = (bytes) => {
  if (bytes < 1000) return `${bytes}B`;
  if (bytes < 1000000) return `${Math.floor(bytes / 1000)}KB`;
  if (bytes < 1000000000) return `${Math.floor(bytes / 1000000)}MB`;
  if (bytes < 1000000000000) return `${Math.floor(bytes / 1000000000)}GB`;
  if (bytes < 1000000000000000) return `${Math.floor(bytes / 1000000000000)}TB`;
  return `${bytes}`;
};
