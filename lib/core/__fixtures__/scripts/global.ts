import { value } from "./dependency";

declare global {
  var __miniScriptFromImport: number;
}

globalThis.__miniScriptFromImport = value;
