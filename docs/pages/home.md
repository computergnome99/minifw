# Mini Framework: `MiniFW`

A simple, server-side, function-forward framework for building hypermedia apps
quickly with HTMX.

```ts
const server = mini({
  routes: {
    "/": page(() => html` <h1>Hello World</h1> `),
  },
});

console.log(`Mini Server is running on ${server.url}`);
```

[Read the Docs](./docs).

## Zero-Build

Write TypeScript, start Bun, and serve your application. MiniFW runs directly on
the server, so pages, partials, styles, and routes stay close to the code that
defines them without a separate application build step.

## Super Fast

MiniFW renders HTML on the server. The initial response is usable HTML, and HTMX
requests return only the fragment required for the next interaction. Your
application state and rendering work remain on the server.

## Small Client Payloads

The browser receives rendered markup rather than a client-side application
bundle. MiniFW adds only the small runtime needed to support HTMX navigation and
promote scoped styles after swaps; generated HTML, CSS, and scripts are minified
before they are sent.

## Scoped-Styles

Give a page or partial its own style function and MiniFW scopes those selectors
to that component's markup automatically. Scoped styles are moved into the
document head for full-page responses and after HTMX swaps, keeping component
styles isolated without giving up server-rendered HTML.
