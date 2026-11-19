(() => {
  // Original desktop values: pieces that look scattered from the start (slot number: x%, y%, z, blur) and the order in which the rest attach.
  const FIRST = { 20: [-645, -160, -260, 0], 4: [-200, -135, -1200, 12], 5: [180, 80, -360, 0], 2: [220, 245, -100, 0], 19: [130, -240, -2270, 12], 15: [96, -10, 252, 0] };
  const ORDER = [0, 34, 7, 22, 1, 19, 28, 3, 33, 21, 6, 25, 2, 18, 12, 27, 29, 8, 13, 32, 23, 16, 24, 5, 31, 14, 9];

  kfFx.register("tile-gather-scrub", (el, { options, reduce, scroller }) => {
    const frame = el.querySelector('[data-fx-part="frame"]');
    const image = el.querySelector('[data-fx-part="image"]');
    if (!frame || !image || !window.gsap) return;
    const cols = +options.cols || 7, rows = +options.rows || 5, n = cols * rows;
    const intro = +(options.intro ?? 2.7), delay = +(options.delay ?? 0.5);
    const ease = (s, f) => kfFx.ease(s, f);
    const sway = ease("0.08,0.494,0.14,1", "expo.out"), wide = ease("0.83,0,0.17,1", "power4.inOut");
    if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

    // Put one copy of the image in each cell and show only that cell’s portion — even if pieces fly in, they interlock as a single image
    const layer = document.createElement("div");
    layer.className = "fx-tg-layer";
    const tiles = [];
    for (let i = 0; i < n; i++) {
      const c = i % cols, r = Math.floor(i / cols);
      const t = document.createElement("div");
      t.className = "fx-tg-tile";
      t.style.cssText = `left:${(c * 100) / cols}%;top:${(r * 100) / rows}%;width:${100 / cols}%;height:${100 / rows}%`;
      const copy = image.cloneNode(true);
      copy.removeAttribute("data-fx-part");
      copy.setAttribute("aria-hidden", "true");
      copy.style.cssText = `position:absolute;width:${cols * 100}%;height:${rows * 100}%;left:${-c * 100}%;top:${-r * 100}%`;
      t.append(copy);
      layer.append(t);
      tiles.push(t);
    }
    frame.append(layer);
    image.style.visibility = "hidden";
    if (reduce) { layer.remove(); image.style.visibility = ""; return; }

    // Start positions of the remaining pieces are pseudo-random by cell index — same every time it opens
    const rnd = (i, k) => { const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return x - Math.floor(x); };
    const start = tiles.map((_, i) => FIRST[i] || [(rnd(i, 1) - 0.5) * 900, (rnd(i, 2) - 0.5) * 600, -300 - rnd(i, 3) * 1600, rnd(i, 4) * 12]);
    const firsts = Object.keys(FIRST).map(Number).filter((i) => i < n);
    const rest = [...ORDER.filter((i) => i < n && !FIRST[i]), ...tiles.map((_, i) => i).filter((i) => !FIRST[i] && !ORDER.includes(i))];
    const at = (i, k = 1, z = 0, b = 0) => ({ xPercent: start[i][0] * k, yPercent: start[i][1] * (k === 1 ? 1 : 1.5), z: start[i][2] + z, filter: `blur(${start[i][3] + b}px)` });

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      firsts.forEach((i) => gsap.set(tiles[i], { ...at(i, 2, -1500, 20), opacity: 0, scale: 0.2 }));
      rest.forEach((i) => gsap.set(tiles[i], { ...at(i, 1, 0, start[i][3]), opacity: 0, scale: 0.2 }));
      const tl = gsap.timeline({ delay });
      firsts.forEach((i) => tl.fromTo(tiles[i], { ...at(i, 2, -1500, 40), opacity: 0, scale: 0.2 }, { ...at(i), opacity: 0.8, scale: 1, ease: sway, duration: intro }, 0));
      const st = gsap.timeline({ scrollTrigger: { trigger: el, scroller, start: options.start || "top top", end: options.end || "bottom bottom", scrub: +(options.scrub ?? 1.5) } });
      firsts.forEach((i) => st.to(tiles[i], { xPercent: 0, yPercent: 0, z: 0, opacity: 1, scale: 1, filter: "blur(0px)", force3D: true, ease: "power3.inOut", duration: 3.5 }, 0));
      rest.forEach((i, k) => st.to(tiles[i], { xPercent: 0, yPercent: 0, z: 0, opacity: 1, scale: 1, filter: "blur(0px)", force3D: true, ease: "power3.out", duration: 3, immediateRender: false }, 3.4 + (k / rest.length) * 3));
      st.set(layer, { autoAlpha: 0 }, "+=0.01").set(image, { visibility: "visible" }, "<");
      if (options.widen !== "off") st.to(frame, { width: "100%", maxWidth: "100%", duration: 4, ease: wide }, ">");
      st.call(() => el.dispatchEvent(new CustomEvent("fx:gathered", { bubbles: true, detail: { dir: st.scrollTrigger?.direction } })), null, ">");
      return () => { tl.kill(); st.scrollTrigger?.kill(); st.kill(); };
    });
    return () => { mm.revert(); layer.remove(); image.style.visibility = ""; gsap.set(frame, { clearProps: "width,maxWidth" }); };
  });
})();
