// Credit: https://jsfiddle.net/knLbjc9a/4/
export const trimSvgWhitespace = (
  base64Svg: string,
  padding: number = 5,
): string => {
  const svg = atob(base64Svg.split(",")[1]);
  const parser = new DOMParser();
  const doc = parser.parseFromString(svg, "image/svg+xml");
  const svgElement = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg",
  );
  svgElement.appendChild(doc.documentElement);

  // Temporarily add the SVG to the DOM to calculate the bounding box
  const tempDiv = document.createElement("div");
  tempDiv.style.position = "absolute";
  tempDiv.style.opacity = "0";
  tempDiv.style.pointerEvents = "none";
  document.body.appendChild(tempDiv);

  tempDiv.appendChild(svgElement);

  // Calculate the bounding box to remove the whitespace
  const bbox = svgElement.getBBox();
  const viewBox = [
    bbox.x - padding,
    bbox.y - padding,
    bbox.width + padding * 2,
    bbox.height + padding * 2,
  ].join(" ");
  svgElement.setAttribute("viewBox", viewBox);

  // Cleanup: Remove the temporary SVG from the DOM
  document.body.removeChild(tempDiv);

  // Serialize the modified SVG back to a string
  const serializer = new XMLSerializer();
  const trimmedSvg = serializer.serializeToString(svgElement);

  return `data:image/svg+xml;base64,${btoa(trimmedSvg)}`;
};
