(() => {
  // A bright plate is hidden behind an SVG mask and only the blurred circle (diameter size, blur blur) is lit — the circle sticks to the cursor with no delay, and
  // Pressing the lamp button (switch) lights the background rectangles in .8s to reveal the whole panel. In the scroll fade range the circle clears away
  let uid = 0;
  const NS = "http://www.w3.org/2000/svg";
  kfFx.register("spotlight-layer-mask", (el, { options, reduce, hover, scroller }) => {
    const size = +(options.size || 550), blur = +(options.blur ?? 50), base = +(options.base ?? 0.006);
    const id = `fx-slm-${++uid}`;
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("aria-hidden", "true");
    svg.style.cssText = "position:fixed;width:0;height:0;overflow:hidden;pointer-events:none";
    svg.innerHTML = `<defs><filter id="${id}-b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${blur}"/></filter>
      <mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="100000" height="100000">
        <rect class="fx-slm-base" x="0" y="0" width="100000" height="100000" fill="white"/>
        <rect class="fx-slm-spot" width="${size}" height="${size}" rx="${size}" ry="${size}" fill="white" filter="url(#${id}-b)"/>
      </mask></defs>`;
    document.body.append(svg);
    const baseRect = svg.querySelector(".fx-slm-base"), spot = svg.querySelector(".fx-slm-spot");
    const lit = (on) => {
      el.classList.toggle("is-lit", on);
      baseRect.style.fillOpacity = on ? 1 : base;
      sw?.setAttribute("aria-pressed", String(on));
      sw?.classList.toggle("is-on", on);
    };
    baseRect.style.transition = reduce ? "none" : "fill-opacity .8s";
    el.style.webkitMaskImage = el.style.maskImage = `url(#${id})`;
    el.style.maskType = "luminance";
    const sw = options.switch ? document.querySelector(options.switch) : null;
    lit(reduce || options.lit === "on");

    const box = () => { const r = el.getBoundingClientRect(); return { x: r.left, y: r.top }; };
    const place = (x, y) => { spot.setAttribute("x", String(x - size / 2)); spot.setAttribute("y", String(y - size / 2)); };
    // Initial position is a percent of the panel (original 4% · 12%)
    const start = () => { const r = el.getBoundingClientRect(); place(r.width * parseFloat(options.x ?? 4) / 100 + size / 2, innerHeight * parseFloat(options.y ?? 12) / 100 + size / 2 + (-r.top)); };
    start();
    const onMove = (e) => { const b = box(); place(e.clientX - b.x, e.clientY - b.y); };
    // Giving scroll-top moves the circle down by that much from the screen top (relative to the panel) when scrolling — in the original, releasing the hand and scrolling makes the circle stick to the screen top
    const st = options["scroll-top"] != null ? +options["scroll-top"] : null;
    const target = scroller || window;
    const [f0, f1] = String(options.fade || "").split(/\s+/).map(Number);
    const onScroll = () => {
      const b = box();
      if (st != null) spot.setAttribute("y", String(-b.y + st));
      if (Number.isFinite(f0) && Number.isFinite(f1) && f1 > f0) {
        const y = scroller ? scroller.scrollTop : scrollY;
        spot.style.opacity = String(1 - Math.min(1, Math.max(0, (y - f0) / (f1 - f0))));
      }
    };
    if (hover && !reduce) addEventListener("pointermove", onMove, { passive: true });
    target.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    const toggle = () => lit(!el.classList.contains("is-lit"));
    sw?.addEventListener("click", toggle);
    // When the consumer switches the light off after the loader has cleared — el.dispatchEvent(new CustomEvent("fx:light", { detail: false }))
    const onLight = (e) => lit(typeof e.detail === "boolean" ? e.detail : !el.classList.contains("is-lit"));
    el.addEventListener("fx:light", onLight);
    return () => {
      removeEventListener("pointermove", onMove);
      target.removeEventListener("scroll", onScroll);
      sw?.removeEventListener("click", toggle);
      el.removeEventListener("fx:light", onLight);
      el.style.removeProperty("mask-image");
      el.style.removeProperty("-webkit-mask-image");
      el.style.removeProperty("mask-type");
      el.classList.remove("is-lit");
      svg.remove();
    };
  });
})();
