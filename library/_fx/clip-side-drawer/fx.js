// Pressing a button (tab) on the fixed sidebar widens the sidebar’s clip-path to the right so the side panel (drawer) attaches, and the panel content comes in from the side.
// Pressing the same button again, or close · scrim · Esc, closes it. On open and close, fx:open(detail.key) and fx:close are fired on this element — the consumer hooks its scroll lock onto them.
(() => {
  const opened = new Set();
  document.addEventListener("keydown", (e) => e.key === "Escape" && opened.forEach((el) => el.dispatchEvent(new Event("fx:close"))));

  kfFx.register("clip-side-drawer", (el, { options, reduce }) => {
    const q = (role) => [...el.querySelectorAll(`[data-fx-part="${role}"]`)];
    const tabs = q("tab"), drawers = q("drawer");
    if (!tabs.length || !drawers.length) return;
    const ac = new AbortController(), on = { signal: ac.signal };
    const d = reduce ? 0 : 1;
    // Original (Brand) values: other plates switch off in .2s, then the new plate comes in .8s power2.out (from the side, x first) · closing waits .5s for the clip to close, then fades .2s
    const T = { swap: +(options.swap ?? 0.2), in: +(options.in ?? 0.8), hold: +(options.hold ?? 0.5), out: +(options.out ?? 0.2) };
    const fromX = +(options.x ?? 0), ease = kfFx.ease(options.ease || "power2.out", "power2.out");
    // Keep the blur layer outside the sidebar — the sidebar’s clip-path also clips fixed elements inside it
    const veil = options.veil === "false" ? null : Object.assign(document.createElement("div"), { className: "fx-clip-side-drawer-veil" });
    if (veil) el.before(veil);
    let key = null;
    const swapTl = gsap.timeline();
    const show = (k, x = fromX) => {
      const next = drawers.find((dr) => dr.dataset.key === k);
      if (!next) return;
      swapTl.clear();
      if (x === fromX) swapTl.to(drawers.filter((dr) => dr !== next), { autoAlpha: 0, duration: T.swap * d });
      drawers.forEach((dr) => dr.classList.toggle("is-active", dr === next));
      swapTl.fromTo(next, { autoAlpha: 0, x }, { autoAlpha: 1, x: 0, duration: T.in * d, ease });
    };
    const open = (k) => {
      if (key === k) return close();
      tabs.forEach((t) => { t.classList.toggle("is-active", t.dataset.key === k); t.classList.toggle("is-other", t.dataset.key !== k); });
      el.classList.add("is-open");
      veil?.classList.add("is-open");
      show(k);
      key = k;
      opened.add(el);
      el.dispatchEvent(new CustomEvent("fx:open", { detail: { key: k } }));
    };
    const close = () => {
      if (!key) return;
      key = null;
      opened.delete(el);
      tabs.forEach((t) => t.classList.remove("is-active", "is-other"));
      el.classList.remove("is-open");
      veil?.classList.remove("is-open");
      swapTl.clear().to({}, { duration: T.hold * d }).to(drawers, { autoAlpha: 0, duration: T.out * d, onComplete: () => drawers.forEach((dr) => dr.classList.remove("is-active")) });
      el.dispatchEvent(new Event("fx:close"));
    };
    tabs.forEach((t) => t.addEventListener("click", (e) => { e.preventDefault(); open(t.dataset.key); }, on));
    q("close").forEach((b) => b.addEventListener("click", close, on));
    veil?.addEventListener("click", close, on);
    el.addEventListener("fx:close", close, on);
    el.addEventListener("fx:open", (e) => e.detail?.key && e.detail.key !== key && open(e.detail.key), on);
    gsap.set(drawers, { autoAlpha: 0 });
    return () => {
      ac.abort();
      opened.delete(el);
      swapTl.kill();
      veil?.remove();
      el.classList.remove("is-open");
      tabs.forEach((t) => t.classList.remove("is-active", "is-other"));
      drawers.forEach((dr) => dr.classList.remove("is-active"));
      gsap.set(drawers, { clearProps: "opacity,visibility,transform" });
    };
  });
})();
