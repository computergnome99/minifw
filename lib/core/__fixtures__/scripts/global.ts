import { value } from "./dependency";

/** @ignore */
declare global {
  var __miniScriptFromImport: number;
}

/** @ignore */
globalThis.__miniScriptFromImport = value;
