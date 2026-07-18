/**
 * Compresses an image data URL (Base64) to a smaller size using an HTML5 Canvas.
 * This keeps profile pictures and avatar uploads tiny (e.g. 10-15KB instead of 5-10MB),
 * preventing local storage QuotaExceededError crashes.
 */
export function compressImage(
  base64Str: string,
  maxWidth: number = 180,
  maxHeight: number = 180,
  quality: number = 0.7
): Promise<string> {
  return new Promise((resolve) => {
    if (!base64Str || !base64Str.startsWith("data:image/")) {
      resolve(base64Str);
      return;
    }

    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions to fit within maxWidth and maxHeight while maintaining aspect ratio
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Draw the resized image onto the canvas
        ctx.drawImage(img, 0, 0, width, height);
        // Export to highly compressed JPEG
        const compressedBase64 = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedBase64);
      } else {
        resolve(base64Str);
      }
    };

    img.onerror = () => {
      resolve(base64Str);
    };

    img.src = base64Str;
  });
}
