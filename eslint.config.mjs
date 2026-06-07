import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import spellcheck from "eslint-plugin-spellcheck";
import tseslint from "typescript-eslint";
import storybooklint from "eslint-plugin-storybook";
import { parserOptions } from "storybook/internal/babel";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    extends: [
      tseslint.configs.recommendedTypeChecked,
      storybooklint.configs.recommended
    ],
    plugins: {
      spellcheck
    },
    rules: {
      "@typescript-eslint/no-deprecated": "error",
      "import/no-deprecated": "warn",
      "max-len": [
        "warn",
        { code: 120 }
      ],
      "@typescript-eslint/no-explicit-any": "off",
      "react-hooks/exhaustive-deps": "off",
      "no-warning-comments": "warn"
    },
    languageOptions: {
      parserOptions: {
        projectService: true
      }
    }
  }
]);

export default eslintConfig;
