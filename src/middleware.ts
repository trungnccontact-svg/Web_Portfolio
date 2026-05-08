import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

import { NextRequest } from "next/server";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  // Railway's reverse proxy can sometimes leak the internal port (e.g. 8080)
  // Stripping it ensures that next-intl redirects use the correct public URL.
  request.nextUrl.port = "";
  
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/", "/(en|vi)/:path*"],
};
