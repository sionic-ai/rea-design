/* Home page — a single non-scrolling page. Gathers the wheel to flip square works one cell at a time, the Voronoi background turns on at the pledge cell, and the team below slides along */
(() => {
  const TT = window.TT;
  const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = () => matchMedia("(hover: none) and (pointer: coarse)").matches;
  const STEP = 125, PAD_MUL = 2.5, PAD_MAX = 35, PASS = 0.3, IDLE = 300, LERP = 0.1, NEAR = 1.2;
  const DUR_BACK = 620, DUR_NEXT = 700, DUR_TO_STATEMENT = 760, DUR_FROM_STATEMENT = 720;
  const cubicInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  // Starts out like power2.out, then latches on at the end with expo.out (a blend of the original power2Out).
  const blendOut = (t) => { const a = 1 - Math.pow(1 - t, 2), b = t >= 1 ? 1 : 1 - Math.pow(2, -10 * t), w = Math.pow(t, 2.6); return a * (1 - w) + b * w; };

  /* ───── Voronoi background — 15 cells painted in team colors drift slowly, and at the pledge cell each cell grows 0→1 in random order ───── */
  const Voronoi = (() => {
    let cv, ctx, raf = 0, seeds = [], colors = [], w = 0, h = 0, on = false, alive = false;
    const clip = (poly, ax, ay, nx, ny) => {
      const out = [], d = (p) => (p[0] - ax) * nx + (p[1] - ay) * ny;
      for (let i = 0; i < poly.length; i++) {
        const p = poly[i], q = poly[(i + 1) % poly.length], dp = d(p), dq = d(q);
        if (dp <= 0) out.push(p);
        if ((dp <= 0) !== (dq <= 0)) { const t = dp / (dp - dq); out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]); }
      }
      return out;
    };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      seeds.forEach((s, i) => {
        let poly = [[0, 0], [w, 0], [w, h], [0, h]];
        seeds.forEach((o, j) => { if (j !== i && poly.length) poly = clip(poly, (s.x + o.x) / 2, (s.y + o.y) / 2, o.x - s.x, o.y - s.y); });
        if (poly.length < 3 || s.scale <= 0) return;
        ctx.beginPath();
        poly.forEach(([x, y], k) => { const px = s.x + (x - s.x) * s.scale, py = s.y + (y - s.y) * s.scale; k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); });
        ctx.closePath();
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();
      });
    };
    const tick = () => {
      seeds.forEach((s) => {
        s.x += s.vx; s.y += s.vy;
        if (s.x < 0 || s.x > w) s.vx *= -1;
        if (s.y < 0 || s.y > h) s.vy *= -1;
      });
      draw();
      raf = alive && !document.hidden ? requestAnimationFrame(tick) : 0;
    };
    const size = () => {
      const r = cv.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
      w = Math.max(320, Math.round(r.width)); h = Math.max(480, Math.round(r.height));
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    return {
      init(canvas, palette) {
        cv = canvas; ctx = cv.getContext("2d"); colors = palette.length ? palette : [getComputedStyle(document.documentElement).getPropertyValue("--kf-raised")];
        size();
        seeds = Array.from({ length: 15 }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.14, vy: (Math.random() - 0.5) * 0.14, scale: 0 }));
        addEventListener("resize", size);
        draw();
      },
      enter() {
        if (on) return; on = true; alive = true;
        if (!raf) raf = requestAnimationFrame(tick);
        if (reduce() || !window.gsap) { seeds.forEach((s) => (s.scale = 1)); return; }
        gsap.killTweensOf(seeds);
        gsap.to(seeds, { scale: 1, duration: 0.35, ease: "power4.out", stagger: { each: 0.01, from: "random" } });
      },
      exit() {
        if (!on) return; on = false;
        if (!window.gsap) { seeds.forEach((s) => (s.scale = 0)); return; }
        gsap.killTweensOf(seeds);
        gsap.to(seeds, { scale: 0, duration: 0.2, ease: "power4.out", onComplete: () => { if (!on) alive = false; } });
      },
      destroy() { alive = false; cancelAnimationFrame(raf); raf = 0; removeEventListener("resize", size); if (window.gsap) gsap.killTweensOf(seeds); on = false; },
    };
  })();

  let st = null;
  TT.modules.Stage = {
    init() {
      const root = document.querySelector(".p-index-main");
      if (!root) return;
      const inner = root.querySelector(".p-index-main__inner");
      const items = Array.from(root.querySelectorAll(".project-item"));
      const sets = Array.from(root.querySelectorAll(".title-set"));
      const info = root.querySelector(".p-index-projects__info");
      const count = root.querySelector(".p-index-projects__info__count .current");
      const bg = root.querySelector(".p-index-main__statement-bg");
      const n = items.length;
      const palette = Array.from(root.querySelectorAll(".c-team-thumb")).map((t) => getComputedStyle(t).getPropertyValue("--member").trim()).filter(Boolean);
      Voronoi.init(root.querySelector(".voronoi-canvas"), palette);
      let H = innerHeight, A = 0, P = 0, W = 0, shown = -1, anim = null, idleT = 0, lockUntil = 0, trackpad = false, raf = 0;
      const maxY = () => Math.max(n * H, inner.scrollHeight - H);
      const clampY = (y) => Math.max(0, Math.min(maxY(), y));

      const typeTitle = (set) => {
        let delay = 0;
        set.querySelectorAll("h2 > span").forEach((s) => {
          const full = s.dataset.fullText || "";
          const d = Math.max(0.45, full.length * 0.03);
          if (!window.gsap || reduce()) { s.textContent = full; return; }
          gsap.killTweensOf(s); s.textContent = "";
          gsap.fromTo(s, { text: { value: "", delimiter: "", preserveSpaces: true } }, { duration: d, ease: "none", delay, overwrite: true, text: { value: full, delimiter: "", preserveSpaces: true } });
          delay += d;
        });
      };
      const show = (i, animate) => {
        if (i === shown) return;
        shown = i;
        sets.forEach((s, k) => s.classList.toggle("-active", k === i));
        if (i < n) {
          info.classList.add("is-show");
          count.textContent = String(i + 1);
          if (animate) typeTitle(sets[i]);
          bg.classList.remove("is-active"); Voronoi.exit();
        } else {
          info.classList.remove("is-show");
          bg.classList.add("is-active"); Voronoi.enter();
        }
      };
      const go = (i, type, dur) => {
        clearTimeout(idleT);
        W = Math.max(0, Math.min(n, i));
        anim = { from: A, to: clampY(W * H), start: performance.now(), dur: reduce() ? 1 : dur, type };
        P = anim.to;
        show(W, true);
      };
      const durFor = (from, to) => (from === n - 1 && to === n ? DUR_TO_STATEMENT : from === n && to === n - 1 ? DUR_FROM_STATEMENT : DUR_NEXT);
      const frame = (now) => {
        if (anim) {
          const t = Math.min(1, (now - anim.start) / anim.dur);
          A = anim.from + (anim.to - anim.from) * (anim.type === "out" ? blendOut(t) : cubicInOut(t));
          if (t >= 1 || Math.abs(P - A) <= NEAR) { A = P; anim = null; }
        } else {
          A += (P - A) * LERP;
          if (Math.abs(P - A) <= NEAR) A = P;
          // When scrolling up from Team into the pledge box, it attaches to the pledge box
          if (W === n && A < n * H - 1 && P < n * H) go(n, "inOut", DUR_BACK);
        }
        inner.style.transform = `translateY(${-A}px)`;
        raf = requestAnimationFrame(frame);
      };
      const onWheel = (e) => {
        e.preventDefault();
        const now = performance.now();
        if (anim || now < lockUntil) return;
        if (!trackpad && e.deltaMode === 0 && Math.abs(e.deltaX) >= 1) trackpad = true;
        const dir = e.deltaY > 0 ? 1 : -1;
        const delta = trackpad && e.deltaMode === 0 ? Math.max(-PAD_MAX, Math.min(PAD_MAX, e.deltaY * PAD_MUL)) : dir * STEP;
        // Below the pledge block (team, footer) slides along with the scroll
        if (W === n && (A > n * H + 1 || dir > 0)) { P = clampY(P + delta); return; }
        P = clampY(P + delta);
        const moved = P - W * H;
        if ((dir > 0 && moved >= PASS * H) || (dir < 0 && moved <= -PASS * H)) {
          const to = W + dir;
          if (to < 0 || to > n) return;
          const d = durFor(W, to);
          go(to, "out", d);
          lockUntil = now + d + 50;
        } else {
          clearTimeout(idleT);
          idleT = setTimeout(() => { if (!anim) go(W, "inOut", DUR_BACK); }, IDLE);
        }
      };
      const onKey = (e) => {
        if (anim) return;
        if (["ArrowDown", "PageDown", " "].includes(e.key) && W < n) { e.preventDefault(); go(W + 1, "out", durFor(W, W + 1)); }
        if (["ArrowUp", "PageUp"].includes(e.key) && W > 0 && A <= n * H + 1) { e.preventDefault(); go(W - 1, "out", durFor(W, W - 1)); }
      };
      // Touch devices leave it to the inner panel’s default scroll + slot snapping (css) like the original, and only read the current slot
      const onScroll = () => { const i = Math.min(n, Math.round(inner.scrollTop / Math.max(1, H))); W = i; show(i, true); if (i === n) Voronoi.enter(); };
      const onResize = () => { H = innerHeight; A = P = clampY(W * H); inner.style.transform = touch() ? "" : `translateY(${-A}px)`; };
      const isTouch = touch();
      // The first work item appears after the header-line intro finishes (original site:intro:header:complete) — if there was an intro, wait until the first image loads (max 1.4s)
      // Wait for the title to be written and 120ms later (or 180ms if there was none) it rises right away from 14% below in .6s power4.out
      const first = items[0]?.querySelector(":scope > a");
      const mediaReady = () => new Promise((r) => {
        const v = first?.querySelector("video");
        if (!v || v.readyState >= 2) return r();
        v.addEventListener("loadeddata", r, { once: true });
        setTimeout(r, 1400);
      });
      const wait = (ms) => new Promise((r) => setTimeout(r, ms));
      // The original ignores cursor tilt while the first work rises — so the rising cell doesn’t sway toward the cursor
      let entering = false;
      const holdTilt = (e) => { if (entering && e.target.closest?.(".project-item > a")) e.stopPropagation(); };
      root.addEventListener("mousemove", holdTilt, true);
      const ready = async (withIntro) => {
        if (!first || !window.gsap || reduce()) { root.classList.add("is-first-project-ready"); show(0, true); return; }
        entering = true;
        gsap.set(first, { visibility: "hidden", yPercent: 14 });
        root.classList.add("is-first-project-ready");
        if (withIntro) { await mediaReady(); show(0, true); await wait(120); } else await wait(180);
        await new Promise((r) => gsap.to(first, { yPercent: 0, visibility: "visible", duration: 0.6, ease: "power4.out", overwrite: true, onComplete: r, onInterrupt: r }));
        gsap.set(first, { clearProps: "transform,visibility" });
        entering = false;
        if (!withIntro) show(0, true);
      };
      // The original takes the same path when returning via paging (even if the intro already finished) — wait for the first paint, then title · rise
      if (document.documentElement.dataset.siteIntroHeaderComplete === "1") ready(true);
      else addEventListener("site:intro:header:complete", () => ready(true), { once: true });
      if (isTouch) { inner.addEventListener("scroll", onScroll, { passive: true }); }
      else { root.addEventListener("wheel", onWheel, { passive: false }); addEventListener("keydown", onKey); raf = requestAnimationFrame(frame); }
      addEventListener("resize", onResize);
      st = () => {
        cancelAnimationFrame(raf); clearTimeout(idleT);
        root.removeEventListener("wheel", onWheel); removeEventListener("keydown", onKey); removeEventListener("resize", onResize); inner.removeEventListener("scroll", onScroll);
        root.removeEventListener("mousemove", holdTilt, true);
        Voronoi.destroy();
        if (window.gsap) sets.forEach((s) => gsap.killTweensOf(s.querySelectorAll("span")));
      };
    },
    destroy() { st?.(); st = null; },
  };
})();
