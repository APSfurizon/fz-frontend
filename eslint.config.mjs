import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-plugin-prettier/recommended";
import spellcheck from "eslint-plugin-spellcheck";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    ".storybook/**",
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
      "@typescript-eslint/unbound-method": "off",
      "@typescript-eslint/no-deprecated": "error",
      "@typescript-eslint/no-misused-promises": [
        "error",
        {
          checksVoidReturn: {
            arguments: false,
          },
        },
      ],
      "import/no-deprecated": "warn",
      "max-len": ["warn", { code: 120 }],
      "@typescript-eslint/no-explicit-any": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/exhaustive-deps": "off",
      "no-warning-comments": "warn",
      "prettier/prettier": [
        "error",
        {
          singleQuote: false,
          printWidth: 120,
          tabWidth: 2,
          semi: true,
          trailingComma: "es5",
          bracketSpacing: true,
          endOfLine: "lf",
        },
      ],
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
]);

export default eslintConfig;
