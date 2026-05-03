import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import './src/envConfig.ts'
import { version } from './package.json';
import { Header } from "next/dist/lib/load-custom-routes.js";
import { RemotePattern } from "next/dist/shared/lib/image-config.js";

const withNextIntl = createNextIntlPlugin();

const isDev = process.env.NODE_ENV === "development";
const API_IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;
const S3_IMAGE_URL = process.env.NEXT_PUBLIC_S3_IMAGE_BASE_URL;
const LOCAL_URL = isDev ? "http://localhost" : undefined;

const getImageUrl = (url?: string) => {
  if (!url) return [];
  const apiUrl = new URL(url);
  return [{
    protocol: apiUrl.protocol.replace(":", "") as "http" | "https",
    hostname: apiUrl.hostname,
    port: apiUrl.port,
    pathname: "**"
  }] as RemotePattern[];
}

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['localhost', '192.168.1.72'],
  images: {
    dangerouslyAllowLocalIP: isDev,
    qualities: [100, 75],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.furizon.net",
        port: "",
        pathname: "**"
      },
      ...getImageUrl(API_IMAGE_URL),
      ...getImageUrl(LOCAL_URL),
      ...getImageUrl(S3_IMAGE_URL),
    ]
  },
  env: {
    version
  },
  output: "standalone",
  headers: () => Promise.resolve<Header[]>([
    {
      source: "/fonts/(.*)",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=32536000, immutable"
        }
      ]
    }
  ])
};

export default withNextIntl(nextConfig);
