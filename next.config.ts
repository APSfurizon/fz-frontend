import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import { loadEnvConfig } from "@next/env";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  /* config options here */
};

const projectDir = process.cwd();
loadEnvConfig(projectDir);

export default withNextIntl(nextConfig);
