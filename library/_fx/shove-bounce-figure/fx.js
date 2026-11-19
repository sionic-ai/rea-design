// Character that flies off when pushed: the center image first pops up from .75× scale and 45px below (.65s back.out(1.8)), then every 120ms it swaps between center, right, center, left frames to shake.
// When the cursor brushes lightly over the image it is pushed .45 times the distance moved (up to ±160px) and returns in .5s, and when struck hard (over 2px/ms · 20px) it flies to the 340px wall in .22s
// tilts 12° (a turned-around frame past 160px) and shows a speech bubble, then returns with .65s elastic. On return the next color spreads from the picture center as a circle over .85s and becomes the background,
// Stay turned around for .25s, then change into the next skin — brand
(() => {
  kfFx.register("shove-bounce-figure", (host, { options, reduce, hover }) => {
    const fig = host.querySelector('[data-fx-part="figure"]');
    if (!fig) return;
    const bubble = host.querySelector('[data-fx-part="bubble"]');
    const list = (s) => (s || "").split(/\s+/).filter((v) => v.startsWith("--"));
    const pages = list(options.colors), costumes = list(options.costumes);
    const prop = options.prop || "--fx-page";
    const wall = +(options.wall ?? 340), gentle = +(options.gentle ?? 160), push = +(options.push ?? 0.45);
    const speed = +(options.speed ?? 2), min = +(options.min ?? 20), turnAt = +(options.turn ?? 160);
    const fly = +(options.fly ?? 0.22), back = +(options.back ?? 0.65), hold = +(options.hold ?? 0.25), spread = +(options.ripple ?? 0.85);
    const every = +(options.frames ?? 120), gap = +(options["side-gap"] ?? 260), lift = +(options["bubble-y"] ?? 170), top = +(options["bubble-top"] ?? 20);
    const order = ["center", "right", "center", "left"];
    let step = 0, turning = false, smashing = false, mustLeave = false, pos = 0, ret = null, lastX = null, lastT = null;
    let at = Math.floor(Math.random() * Math.max(1, pages.length)), wear = Math.floor(Math.random() * Math.max(1, costumes.length));
    const root = document.documentElement;
    const paint = () => {
      if (pages.length) root.style.setProperty(prop, `var(${pages[at % pages.length]})`);
      if (costumes.length) fig.style.setProperty("--fx-costume", `var(${costumes[wear % costumes.length]})`);
    };
    paint();
    const frame = (f) => fig.setAttribute("data-frame", f);
    if (reduce) { frame("center"); return () => { root.style.removeProperty(prop); fig.style.removeProperty("--fx-costume"); }; }

    gsap.fromTo(fig, { opacity: 0, scale: 0.75, y: 45 }, { opacity: 1, scale: 1, y: 0, duration: 0.65, ease: "back.out(1.8)", clearProps: "y" });
    const sway = every > 0 ? setInterval(() => { if (!turning) frame(order[(step = (step + 1) % order.length)]); }, every) : 0;

    // The spreading circle is drawn on a screen-fixed board behind the image and in front of the background
    const layer = document.createElement("div");
    layer.className = "fx-sbf-layer";
    layer.setAttribute("aria-hidden", "true");
    document.body.prepend(layer);

    const showBubble = (left) => {
      if (!bubble || (top >= 0 && scrollY > top)) return;
      gsap.killTweensOf(bubble);
      const w = bubble.offsetWidth || 480, c = innerWidth / 2;
      const x = left ? c - gap - w : c + gap, y = innerHeight * 0.55 - lift;
      gsap.set(bubble, { opacity: 0, scale: 0.85, x: left ? x - 25 : x + 25, y, rotate: left ? -4 : 4, transformOrigin: "center center", force3D: true });
      gsap.to(bubble, { opacity: 1, x, scale: 1, duration: 0.28, ease: "power2.out", force3D: true });
    };
    const ripple = () => {
      if (!pages.length) return;
      const next = (at + 1) % pages.length;
      layer.replaceChildren();
      const r = fig.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const dot = document.createElement("div");
      dot.className = "fx-sbf-dot";
      Object.assign(dot.style, { left: `${cx}px`, top: `${cy}px`, background: `var(${pages[next]})` });
      layer.append(dot);
      const far = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy));
      gsap.fromTo(dot, { xPercent: -50, yPercent: -50, scale: 1 }, { scale: (far / 450) * 1.05, duration: spread, ease: "power2.out",
        onComplete: () => { at = next; paint(); dot.remove(); host.dispatchEvent(new CustomEvent("fx:color", { detail: { index: at, name: pages[at] } })); } });
      if (bubble) gsap.delayedCall(0.18, () => gsap.to(bubble, { opacity: 0, duration: 0.35, ease: "power2.inOut" }));
    };
    const smash = (left) => {
      ret?.kill();
      smashing = true; mustLeave = true;
      gsap.to(fig, { x: left ? -wall : wall, rotate: left ? -12 : 12, duration: fly, ease: "power2.out",
        onUpdate: () => { if (!turning && Math.abs(gsap.getProperty(fig, "x")) >= turnAt) { turning = true; frame("turn"); } },
        onComplete: () => {
          showBubble(left);
          gsap.to(fig, { x: 0, rotate: 0, duration: back, ease: "elastic.out(1, 0.45)",
            onComplete: () => {
              pos = 0;
              turning = true; frame("turn");
              ripple();
              gsap.delayedCall(hold, () => { wear++; paint(); step = 0; frame("center"); turning = false; });
              gsap.delayedCall(0.1, () => {
                smashing = false;
                const r = fig.getBoundingClientRect();
                if (lastX == null || lastX < r.left || lastX > r.right) mustLeave = false;
              });
            } });
        } });
    };
    const move = (e) => {
      const now = performance.now();
      if (lastX == null) { lastX = e.clientX; lastT = now; return; }
      const dx = e.clientX - lastX, dt = Math.max(1, now - lastT), prev = lastX;
      lastX = e.clientX; lastT = now;
      const r = fig.getBoundingClientRect();
      const inside = e.clientY >= r.top && e.clientY <= r.bottom && !(Math.max(prev, lastX) < r.left || Math.min(prev, lastX) > r.right);
      if (mustLeave) { if (!inside) mustLeave = false; return; }
      if (smashing || !inside) return;
      if (Math.abs(dx) / dt >= speed && Math.abs(dx) >= min) { smash(dx < 0); return; }
      ret?.kill();
      pos = Math.max(-gentle, Math.min(gentle, pos + dx * push));
      gsap.set(fig, { x: pos, rotate: 0 });
      ret = gsap.to(fig, { x: 0, duration: 0.5, ease: "power2.out", onUpdate: () => { pos = gsap.getProperty(fig, "x"); } });
    };
    if (hover) addEventListener("mousemove", move, { passive: true });
    return () => {
      clearInterval(sway);
      removeEventListener("mousemove", move);
      ret?.kill();
      gsap.killTweensOf([fig, bubble].filter(Boolean));
      gsap.set(fig, { clearProps: "transform,opacity" });
      if (bubble) gsap.set(bubble, { clearProps: "all" });
      layer.remove();
      root.style.removeProperty(prop);
      fig.style.removeProperty("--fx-costume");
      fig.removeAttribute("data-frame");
    };
  });
})();
