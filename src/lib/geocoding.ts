// Global cache for geocoding
const geocodeCache = new Map<string, { lat: number; lng: number }>();

export async function geocodeAddress(address: string): Promise<{lat: number, lng: number} | null> {
  if (!address) return null;
  if (geocodeCache.has(address)) return geocodeCache.get(address)!;
  
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
  if (!key || key === "your_google_maps_api_key_here") return null;
  
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address + " Vietnam")}&key=${key}`
    );
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      const loc = data.results[0].geometry.location;
      geocodeCache.set(address, loc);
      return loc;
    }
  } catch (e) {
    console.error("Geocoding failed", e);
  }
  return null;
}

export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
