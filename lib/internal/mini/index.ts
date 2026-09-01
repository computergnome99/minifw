/** Bun route builder for page definitions. */
export { buildPages } from "./build-pages";
/** Bun route builder for partial definitions. */
export { buildPartials } from "./build-partials";
/** Memoized global style loader factory used by `mini()`. */
export { createGlobalStylesLoader } from "./create-global-styles-loader";
/** Memoized global script loader factory used by `mini()`. */
export { createScriptsLoader } from "./create-scripts-loader";

export type {
  MiniGlobalStyles,
  MiniScriptEntry,
  MiniScriptLoader,
  MiniScripts,
} from "./types";
