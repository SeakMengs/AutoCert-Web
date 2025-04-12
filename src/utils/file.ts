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
