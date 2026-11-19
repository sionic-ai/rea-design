// Position is in board coordinates — re-measured on every pointermove so it stays under the cursor even when the board moves with scroll
(() => {
  kfFx.register("cursor-spot-glow", (el, { hover }) => {
    if (!hover) return;
    const ac = new AbortController();
    const set = (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--fx-mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--fx-my", `${e.clientY - r.top}px`);
    };
    el.addEventListener("pointermove", set, { signal: ac.signal });
    el.addEventListener("pointerenter", (e) => { set(e); el.style.setProperty("--fx-on", "1"); }, { signal: ac.signal });
    el.addEventListener("pointerleave", () => el.style.setProperty("--fx-on", "0"), { signal: ac.signal });
    return () => { ac.abort(); ["--fx-mx", "--fx-my", "--fx-on"].forEach((p) => el.style.removeProperty(p)); };
  });
})();
