/**
 * Core utility to extract latitude and longitude from a Google Maps URL natively,
 * without using any Google API key.
 */

const LAT_LNG_REGEX_AT = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
const LAT_LNG_REGEX_Q = /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/;
const LAT_LNG_REGEX_LL = /[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/;

export type ExtractedCoordinates = {
  lat: string | null;
  lng: string | null;
  error?: string;
};

/**
 * Validates if the string is generally a Google Maps link format.
 */
export function isGoogleMapsLink(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname;
    return (
      host.includes("google.com") && parsed.pathname.includes("/maps") ||
      host === "maps.app.goo.gl" ||
      host === "goo.gl"
    );
  } catch {
    return false;
  }
}

/**
 * Core extraction logic parsing the parameters or paths of a full Google Maps link.
 */
export function extractCoordinatesFromUrl(fullUrl: string): ExtractedCoordinates {
  // Try pattern 1: /@lat,lng
  let match = fullUrl.match(LAT_LNG_REGEX_AT);
  if (match) {
    return { lat: match[1], lng: match[2] };
  }

  // Try pattern 2: ?q=lat,lng
  match = fullUrl.match(LAT_LNG_REGEX_Q);
  if (match) {
    return { lat: match[1], lng: match[2] };
  }

  // Try pattern 3: ?ll=lat,lng
  match = fullUrl.match(LAT_LNG_REGEX_LL);
  if (match) {
    return { lat: match[1], lng: match[2] };
  }

  return { lat: null, lng: null, error: "Coordinates not found in URL. Please use a full Google Maps link containing coordinates." };
}
