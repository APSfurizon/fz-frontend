import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import './src/envConfig.ts'
import { version } from './package.json';
import { Header } from "next/dist/lib/load-custom-routes.js";
import { RemotePattern } from "next/dist/shared/lib/image-config.js";

const withNextIntl = createNextIntlPlugin();

const API_IMAGE_URL = new URL(process.env.NEXT_PUBLIC_IMAGE_BASE_URL!);
const isDev = process.env.NODE_ENV === 'development';

const additionalData: RemotePattern[] = isDev
  ? [
    {
      protocol: "http",
      hostname: "localhost",
      pathname: "**"
    }
  ]
  : [];


const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['localhost'],
  images: {
    dangerouslyAllowLocalIP: isDev,
    qualities: [100, 75],
    remotePatterns: [
      {
        protocol: API_IMAGE_URL.protocol.replace(":", "") as "http" | "https",
        hostname: API_IMAGE_URL.hostname,
        port: API_IMAGE_URL.port,
        pathname: "**"
      },
      {
        protocol: "https",
        hostname: "**.furizon.net",
        port: "",
        pathname: "**"
      },
      ...additionalData
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
