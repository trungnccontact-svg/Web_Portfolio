import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

import { NextRequest } from "next/server";

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const response = intlMiddleware(request);

  // If next-intl redirects, it might leak the internal port (e.g., :8080)
  // because Railway's proxy sets the Host header to include the port.
  // We strip any port from the Location header to ensure public URLs are correct,
  // but ONLY if we are NOT on localhost or a local network.
  if (response.headers.has("Location")) {
    const loc = response.headers.get("Location");
    if (loc) {
      try {
        const url = new URL(loc, request.url);
        
        // Detect local hostnames (localhost, 127.0.0.1, or network IPs like 172.x.x.x or 192.168.x.x)
        const isLocal = url.hostname === 'localhost' || 
                        url.hostname === '127.0.0.1' || 
                        url.hostname.startsWith('172.') || 
                        url.hostname.startsWith('192.168.');

        // Only strip port if it's NOT a local address (e.g. on Railway production)
        if (url.port && !isLocal) {
          url.port = "";
          response.headers.set("Location", url.toString());
        }
      } catch (e) {
        // Ignore invalid URLs
      }
    }
  }

  return response;
}

export const config = {
  matcher: ["/", "/(en|vi)/:path*"],
};
