---
description: Build from one specific rea-design site or motion part the user picked
argument-hint: "<site-slug | fx:part-name> [what to build]"
---

The user picked a specific reference: $ARGUMENTS

- If it starts with `fx:`, it is a motion part: follow the `rea-interactions` skill with that part (`rea fx <name>`, then `rea get fx:<name> --dir .`).
- Otherwise it is a site slug. Check it with `rea sites -q <slug> -n 1`. Then follow the `rea-web` skill as a **whole-site copy**: `rea get <slug> --dir .`, fill the placeholders with the user's content, swap `theme.css` for a skin (brand or `rea theme`), remove what only meant something to the original, and pass the phone gate (`rea check`).
- If a slug is unknown, search with `rea sites -q "<words from it>"` and show the closest three.
