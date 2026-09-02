import { Resvg, initWasm } from "@resvg/resvg-wasm";
import { html } from "../../lib/helpers";

const wasmUrl = new URL(import.meta.resolve("@resvg/resvg-wasm/index_bg.wasm"));
const initialized = initWasm(Bun.file(wasmUrl).arrayBuffer());
const fontUrl = new URL(
  import.meta
    .resolve("@fontsource/fira-mono/files/fira-mono-latin-700-normal.woff2"),
);
const font = Bun.file(fontUrl).arrayBuffer();

/** Render a crawler-compatible PNG image for a MiniFW page. */
export async function socialCard(request: Request): Promise<Response> {
  await initialized;

  const fontBuffer = new Uint8Array(await font);
  const url = new URL(request.url);
  const title = escapeXml(url.searchParams.get("title") || "MiniFW");

  const svg = html`
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      fill="none"
      viewBox="0 0 1200 630"
    >
      <path fill="#fff" d="M0 0h1200v630H0z" />
      <path fill="url(#a)" d="M0 0h1200v630H0z" />
      <path fill="url(#b)" d="M47.345 86.127H40V40.35h7.345z" />
      <path
        fill="url(#c)"
        d="m66.263 40 20.936 43.626-6.146 2.852-20.936-43.626z"
      />
      <path fill="url(#d)" d="M137.226 86.127h-7.345V40.35h7.345z" />
      <path
        fill="url(#e)"
        d="m156.144 40 20.935 43.626-6.145 2.852-20.936-43.626z"
      />
      <path fill="url(#f)" d="M47.345 145.537H40V99.76h7.345z" />
      <path
        fill="url(#g)"
        d="m96.223 99.41 20.936 43.626-6.146 2.852-20.936-43.626z"
      />
      <path fill="url(#h)" d="M137.226 145.537h-7.345V99.76h7.345z" />
      <path
        fill="url(#i)"
        d="m186.104 99.41 20.936 43.626-6.146 2.852-20.936-43.626z"
      />
      <path fill="url(#j)" d="M47.345 204.948H40v-45.777h7.345z" />
      <path fill="url(#k)" d="M61.166 202.796H86.15V209H61.166z" />
      <path fill="url(#l)" d="M91.127 202.796h24.983V209H91.126z" />
      <path fill="url(#m)" d="M121.087 202.796h24.983V209h-24.983z" />
      <path fill="url(#n)" d="M151.047 202.796h24.983V209h-24.983z" />
      <path fill="url(#o)" d="M181.007 202.796h24.983V209h-24.983z" />
      <path
        fill="url(#p)"
        d="M216.064 158.82 237 202.446l-6.146 2.852-20.936-43.626z"
      />
      <text
        x="40"
        y="338.66"
        fill="#4c4f69"
        font-family="Fira Mono"
        font-size="96"
        font-weight="700"
      >
        ${title}
      </text>
      <text
        x="40"
        y="441.4"
        fill="#4c4f69"
        font-family="Fira Mono"
        font-size="40"
        font-weight="700"
      >
        A simple, server-side framework for building
      </text>
      <text
        x="40"
        y="489.4"
        fill="#4c4f69"
        font-family="Fira Mono"
        font-size="40"
        font-weight="700"
      >
        hypermedia apps quickly with HTMX.
      </text>
      <defs>
        <linearGradient
          id="a"
          x1="0"
          x2="1200"
          y1="0"
          y2="630"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#fff" stop-opacity="0" />
          <stop offset="1" stop-color="#40a02b" stop-opacity=".33" />
        </linearGradient>
        <linearGradient
          id="b"
          x1="135.221"
          x2="135.221"
          y1="19.826"
          y2="271.612"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#40a02b" />
          <stop offset="1" stop-color="#179299" />
        </linearGradient>
        <linearGradient
          id="c"
          x1="135.221"
          x2="135.221"
          y1="19.826"
          y2="271.612"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#40a02b" />
          <stop offset="1" stop-color="#179299" />
        </linearGradient>
        <linearGradient
          id="d"
          x1="135.221"
          x2="135.221"
          y1="19.826"
          y2="271.612"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#40a02b" />
          <stop offset="1" stop-color="#179299" />
        </linearGradient>
        <linearGradient
          id="e"
          x1="135.221"
          x2="135.221"
          y1="19.826"
          y2="271.612"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#40a02b" />
          <stop offset="1" stop-color="#179299" />
        </linearGradient>
        <linearGradient
          id="f"
          x1="135.221"
          x2="135.221"
          y1="19.826"
          y2="271.612"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#40a02b" />
          <stop offset="1" stop-color="#179299" />
        </linearGradient>
        <linearGradient
          id="g"
          x1="135.221"
          x2="135.221"
          y1="19.826"
          y2="271.612"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#40a02b" />
          <stop offset="1" stop-color="#179299" />
        </linearGradient>
        <linearGradient
          id="h"
          x1="135.221"
          x2="135.221"
          y1="19.826"
          y2="271.612"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#40a02b" />
          <stop offset="1" stop-color="#179299" />
        </linearGradient>
        <linearGradient
          id="i"
          x1="135.221"
          x2="135.221"
          y1="19.826"
          y2="271.612"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#40a02b" />
          <stop offset="1" stop-color="#179299" />
        </linearGradient>
        <linearGradient
          id="j"
          x1="135.221"
          x2="135.221"
          y1="19.826"
          y2="271.612"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#40a02b" />
          <stop offset="1" stop-color="#179299" />
        </linearGradient>
        <linearGradient
          id="k"
          x1="135.221"
          x2="135.221"
          y1="19.826"
          y2="271.612"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#40a02b" />
          <stop offset="1" stop-color="#179299" />
        </linearGradient>
        <linearGradient
          id="l"
          x1="135.221"
          x2="135.221"
          y1="19.826"
          y2="271.612"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#40a02b" />
          <stop offset="1" stop-color="#179299" />
        </linearGradient>
        <linearGradient
          id="m"
          x1="135.221"
          x2="135.221"
          y1="19.826"
          y2="271.612"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#40a02b" />
          <stop offset="1" stop-color="#179299" />
        </linearGradient>
        <linearGradient
          id="n"
          x1="135.221"
          x2="135.221"
          y1="19.826"
          y2="271.612"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#40a02b" />
          <stop offset="1" stop-color="#179299" />
        </linearGradient>
        <linearGradient
          id="o"
          x1="135.221"
          x2="135.221"
          y1="19.826"
          y2="271.612"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#40a02b" />
          <stop offset="1" stop-color="#179299" />
        </linearGradient>
        <linearGradient
          id="p"
          x1="135.221"
          x2="135.221"
          y1="19.826"
          y2="271.612"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#40a02b" />
          <stop offset="1" stop-color="#179299" />
        </linearGradient>
      </defs>
    </svg>
  `;

  const image = new Resvg(svg, {
    font: {
      defaultFontFamily: "Fira Mono",
      fontBuffers: [fontBuffer],
      loadSystemFonts: false,
    },
  })
    .render()
    .asPng();

  return new Response(new Uint8Array(image), {
    headers: {
      "Cache-Control": "public, max-age=0, s-maxage=86400",
      "Content-Type": "image/png",
    },
  });
}

function escapeXml(value: string): string {
  return value.replaceAll(/[&<>"']/g, (character) => {
    return (
      { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        character
      ] ?? character
    );
  });
}
