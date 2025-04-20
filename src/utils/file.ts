export const KB = 1024;
export const MB = KB * KB;
export const GB = KB * MB;

export function readableFileSize(bytes: number): string {
  if (bytes < 1) {
    return "0 B";
  }

  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const sizes = ["B", "kB", "MB", "GB", "TB"];
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

// https://stackoverflow.com/questions/38658654/how-to-convert-a-base64-string-into-a-file/38659875#38659875
export function base64ToFile(base64: string, filename: string): File {
  try {
    // Check if the string contains a data URL prefix
    let dataUrl = base64;
    let mime = "application/octet-stream"; // Default MIME type
    let base64Data = "";

    if (dataUrl.includes(",")) {
      const parts = dataUrl.split(",");
      const dataTypeMatch = parts[0].match(/data:(.*?);base64/);

      if (dataTypeMatch && dataTypeMatch[1]) {
        mime = dataTypeMatch[1];
      }

      base64Data = parts[1];
    } else {
      // If there's no comma, assume the entire string is base64 data
      base64Data = dataUrl;
    }

    // Remove any whitespace or non-base64 characters that might be present
    base64Data = base64Data.replace(/[^A-Za-z0-9+/=]/g, "");

    // Decode the base64 string
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Determine file extension from MIME type
    let ext = mime.split("/")[1];

    switch (ext) {
      case "svg+xml":
        ext = "svg";
        break;
    }

    return new File([bytes], `${filename}.${ext}`, { type: mime });
  } catch (e) {
    console.error("Error converting base64 to file:", e);
    throw e;
  }
}
