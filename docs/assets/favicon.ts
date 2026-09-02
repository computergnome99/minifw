import { html } from "../../lib/helpers";

export const favicon = (request: Request): Response => {
  const url = new URL(request.url);

  const from = url.searchParams.get("from") || "a6e3a1";
  const to = url.searchParams.get("to") || "94e2d5";

  const markup = html`
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      fill="none"
      viewBox="0 0 93 93"
    >
      <g clip-path="url(#a)">
        <path
          fill="url(#b)"
          d="M18.968 34.68h-2.352V20.04h2.352zm6.058-14.752L31.73 33.88l-1.968.912-6.704-13.952zM47.749 34.68h-2.352V20.04h2.352zm6.058-14.752 6.704 13.952-1.968.912-6.704-13.952zM18.968 53.68h-2.352V39.04h2.352zM34.62 38.928l6.704 13.952-1.968.912L32.65 39.84zM47.75 53.68h-2.353V39.04h2.352zM63.4 38.928l6.705 13.952-1.968.912-6.704-13.952zM18.969 72.68h-2.352V58.04h2.352zm4.426-.688h8v1.984h-8zm9.593 0h8v1.984h-8zm9.594 0h8v1.984h-8zm9.594 0h8v1.984h-8zm9.594 0h8v1.984h-8zm11.226-14.064 6.703 13.952-1.967.912-6.704-13.952z"
        />
      </g>
      <defs>
        <linearGradient
          id="b"
          x1="47.107"
          x2="47.107"
          y1="13.476"
          y2="94"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#${from}" />
          <stop offset="1" stop-color="#${to}" />
        </linearGradient>
        <clipPath id="a">
          <path fill="#fff" d="M0 0h93v93H0z" />
        </clipPath>
      </defs>
    </svg>
  `;

  return new Response(markup, { headers: { "Content-Type": "image/svg+xml" } });
};
