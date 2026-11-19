// Our story: while the hero is pinned (four screens long), four polaroid bundles go in turn — the previous bundle flies to the nearest edge in .8s power2.in,
// New bundles settle at .8s power2.out with .03s stagger starting .45s after the edge, and the sentence changes. Person cards flip every 10 seconds while visible.
// Numbers count up when visible. Principles expand on press. The photo ring tilts with the cursor (follows .15 at a time) and on press that photo comes to the bottom center and moves closer.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rnd = (n) => { const x = Math.sin(n * 12.9898) * 43758.5453; return x - Math.floor(x); };

  // ── Hero ──
  const hero = document.querySelector(".story-hero");
  if (hero) {
    const sets = [...hero.querySelectorAll(".story-hero__set")].map((s) => [...s.children]);
    const phrase = hero.querySelector(".story-hero__phrase");
    const lines = (phrase.dataset.phrases || "").split("|");
    let box = {}, spots = [], cur = 0, busy = false, queued = null;
    const layout = () => {
      const w = hero.clientWidth, h = hero.clientHeight, small = w < 600;
      const cw = small ? 96 : w < 900 ? 130 : Math.min(210, 0.22 * h), ch = 1.25 * cw;
      box = { w, h, cw, ch };
      spots = sets.map((cards, s) => cards.map((_, k) => {
        const seed = 31 * s + 7 * k;
        if (small) {
          const col = Math.floor(k / 2) / Math.max(1, Math.ceil(cards.length / 2) - 1);
          const band = k % 2 === 0 ? [0.25 * h, 0.33 * h] : [0.69 * h, 0.8 * h];
          return { x: 0.04 * w + col * (0.92 * w - cw) + (rnd(seed) - 0.5) * 24, y: band[0] + rnd(seed + 3) * (band[1] - band[0]) - ch / 2, rot: 30 * rnd(seed + 5) - 15 };
        }
        // Scatter on an ellipse circling the screen center (leave the sentence area empty)
        const a = (k / cards.length) * Math.PI * 2 + 0.6 * rnd(seed) + 0.4 * s, f = rnd(seed + 3), rx = 0.3 * w + 0.6 * cw + f * w * 0.1;
        const ry = w < 900 ? 0.3 * h + f * h * 0.08 : 0.26 * h + f * h * 0.1;
        return { x: Math.min(w - cw - 20, Math.max(20, w / 2 + Math.cos(a) * rx - cw / 2)), y: Math.min(h - ch - 70, Math.max(110, h / 2 + Math.sin(a) * ry - ch / 2)), rot: 40 * rnd(seed + 5) - 20 };
      }));
      sets.forEach((cards) => cards.forEach((c) => gsap.set(c, { width: cw, height: ch })));
    };
    // Spot outside the nearest edge
    const outside = (p) => {
      const { w, h, cw, ch } = box, cx = p.x + cw / 2, cy = p.y + ch / 2;
      const d = { l: cx, r: w - cx, t: cy, b: h - cy }, m = Math.min(d.l, d.r, d.t, d.b), j = (rnd(p.x + p.y) - 0.5) * 300;
      return m === d.l ? { x: -cw - 200, y: p.y + j } : m === d.r ? { x: w + 200, y: p.y + j } : m === d.t ? { x: p.x + j, y: -ch - 200 } : { x: p.x + j, y: h + 200 };
    };
    const place = (s, shown) => sets[s].forEach((c, k) => {
      const p = spots[s][k], o = outside(p);
      gsap.set(c, shown ? { x: p.x, y: p.y, rotation: p.rot, autoAlpha: 1 } : { x: o.x, y: o.y, rotation: 3 * p.rot, autoAlpha: 0 });
    });
    layout();
    sets.forEach((_, s) => place(s, s === 0));
    const go = (to) => {
      if (to === cur) return;
      if (busy) { queued = to; return; }
      busy = true;
      const from = cur;
      const tl = gsap.timeline({ onComplete: () => { busy = false; cur = to; if (queued != null && queued !== cur) { const q = queued; queued = null; go(q); } else queued = null; } });
      sets[from].forEach((c, k) => { const o = outside(spots[from][k]); tl.to(c, { x: o.x, y: o.y, rotation: (rnd(k + from) - 0.5) * 180, duration: 0.8, ease: "power2.in" }, 0); tl.set(c, { autoAlpha: 0 }, 0.8); });
      sets[to].forEach((c, k) => { const p = spots[to][k], o = outside(p); tl.set(c, { x: o.x, y: o.y, rotation: (rnd(k + to + 9) - 0.5) * 180, autoAlpha: 1 }, 0); tl.to(c, { x: p.x, y: p.y, rotation: p.rot, duration: 0.8, ease: "power2.out" }, 0.45 + 0.03 * k); });
      tl.to(phrase, { autoAlpha: 0, y: -12, duration: 0.4, ease: "power2.in" }, 0);
      tl.call(() => { phrase.textContent = lines[to] || ""; }, null, 0.4);
      tl.fromTo(phrase, { y: 12 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" }, 0.45);
    };
    if (!reduce) {
      ScrollTrigger.create({ trigger: hero, start: "top top", end: () => `+=${4 * innerHeight}`, pin: true, onUpdate: (st) => go(Math.min(sets.length - 1, Math.floor(st.progress * sets.length * 0.999))) });
    }
    addEventListener("resize", () => { layout(); sets.forEach((_, s) => place(s, s === cur)); });
  }

  // ── Person card: flips when the name is clicked, or every 10 seconds while visible (1.3s) ──
  const duo = document.querySelector(".story-ilaria");
  if (duo) {
    const flip = duo.querySelector(".story-flip");
    const [a, b, pause] = duo.querySelectorAll(".story-flip__who button");
    const stories = [...duo.querySelectorAll(".story-duo__story")];
    let back = false, paused = false, seen = false;
    const set = (v) => {
      back = v;
      flip.classList.toggle("is-flipped", v);
      a.classList.toggle("is-on", !v); b.classList.toggle("is-on", v);
      stories.forEach((s, k) => { const on = k === (v ? 1 : 0); s.classList.toggle("is-active", on); s.setAttribute("aria-hidden", String(!on)); });
    };
    a.addEventListener("click", () => set(false));
    b.addEventListener("click", () => set(true));
    pause.addEventListener("click", () => { paused = !paused; pause.classList.toggle("is-paused", paused); pause.setAttribute("aria-label", paused ? "Spin again" : "Pause"); });
    new IntersectionObserver(([e]) => { seen = e.isIntersecting; }, { threshold: 0.3 }).observe(duo);
    setInterval(() => { if (seen && !document.hidden && !paused) set(!back); }, 10000);
  }

  // ── Numbers: count up from 0 when visible ──
  document.querySelectorAll("[data-count]").forEach((el) => {
    const to = Number(el.dataset.count), tail = el.querySelector("small")?.outerHTML || "";
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const o = { v: 0 };
      gsap.to(o, { v: to, duration: reduce ? 0 : 1.6, ease: "power2.out", onUpdate: () => { el.innerHTML = `${Math.round(o.v)}${tail}`; } });
    }, { threshold: 0.4 });
    io.observe(el);
  });

  // ── Principles ──
  const items = [...document.querySelectorAll(".story-tested__item")];
  const layers = [...document.querySelectorAll(".story-tested__layer")];
  // Hover, focus or press and that row expands and the photo changes
  items.forEach((it, k) => {
    const pick = () => {
      items.forEach((x, j) => { x.classList.toggle("is-active", j === k); x.setAttribute("aria-pressed", String(j === k)); });
      layers.forEach((l, j) => l.classList.toggle("is-active", j === k));
    };
    ["mouseenter", "focus", "click"].forEach((ev) => it.addEventListener(ev, pick));
  });

  // ── Photo Ring ──
  const gal = document.querySelector(".story-gallery");
  if (gal) {
    const stage = gal.querySelector(".story-gallery__stage");
    const ring = gal.querySelector(".story-gallery__ring");
    const cards = [...ring.children];
    const caption = gal.querySelector(".story-gallery__caption");
    const R = 1375, n = cards.length;
    const fit = () => (innerWidth < 768 ? 0.6 : innerWidth < 1200 ? 0.8 : 1) / 5;
    const st = cards.map((_, k) => ({ angle: (k / n) * Math.PI * 2, rot: 0, tRot: 0, x: 0, tX: 0, y: 0, tY: 0, s: 1, tS: 1 }));
    const tilt = { x: 0, y: 0, z: 0, tx: 0, ty: 0, tz: 0 };
    let open = false, moving = false, at = -1, live = false, raf = 0;
    cards.forEach((c, k) => gsap.set(c, { x: R * Math.cos(st[k].angle), y: R * Math.sin(st[k].angle), rotation: (180 * st[k].angle) / Math.PI + 90, transformPerspective: 4000 }));
    gsap.set(ring, { scale: fit() });
    const frame = () => {
      raf = 0;
      if (!live) return;
      if (!open && !moving) {
        tilt.x += (tilt.tx - tilt.x) * 0.15; tilt.y += (tilt.ty - tilt.y) * 0.15; tilt.z += (tilt.tz - tilt.z) * 0.15;
        gsap.set(stage, { rotateX: tilt.x, rotateY: tilt.y, rotation: tilt.z });
        cards.forEach((c, k) => {
          const s = st[k];
          s.rot += (s.tRot - s.rot) * 0.15; s.s += (s.tS - s.s) * 0.15; s.x += (s.tX - s.x) * 0.15; s.y += (s.tY - s.y) * 0.15;
          gsap.set(c, { x: R * Math.cos(s.angle) + s.x, y: R * Math.sin(s.angle) + s.y, rotationY: s.rot, scale: s.s, rotation: (180 * s.angle) / Math.PI + 90, transformPerspective: 5000 });
        });
      }
      raf = requestAnimationFrame(frame);
    };
    new IntersectionObserver(([e]) => { live = e.isIntersecting; if (live && !raf && !reduce) raf = requestAnimationFrame(frame); }).observe(gal);
    // The panel tilts up to 15° toward the cursor, and photos within 250px spin as if flipped, scale to 1.3x, and are pushed 250px outward
    gal.addEventListener("mousemove", (e) => {
      if (open || moving || innerWidth < 1000) return;
      const r = gal.getBoundingClientRect(), ax = (e.clientX - (r.left + r.width / 2)) / (r.width / 2), ay = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      tilt.ty = 15 * ax; tilt.tx = -15 * ay; tilt.tz = (ax + ay) * 5;
      cards.forEach((c, k) => {
        const b = c.getBoundingClientRect(), d = Math.hypot(e.clientX - (b.left + b.width / 2), e.clientY - (b.top + b.height / 2)), s = st[k];
        if (d < 500) { const f = Math.max(0, 1 - d / 250); s.tRot = 180 * f; s.tS = 1 + 0.3 * f; s.tX = 250 * f * Math.cos(s.angle); s.tY = 250 * f * Math.sin(s.angle); }
        else { s.tRot = 0; s.tS = 1; s.tX = 0; s.tY = 0; }
      });
    });
    gal.addEventListener("mouseleave", () => { st.forEach((s) => Object.assign(s, { tRot: 0, tS: 1, tX: 0, tY: 0 })); Object.assign(tilt, { tx: 0, ty: 0, tz: 0 }); });
    const say = (k) => {
      const words = (cards[k].dataset.caption || "").split(" ");
      caption.innerHTML = `<div><p>${words.map((w, i) => `<span class="story-gallery__word"><span style="--k:${i}">${w}</span></span>`).join(" ")}</p></div>`;
    };
    const openAt = (k) => {
      if (open || moving) return;
      open = true; moving = true; at = k;
      gal.classList.add("is-open");
      let turn = (3 * Math.PI) / 2 - st[k].angle;
      if (turn > Math.PI) turn -= 2 * Math.PI; else if (turn < -Math.PI) turn += 2 * Math.PI;
      st.forEach((s) => Object.assign(s, { rot: 0, tRot: 0, s: 1, tS: 1, x: 0, tX: 0, y: 0, tY: 0 }));
      cards.forEach((c, j) => gsap.to(c, { x: R * Math.cos(st[j].angle), y: R * Math.sin(st[j].angle), rotationY: 0, scale: 1, duration: 1.25, ease: "power4.out" }));
      gsap.to(stage, { rotateX: 0, rotateY: 0, rotation: 0, duration: 0.5, ease: "power2.out" });
      Object.assign(tilt, { x: 0, y: 0, z: 0, tx: 0, ty: 0, tz: 0 });
      const z = innerWidth < 768 ? 3.2 : 5;
      gsap.to(ring, { scale: z / 5, y: 275 * z - (z / 5) * 75, rotation: (180 * turn) / Math.PI + 360, duration: 2, ease: "power4.inOut", onComplete: () => { moving = false; } });
      say(k);
    };
    const goTo = (k) => {
      if (!open || moving || k === at) return;
      moving = true; at = k;
      const now = gsap.getProperty(ring, "rotation");
      let d = (270 - (180 * st[k].angle) / Math.PI - now) % 360;
      if (d > 180) d -= 360; else if (d < -180) d += 360;
      gsap.to(ring, { rotation: now + d, duration: 1.2, ease: "power3.inOut", onComplete: () => { moving = false; } });
      say(k);
    };
    const close = () => {
      if (!open || moving) return;
      moving = true;
      caption.firstElementChild?.classList.add("is-leaving");
      gsap.to(ring, { scale: fit(), x: 0, y: 0, rotation: 0, duration: 2.5, ease: "power4.inOut", onComplete: () => { open = false; at = -1; moving = false; gal.classList.remove("is-open"); caption.innerHTML = ""; } });
    };
    cards.forEach((c, k) => c.addEventListener("click", (e) => { e.stopPropagation(); if (!open) openAt(k); else if (k === at) close(); else goTo(k); }));
    gal.addEventListener("click", () => close());
    addEventListener("resize", () => { if (!open) gsap.set(ring, { scale: fit() }); });
  }
})();
