import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import './src/envConfig.ts'
import { version } from './package.json';

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
  }
};

export default withNextIntl(nextConfig);
