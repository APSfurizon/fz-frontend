import type { StorybookConfig } from "@storybook/nextjs-vite";
import { mergeConfig } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@storybook/addon-vitest"
  ],
  "framework": {
    "name": "@storybook/nextjs-vite",
    "options": {}
  },
  "staticDirs": [
    "..\\public"
  ],
  async viteFinal(config) {
    return mergeConfig(config, {
      resolve: {
        alias: {
          "@components": path.resolve(__dirname, "../src/components"),
          "@components/atoms": path.resolve(__dirname, "../src/components/atoms"),
          "@molecules": path.resolve(__dirname, "../src/components/molecules"),
          "@organisms": path.resolve(__dirname, "../src/components/organisms"),
          "@pages": path.resolve(__dirname, "../src/components/pages"),
          "@layouts": path.resolve(__dirname, "../src/components/layouts")
        }
      }
    });
  }
};
export default config;