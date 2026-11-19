// While the tall board (default 560vh) is pinned: stage 1 changes to stage 2, the stage 2 result photo grows and moves to the left cell as a video, and two videos rise in turn in the center and right.
// The result cell’s position and scale are measured each time from the attached panel size — so the three videos fit in one row depending on screen height (original formula)
(() => {
  const map = (p, xs, ys) => {
    if (p <= xs[0]) return ys[0];
    for (let i = 1; i < xs.length; i++) if (p <= xs[i]) return ys[i - 1] + (ys[i] - ys[i - 1]) * ((p - xs[i - 1]) / (xs[i] - xs[i - 1] || 1));
    return ys[ys.length - 1];
  };
  kfFx.register("step-zoom-trio", (el, { options, reduce }) => {
    if (!window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const q = (p) => el.querySelector(`[data-fx-part="${p}"]`);
    const qa = (p) => [...el.querySelectorAll(`[data-fx-part="${p}"]`)];
    const stick = q("stick"), result = q("result"), zoom = q("zoom");
    const steps = qa("step");
    if (!stick || !result || !zoom || steps.length < 2) return;
    const fades = qa("fade"), bars = qa("bar"), clip = q("clip"), title2 = q("title2");
    const vids = [q("vid2"), q("vid3")], caps = [q("cap1"), q("cap2"), q("cap3")];
    const k = +(options.stiffness || 100), c = +(options.damping ?? 30), lift = +(options.lift ?? 56);
    const mm = gsap.matchMedia();
    mm.add(`(min-width: ${+(options.min ?? 768)}px)`, () => {
      let O = { scale: 1.5, x: 0, captionTop: 0, centerY: 0, w: 0, h: 0, cx1: 0, cx3: 0 };
      const layout = () => {
        const e = result.offsetWidth, t = zoom.offsetHeight, s = stick.clientWidth, o = stick.clientHeight;
        if (!e || !t || !s || !o) return;
        const sr = stick.getBoundingClientRect(), rr = zoom.getBoundingClientRect();
        // Subtract the transform from the currently drawn position to get the original position
        const l = rr.left - sr.left - (+gsap.getProperty(zoom, "x") || 0) - (e - rr.width) / 2;
        const top = rr.top - sr.top - (+gsap.getProperty(zoom, "y") || 0) - (t - rr.height) / 2;
        const p = Math.min(Math.max(0.4, Math.min(0.46, 0.4 + ((o - 760) / 140) * 0.06)) * o / t, (s - 48 - 64) / 3 / e);
        const w = e * p, h = t * p, cy = top + t / 2 - lift, g = w + 32, v = s / 2 - g;
        O = { scale: p, x: v - (l + e / 2), captionTop: cy + h / 2 + 18, centerY: cy, w, h, cx1: v, cx3: s / 2 + g };
        caps.forEach((cap, i) => { if (!cap) return; const cx = [O.cx1, s / 2, O.cx3][i]; Object.assign(cap.style, { left: `${cx - w / 2}px`, top: `${O.captionTop}px`, width: `${w}px` }); });
        vids.forEach((vd, i) => { if (!vd) return; Object.assign(vd.style, { left: `${i ? O.cx3 : s / 2}px`, top: `${O.centerY}px`, width: `${w}px`, height: `${h}px` }); });
        paint(x);
      };
      const play = (vd, on) => {
        if (!vd) return;
        if (on) { if (vd.paused) { vd.currentTime = 0; vd.play().catch(() => {}); } }
        else { if (!vd.paused) vd.pause(); vd.currentTime = 0; }
      };
      const v2 = vids[0]?.querySelector("video"), v3 = vids[1]?.querySelector("video");
      const paint = (r) => {
        const g = map(r, [0, 0.1, 0.15], [1, 1, 0]), vy = map(r, [0.1, 0.15], [0, -24]);
        const y = map(r, [0.13, 0.2, 1], [0, 1, 1]), by = map(r, [0.13, 0.2], [24, 0]);
        if (bars[0]) bars[0].style.height = `${map(r, [0, 0.1], [0, 100])}%`;
        if (bars[1]) bars[1].style.height = `${map(r, [0.1, 0.22], [0, 100])}%`;
        const N = map(r, [0.25, 0.44], [0, 1]), kk = map(r, [0.25, 0.33], [1, 0]);
        const L = map(r, [0.5, 0.68], [0, 1]), W = map(r, [0.74, 0.92], [0, 1]);
        gsap.set(steps[0], { opacity: g, y: reduce ? 0 : vy });
        gsap.set(steps[1], { opacity: y, y: reduce ? 0 : by });
        fades.forEach((f) => (f.style.opacity = kk));
        gsap.set(zoom, { scale: 1 + (O.scale - 1) * N, x: O.x * N, y: -lift * N });
        if (clip) clip.style.opacity = map(N, [0.78, 1], [0, 1]);
        if (title2) { title2.style.opacity = map(N, [0.8, 1], [0, 1]); title2.style.transform = `translate(-50%, ${reduce ? 0 : map(N, [0.8, 1], [20, 0])}px)`; }
        if (caps[0]) caps[0].style.opacity = map(N, [0.78, 1], [0, 1]);
        const o2 = map(L, [0, 0.6], [0, 1]), o3 = map(W, [0, 0.6], [0, 1]);
        if (vids[0]) { const c2 = vids[0].firstElementChild; c2.style.opacity = o2; c2.style.transform = `translateY(${reduce ? 0 : map(L, [0, 0.6], [40, 0])}px)`; }
        if (caps[1]) caps[1].style.opacity = o2;
        if (vids[1]) { const c3 = vids[1].firstElementChild; c3.style.opacity = o3; c3.style.transform = `translateY(${reduce ? 0 : map(W, [0, 0.6], [40, 0])}px)`; }
        if (caps[2]) caps[2].style.opacity = o3;
        play(clip, N >= 0.985); play(v2, L >= 0.985); play(v3, W >= 0.985);
      };
      let x = 0, v = 0, target = 0, last = 0, running = false;
      const tick = () => {
        const now = performance.now();
        if (!last) last = now;
        let dt = Math.max(1, Math.min(64, now - last)); last = now;
        for (; dt > 0; dt -= 1) { const a = k * (target - x) - c * v; v += a * 0.001; x += v * 0.001; }
        if (Math.abs(target - x) < 0.001 && Math.abs(v) < 0.001) { x = target; v = 0; running = false; gsap.ticker.remove(tick); last = 0; }
        paint(Math.min(1, Math.max(0, x)));
      };
      const st = ScrollTrigger.create({
        trigger: el, start: "top top", end: "bottom bottom",
        onUpdate: (self) => {
          target = self.progress;
          if (reduce) { x = target; paint(x); return; }
          if (!running) { running = true; last = 0; gsap.ticker.add(tick); }
        },
      });
      const ro = new ResizeObserver(layout);
      ro.observe(stick); ro.observe(result);
      x = target = st.progress;
      layout();
      return () => {
        st.kill(); ro.disconnect(); gsap.ticker.remove(tick);
        gsap.set([...steps, zoom], { clearProps: "all" });
        [...fades, ...bars, clip, title2, ...vids, ...caps].forEach((n) => n && n.removeAttribute("style"));
        vids.forEach((n) => n?.firstElementChild?.removeAttribute("style"));
        [clip, v2, v3].forEach((vd) => vd && !vd.paused && vd.pause());
      };
    });
    return () => mm.revert();
  });
})();
