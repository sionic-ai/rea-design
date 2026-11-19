/* Shared — Lenis 1.3.26 (default lerp .1) · loader (original values unchanged) · header blur-out · short header · memo mode · child-drawn panel · phone hint clock.
   Loader order: white curtain scaleY 1→0 .9s power3.inOut(0) · wordmark letters y 1.08× →0 .95s power3.out stagger .085(.34) · header band scaleY .5s power2.out(.75)
   · header text lines .7s power3.out stagger .06(.92) · whole header screen from below→in place 1.05s power3.inOut(1.65) · film strip 191/1400x→1 2.05s power2.inOut(1.65)
   · First card · the rest appear at .5s (3.2) · film strip drops out (3.45) */
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const Fm = (window.Fm = { reduce });
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  scrollTo(0, 0);

  const lenis = new Lenis({ autoRaf: false });
  Fm.lenis = lenis;
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  const S = () => innerWidth / 1440;

  // ── Film strip: from the first card downward, duplicates the 7760-long scene into a miniature (our scene as is) ──
  const strip = document.querySelector(".fm-strip");
  const app = document.querySelector(".fm-app");
  if (strip && app) {
    const inner = document.createElement("div");
    inner.className = "fm-strip__in";
    for (const el of app.children) {
      if (el.matches(".fm-notes, .fm-footer, .fm-burst")) continue;
      const c = el.cloneNode(true);
      c.removeAttribute("data-slot");
      c.querySelectorAll("[data-slot]").forEach((x) => x.removeAttribute("data-slot"));
      inner.appendChild(c);
    }
    strip.appendChild(inner);
  }

  // ── Loader ──
  const curtain = document.querySelector(".fm-curtain");
  const head = [".fm-logo", ".fm-nav"].map((s) => document.querySelector(s)).filter(Boolean);
  const letters = gsap.utils.toArray(".fm-logo .fm-logo__letter");
  const bars = gsap.utils.toArray(".fm-nav__bar, .fm-nav__box");
  const lines = gsap.utils.toArray(".fm-nav .fm-line__in");
  const first = app?.querySelector(".fm-b1");
  const rest = app ? [...app.children].filter((el) => el !== first && !el.matches(".fm-notes")) : [];
  Fm.ready = new Promise((done) => {
    if (!curtain || reduce || innerWidth <= 767 || matchMedia("(pointer: coarse)").matches) {
      curtain?.remove();
      strip?.closest(".fm-strip-view")?.remove();
      return done();
    }
    lenis.stop();
    root.classList.add("is-loading");
    const svg = document.querySelector(".fm-logo svg");
    const lift = svg.viewBox.baseVal.height * 1.08 * (svg.getBoundingClientRect().width / svg.viewBox.baseVal.width);
    const Sc = 191 / 1400, p = 533 - 1400 / 2;
    const m = { scale: Sc, y: -7760 * Sc * S() };
    const place = () => {
      const e = S();
      gsap.set(strip, { scale: m.scale, y: m.y });
      gsap.set(first, { scale: m.scale, x: innerWidth / 2 + p * e * m.scale - 553 * e, y: m.y - 436 * e });
    };
    gsap.set(head, { y: () => innerHeight - 293 * S() });
    gsap.set(letters, { y: lift });
    gsap.set(bars, { scaleY: 0, transformOrigin: "top" });
    gsap.set(lines, { y: (i, el) => el.parentElement.clientHeight + 1 });
    gsap.set(strip, { transformOrigin: "50% 0" });
    gsap.set(first, { opacity: 0.001, transformOrigin: "0 0" });
    gsap.set(rest, { opacity: 0 });
    place();
    gsap.timeline({
      onComplete: () => {
        root.classList.remove("is-loading");
        lenis.start();
        curtain.remove();
        strip.closest(".fm-strip-view")?.remove();
        gsap.set(first, { clearProps: "transform,opacity" });
        gsap.set(rest, { clearProps: "opacity" });
        ScrollTrigger.refresh();
        done();
      },
    })
      .to(curtain, { scaleY: 0, ease: "power3.inOut", duration: 0.9 }, 0)
      .to(letters, { y: 0, ease: "power3.out", duration: 0.95, stagger: 0.085 }, 0.34)
      .to(bars, { scaleY: 1, ease: "power2.out", duration: 0.5 }, 0.75)
      .to(lines, { y: 0, ease: "power3.out", duration: 0.7, stagger: 0.06 }, 0.92)
      .to(head, { y: 0, ease: "power3.inOut", duration: 1.05 }, 1.65)
      .to(m, { scale: 1, y: () => 436 * S(), ease: "power2.inOut", duration: 2.05, onUpdate: place }, 1.65)
      .to(first, { opacity: 1, duration: 0.5 }, 3.2)
      .to(rest, { opacity: 1, duration: 0.5 }, 3.2)
      .to(strip, { opacity: 0, duration: 0.5 }, 3.45);
  });

  // ── Header fade: 1→.6 until it reaches the ground photo, then .6→0 over a length of 253. Once fully gone, a short header drops down ──
  // A clone of the film strip sits earlier in the document, so look for the original inside its scene
  const ground = app?.querySelector(".fm-ground");
  const back = document.querySelector(".fm-backnav");
  if (head.length && ground) {
    const setO = head.map((el) => gsap.quickSetter(el, "opacity"));
    let r = 1, len = 1;
    const measure = () => { const e = S(); r = Math.max(1, ground.getBoundingClientRect().top + scrollY - 273 * e); len = Math.max(1, 253.293213 * e); };
    let lastY = 0;
    const upd = () => {
      const y = scrollY;
      const o = y <= r ? 1 - (y / r) * 0.4 : 0.6 * (1 - Math.min(1, (y - r) / len));
      setO.forEach((f) => f(o));
      lastY = y;
    };
    measure(); upd();
    ScrollTrigger.create({ start: 0, end: () => document.documentElement.scrollHeight, onUpdate: upd, onRefresh: () => { measure(); upd(); }, invalidateOnRefresh: true });
  }

  // ── Short header: appears when scrolling up from two screens down, hides when scrolling down (when not hovering) or when the footer is visible ──
  if (back) {
    const foot = app?.querySelector(".fm-footer");
    let py = scrollY, hover = false, shown = false;
    back.addEventListener("pointerenter", () => (hover = true));
    back.addEventListener("pointerleave", () => (hover = false));
    const show = (v) => { if (v === shown) return; shown = v; back.classList.toggle("is-shown", v); back.setAttribute("aria-hidden", String(!v)); };
    gsap.ticker.add(() => {
      const y = scrollY, d = y - py;
      py = y;
      if (y < innerHeight * 2 || (foot && foot.getBoundingClientRect().top < innerHeight)) return show(false);
      if (d < -2) show(true); else if (d > 2 && !hover) show(false);
    });
  }

  // ── Turning on the kids’ board makes four sparkles pop out from the pressed spot at .055s intervals and fall (horizontal ±9 · up 11~17 · gravity .62 · rotation ±7°/frame) ──
  const sparks = [];
  let sparkOn = false;
  const sparkTick = () => {
    for (let i = sparks.length - 1; i >= 0; i--) {
      const p = sparks[i];
      p.vy += 0.62; p.x += p.vx; p.y += p.vy; p.turn += p.spin;
      p.el.style.transform = `translate3d(${p.x}px,${p.y}px,0) rotate(${p.turn}deg)`;
      if (p.y > innerHeight + 400) { p.el.remove(); sparks.splice(i, 1); }
    }
    if (!sparks.length) { gsap.ticker.remove(sparkTick); sparkOn = false; }
  };
  const spark = (at) => {
    if (reduce) return;
    [0, 1, 2, 3].forEach((k) => setTimeout(() => {
      const e = S(), el = document.createElement("span");
      el.className = "fm-spark";
      el.setAttribute("aria-hidden", "true");
      el.innerHTML = '<svg viewBox="0 0 92 92"><path d="M46 4C49 34 58 43 88 46C58 49 49 58 46 88C43 58 34 49 4 46C34 43 43 34 46 4Z"/></svg>';
      el.style.cssText = `width:${92 * e}px;height:${92 * e}px;margin-left:${-46 * e}px;margin-top:${-46 * e}px`;
      document.body.appendChild(el);
      const c = (k - 1.5) / 1.5, l = Math.max(0, Math.min(1, at[1] / (140 * e)));
      sparks.push({ el, x: at[0], y: at[1], vx: (c * 9 + (Math.random() - 0.5) * 3) * (1 + (1 - l) * 2), vy: -(11 + Math.random() * 6) * l, turn: (Math.random() - 0.5) * 40, spin: (Math.random() - 0.5) * 14 });
      el.style.transform = `translate3d(${at[0]}px,${at[1]}px,0)`;
      if (!sparkOn) { sparkOn = true; gsap.ticker.add(sparkTick); }
    }, k * 55));
  };

  // ── Memo mode · board drawn by a child ──
  const notes = gsap.utils.toArray(".fm-note");
  document.querySelectorAll("[data-toggle]").forEach((b) => b.addEventListener("click", (event) => {
    const k = b.dataset.toggle, on = !root.classList.contains(`is-${k}`);
    if (k === "notes") {
      // Starting with the notes visible on screen, ripple from top to bottom (.04s apart)
      const vis = notes.map((n) => ({ n, t: n.getBoundingClientRect().top })).sort((a, c) => a.t - c.t);
      vis.forEach(({ n }, i) => n.style.setProperty("--wave", on && !reduce ? `${-0.045 + Math.min(i, 12) * 0.017}s` : "0s"));
    }
    // Show the sparkles first — if the kid’s doodle is turned on, the large page is laid out once more, so postponing them makes them appear late
    if (k === "kid" && on) { if (event?.clientX) spark([event.clientX, event.clientY]); else { const r = b.getBoundingClientRect(); spark([r.left + r.width / 2, r.top + r.height / 2]); } }
    root.classList.toggle(`is-${k}`, on);
    document.querySelectorAll(`[data-toggle="${k}"]`).forEach((x) => x.setAttribute("aria-pressed", String(on)));
  }));
  // Child’s doodle: one clumsy line (our drawing) per panel
  const doodles = [
    "M20 80 C 40 20, 80 20, 100 70 S 160 120, 180 40",
    "M30 30 L 70 90 L 110 30 L 150 90",
    "M50 50 m -30 0 a 30 30 0 1 0 60 0 a 30 30 0 1 0 -60 0 M 40 45 l 4 0 M 58 45 l 4 0 M 40 62 q 10 8 20 0",
    "M20 100 Q 60 10 100 100 T 180 100",
  ];
  document.querySelectorAll(".fm-b1__card, .fm-wide, .fm-tag, .fm-side, .fm-screens__card, .fm-vcard__plate, .fm-bar, .fm-tri, .fm-special, .fm-deck, .fm-vee__card--east").forEach((el, i) => {
    el.insertAdjacentHTML("beforeend", `<svg class="fm-kid" viewBox="0 0 200 140" preserveAspectRatio="none" aria-hidden="true"><path d="${doodles[i % doodles.length]}"/></svg>`);
  });

  // ── Clock disc: three dots stand at the real time (City). When a small dot touches the big dot it steps aside inward ──
  const RATE = { second: 1, minute: 1 / 4, hour: 1 / 12 };
  function now() {
    const t = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Berlin", hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }).formatToParts(new Date()).reduce((o, p) => ((o[p.type] = Number(p.value)), o), {});
    const s = t.second % 60, m = t.minute + s / 60, h = (t.hour % 12) + m / 60;
    return { second: (s / 60) * 360, minute: (m / 60) * 360, hour: (h / 12) * 360 };
  }
  Fm.dial = (el, { scrollSpeed = true } = {}) => {
    const inner = 504.068 / 2;
    const dots = ["second", "minute", "hour"].map((role) => {
      const d = el.querySelector(`.fm-dial__dot--${role}`);
      const rad = parseFloat(d.style.getPropertyValue("--d")) / 2;
      return { role, d, rad, rail: inner - rad, rate: RATE[role], angle: 0, lift: 0, x: gsap.quickSetter(d, "x", "px"), y: gsap.quickSetter(d, "y", "px") };
    });
    const sync = () => { const a = now(); dots.forEach((o) => (o.angle = a[o.role])); };
    const draw = () => {
      dots.forEach((o) => (o.lift = 0));
      const by = [...dots].sort((a, b) => a.rad - b.rad);
      for (const a of by) for (const b of by) {
        if (b === a || b.rad >= a.rad) continue;
        const t = ((b.angle - a.angle) * Math.PI) / 180;
        if (Math.cos(t) <= 0) continue;
        const r = b.rail - b.lift, sum = b.rad + a.rad, off = r * Math.sin(t), q = sum * sum - off * off;
        if (q <= 0) continue;
        const need = a.rail - (r * Math.cos(t) - Math.sqrt(q));
        if (need > a.lift) a.lift = need;
      }
      const k = el.offsetWidth / 697;
      for (const o of dots) { const t = ((o.angle - 90) * Math.PI) / 180, r = (o.rail - o.lift) * k; o.x(Math.cos(t) * r); o.y(Math.sin(t) * r); }
    };
    sync(); draw();
    if (!scrollSpeed) {
      setTimeout(() => { sync(); draw(); setInterval(() => { if (el.offsetParent) { sync(); draw(); } }, 1000); }, 1000 - (Date.now() % 1000));
      return;
    }
    // On screen the dot rotates at 24° per second + scroll speed × 240° (ratio like second · minute · hour hands 1 · 1/4 · 1/12)
    let on = false, lastY = scrollY;
    gsap.ticker.add((t, dt) => {
      const y = scrollY, v = (Math.abs(y - lastY) * 1000) / Math.max(dt, 4) / innerHeight;
      lastY = y;
      if (!on || reduce) return;
      const step = ((24 + 240 * v) * dt) / 1000;
      dots.forEach((o) => (o.angle += step * o.rate));
      draw();
    });
    ScrollTrigger.create({ trigger: el, start: "top bottom", end: "bottom top", onToggle: (st) => { on = st.isActive; lastY = scrollY; }, onRefresh: () => draw() });
  };
  document.querySelectorAll(".fm-splash .fm-dial").forEach((d) => Fm.dial(d, { scrollSpeed: false }));
})();
