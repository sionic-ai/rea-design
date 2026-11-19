(() => {
  const HOT = 'a, button, input, textarea, select, label, summary, [role="button"], [tabindex]:not([tabindex="-1"])';
  let dot = null, users = 0;
  kfFx.register("dot-cursor-grow", (el, { options, reduce, hover }) => {
    if (!hover || !window.gsap) return;
    const dur = reduce ? 0 : +(options.dur ?? 0.25);
    // A shape that floats round letter bubbles instead of dots only inside the panel — hero SCROLL hint
    if (options.label) {
      const bubble = document.createElement("div");
      bubble.setAttribute("data-fx-part", "bubble");
      bubble.setAttribute("aria-hidden", "true");
      bubble.textContent = options.label;
      document.body.append(bubble);
      gsap.set(bubble, { x: -100, y: -100, opacity: 0 });
      const qx = gsap.quickTo(bubble, "x", { duration: dur, ease: "power3" }), qy = gsap.quickTo(bubble, "y", { duration: dur, ease: "power3" });
      let inside = false;
      const setDot = (o) => dot && gsap.to(dot, { opacity: o, duration: 0.2, ease: "power2.out" });
      const enter = () => { if (inside) return; inside = true; gsap.to(bubble, { opacity: 1, duration: 0.25, ease: "power2.out" }); setDot(0); };
      const leave = () => { if (!inside) return; inside = false; gsap.to(bubble, { opacity: 0, duration: 0.2, ease: "power2.out" }); setDot(1); };
      const move = (e) => {
        qx(e.clientX); qy(e.clientY);
        const r = el.getBoundingClientRect();
        e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom ? enter() : leave();
      };
      const scroll = () => { const r = el.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) leave(); };
      document.addEventListener("mousemove", move, { passive: true });
      document.addEventListener("scroll", scroll, { passive: true });
      return () => { document.removeEventListener("mousemove", move); document.removeEventListener("scroll", scroll); bubble.remove(); };
    }
    users++;
    if (!dot) {
      dot = document.createElement("div");
      dot.setAttribute("data-fx-part", "dot");
      dot.setAttribute("aria-hidden", "true");
      document.body.append(dot);
    }
    const d = dot, grow = +(options.grow ?? 3);
    // hot — where it grows (css). Brand only uses a, button, [data-pointer-target] — stays as is over fold headers (summary) and input fields
    const hot = options.hot || HOT;
    // Growth length, curve and type — Brand is a 15px green dot that doubles in .6s power3 (without difference blending)
    const growDur = reduce ? 0 : +(options["grow-dur"] ?? 0.25), growEase = kfFx.ease(options["grow-ease"] || "power2.out", "power2.out");
    // Different length · curve only when shrinking — Brand grows with .3s cubic-bezier(.43,.05,.17,1) and shrinks with .55s cubic-bezier(.18,.06,.23,1)
    const outDur = reduce ? 0 : +(options["out-dur"] ?? growDur), outEase = options["out-ease"] ? kfFx.ease(options["out-ease"], "power2.out") : growEase;
    if (options.look) d.dataset.look = options.look;
    // lerp — instead of easing, each frame follows by this fraction of the remaining distance (brand .15)
    const lerp = options.lerp != null ? +options.lerp : 0;
    const pos = { x: -100, y: -100, tx: -100, ty: -100 };
    let raf = 0;
    // look: like the original (#js-pointer), tint moves its position via top/left, while growing and tinting are handled by the css transition (scale3d 6) — transform is left empty for css
    const tint = options.look === "tint";
    if (tint) d.style.setProperty("--fx-grow", grow);
    const put = (x, y) => (tint ? Object.assign(d.style, { left: `${x}px`, top: `${y}px` }) : gsap.set(d, { x, y }));
    const step = () => {
      pos.x += (pos.tx - pos.x) * lerp;
      pos.y += (pos.ty - pos.y) * lerp;
      put(pos.x, pos.y);
      raf = Math.abs(pos.tx - pos.x) + Math.abs(pos.ty - pos.y) > 0.1 ? requestAnimationFrame(step) : 0;
    };
    const qx = lerp ? null : gsap.quickTo(d, "x", { duration: dur, ease: "power3" }), qy = lerp ? null : gsap.quickTo(d, "y", { duration: dur, ease: "power3" });
    let seen = false;
    const move = (e) => {
      if (lerp) { pos.tx = e.clientX; pos.ty = e.clientY; if (!seen) { pos.x = pos.tx; pos.y = pos.ty; } if (!raf) raf = requestAnimationFrame(step); }
      else { qx(e.clientX); qy(e.clientY); }
      if (!seen) { seen = true; gsap.to(d, { opacity: 1, duration: 0.2 }); }
    };
    // While enlarged, data-hot — look: tint is tinted with 20% accent color during that time (css)
    const over = (e) => { if (!e.target.closest?.(hot)) return; d.dataset.hot = ""; if (!tint) gsap.to(d, { scale: grow, duration: growDur, ease: growEase }); };
    const out = (e) => { if (!e.target.closest?.(hot)) return; delete d.dataset.hot; if (!tint) gsap.to(d, { scale: 1, duration: outDur, ease: outEase }); };
    const gone = () => gsap.to(d, { opacity: 0, duration: 0.2 });
    const back = () => { if (seen) gsap.to(d, { opacity: 1, duration: 0.2 }); };
    document.addEventListener("mousemove", move, { passive: true });
    document.addEventListener("mouseover", over);
    document.addEventListener("mouseout", out);
    document.documentElement.addEventListener("mouseleave", gone);
    document.documentElement.addEventListener("mouseenter", back);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("mousemove", move); document.removeEventListener("mouseover", over); document.removeEventListener("mouseout", out);
      document.documentElement.removeEventListener("mouseleave", gone); document.documentElement.removeEventListener("mouseenter", back);
      if (--users <= 0 && dot) { dot.remove(); dot = null; users = 0; }
    };
  });
})();
