// Over the full-bleed photo panel, the next photo’s small panel (square 214px) follows the cursor 25% per frame, and on click that small panel grows in place to fill the screen and becomes the next photo.
// A small panel grows only when it fits entirely inside the panel (20% per frame), and when it catches on the edge it shrinks to a point 64px inside. Touch devices keep a fixed 80×96 at right center.
(() => {
  kfFx.register("thumb-grow-carousel", (el, { options, reduce, hover }) => {
    const slides = [...el.querySelectorAll('[data-fx-part="slide"]')];
    if (slides.length < 2) return;
    const ease = kfFx.ease(options.ease || "0.4,0.4,0,1", "power2.inOut");
    const dur = +(options.dur ?? 1);
    const follow = +(options.follow ?? 0.25);
    const [mw, mh] = String(options.msize || "80x96").split("x").map(Number);
    const size = +(options.size || 214);
    let cur = 0, busy = false;
    const st = { x: null, y: null, raw: null, hover: hover ? 0 : 1, scale: 1, w: size, h: size };
    slides.forEach((s, i) => { s.classList.add("fx-tgc-slide"); s.style.zIndex = i === cur ? 1 : 0; s.style.visibility = i === cur ? "visible" : "hidden"; });
    const thumb = document.createElement("div");
    thumb.className = "fx-tgc-thumb";
    thumb.setAttribute("aria-hidden", "true");
    el.appendChild(thumb);
    const fillThumb = () => {
      const next = slides[(cur + 1) % slides.length].cloneNode(true);
      next.removeAttribute("data-fx-part");
      next.classList.remove("fx-tgc-slide");
      next.style.cssText = "position:absolute;inset:0;visibility:visible;z-index:auto";
      thumb.replaceChildren(next);
    };
    fillThumb();
    const layout = () => {
      const touch = !hover || innerWidth < 768;
      st.w = touch ? mw : size; st.h = touch ? mh : size;
      if (touch) { st.x = el.clientWidth - 40 - 20 - 40; st.y = el.clientHeight / 2 - 48; st.raw = null; st.hover = 1; }
    };
    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(el);
    // Like the original, the mouse position is remembered across the whole window, and even when the board rolls under that spot it is re-measured against the board every frame
    let pointer = null;
    const move = (e) => { if (e.pointerType !== "touch") pointer = { x: e.clientX, y: e.clientY }; };
    // If the plate is off screen, the small plate doesn’t move (so an invisible plate isn’t redrawn following the mouse)
    let seen = false;
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; });
    io.observe(el);
    const draw = () => {
      if (!seen) return;
      if (pointer && hover && innerWidth >= 768) { const r = el.getBoundingClientRect(); st.raw = { x: pointer.x - r.left, y: pointer.y - r.top }; }
      if (st.raw) {
        if (st.x == null) { st.x = st.raw.x; st.y = st.raw.y; }
        st.x += (st.raw.x - st.x) * follow;
        st.y += (st.raw.y - st.y) * follow;
        const inside = st.x >= 0 && st.x + st.w <= el.clientWidth && st.y >= 0 && st.y + st.h <= el.clientHeight;
        st.hover += ((inside ? 1 : 0) - st.hover) * 0.2;
      } else if (hover && innerWidth >= 768) st.hover += (0 - st.hover) * 0.2;
      const f = st.hover, w = st.w * st.scale * f, h = st.h * st.scale * f, l = 1 - f;
      if (st.x == null || w < 0.5) { thumb.style.visibility = "hidden"; return; }
      thumb.style.visibility = "visible";
      thumb.style.transform = `translate3d(${st.x + st.w / 2 - (st.w - 64) * 0.5 * l - w / 2}px, ${st.y + st.h / 2 - (st.h - 64) * 0.5 * l - h / 2}px, 0)`;
      thumb.style.width = `${w}px`;
      thumb.style.height = `${h}px`;
    };
    gsap.ticker.add(draw);
    const next = () => {
      if (busy) return;
      const ni = (cur + 1) % slides.length;
      const s = slides[ni];
      const prev = slides[cur];
      if (reduce) { prev.style.visibility = "hidden"; s.style.visibility = "visible"; s.style.zIndex = 1; cur = ni; fillThumb(); return; }
      busy = true;
      const r = thumb.getBoundingClientRect(), box = el.getBoundingClientRect();
      const from = thumb.style.visibility === "visible" ? { x: r.left - box.left, y: r.top - box.top, w: r.width, h: r.height } : { x: box.width / 2, y: box.height / 2, w: 0, h: 0 };
      s.style.zIndex = 2;
      s.style.visibility = "visible";
      gsap.fromTo(s, { left: from.x, top: from.y, width: from.w, height: from.h, right: "auto", bottom: "auto" }, { left: 0, top: 0, width: box.width, height: box.height, duration: dur, ease, onComplete: () => {
        prev.style.visibility = "hidden"; prev.style.zIndex = 0;
        s.style.zIndex = 1;
        gsap.set(s, { clearProps: "left,top,width,height,right,bottom" });
        busy = false;
      } });
      cur = ni;
      st.scale = 0;
      fillThumb();
      gsap.to(st, { scale: 1, duration: +(options.grow ?? 0.8), delay: 0.2, ease });
      el.dispatchEvent(new CustomEvent("fx:change", { detail: { index: ni } }));
    };
    addEventListener("pointermove", move, { passive: true });
    el.addEventListener("click", next);
    const key = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); next(); } };
    if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "0");
    el.addEventListener("keydown", key);
    return () => {
      gsap.ticker.remove(draw);
      ro.disconnect();
      io.disconnect();
      removeEventListener("pointermove", move);
      el.removeEventListener("click", next);
      el.removeEventListener("keydown", key);
      gsap.killTweensOf(st);
      slides.forEach((s) => { gsap.killTweensOf(s); s.classList.remove("fx-tgc-slide"); s.style.removeProperty("z-index"); s.style.removeProperty("visibility"); gsap.set(s, { clearProps: "left,top,width,height,right,bottom" }); });
      thumb.remove();
    };
  });
})();
