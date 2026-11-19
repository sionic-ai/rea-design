// Put a hand (or keyboard focus) on a name row and the backing panel (logo · statement) on the center stage turns off, and that name’s panel (product video) turns on in the same place while the video plays.
// On leaving, returns to the background panel and all videos pause. On/off duration is a CSS transition (.4s ease-in-out delayed .09s), so panels overlap and flow even when swept quickly
(() => {
  kfFx.register("hover-stage-swap", (el, { options, hover }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    const panels = [...el.querySelectorAll('[data-fx-part="panel"]')];
    const base = el.querySelector('[data-fx-part="base"]');
    if (!items.length || !panels.length) return;
    const wide = matchMedia(`(min-width: ${+(options.wide ?? 960)}px)`);
    const videos = () => panels.flatMap((p) => [...p.querySelectorAll("video")]);
    const keyOf = (n, i) => n.dataset.key ?? String(i);
    let current = null;
    const show = (key) => {
      if (current === key) return;
      const wasBase = current === null;
      current = key;
      panels.forEach((p, i) => p.classList.toggle("is-on", keyOf(p, i) === key));
      base?.classList.toggle("is-on", key === null);
      // Tells the parts inside the background panel (cell logos) when to turn off and on
      if (base && wasBase !== (key === null)) base.querySelectorAll("[data-fx]").forEach((n) => n.dispatchEvent(new CustomEvent(key === null ? "fx:on" : "fx:off")));
      videos().forEach((v) => { if (v.closest('[data-fx-part="panel"]')?.classList.contains("is-on")) v.play?.().catch(() => {}); else v.pause?.(); });
    };
    const ac = new AbortController();
    const arm = () => {
      const on = hover && wide.matches;
      el.classList.toggle("is-armed", on);
      if (!on) { current = undefined; panels.forEach((p) => p.classList.remove("is-on")); base?.classList.remove("is-on"); return; }
      current = undefined; show(null);
    };
    items.forEach((it, i) => {
      const k = keyOf(it, i);
      const enter = () => el.classList.contains("is-armed") && show(k);
      const leave = () => el.classList.contains("is-armed") && show(null);
      it.addEventListener("pointerenter", enter, { signal: ac.signal });
      it.addEventListener("focus", enter, { signal: ac.signal });
      it.addEventListener("pointerleave", leave, { signal: ac.signal });
      it.addEventListener("blur", leave, { signal: ac.signal });
    });
    wide.addEventListener("change", arm, { signal: ac.signal });
    arm();
    return () => {
      ac.abort();
      el.classList.remove("is-armed");
      panels.forEach((p) => p.classList.remove("is-on"));
      base?.classList.remove("is-on");
      videos().forEach((v) => v.pause?.());
    };
  });
})();
