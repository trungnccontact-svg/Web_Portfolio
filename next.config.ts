import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import os from "os";

// Automatically get all local IPv4 addresses
const getLocalIPv4Addresses = () => {
  const interfaces = os.networkInterfaces();
  const addresses: string[] = ["localhost"];
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name] || []) {
      // Skip internal (localhost) and only get IPv4
      if (net.family === "IPv4" && !net.internal) {
        addresses.push(net.address);
      }
    }
  }
  return addresses;
};

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // Allow network access for Next.js dev server dynamically
  allowedDevOrigins: getLocalIPv4Addresses(),
};

export default withNextIntl(nextConfig);
