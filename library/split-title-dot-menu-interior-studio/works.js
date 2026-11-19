// Work list — masonry layout (lowest column, left column first if within 50px), label cursor, gallery/list toggle, and photo swap on list hover
(() => {
  const SD = window.SD;
  SD.register("works", (view) => {
    const ac = new AbortController();
    const on = (t, ev, fn, o = {}) => t.addEventListener(ev, fn, { signal: ac.signal, ...o });

    // Bricks — column count and gap are read from css variables, and each is placed absolutely in the column with the lowest stacked height (the leftmost if within 50px)
    const lists = [...view.querySelectorAll("[data-masonry]")];
    const layout = (list) => {
      const cs = getComputedStyle(list);
      const cols = parseInt(cs.getPropertyValue("--mas-col")) || 1;
      const gap = parseFloat(cs.getPropertyValue("--mas-gap")) * (cs.getPropertyValue("--mas-gap").trim().endsWith("em") ? parseFloat(cs.fontSize) : 1);
      const items = [...list.children];
      if (cols === 1) { list.style.cssText = ""; items.forEach((it) => (it.style.cssText = "")); return; }
      const w = `calc((100% - ${cols - 1} * var(--mas-gap)) / ${cols})`;
      const h = Array(cols).fill(0);
      list.style.position = "relative";
      items.forEach((it) => { it.style.position = "absolute"; it.style.width = w; });
      items.forEach((it) => {
        const ih = it.offsetHeight, min = Math.min(...h);
        let c = h.findIndex((v) => v - min <= 50);
        if (c < 0) c = h.indexOf(min);
        it.style.top = `${h[c]}px`;
        it.style.left = `calc(${w} * ${c} + var(--mas-gap) * ${c})`;
        h[c] += ih + gap;
      });
      list.style.height = `${Math.max(...h)}px`;
    };
    const relayout = () => { lists.forEach(layout); ScrollTrigger.refresh(); };
    lists.forEach(layout);
    const ro = new ResizeObserver(() => relayout());
    ro.observe(view.querySelector("[data-grid]"));

    // Name-tag cursor — offset by 6% and 40%, it follows with a .5s expo, at the right edge it flips to the left (-100%), and within the bottom 10% of the screen it flips above (-120%)
    const tag = view.querySelector("[data-cursor-tag]"), label = tag?.querySelector("span");
    if (tag && SD.fine && !SD.reduce) {
      gsap.set(tag, { xPercent: 6, yPercent: 40 });
      const qx = gsap.quickTo(tag, "x", { ease: "expo", duration: 0.5 }), qy = gsap.quickTo(tag, "y", { ease: "expo", duration: 0.5 });
      // Like the original, follows only while at least one photo with a name tag is on screen (stays still over the footer)
      const seen = new Set();
      const io = new IntersectionObserver((list) => list.forEach((en) => (en.isIntersecting ? seen.add(en.target) : seen.delete(en.target))));
      view.querySelectorAll("[data-cursor]").forEach((el) => io.observe(el));
      ac.signal.addEventListener("abort", () => io.disconnect());
      let text = "";
      const setText = (t) => { if (t && t !== text) { label.textContent = t; text = t; } };
      view.querySelectorAll("[data-cursor]").forEach((el) => on(el, "mouseenter", () => setText(el.dataset.cursor)));
      on(window, "mousemove", (e) => {
        if (!seen.size) return;
        const hit = e.target.closest?.("[data-cursor]");
        if (hit) setText(hit.dataset.cursor);
        const wide = tag.offsetWidth + 16;
        const px = e.clientX > innerWidth - wide ? -100 : 6, py = e.clientY > 0.9 * innerHeight ? -120 : 40;
        gsap.to(tag, { xPercent: px, yPercent: py, duration: 0.5, ease: "expo", overwrite: "auto" });
        qx(e.clientX); qy(e.clientY);
      }, { passive: true });
    }

    // Gallery ↔ list — move to the top and overlap the two, swapping in .4s power2.out, with the panel height following
    const btns = [...view.querySelectorAll("[data-view]")];
    const grid = view.querySelector("[data-grid]"), list = view.querySelector("[data-list]"), wrap = view.querySelector("[data-views]");
    const swap = (toList) => {
      const [show, hide] = toList ? [list, grid] : [grid, list];
      if (!hide.classList.contains("is-hidden") || show.classList.contains("is-hidden")) {
        SD.scrollTo(0);
        gsap.killTweensOf([grid, list, wrap]);
        show.classList.remove("is-hidden");
        hide.classList.remove("is-hidden");
        [show, hide].forEach((p) => Object.assign(p.style, { position: "absolute", top: "0", left: "0", right: "0" }));
        gsap.set(hide, { opacity: 1 }); gsap.set(show, { opacity: 0 });
        const from = hide.offsetHeight, to = show.offsetHeight;
        gsap.set(wrap, { height: from });
        gsap.timeline({ defaults: { duration: SD.reduce ? 0 : 0.4, ease: "power2.out" }, onComplete: () => {
          hide.classList.add("is-hidden");
          show.style.position = show.style.top = show.style.left = show.style.right = "";
          hide.style.position = hide.style.top = hide.style.left = hide.style.right = "";
          gsap.set(wrap, { clearProps: "height" });
          relayout();
        } }).to(show, { opacity: 1 }, 0).to(hide, { opacity: 0 }, 0).to(wrap, { height: to }, 0);
      }
    };
    btns.forEach((b) => on(b, "click", () => {
      if (b.classList.contains("is-on")) return;
      btns.forEach((o) => o.classList.toggle("is-on", o === b));
      swap(b.dataset.view === "list");
    }));

    // List — clicking a type turns the name group on over .5s and off over .35s (power2.inOut), and the photo group starts with its first image .2s later over .8s power3.inOut
    const cats = [...view.querySelectorAll("[data-list-category]")];
    const pick = (key) => {
      cats.forEach((c) => c.classList.toggle("is-active", c.dataset.listCategory === key));
      view.querySelectorAll("[data-list-content]").forEach((set) => {
        gsap.killTweensOf(set);
        if (set.dataset.listContent === key) { set.classList.remove("is-hidden"); gsap.fromTo(set, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power2.inOut" }); }
        else if (!set.classList.contains("is-hidden")) gsap.to(set, { opacity: 0, duration: 0.35, ease: "power2.inOut", onComplete: () => set.classList.add("is-hidden") });
      });
      view.querySelectorAll("[data-list-image]").forEach((set) => {
        gsap.killTweensOf(set);
        if (set.dataset.listImage === key) {
          set.classList.remove("is-hidden");
          const figs = [...set.querySelectorAll("[data-figure]")], tl = gsap.timeline();
          figs.forEach((f, i) => {
            gsap.killTweensOf(f);
            if (i === 0) { gsap.set(f, { opacity: 0, zIndex: 2 }); tl.to(f, { opacity: 1, duration: 0.8, ease: "power3.inOut" }, 0.2); }
            else { gsap.set(f, { zIndex: 1 }); tl.to(f, { opacity: 0, duration: 0.5, ease: "power3.out" }, 0); }
          });
        } else if (!set.classList.contains("is-hidden")) gsap.to(set, { opacity: 0, duration: 0.3, ease: "power2.inOut", onComplete: () => { set.classList.add("is-hidden"); gsap.set(set, { opacity: 1 }); } });
      });
    };
    cats.forEach((c) => on(c, "click", () => pick(c.dataset.listCategory)));
    // Hovering a name dims the other names to .3, its work photo rises in .25s power3 and the rest leave in .35s. On leave, back to the first one in 1s
    const names = [...view.querySelectorAll("[data-project]")];
    names.forEach((n) => {
      on(n, "mouseenter", () => {
        names.forEach((o) => { gsap.killTweensOf(o); gsap.to(o, { opacity: o === n ? 1 : 0.3, duration: 0.3, ease: "power1" }); });
        const set = view.querySelector("[data-list-image]:not(.is-hidden)"), fig = set?.querySelector(`[data-figure="${n.dataset.project}"]`);
        if (!fig) return;
        set.querySelectorAll("[data-figure]").forEach((f) => { gsap.killTweensOf(f); gsap.to(f, { opacity: 0, duration: 0.35, zIndex: 0, ease: "power3" }); });
        gsap.killTweensOf(fig);
        gsap.to(fig, { opacity: 1, duration: 0.25, zIndex: 2, ease: "power3" });
      });
      on(n, "mouseleave", () => {
        names.forEach((o) => { gsap.killTweensOf(o); gsap.to(o, { opacity: 1, duration: 0.3, ease: "power1" }); });
        const set = view.querySelector("[data-list-image]:not(.is-hidden)");
        if (!set) return;
        const figs = [...set.querySelectorAll("[data-figure]")];
        figs.forEach((f) => { gsap.killTweensOf(f); gsap.to(f, { opacity: 0, duration: 1, ease: "power3" }); });
        gsap.killTweensOf(figs[0]);
        gsap.to(figs[0], { opacity: 1, duration: 1, ease: "power3" });
      });
    });

    return () => { ac.abort(); ro.disconnect(); };
  });
})();
