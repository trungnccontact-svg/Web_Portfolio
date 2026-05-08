import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

import { NextRequest } from "next/server";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const response = intlMiddleware(request);

  // If next-intl redirects, it might leak the internal port (e.g., :8080)
  // because Railway's proxy sets the Host header to include the port.
  // We strip any port from the Location header to ensure public URLs are correct.
  if (response.headers.has("Location")) {
    const loc = response.headers.get("Location");
    if (loc) {
      try {
        const url = new URL(loc);
        if (url.port) {
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
