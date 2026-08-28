import prettierPlugin from "eslint-plugin-prettier/recommended";
import { defineConfig } from "eslint/config";
import jsdoc from "eslint-plugin-jsdoc";
import unicorn from "eslint-plugin-unicorn";
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
    extends: [
      tseslint.configs.recommended,
      jsdoc.configs["flat/recommended-typescript"],
      unicorn.configs["flat/recommended"],
      prettierPlugin,
    ],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "prettier/prettier": "warn",
      "jsdoc/check-alignment": "off",
      "jsdoc/check-line-alignment": "off",
      "jsdoc/lines-before-block": "off",
      "jsdoc/multiline-blocks": "off",
      "jsdoc/no-multi-asterisks": "off",
      "jsdoc/require-asterisk-prefix": "off",
      "jsdoc/require-hyphen-before-param-description": "off",
      "jsdoc/tag-lines": "off",
      "jsdoc/require-jsdoc": ["warn", { publicOnly: true }],
      "jsdoc/require-param": "off",
      "jsdoc/require-param-description": "off",
      "jsdoc/require-returns": "off",
      "jsdoc/require-returns-description": "off",
      "unicorn/prefer-dom-node-html-methods": "off",
      "unicorn/single-line-block-comment-style": "off",
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        {
          prefer: "type-imports",
          fixStyle: "separate-type-imports",
        },
      ],
    },
  },
  {
    files: ["lib/core/__fixtures__/**/*.ts"],
    rules: {
      "unicorn/filename-case": "off",
      "unicorn/no-global-object-property-assignment": "off",
    },
  },
);
