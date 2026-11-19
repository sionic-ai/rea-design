// Stack panel-sized sections (page) and advance one at a time with one wheel tick, up/down keys, vertical swipe or dot buttons (pagePiling type).
// Going down, the current section is peeled up by −100% revealing the next one laid beneath, going up, the peeled section covers down from above —
// 1s cubic-bezier(.55,.085,0,.99). For 1300ms after a switch (original switch 700 + rest 600) the next switch is not accepted.
// A section with longer content (overflow) scrolls inside first, only scrolling at the very top or bottom moves on.
(() => {
  kfFx.register("pile-page-stack", (el, { options, reduce }) => {
    const pages = [...el.children].filter((n) => n.matches('[data-fx-part="page"]'));
    if (pages.length < 2) return;
    const dur = reduce ? 0 : +(options.dur ?? 1);
    const lock = +(options.lock ?? 1300);
    const ease = options.ease || "0.55,0.085,0,0.99";
    const swipe = +(options.swipe ?? 5);
    el.style.setProperty("--fx-dur", dur + "s");
    el.style.setProperty("--fx-ease", /^[\d.,\s-]+$/.test(ease) ? `cubic-bezier(${ease})` : ease);

    const dotsBox = el.querySelector('[data-fx-part="dots"]');
    const dots = dotsBox ? pages.map((_, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", `${i + 1}th Section`);
      b.addEventListener("click", () => go(i));
      dotsBox.append(b);
      return b;
    }) : [];

    let cur = Math.min(Math.max(+(options.start ?? 0), 0), pages.length - 1);
    let last = -Infinity;
    const paint = (animate) => {
      pages.forEach((p, i) => {
        p.style.zIndex = String(pages.length - i);
        p.classList.toggle("fx-pile-moving", animate);
        p.classList.toggle("is-up", i < cur);
        p.toggleAttribute("inert", i !== cur);
      });
      dots.forEach((d, i) => d.toggleAttribute("aria-current", i === cur));
    };
    const go = (i) => {
      if (i < 0 || i >= pages.length || i === cur) return;
      cur = i;
      last = performance.now();
      paint(dur > 0);
      el.dispatchEvent(new CustomEvent("fx:page", { detail: { index: cur }, bubbles: true }));
    };
    const step = (dir) => {
      if (performance.now() - last < lock) return;
      go(cur + dir);
    };
    // An overflowing section only advances once it hits its inner end
    const atEdge = (dir) => {
      const p = pages[cur];
      if (p.scrollHeight <= p.clientHeight + 1) return true;
      return dir > 0 ? p.scrollTop + p.clientHeight >= p.scrollHeight - 1 : p.scrollTop <= 0;
    };

    const ac = new AbortController(), on = { signal: ac.signal };
    el.addEventListener("wheel", (e) => {
      const dir = Math.sign(e.deltaY);
      if (!dir || !atEdge(dir)) return;
      e.preventDefault();
      step(dir);
    }, { passive: false, signal: ac.signal });
    let y0 = null;
    el.addEventListener("touchstart", (e) => { y0 = e.touches[0].clientY; }, { passive: true, signal: ac.signal });
    el.addEventListener("touchend", (e) => {
      if (y0 == null) return;
      const d = y0 - e.changedTouches[0].clientY;
      y0 = null;
      if (Math.abs(d) < (el.clientHeight * swipe) / 100) return;
      const dir = Math.sign(d);
      if (atEdge(dir)) step(dir);
    }, { passive: true, signal: ac.signal });
    addEventListener("keydown", (e) => {
      if (e.target.closest && e.target.closest("input, textarea, select, [contenteditable]")) return;
      const r = el.getBoundingClientRect();
      if (r.bottom <= 0 || r.top >= innerHeight) return;
      const dir = { ArrowDown: 1, PageDown: 1, ArrowUp: -1, PageUp: -1 }[e.key];
      if (!dir || !atEdge(dir)) return;
      e.preventDefault();
      step(dir);
    }, on);
    pages.forEach((p) => p.addEventListener("transitionend", (e) => { if (e.target === p) p.classList.remove("fx-pile-moving"); }, on));
    paint(false);

    return () => {
      ac.abort();
      dots.forEach((d) => d.remove());
      pages.forEach((p) => { p.classList.remove("is-up", "fx-pile-moving"); p.removeAttribute("inert"); p.style.zIndex = ""; });
      el.style.removeProperty("--fx-dur");
      el.style.removeProperty("--fx-ease");
    };
  });
})();
