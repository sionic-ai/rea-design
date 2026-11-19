// Dot-pattern transition curtain — lay a staggered dot grid over the screen, giving each dot a delay --d by row order (bottom rows first).
// Entering page: the dots grow and stay covered, then clear from the bottom row. Clicking a same-site link: the dots grow from the bottom row to cover, and after hold seconds it navigates
(() => {
  kfFx.register("dot-rows-veil", (el, { options, reduce }) => {
    const cell = +(options.cell || 37), hold = +(options.hold ?? 0.75);
    const spreadIn = +(options["spread-in"] ?? 0.5), spreadOut = +(options["spread-out"] ?? 0.3);
    const build = (spread) => {
      const cols = Math.ceil(innerWidth / (2 * cell)) + 1, rows = Math.ceil(innerHeight / cell) + 2;
      let html = "";
      for (let r = 0; r <= rows; r++) {
        const d = (spread - (spread * r) / rows).toFixed(3);
        html += `<div class="fx-dot-line"${r % 2 ? " data-odd" : ""}>${`<i style="--d:${d}s"></i>`.repeat(cols)}</div>`;
      }
      el.innerHTML = html;
    };
    el.style.setProperty("--fx-cell", `${cell}px`);
    if (options.reveal !== undefined) el.style.setProperty("--fx-reveal", `${+options.reveal}s`);
    if (options.cover !== undefined) el.style.setProperty("--fx-cover", `${+options.cover}s`);
    el.setAttribute("aria-hidden", "true");
    if (reduce) { el.classList.add("is-done"); return () => el.classList.remove("is-done"); }

    let raf = 0, t1 = 0, t2 = 0;
    const open = () => {
      build(spreadIn);
      el.classList.remove("is-leave", "is-pre", "is-open", "is-done");
      el.classList.add("is-covered");
      raf = requestAnimationFrame(() => (raf = requestAnimationFrame(() => {
        el.classList.add("is-open");
        const reveal = parseFloat(getComputedStyle(el).getPropertyValue("--fx-reveal")) || 1.25;
        t1 = setTimeout(() => { el.classList.add("is-done"); el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true })); }, (reveal + spreadIn) * 1000);
      })));
    };
    const onClick = (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || (url.pathname === location.pathname && url.hash)) return;
      e.preventDefault();
      clearTimeout(t1);
      build(spreadOut);
      el.classList.remove("is-covered", "is-open", "is-done");
      el.classList.add("is-leave", "is-pre");
      void el.offsetWidth;
      el.classList.remove("is-pre");
      t2 = setTimeout(() => (location.href = url.href), hold * 1000);
    };
    const onShow = (e) => { if (e.persisted) { clearTimeout(t2); el.classList.remove("is-leave", "is-pre", "is-covered"); el.classList.add("is-open", "is-done"); } };
    document.addEventListener("click", onClick);
    addEventListener("pageshow", onShow);
    if (document.readyState === "complete") open(); else addEventListener("load", open, { once: true });
    return () => {
      cancelAnimationFrame(raf); clearTimeout(t1); clearTimeout(t2);
      document.removeEventListener("click", onClick);
      removeEventListener("pageshow", onShow);
      removeEventListener("load", open);
      el.innerHTML = "";
      el.classList.remove("is-covered", "is-open", "is-done", "is-leave", "is-pre");
    };
  });
})();
