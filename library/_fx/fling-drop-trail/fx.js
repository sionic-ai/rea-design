// Trail of stickers thrown and falling: each time the cursor moves 150px over the pad, the next sticker starts from the cursor position
// Thrown by cursor speed (movement between frames × 3, ±300px) while growing from .3 to 1× (.5s easeOutSine), rests .2s, then falls to the bottom of the screen (.4s easeIn) — Agency footer
(() => {
  kfFx.register("fling-drop-trail", (el, { options, reduce, hover }) => {
    const stickers = [...el.querySelectorAll('[data-fx-part="sticker"]')];
    if (reduce || !hover || !stickers.length) return;
    const pad = el.querySelector('[data-fx-part="pad"]') || el;
    const step = +(options.step || 150), most = +(options.throw ?? 300), off = +(options.offset ?? 50);
    const w = +(options.w || 200), h = +(options.h || 150);
    const outEase = kfFx.ease("0.39,0.575,0.565,1", "sine.out");
    const fallEase = kfFx.ease("0.4,0,1,1", "power2.in");
    const busy = new Set();
    const tls = new Set();
    gsap.set(stickers, { x: 0, y: 0, scale: 0 });

    let total = 0, prevTotal = 0, lx = null, ly = null, idx = 0;
    // Speed like the original: per frame (a gap over 15ms), the screen-coordinate difference from the previous frame × 3
    let cur = null, prev = null, vx = 0, vy = 0, last = 0, raf = 0, running = false;
    const sample = (now) => {
      if (!running) return;
      raf = requestAnimationFrame(sample);
      if (now - last < 15) return;
      last = now;
      if (!cur || !prev) { prev = cur; return; }
      vx = 3 * (cur.x - prev.x); vy = 3 * (cur.y - prev.y);
      if (vx === 0 && vy === 0) { running = false; cancelAnimationFrame(raf); }
      prev = cur;
    };
    const clamp = (v) => (v > 0 ? Math.min(most, v) : Math.max(-most, v));

    const fling = (s, px, py) => {
      if (busy.has(s)) return;
      busy.add(s);
      const tx = Math.min(Math.max(px + clamp(vx), 0), innerWidth - w);
      const ty = Math.min(Math.max(py + clamp(vy), 0), innerHeight - h);
      const tl = gsap.timeline({ onComplete: () => { busy.delete(s); tls.delete(tl); } });
      tls.add(tl);
      tl.fromTo(s, { x: px, y: py }, { x: tx, y: ty, duration: 0.5, ease: outEase })
        .fromTo(s, { scale: 0.3 }, { scale: 1, duration: 0.5, ease: outEase }, "<")
        .to(s, { y: innerHeight + 300, duration: 0.4, ease: fallEase }, "+=0.2");
    };

    const move = (e) => {
      cur = { x: e.screenX, y: e.screenY };
      if (!running) { running = true; last = 0; raf = requestAnimationFrame(sample); }
      const top = el.getBoundingClientRect().top;
      const px = e.clientX - off, py = e.clientY - top - off;
      if (lx !== null) total += Math.hypot(ly - e.clientY, lx - e.clientX);
      lx = e.clientX; ly = e.clientY;
      if (total - prevTotal > step) {
        prevTotal = total;
        idx = idx + 1 > stickers.length - 1 ? 0 : idx + 1;
        fling(stickers[idx], px, py);
      }
    };
    const leave = () => { lx = ly = null; };
    pad.addEventListener("mousemove", move, { passive: true });
    pad.addEventListener("mouseleave", leave);
    return () => {
      pad.removeEventListener("mousemove", move);
      pad.removeEventListener("mouseleave", leave);
      running = false;
      cancelAnimationFrame(raf);
      tls.forEach((t) => t.kill());
      gsap.set(stickers, { clearProps: "transform" });
    };
  });
})();
