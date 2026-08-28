import prettierPlugin from "eslint-plugin-prettier/recommended";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  {
    ignores: ["dist/**", "node_modules/**", "coverage/**", "out/**", "*.tgz"],
    linterOptions: {
      reportUnusedDisableDirectives: "warn",
      reportUnusedInlineConfigs: "warn",
    },
  },
  {
    files: ["**/*.ts"],
    extends: [tseslint.configs.recommended, prettierPlugin],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "prettier/prettier": "warn",
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        {
          prefer: "type-imports",
          fixStyle: "separate-type-imports",
        },
      ],
    },
  },
);
