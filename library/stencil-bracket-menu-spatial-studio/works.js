// Work list — original values as they are:
// Tile↔list: a clone of the photo floats in place and the panel drops out in .25s power2.in, then while the height changes in .65s power3.inOut the clone flies to the new photo spot, and the panel returns in .3s.
// New↔old sort: cell clones slide to their new positions in .55s power3.inOut (content swaps at .24s + 15ms per cell).
// Branches (All · Stores · Offices): the original navigates to a branch address — here, within the same board, items are filtered with the same drop-out and height change as tile↔list.
(() => {
  const { lenis, reduce } = window.fgShared;
  const body = document.querySelector("[data-works-body]");
  const grid = document.querySelector("[data-tiles]");
  if (!body || !grid) return;
  let busy = false;

  const visibleTiles = () => [...grid.children].filter((li) => li.style.display !== "none");
  const flyImages = (apply) => {
    if (reduce) { apply(); return; }
    busy = true;
    const imgs = visibleTiles().map((li) => li.querySelector("[data-flip-img]"));
    const clones = imgs.map((img) => {
      const r = img.getBoundingClientRect();
      const c = img.cloneNode(true);
      Object.assign(c.style, { position: "fixed", top: r.top + "px", left: r.left + "px", width: r.width + "px", height: r.height + "px", margin: 0, zIndex: 300, pointerEvents: "none", clipPath: getComputedStyle(img).clipPath });
      document.body.append(c);
      return c;
    });
    lenis && lenis.stop();
    const h0 = body.offsetHeight;
    gsap.to(body, {
      opacity: 0, duration: 0.25, ease: "power2.in",
      onComplete: () => {
        gsap.set(body, { height: h0 });
        apply();
        requestAnimationFrame(() => requestAnimationFrame(() => {
          gsap.set(body, { height: "auto" });
          const h1 = body.offsetHeight;
          gsap.fromTo(body, { height: h0 }, { height: h1, duration: 0.65, ease: "power3.inOut", onComplete: () => gsap.set(body, { height: "auto" }) });
          const next = visibleTiles().map((li) => li.querySelector("[data-flip-img]"));
          const tl = gsap.timeline({
            onComplete: () => gsap.to(body, {
              opacity: 1, duration: 0.3, ease: "power2.out",
              onComplete: () => { clones.forEach((c) => c.remove()); lenis && lenis.start(); busy = false; ScrollTrigger.refresh(); },
            }),
          });
          clones.forEach((c, i) => {
            const t = next[i];
            if (!t) { tl.to(c, { opacity: 0, duration: 0.2 }, 0); return; }
            const r = t.getBoundingClientRect();
            tl.to(c, { top: r.top, left: r.left, width: r.width, height: r.height, clipPath: getComputedStyle(t).clipPath, duration: 0.65, ease: "power3.inOut" }, 0);
          });
        }));
      },
    });
  };

  document.querySelectorAll("[data-layout]").forEach((b) => {
    if (b.tagName !== "BUTTON") return;
    b.addEventListener("click", () => {
      if (busy) return;
      const layout = b.dataset.layout;
      document.querySelectorAll(".fg-view button").forEach((x) => x.classList.toggle("is-active", x === b));
      flyImages(() => {
        grid.dataset.layout = layout;
        body.classList.toggle("is-list", layout === "list");
      });
    });
  });

  document.querySelectorAll("[data-filter] button").forEach((b) => {
    b.addEventListener("click", () => {
      if (busy) return;
      const cat = b.dataset.cat;
      document.querySelectorAll("[data-filter] li").forEach((li) => li.classList.toggle("is-active", li.contains(b)));
      flyImages(() => {
        [...grid.children].forEach((li) => { li.style.display = cat === "all" || li.dataset.cat === cat ? "" : "none"; });
      });
    });
  });

  document.querySelectorAll("[data-sort]").forEach((b) => {
    b.addEventListener("click", () => {
      if (busy) return;
      const order = b.dataset.sort;
      document.querySelectorAll("[data-sort]").forEach((x) => x.classList.toggle("is-active", x === b));
      const sorted = [...grid.children].sort((a, c) => (order === "old" ? 1 : -1) * (Number(a.dataset.year) - Number(c.dataset.year)));
      if (reduce) { grid.append(...sorted); return; }
      busy = true;
      const tiles = visibleTiles();
      const h = grid.offsetHeight;
      const clones = tiles.map((li) => {
        const r = li.getBoundingClientRect();
        const c = li.cloneNode(true);
        Object.assign(c.style, { position: "fixed", top: r.top + "px", left: r.left + "px", width: r.width + "px", height: r.height + "px", margin: 0, zIndex: 300, pointerEvents: "none", boxSizing: "border-box", willChange: "transform", contain: "layout paint style" });
        c.setAttribute("aria-hidden", "true");
        document.body.append(c);
        return { c, r, id: li.dataset.flipId };
      });
      gsap.set(grid, { height: h });
      grid.append(...sorted);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        const now = visibleTiles();
        gsap.set(now, { visibility: "hidden" });
        const tl = gsap.timeline({ onComplete: () => { gsap.set(now, { visibility: "visible" }); gsap.set(grid, { height: "auto" }); clones.forEach(({ c }) => c.remove()); busy = false; } });
        clones.forEach(({ c, r, id }, n) => {
          const t = now.find((li) => li.dataset.flipId === id);
          if (!t) { tl.to(c, { opacity: 0, duration: 0.2 }, 0); return; }
          const tr = t.getBoundingClientRect();
          const kids = [...t.childNodes].map((k) => k.cloneNode(true));
          tl.to(c, { x: tr.left - r.left, y: tr.top - r.top, force3D: true, duration: 0.55, ease: "power3.inOut" }, 0);
          tl.call(() => c.replaceChildren(...kids), undefined, 0.24 + 0.015 * n);
        });
      }));
    });
  });
})();
