import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import './src/envConfig.ts'
import { version } from './package.json';
import { Header } from "next/dist/lib/load-custom-routes.js";

const withNextIntl = createNextIntlPlugin();

const API_IMAGE_URL = new URL(process.env.NEXT_PUBLIC_IMAGE_BASE_URL!);


const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: API_IMAGE_URL.hostname,
        port: API_IMAGE_URL.port,
        pathname: "**",
        search: ""
      },
      {
        protocol: "https",
        hostname: "furizon.net",
        port: "",
        pathname: "**",
        search: ""
      }
    ]
  },
  env: {
    version
  },
  output: "standalone",
  eslint: {
    dirs: ['app', 'components', 'lib']
  },
  headers: () => Promise.resolve<Header[]>([
      {
        source: "/fonts/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age:32536000, immutable"
          }
        ]
      }
    ])
};

export default withNextIntl(nextConfig);
