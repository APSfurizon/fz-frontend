import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import spellcheck from "eslint-plugin-spellcheck";
import tseslint from "typescript-eslint";
import prettier from "eslint-plugin-prettier/recommended";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    extends: [tseslint.configs.recommendedTypeChecked],
    plugins: {
      spellcheck: spellcheck,
    },
    ignores: ["eslint.config.mjs"],
    rules: {
      "@typescript-eslint/no-deprecated": "error",
      "import/no-deprecated": "warn",
      "max-len": ["warn", { code: 120 }],
      "@typescript-eslint/no-explicit-any": "off",
      "react-hooks/exhaustive-deps": "off",
      "no-warning-comments": "warn",
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
]);

export default eslintConfig;
