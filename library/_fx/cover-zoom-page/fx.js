(() => {
  // Pressing a cover (link) spawns a clone in place that grows 1.5× (.25 appear → .3 power3.in), and that year’s color plate spreads from the clone’s spot to the full screen (.2 → .5)
  // The picture in the plate drifts left and right for 3s each, then moves on after 1s. On the next page, look: arrive elements shrink the same plate that covered the screen back to its place in 1s and clear it in 3s.
  // Panel and clones attach to body — so transforms on the cover and shelf don’t disturb the fixed position
  const KEY = "fx-cover-zoom-page";
  const layer = (css) => {
    const d = document.createElement("div");
    d.setAttribute("aria-hidden", "true");
    Object.assign(d.style, { position: "fixed", left: "0", top: "0", zIndex: "1000", pointerEvents: "none", overflow: "hidden" }, css);
    document.body.append(d);
    return d;
  };
  const strip = (node) => {
    [node, ...node.querySelectorAll("[data-fx]")].forEach((n) => n.removeAttribute?.("data-fx"));
    return node;
  };
  const artBox = (sheet, html, wide) => {
    if (!html) return null;
    const art = document.createElement("div");
    Object.assign(art.style, { position: "absolute", right: "0", top: "50%", width: `${wide}%`, translate: "0 -50%" });
    art.innerHTML = html;
    sheet.append(art);
    return art;
  };

  kfFx.register("cover-zoom-page", (el, { options, reduce }) => {
    const wide = +(options.wide ?? 120);
    if (options.look === "arrive") {
      let got = null;
      try { got = JSON.parse(sessionStorage.getItem(KEY) || "null"); sessionStorage.removeItem(KEY); } catch (e) {}
      if (!got || reduce) return;
      const sheet = layer({ background: got.color, width: "100%", height: "100%" });
      artBox(sheet, got.art, wide);
      const g = el.getBoundingClientRect();
      const tl = gsap.timeline({ onComplete: () => sheet.remove() })
        .to(sheet, { left: g.left, top: g.top, width: g.width, height: g.height, duration: +(options.shrink ?? 1) })
        .to(sheet, { opacity: 0, duration: +(options.fade ?? 3) });
      return () => { tl.kill(); sheet.remove(); };
    }

    const zoom = +(options.zoom ?? 1.5), wait = +(options.wait ?? 1), pan = +(options.pan ?? 12);
    const made = [];
    let busy = false, tl = null, later = null, drift = null;
    const restore = () => {
      tl?.kill();
      later?.kill();
      drift?.kill();
      made.splice(0).forEach((n) => { gsap.killTweensOf(n); n.remove(); });
      gsap.set(el, { clearProps: "opacity" });
      busy = false;
    };
    const go = (e) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || el.target === "_blank") return;
      const href = el.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      e.preventDefault();
      if (busy) return;
      busy = true;
      const cs = getComputedStyle(el);
      const color = cs.getPropertyValue("--fx-sheet").trim() || cs.getPropertyValue("--kf-accent").trim();
      const artSrc = el.querySelector("[data-fx-part=art]");
      const art = artSrc ? strip(artSrc.cloneNode(true)).outerHTML : "";
      const leave = () => {
        try { sessionStorage.setItem(KEY, JSON.stringify({ color, art })); } catch (err) {}
        location.href = el.href;
      };
      if (reduce) return leave();
      gsap.set(el, { rotate: 0, scale: 1 });
      const r = el.getBoundingClientRect();
      const clone = layer({ left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px`, opacity: "0" });
      clone.append(strip(el.cloneNode(true)));
      clone.firstElementChild.style.cssText += ";position:static;width:100%;height:100%;transform:none;rotate:none;scale:none;";
      const sheet = layer({ background: color, opacity: "0" });
      const sheetArt = artBox(sheet, art, wide);
      made.push(clone, sheet);
      tl = gsap.timeline({ onComplete: () => { later = gsap.delayedCall(wait, leave); } })
        .to(clone, { opacity: 1, duration: 0.25 })
        .set(el, { opacity: 0 })
        .to(clone, { scale: zoom, duration: 0.3, ease: "power3.in" })
        .add(() => {
          const z = clone.getBoundingClientRect();
          gsap.set(sheet, { left: z.left, top: z.top, width: z.width, height: z.height });
        })
        .to(sheet, { opacity: 1, duration: 0.2 })
        .set(clone, { opacity: 0 })
        .to(sheet, { left: 0, top: 0, width: "100%", height: "100%", duration: 0.5 })
        .add(() => { if (sheetArt) drift = gsap.fromTo(sheetArt, { xPercent: 0 }, { xPercent: pan, duration: 3, ease: "none", repeat: -1, yoyo: true }); });
    };
    const back = (e) => e.persisted && restore();
    el.addEventListener("click", go);
    addEventListener("pageshow", back);
    return () => { el.removeEventListener("click", go); removeEventListener("pageshow", back); restore(); };
  });
})();
