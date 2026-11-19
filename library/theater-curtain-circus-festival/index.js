// First page: cast wall fill · pink → violet-blue background · floating hat · zone ticket accordion band · ticket card
(() => {
  // Section strip: cards fold in 3D while joined edge to edge — center card lean 3°, one wave per three cards (fold 14°),
  // During the turn, two springs (position: 1Hz · damping .5 / speed: 1.2Hz · damping .55) follow late, so sections farther away fold later
  const BEND = { lean: 3, fold: 14, wave: 3, gain: 0.6, speed: 4, persp: 2.5, dur: 0.8 };
  const springStep = (s, target, hz, damping, dt) => {
    const k = (2 * Math.PI * hz) ** 2;
    s.speed += (k * (target - s.pos) - 2 * damping * Math.sqrt(k) * s.speed) * dt;
    s.pos += s.speed * dt;
  };
  const areas = (root) => {
    const box = root.querySelector("[data-areas]");
    const track = root.querySelector("[data-areas-track]");
    if (!box || !track) return null;
    const n = 13;
    const make = (i, copy) => { const w = document.createElement("div"); w.innerHTML = PPC.area(i); const el = w.firstElementChild; if (copy) { el.setAttribute("aria-hidden", "true"); el.inert = true; } return el; };
    const slides = [];
    for (const copy of [true, false, true]) for (let i = 0; i < n; i++) { const el = make(i, copy); track.append(el); slides.push(el); }
    const bends = slides.map((s) => s.querySelector("[data-areas-bend]"));
    const cur = root.querySelector("[data-areas-cur]");
    root.querySelector("[data-areas-total]").textContent = String(n);
    const reduced = PP.reduced;
    const fold = (BEND.fold * Math.PI) / 180 / Math.sin(Math.PI / BEND.wave) ** 2, lean = (BEND.lean * Math.PI) / 180;
    const st = { pos: 0 };
    let d = 1, vw = 1, reach = 3, tween = null, last = 0, prevPos = 0, live = false;
    const ys = { pos: 0, speed: 0 }, vs = { pos: 0, speed: 0 };
    const lag = [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0]];
    const pick = (arr, w) => { const i = Math.min(Math.floor(w), arr.length - 2), t = Math.min(w - i, 1); return arr[i] + (arr[i + 1] - arr[i]) * t * t * (3 - 2 * t); };
    const shown = () => ((st.pos % n) + n + 0.5) % n - 0.5;
    const measure = () => { d = slides[0].offsetWidth || 1; vw = box.clientWidth; reach = (vw / d) * 0.75 + 1.5; };
    const place = () => { track.style.transform = `translate3d(${(vw - d) / 2 - (n + shown()) * d}px,0,0)`; };
    const bend = () => {
      const q = n + shown(), persp = BEND.persp * Math.max(vw / 2, d);
      const ang = bends.map((_, c) => {
        const pt = c - q, w = Math.abs(pt);
        return reduced || w > reach ? 0 : lean - fold * (1 + BEND.gain * pick(lag[1], w)) * Math.sin((Math.PI * (pt + st.pos - pick(lag[0], w))) / BEND.wave) ** 2;
      });
      const X = Math.max(0, Math.min(bends.length - 1, Math.round(q)));
      const lx = [], lz = [];
      lx[X] = (X - q) * d * Math.cos(ang[X]); lz[X] = (q - X) * d * Math.sin(ang[X]);
      for (let c = X + 1; c < bends.length; c++) { lx[c] = lx[c - 1] + (d / 2) * (Math.cos(ang[c - 1]) + Math.cos(ang[c])); lz[c] = lz[c - 1] - (d / 2) * (Math.sin(ang[c - 1]) + Math.sin(ang[c])); }
      for (let c = X - 1; c >= 0; c--) { lx[c] = lx[c + 1] - (d / 2) * (Math.cos(ang[c + 1]) + Math.cos(ang[c])); lz[c] = lz[c + 1] + (d / 2) * (Math.sin(ang[c + 1]) + Math.sin(ang[c])); }
      bends.forEach((b, c) => {
        const pt = (c - q) * d;
        if (reduced || Math.abs(c - q) > reach) { b.style.transform = ""; return; }
        b.style.transformOrigin = `${d / 2 - pt}px 50%`;
        b.style.transform = `perspective(${persp}px) translate3d(${lx[c]}px,0,${lz[c]}px) rotateY(${ang[c]}rad) translateX(${-pt}px)`;
      });
    };
    const label = () => { const i = ((Math.round(st.pos) % n) + n) % n; if (cur.textContent !== String(i + 1)) cur.textContent = String(i + 1); };
    const tick = (time, dms) => {
      const dt = Math.max(1, Math.min(dms || 16, 100)) / 1000;
      const speed = (st.pos - prevPos) / dt;
      prevPos = st.pos;
      const s = Math.min(Math.abs(speed) / BEND.speed, 1);
      for (let t = dt; t > 0; t -= 0.004) { springStep(ys, st.pos, 1, 0.5, Math.min(t, 0.004)); springStep(vs, s, 1.2, 0.55, Math.min(t, 0.004)); }
      const k = 1 - Math.exp(-dt / 0.1);
      [ys.pos, vs.pos].forEach((v, r) => lag[r].forEach((x, i, a) => (a[i] = i ? x + (a[i - 1] - x) * k : v)));
      bend();
    };
    const wake = () => { if (!live) { live = true; prevPos = st.pos; gsap.ticker.add(tick); } last && clearTimeout(last); };
    const sleep = () => {
      last = setTimeout(() => {
        live = false; gsap.ticker.remove(tick);
        Object.assign(ys, { pos: st.pos, speed: 0 }); Object.assign(vs, { pos: 0, speed: 0 });
        lag[0].fill(st.pos); lag[1].fill(0); bend();
      }, 1200);
    };
    const go = (to) => {
      tween?.kill();
      wake();
      label();
      tween = gsap.to(st, {
        pos: to, duration: reduced ? 0 : BEND.dur, ease: "main",
        onUpdate: () => { place(); label(); },
        onComplete: () => {
          const wrap = shown(); const shift = wrap - st.pos;
          st.pos = wrap; prevPos += shift; ys.pos += shift; lag[0].forEach((v, i, a) => (a[i] = v + shift));
          place(); sleep();
        },
      });
    };
    const prev = () => go(Math.round(st.pos) - 1), next = () => go(Math.round(st.pos) + 1);
    root.querySelector("[data-areas-prev]").addEventListener("click", prev);
    root.querySelector("[data-areas-next]").addEventListener("click", next);
    // Drag: grabs when dragged horizontally over 6px, on release moves one slide toward the drag if over 15%, otherwise to the nearest slide
    let drag = null;
    box.addEventListener("pointerdown", (e) => { if (e.button === 0) drag = { x: e.clientX, y: e.clientY, from: st.pos, on: false, id: e.pointerId }; });
    box.addEventListener("pointermove", (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x;
      if (!drag.on) { if (Math.abs(dx) < 6 || Math.abs(dx) < Math.abs(e.clientY - drag.y)) return; drag.on = true; box.setPointerCapture(e.pointerId); tween?.kill(); wake(); }
      st.pos = drag.from - dx / d; place(); label();
    });
    const up = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const { on, from } = drag; drag = null;
      if (!on) return;
      const moved = st.pos - from;
      go(moved >= 0.15 ? Math.max(Math.round(st.pos), Math.floor(from) + 1) : moved <= -0.15 ? Math.min(Math.round(st.pos), Math.ceil(from) - 1) : Math.round(st.pos));
    };
    box.addEventListener("pointerup", up);
    box.addEventListener("pointercancel", up);
    box.addEventListener("dragstart", (e) => e.preventDefault());
    measure(); place(); lag[0].fill(0); bend(); label();
    const ro = new ResizeObserver(() => { measure(); place(); bend(); });
    ro.observe(box);
    return () => { ro.disconnect(); tween?.kill(); gsap.ticker.remove(tick); clearTimeout(last); };
  };

  // Performer wall: four columns on wide screens, two on narrow — each column is one cell of velocity-lag-columns, so every column lags differently
  const wall = (root) => {
    const el = root.querySelector("[data-lineup-wall]");
    if (!el) return null;
    const mq = matchMedia("(min-width: 992px)");
    const build = () => {
      const cols = mq.matches ? 4 : 2, count = 16;
      el.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
      el.innerHTML = Array.from({ length: cols }, (_, c) =>
        `<div class="pp-lineup__col" data-fx-part="item" style="--col-x: ${((2 * c + 1) / cols - 1).toFixed(3)}">${Array.from({ length: count / cols }, (_, r) => PPC.artist(r * cols + c)).join("")}</div>`).join("");
    };
    build();
    mq.addEventListener("change", build);
    return () => mq.removeEventListener("change", build);
  };

  // Cursor wobble (original line-up window-wide mousemove): two numbers for the cursor position −1~1 followed with .8s energy, and the shape is drawn by index.css.
  // The original enables this only on devices with a mouse, leaving phones untouched
  const sway = (root) => {
    const sec = root.querySelector(".pp-lineup");
    if (!sec || PP.reduced || !matchMedia("(hover: hover)").matches) return null;
    gsap.set(sec, { "--lp-x": 0, "--lp-y": 0 });
    const to = ["x", "y"].map((k) => gsap.quickTo(sec, `--lp-${k}`, { duration: 0.8, ease: "energy" }));
    const move = (e) => { to[0]((e.clientX / innerWidth) * 2 - 1); to[1]((e.clientY / innerHeight) * 2 - 1); };
    const io = new IntersectionObserver(([e]) => window[e.isIntersecting ? "addEventListener" : "removeEventListener"]("mousemove", move), { rootMargin: "25% 0px" });
    io.observe(sec);
    return () => { io.disconnect(); removeEventListener("mousemove", move); gsap.killTweensOf(sec); sec.style.removeProperty("--lp-x"); sec.style.removeProperty("--lp-y"); };
  };

  PP.page("home", (root) => {
    const offs = [wall(root), sway(root), areas(root)];
    const tickets = root.querySelector("[data-tickets]");
    if (tickets) tickets.innerHTML = Array.from({ length: 4 }, (_, i) => `<div class="pp-tickets__item">${PPC.ticket(i)}</div>`).join("");

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Pink stage → navy-violet wall: it darkens while the wall top moves from 40% to −20% of the screen
      const bg = root.querySelector("[data-lineup-bg]");
      const wallEl = root.querySelector("[data-lineup-wall]");
      if (bg && wallEl) gsap.fromTo(bg, { "--dark": 0 }, { "--dark": 1, ease: "none", scrollTrigger: { trigger: wallEl, start: "top 40%", end: "top -20%", scrub: true } });
      // Hat: floats in place on a 3s cycle, rises out while a section passes, and the coins go faster
      const hat = root.querySelector("[data-fifty-hat]");
      const fifty = root.querySelector(".pp-fifty");
      if (hat && fifty) {
        gsap.to(hat.firstElementChild, { y: -14, rotation: 1.5, duration: 1.5, ease: "sine.inOut", yoyo: true, repeat: -1 });
        gsap.fromTo(hat, { yPercent: 35 }, { yPercent: -95, ease: "none", scrollTrigger: { trigger: fifty, start: "top top", end: "bottom top", scrub: true } });
        gsap.fromTo(fifty.querySelectorAll(".pp-fifty__coin"), { y: 0 }, { y: (i) => -innerHeight * (0.6 + (i % 3) * 0.25), ease: "none", scrollTrigger: { trigger: fifty, start: "top top", end: "bottom top", scrub: true } });
        gsap.fromTo(fifty.querySelector(".pp-fifty__face"), { yPercent: 0 }, { yPercent: -70, ease: "none", scrollTrigger: { trigger: fifty, start: "top top", end: "bottom top", scrub: true } });
      }
    });
    return () => { offs.forEach((f) => f?.()); mm.revert(); };
  });
})();
