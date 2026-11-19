// A small tag that only turns on over labeled panels — it follows the mouse even while off, so it is already beside the cursor when it turns on
(() => {
  kfFx.register("cursor-tag-follow", (el, { options, reduce, hover }) => {
    if (!hover) return;
    const tag = document.createElement("div");
    tag.className = "fx-cursor-tag";
    tag.setAttribute("aria-hidden", "true");
    const label = tag.appendChild(document.createElement("span"));
    document.body.appendChild(tag);
    const lag = reduce ? 0 : +(options.lag ?? 0.6);
    const ease = kfFx.ease(options.ease || "0.19,1,0.22,1", "expo.out");
    // Zero delay (reduced-motion setting, lag: 0) can’t move the position because quickTo with duration 0 doesn’t work, so like the original it is placed directly with left and top
    // follow: css — as in the original site, transform is written directly and a CSS transition (lag seconds · ease) delays it. After stopping it always catches up within lag
    const css = options.follow === "css" && lag > 0;
    let px0 = 0, py0 = 0;
    if (css) {
      const bez = String(options.ease || "0.19,1,0.22,1").includes(",") ? `cubic-bezier(${options.ease || "0.19,1,0.22,1"})` : "ease-out";
      tag.style.transition = `transform ${lag}s ${bez}, opacity var(--fx-fade, 0.7s) var(--fx-fade-ease, cubic-bezier(0.19, 1, 0.22, 1))`;
    }
    const put = () => { tag.style.transform = `translate3d(${px0}px, ${py0}px, 0)`; };
    const qx = css ? (v) => { px0 = Math.floor(v); put(); } : lag > 0 ? gsap.quickTo(tag, "x", { duration: lag, ease }) : (v) => { tag.style.left = `${v}px`; };
    const qy = css ? (v) => { py0 = Math.floor(v); put(); } : lag > 0 ? gsap.quickTo(tag, "y", { duration: lag, ease }) : (v) => { tag.style.top = `${v}px`; };
    // x·y — how many % of its own size the tag is offset from the cursor (default is 25%·50% in css). With flip, at the right edge it flips to the left (-100%), and in the bottom 10% of the screen it flips above (-120%)
    const ox = options.x != null ? +options.x : null, oy = options.y != null ? +options.y : null, flip = options.flip === "true";
    if (ox != null || oy != null || flip) gsap.set(label, { x: 0, y: 0, xPercent: ox ?? 25, yPercent: oy ?? 50 });
    // dx, dy — distance in px to offset from the cursor (the Brand preset is 5 right and 16 up), default 0
    const dx = +(options.dx ?? 0), dy = +(options.dy ?? 0);
    // track: zone — while off it does not follow, and the moment it turns on it jumps straight to the cursor position then follows (Brand — outside the panel the tag stays still)
    const zoneOnly = options.track === "zone";
    let lx = innerWidth / 2, ly = innerHeight / 2;
    // Initially placed off at screen center — placing it offscreen (above 0,0) keeps it from counting as a visible element until it first turns on
    if (zoneOnly) { if (css || lag <= 0) { qx(lx); qy(ly); } else { qx(lx, lx); qy(ly, ly); } }
    const move = (e) => {
      lx = e.clientX + dx; ly = e.clientY + dy;
      if (zoneOnly && !tag.classList.contains("is-on")) return;
      qx(lx); qy(ly);
      if (!flip) return;
      const px = e.clientX > innerWidth - label.offsetWidth - 16 ? -100 : ox ?? 25, py = e.clientY > 0.9 * innerHeight ? -120 : oy ?? 50;
      gsap.to(label, { xPercent: px, yPercent: py, duration: lag, ease, overwrite: "auto" });
    };
    const over = (e) => {
      const t = e.target.closest?.("[data-cursor]");
      if (!t || !el.contains(t)) return;
      label.textContent = t.dataset.cursor;
      if (zoneOnly && !tag.classList.contains("is-on")) {
        lx = e.clientX + dx; ly = e.clientY + dy;
        if (css || lag <= 0) { qx(lx); qy(ly); } else { qx(lx, lx); qy(ly, ly); }
      }
      tag.classList.add("is-on");
    };
    const out = (e) => {
      const next = e.relatedTarget?.closest?.("[data-cursor]");
      if (!next || !el.contains(next)) tag.classList.remove("is-on");
    };
    addEventListener("mousemove", move, { passive: true });
    el.addEventListener("mouseover", over);
    el.addEventListener("mouseout", out);
    return () => {
      removeEventListener("mousemove", move);
      el.removeEventListener("mouseover", over);
      el.removeEventListener("mouseout", out);
      gsap.killTweensOf([tag, label]);
      tag.remove();
    };
  });
})();
