import type { MaybePromise } from "bun";

/** Function form for global CSS loading. */
export type MiniGlobalStyleLoader = () => MaybePromise<string>;
/** Single global CSS entry, either loader or Bun.file. */
export type MiniGlobalStyleEntry = MiniGlobalStyleLoader | Bun.BunFile;
/** Global CSS configuration as single or multiple entries. */
export type MiniGlobalStyles = MiniGlobalStyleEntry | MiniGlobalStyleEntry[];

/** Function form for global script loading. */
export type MiniScriptLoader = () => MaybePromise<string>;
/** Single global script entry, either loader or Bun.file. */
export type MiniScriptEntry = MiniScriptLoader | Bun.BunFile;
/** Global script configuration as single or multiple entries. */
export type MiniScripts = MiniScriptEntry | MiniScriptEntry[];
