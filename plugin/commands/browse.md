---
description: Open the rea-design gallery (optionally filtered) to browse 1,009 rebuilt sites and 2,253 motion parts by hand
argument-hint: "[words, e.g. horizontal scroll portfolio]"
---

Open the rea-design gallery for the user so they can browse and pick by hand.

1. Build the URL: `$(rea url "")` plus `?q=<the arguments, URL-encoded>` when arguments were given. For motion parts add `&tab=fx`.
2. Open it (`open <url>` on macOS, `xdg-open` on Linux, `start` on Windows) and print it.
3. Tell the user in one line: click a card to open the live rebuilt site; when they've found one, they can say `/rea-design:use <slug>` (the slug is shown in the viewer's top bar).

Arguments: $ARGUMENTS
