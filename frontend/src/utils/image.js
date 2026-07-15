/**
 * Helper function to resolve the image URL.
 * Supports absolute URLs (Cloudinary) and relative file paths (local storage).
 * 
 * @param {string} imagePath - The path or URL of the image
 * @returns {string} The fully qualified image URL or a placeholder path
 */
export function getImageUrl(imagePath) {
  if (!imagePath) return "/placeholder.jpg";
  
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  
  // Make sure not to double-slash if VITE_SERVER_URL ends with a slash or imagePath starts with one
  const envUrl = import.meta.env.VITE_SERVER_URL;
  let serverUrl;
  if (envUrl) {
    serverUrl = envUrl;
  } else {
    const apiHostname = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'localhost'
      : window.location.hostname;
    serverUrl = `http://${apiHostname}:5000`;
  }
  const cleanServerUrl = serverUrl.endsWith("/") ? serverUrl.slice(0, -1) : serverUrl;
  const cleanImagePath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  
  return `${cleanServerUrl}${cleanImagePath}`;
}
