import type { Config } from "prettier";

const config: Config = {
  plugins: ["prettier-plugin-jsdoc", "prettier-plugin-css-order"],
  semi: true,
  singleQuote: false,
  trailingComma: "all",
  printWidth: 80,
  proseWrap: "always",
  tabWidth: 2,
  endOfLine: "lf",
};

export default config;
