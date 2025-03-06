export function isHexColor(hex: string): boolean {
  return hex.length === 6 && !isNaN(Number("0x" + hex));
}
