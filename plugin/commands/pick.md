---
description: Show three rea-design candidates (pictures + live links) for a request and wait for the user's choice
argument-hint: "<what you need, e.g. calm clinic homepage>"
---

The user wants to choose the reference themselves. Request: $ARGUMENTS

1. Run `rea route "$ARGUMENTS"` to get the kind and the skill, then `rea sites -q "<words>" [-k kind] -n 12` (or `rea fx -q "<words>"` for an interaction, `rea sections <role> -q "<words>"` for one section).
2. Look at the pictures (`picture:` lines) and keep three that differ clearly from each other. Drop any that show a loader or a blank screen.
3. Present them as A / B / C: one plain-language line · live URL, with the picture inline when the terminal can show images. Recommend one with a one-line reason. Add one gallery link with all three: `rea board <a>,<b>,<c>`.
4. Ask with the question tool (AskUserQuestion) if it is available, recommendation first; otherwise ask in chat. Then stop and wait.
5. After the answer, restate the choice in one line and continue with the skill the router named (`rea-web`, `rea-interactions` or `rea-video`), using the chosen slug or part.
