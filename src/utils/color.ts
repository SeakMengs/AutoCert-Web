export function isHexColor(hex: string): boolean {
  // Remove the leading '#' if it exists
  if (hex[0] === "#") {
    hex = hex.slice(1);
  }
  return hex.length === 6 && !isNaN(Number("0x" + hex));
}
