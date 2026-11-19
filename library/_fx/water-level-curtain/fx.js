// Water level curtain: water filling the screen drains off through a rippled edge (clip-path polygon), revealing the page.
// mode: loader — On first open. Mimicking the wordmark letters, the first line drops in and the last line rides a wave, then the water drains and droplets splash onto the letters.
// mode: page — pressing a same-site link makes water rise and cover the page (page at .95x and blurred) and drain away on the next page — Brand
(() => {
  const KEY = "fx-water-level-curtain";
  const arriving = (() => { try { const v = sessionStorage.getItem(KEY) === "1"; sessionStorage.removeItem(KEY); return v; } catch { return false; } })();
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const poly = (fn, steps) => {
    const pts = ["0% 100%", "100% 100%"];
    for (let i = steps; i >= 0; i--) { const x = i / steps; pts.push(`${(x * 100).toFixed(2)}% ${(fn(x) * 100).toFixed(2)}%`); }
    return `polygon(${pts.join(",")})`;
  };
  const LOADER_WAVES = [{ f: 1.2, d: 1.6, a: 0.02 }, { f: 2.7, d: -2.3, a: 0.011 }, { f: 4.6, d: 3.7, a: 0.006 }];
  const PAGE_WAVES = [{ f: 1.2, v: 0.28, a: 0.05 }, { f: 2.7, v: 0.42, a: 0.026 }, { f: 4.6, v: 0.6, a: 0.012 }];

  const part = (el, name) => el.querySelector(`[data-fx-part="${name}"]`);
  const makeBubbles = (host) => {
    if (!host || host.childElementCount) return;
    for (let t = 0; t < 14; t++) {
      const b = document.createElement("span");
      b.style.cssText = `--bx:${(37 * t + 11) % 100}%;--bs:${(0.45 + ((7 * t) % 5) * 0.26).toFixed(2)}vw;--bd:${(7 + ((3 * t) % 6) * 0.9).toFixed(1)}s;--bdelay:${(-((1.7 * t) % 9)).toFixed(1)}s;--bsway:${(t % 2 ? 1 : -1) * (1 + (t % 3))}vw`;
      host.append(b);
    }
  };

  function loader(el, { options, reduce }) {
    const root = document.documentElement;
    const water = part(el, "water"), foam = part(el, "foam");
    if (!water) return;
    makeBubbles(part(el, "bubbles"));
    const held = options.held || "wordmark-held";
    let alive = true, tl = null, rideTick = null, drops = [];
    const finish = () => {
      if (!alive) return;
      root.classList.remove("is-loading", "preloader-open", held);
      root.classList.add("wordmark-placed");
      el.hidden = true;
      el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true }));
      window.dispatchEvent(new Event("kf:ready"));
    };
    if (arriving) { finish(); return () => { alive = false; }; }
    root.classList.add("is-loading", "preloader-open");
    const ready = Promise.race([
      Promise.all([document.fonts?.ready, new Promise((r) => (document.readyState === "complete" ? r() : addEventListener("load", r, { once: true })))]),
      new Promise((r) => setTimeout(r, 5000)),
    ]);
    const guard = setTimeout(finish, 12000);
    let loaded = false;
    ready.then(() => (loaded = true));

    if (reduce) {
      ready.then(() => alive && gsap.to(el, { opacity: 0, duration: 0.45, ease: "power1.out", onComplete: finish }));
      return () => { alive = false; clearTimeout(guard); };
    }

    const targets = options.letters ? [...document.querySelectorAll(options.letters)] : [];
    const word = part(el, "word");
    const W = innerWidth, H = innerHeight;
    scrollTo(0, 0);
    // Remove the transform from the css animations (drop, float) on the characters and measure the resting position
    const rects = targets.map((t) => { const a = t.style.animation; t.style.animation = "none"; const r = t.getBoundingClientRect(); t.style.animation = a; return r; });
    const letters = targets.map((t, i) => {
      const r = rects[i], cs = getComputedStyle(t), d = document.createElement("span");
      d.className = "fx-wl-letter";
      d.textContent = t.textContent;
      d.style.cssText = `left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;font:${cs.font};color:${cs.color};text-shadow:${cs.textShadow};-webkit-text-stroke:${cs.webkitTextStroke || "0"};paint-order:stroke fill;letter-spacing:${cs.letterSpacing};text-transform:${cs.textTransform}`;
      word?.append(d);
      return d;
    });
    if (word) word.style.opacity = "1";
    const lastTop = rects.length ? Math.max(...rects.map((r) => r.top)) : 0;
    const split = options.ride != null ? +options.ride : rects.findIndex((r) => Math.abs(r.top - lastTop) < r.height * 0.4);
    const droppers = letters.slice(0, Math.max(0, split)), riders = split >= 0 ? letters.slice(split) : [], rr = split >= 0 ? rects.slice(split) : [];
    droppers.forEach((d, i) => d.animate([
      { opacity: 0, transform: "translateY(-45%) rotate(-7deg) scale(.86)" },
      { opacity: 1, transform: "translateY(4%) rotate(1deg) scale(1.06,.93)", offset: 0.55 },
      { transform: "translateY(-2%) rotate(0) scale(.98,1.03)", offset: 0.78 },
      { opacity: 1, transform: "none" },
    ], { duration: 720, delay: i * 70, easing: "cubic-bezier(.22,1.2,.36,1)", fill: "backwards" }));

    tl = gsap.timeline();
    if (riders.length) {
      const left = Math.min(...rr.map((r) => r.left)), width = Math.max(...rr.map((r) => r.right)) - left, T = Math.max(...rr.map((r) => r.height));
      const c0 = rr[0].left + rr[0].width / 2 - left, span = Math.max(1, width - c0);
      const wav = rr.map((r) => { const cx = r.left + r.width / 2 - left; return { cx: cx - width / 2, amp: (0.08 + 0.37 * Math.pow(clamp((cx - c0) / span, 0, 1), 1.5)) * T }; });
      const s = { x: W - left + 0.08 * W, y: 0.1 * H, amp: 1.5, beat: 11, tilt: -7, phase: 0 };
      const k = (2 * Math.PI * 1.3) / width;
      const set = riders.map((d) => ({ x: gsap.quickSetter(d, "x", "px"), y: gsap.quickSetter(d, "y", "px"), r: gsap.quickSetter(d, "rotation", "deg") }));
      rideTick = () => {
        s.phase += (s.beat * gsap.ticker.deltaRatio(60)) / 60;
        const t = (s.tilt * Math.PI) / 180, co = Math.cos(t), si = Math.sin(t);
        wav.forEach(({ cx, amp }, i) => {
          const n = amp * s.amp, ph = k * cx - s.phase, lift = n * Math.sin(ph), lean = (0.8 * Math.atan(n * k * Math.cos(ph)) * 180) / Math.PI;
          set[i].x(s.x + cx * co - cx - lift * si);
          set[i].y(s.y + cx * si + lift * co);
          set[i].r(s.tilt + lean);
        });
      };
      rideTick();
      gsap.set(riders, { opacity: 1, transformOrigin: "50% 50%" });
      gsap.ticker.add(rideTick);
      tl.to(s, { x: 0, duration: 1.4, ease: "power3.out" }, 0.7)
        .to(s, { y: 0, duration: 1.4, ease: "back.out(1.4)" }, 0.7)
        .to(s, { tilt: 0, duration: 1.4, ease: "power2.inOut" }, 0.7)
        .to(s, { beat: 4, duration: 1.4, ease: "power2.out" }, 0.7)
        .to(s, { amp: 0, duration: 0.7, ease: "power2.out" }, 1.4);
      const spout = part(el, "spout");
      if (spout) {
        spout.style.left = `${rr[0].left + rr[0].width * 0.5}px`;
        spout.style.top = `${rr[0].top - rr[0].height * 0.08}px`;
        const st = gsap.timeline();
        [...spout.children].forEach((b, i) => st.fromTo(b, { scale: 0, y: 0, opacity: 1 }, { scale: 1, y: -T * (0.45 + 0.2 * i), duration: 0.55, ease: "power2.out" }, 0.09 * i).to(b, { scale: 1.5, opacity: 0, duration: 0.2, ease: "power1.in" }, ">-0.02"));
        tl.add(st, 0.7 + 1.4 - 0.15);
      }
    }
    const hold = 0.7 + 1.4 + 0.1, drain = hold + 0.05;
    tl.addPause(hold, () => {
      const go = () => alive && tl.play();
      if (loaded) go();
      else ready.then(go);
    });
    tl.call(() => { root.classList.add(held); root.classList.remove("is-loading"); }, [], drain);

    for (let i = 0; i < 16; i++) { const d = document.createElement("i"); d.className = "fx-wl-drop"; el.append(d); drops.push(d); }
    let di = 0;
    const splash = (x, y, big) => {
      const d = drops[di++ % drops.length];
      gsap.killTweensOf(d);
      const fall = H * (big ? 0.08 : 0.05) * (1 + Math.random()), dx = big ? 0 : (Math.random() - 0.5) * W * 0.03;
      gsap.set(d, { x, y, opacity: 1, scaleX: big ? 0.7 : 0.45 + 0.3 * Math.random(), scaleY: big ? 0.5 : 0.45 + 0.3 * Math.random() });
      gsap.to(d, { x: x + dx, y: y + fall, scaleY: big ? 1.5 : 0.8, duration: 0.45 + 0.3 * Math.random(), ease: big ? "power3.in" : "power2.in" });
      gsap.to(d, { opacity: 0, duration: 0.18, delay: 0.4 + 0.15 * Math.random() });
    };
    const hit = letters.map(() => false);
    const lv = { v: -0.03, slosh: 0 };
    let last = lv.v, spray = 0;
    const paint = () => {
      const t = tl.time(), speed = clamp((lv.v - last) * 72, 0, 2);
      last = lv.v;
      const A = 0.35 + 1.2 * speed;
      const level = (x) => { let y = lv.v + lv.slosh * (x - 0.5); for (const w of LOADER_WAVES) y += A * w.a * Math.sin(x * Math.PI * 2 * w.f + 1.15 * t * w.d); return y; };
      water.style.clipPath = poly(level, 40);
      if (foam) foam.style.clipPath = poly((x) => level(x) - 0.011, 40);
      letters.forEach((d, i) => {
        if (hit[i]) return;
        const r = rects[i];
        if (level((r.left + r.width / 2) / W) * H > r.bottom + 0.15 * r.height) {
          hit[i] = true;
          gsap.timeline().to(d, { yPercent: -4, duration: 0.16, ease: "power2.out" }).to(d, { yPercent: 0, duration: 0.6, ease: "elastic.out(1, 0.45)" });
          const cx = r.left + r.width / 2;
          splash(cx + 0.15 * r.width, r.bottom, true);
          gsap.delayedCall(0.12, () => splash(cx - 0.2 * r.width, r.bottom - 0.1 * r.height, true));
        }
      });
      for (spray += 0.55 * speed; spray > 1; spray--) { const x = Math.random(); splash(x * W, (level(x) - 0.004) * H, false); }
    };
    paint();
    tl.to(lv, { v: 0.012, duration: 0.25, ease: "sine.inOut", onUpdate: paint }, drain)
      .to(lv, { v: 1.08, duration: 1.2, ease: "power3.inOut", onUpdate: paint, onComplete: finish }, ">")
      .to(lv, { slosh: 0.035, duration: 0.36, ease: "sine.inOut" }, "<")
      .to(lv, { slosh: -0.028, duration: 0.384, ease: "sine.inOut" }, ">")
      .to(lv, { slosh: 0, duration: 0.456, ease: "sine.inOut" }, ">");

    return () => {
      alive = false;
      clearTimeout(guard);
      tl?.kill();
      if (rideTick) gsap.ticker.remove(rideTick);
      drops.forEach((d) => { gsap.killTweensOf(d); d.remove(); });
      letters.forEach((d) => d.remove());
      root.classList.remove("preloader-open", held);
      if (el.isConnected) { water.style.clipPath = ""; if (foam) foam.style.clipPath = ""; }
    };
  }

  function page(el, { options, reduce }) {
    const water = part(el, "water"), foam = part(el, "foam");
    if (!water) return;
    const stage = options.stage ? document.querySelector(options.stage) : null;
    const rise = +(options.rise ?? 0.85), fall = +(options.fall ?? 1.05), wait = +(options.delay ?? 0.25);
    let busy = false, tw = null;
    const draw = (lvl, sec, amp) => {
      const f = (off) => (x) => { let y = lvl - off; for (const w of PAGE_WAVES) y += amp * w.a * Math.sin(2 * Math.PI * w.f * (x - w.v * sec)); return y; };
      water.style.clipPath = poly(f(0), 64);
      if (foam) foam.style.clipPath = poly(f(0.024), 64);
    };
    const sweep = (from, to, dur) => new Promise((done) => {
      const p = { p: 0 }, t0 = performance.now();
      tw = gsap.to(p, { p: 1, duration: dur, ease: "power2.inOut", onUpdate: () => draw(from + (to - from) * p.p, (performance.now() - t0) / 1000, 1.5 * Math.sin(Math.PI * p.p)), onComplete: done });
    });
    const shrink = (out, dur, delay = 0) => {
      if (!stage) return Promise.resolve();
      stage.style.transformOrigin = `50% ${scrollY + innerHeight / 2}px`;
      const a = { scale: 1, filter: "blur(0px)" }, b = { scale: 0.95, filter: "blur(4px)" };
      return new Promise((done) => gsap.fromTo(stage, out ? a : b, { ...(out ? b : a), duration: dur, delay, ease: out ? "power2.out" : "power2.inOut", onComplete: done }));
    };
    const onClick = (e) => {
      if (busy || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest("a[href]");
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || (url.pathname === location.pathname && url.search === location.search)) return;
      if (reduce) return;
      e.preventDefault();
      busy = true;
      el.classList.add("is-active");
      shrink(true, 0.6);
      gsap.delayedCall(wait, () => sweep(1.12, -0.12, rise).then(() => {
        try { sessionStorage.setItem(KEY, "1"); } catch {}
        location.href = url.href;
      }));
    };
    document.addEventListener("click", onClick);
    const onShow = (e) => { if (e.persisted) { busy = false; el.classList.remove("is-active"); draw(1.12, 0, 0); if (stage) gsap.set(stage, { clearProps: "scale,filter" }); } };
    addEventListener("pageshow", onShow);
    if (arriving && !reduce) {
      el.classList.add("is-active");
      draw(-0.12, 0, 0);
      if (stage) gsap.set(stage, { scale: 0.95, filter: "blur(4px)" });
      requestAnimationFrame(() => requestAnimationFrame(() => {
        Promise.all([sweep(-0.12, 1.12, fall), shrink(false, 0.9, 0.35)]).then(() => {
          el.classList.remove("is-active");
          if (stage) gsap.set(stage, { clearProps: "scale,filter,transformOrigin" });
          el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true }));
        });
      }));
    }
    return () => {
      document.removeEventListener("click", onClick);
      removeEventListener("pageshow", onShow);
      tw?.kill();
      if (stage) gsap.set(stage, { clearProps: "scale,filter,transformOrigin" });
      el.classList.remove("is-active");
    };
  }

  kfFx.register("water-level-curtain", (el, ctx) => (ctx.options.mode === "page" ? page(el, ctx) : loader(el, ctx)));
})();
