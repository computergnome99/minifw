```txt
         _ _     _   ___  _______
   /|  /| | |  /| | |  _|/      /
  / | / | | | / | | | |_|  /|  /
 /  |/  | | |/  | | |  _| / | /
/______/|_|____/|_| |_| |/  |/
```

# Mini Framework

A set of functions to take the legwork out of building HTMX applications,
designed around server-rendered hypermedia and built to deliver the smallest
possible, static client payload.

## Getting Started

Install MiniFW with the package manager of your choice from either NPM or JSR
repositories. Then import and implement the `mini()` server function to host
your application.

```ts
import { mini, page } from "minifw/core";

const home = page(() => "Welcome to MiniFW!");

mini({
  routes: {
    "/": home,
  },
});
```

The `mini()` function wraps Bun's `Bun.server()` function, and the
implementation for the function matches almost exactly, with a few minor
exceptions. As such, **Bun is currently a required peer dependency** to run
MiniFW. In a future release of this project, I hope to open this up and make it
a "bring-your-own-runtime" system.

## Documentation

Full, detailed documentation will be available soon. In the meantime, generate
documentation locally using:

```bash
cd ./node_modules/minifw && bun run build:docs
```
