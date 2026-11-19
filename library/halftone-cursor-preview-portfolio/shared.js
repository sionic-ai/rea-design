// Motion shared by all pages: paper loader, Lenis (lerp .1), vermilion cursor, scroll progress line, reveals (data-split · data-reveal · data-reveal-group),
// Parallax (data-parallax), magnetic (data-magnetic) and tilt (data-tilt), marquee that speeds up with scroll velocity (data-marquee), footer hover.
// While the loader covers the screen, scroll triggers are turned off and then re-measured all at once after the paper opens — otherwise reveals would finish during the loader.
(() => {
  gsap.registerPlugin(ScrollTrigger);

  const root = document.documentElement;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(pointer: fine)").matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const emit = (name) => dispatchEvent(new Event(name));

  // ── Lenis ──
  let lenis = null;
  if (!reduced) {
    lenis = window.lenis = new Lenis({ autoRaf: false, anchors: true, lerp: 0.1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
    const start = () => lenis.start();
    addEventListener("dd:loader-done", start, { once: true });
    setTimeout(start, 9000);
  }

  // ── Loader: minimum 2.5s the first time, and on a return in the same session 0.8s at 1/0.6 speed ──
  const SEEN = "dd-loader-seen";
  const loader = document.getElementById("site-loader");
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    root.classList.remove("is-loading");
    loader?.remove();
    try { sessionStorage.setItem(SEEN, "1"); } catch {}
    emit("dd:loader-done");
  };

  const particlesReady = new Promise((resolve) => {
    let left = document.querySelectorAll("[data-particle]:not([data-particle-ready])").length;
    if (!left) return resolve();
    addEventListener("dd:particle-ready", () => { if (--left <= 0) resolve(); });
  });

  async function runLoader(el) {
    let seen = false;
    try { seen = sessionStorage.getItem(SEEN) === "1"; } catch {}
    const minWait = seen ? 800 : 2500;
    const speed = seen ? 0.6 : 1;
    root.classList.add("is-loading");
    scrollTo(0, 0);
    setTimeout(finish, 9000);

    const q = (s) => el.querySelector(s);
    const top = q('[data-ld-panel="top"]');
    const bottom = q('[data-ld-panel="bottom"]');
    const hair = q("[data-ld-hair]");
    const disc = q("[data-ld-disc]");
    const count = q("[data-ld-count]");
    const meta = el.querySelectorAll("[data-ld-meta]");
    const heroDisc = document.querySelector("[data-hero-disc]");
    const ready = Promise.race([particlesReady, wait(minWait)]);
    const size = heroDisc?.getBoundingClientRect().width ?? Math.min(innerWidth, innerHeight) * 0.3;

    gsap.set(disc, { width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2, scale: 0 });
    gsap.set(hair, { scaleX: 0 });
    gsap.set(meta, { y: 8 });
    gsap.set(count, { yPercent: 105, opacity: 1 });
    await Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), wait(700)]);

    gsap.timeline({ defaults: { ease: "power3.out" } }).timeScale(1 / speed)
      .to(meta, { opacity: 1, y: 0, duration: 0.8, stagger: 0.08 }, 0)
      .to(count, { yPercent: 0, duration: 1, ease: "expo.out" }, 0.05)
      .to(disc, { scale: 0.035, duration: 0.6, ease: "back.out(2.2)" }, 0.1);

    const p = { v: 0 };
    const paint = () => {
      count.textContent = String(Math.round(p.v * 100)).padStart(3, "0");
      gsap.set(hair, { scaleX: p.v });
      gsap.set(disc, { scale: 0.035 + 0.965 * p.v });
    };
    const fill = (vars) => new Promise((r) => gsap.to(p, { ...vars, onUpdate: paint, onComplete: r }));

    await wait(450 * speed);
    await Promise.all([fill({ v: 0.92, duration: 1.3 * speed, ease: "power2.out" }), ready]);
    await fill({ v: 1, duration: 0.45 * speed, ease: "power2.inOut" });
    await wait(140);
    await new Promise((resolve) => {
      const r = heroDisc?.getBoundingClientRect();
      const tl = gsap.timeline({ onComplete: resolve }).timeScale(1 / speed)
        .to(count, { yPercent: -105, duration: 0.7, ease: "power3.in" }, 0)
        .to(meta, { opacity: 0, y: -8, duration: 0.4, ease: "power2.in" }, 0)
        .to(hair, { opacity: 0, duration: 0.3 }, 0.25)
        .addLabel("open", 0.3)
        .to(top, { yPercent: -50, duration: 1.25, ease: "expo.inOut" }, "open")
        .to(bottom, { yPercent: 50, duration: 1.25, ease: "expo.inOut" }, "open");
      if (r) {
        tl.to(disc, {
          x: r.left + r.width / 2 - innerWidth / 2,
          y: r.top + r.height / 2 - innerHeight / 2,
          scale: r.width / size, duration: 1.25, ease: "expo.inOut",
        }, "open");
      } else {
        tl.to(disc, { scale: 0, duration: 0.6, ease: "power3.in" }, 0.1);
      }
      tl.call(() => emit("dd:loader-reveal"), [], "open+=0.35");
    });
    finish();
  }

  // ── Cursor: the dot follows in .12s, the ring in .45s, and over pressable items the ring is 1.7x ──
  function cursor() {
    const dot = document.getElementById("cur-dot");
    const ring = document.getElementById("cur-ring");
    if (!dot || !ring) return;
    if (!fine || reduced) { dot.remove(); ring.remove(); return; }
    root.classList.add("has-cursor");
    gsap.set([dot, ring], { x: innerWidth / 2, y: innerHeight / 2 });
    const dx = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3" });
    const dy = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3" });
    const rx = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3" });
    const ry = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3" });
    addEventListener("mousemove", (e) => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); });
    document.addEventListener("mouseover", (e) => {
      const on = !!e.target.closest?.("a, button, .dd-row");
      gsap.to(ring, { scale: on ? 1.7 : 1, duration: 0.35, ease: "power3.out" });
      ring.classList.toggle("is-hover", on);
    });
    document.addEventListener("mousedown", () => gsap.to([dot, ring], { scale: 0.8, duration: 0.2 }));
    document.addEventListener("mouseup", () => gsap.to([dot, ring], { scale: 1, duration: 0.3 }));
  }

  // Text splitting: the readable text stays as one hidden block, and only the visible side is split into letter and word cells
  function split(el, mode) {
    const text = (el.textContent ?? "").trim().replace(/\s+/g, " ");
    el.textContent = "";
    const sr = document.createElement("span");
    sr.className = "dd-sr";
    sr.textContent = text;
    const vis = document.createElement("span");
    vis.setAttribute("aria-hidden", "true");
    text.split(" ").forEach((w, i, all) => {
      const word = document.createElement("span");
      if (mode === "chars") {
        word.className = "dd-chars-word";
        [...w].forEach((c) => {
          const ch = document.createElement("span");
          ch.className = "dd-char";
          ch.textContent = c;
          word.append(ch);
        });
      } else {
        word.className = "dd-word";
        word.textContent = w;
      }
      vis.append(word);
      if (i < all.length - 1) vis.append(" ");
    });
    el.append(sr, vis);
    return vis.querySelectorAll(mode === "chars" ? ".dd-char" : ".dd-word");
  }

  const REVEAL = {
    up: { y: 36, opacity: 0 },
    left: { x: -48, opacity: 0 },
    right: { x: 48, opacity: 0 },
    scale: { scale: 0.92, opacity: 0, y: 18 },
    clip: { clipPath: "inset(0 0 100% 0)", y: 30 },
  };

  function motion() {
    gsap.defaults({ ease: "power3.out", overwrite: "auto" });

    const bar = document.getElementById("scroll-progress");
    if (bar) gsap.to(bar, { scaleX: 1, ease: "none", scrollTrigger: { trigger: document.body, start: 0, end: "max", scrub: 0.3 } });

    document.querySelectorAll("[data-split]").forEach((el) => {
      const mode = el.dataset.split || "chars";
      const parts = split(el, mode);
      gsap.fromTo(parts, { yPercent: 110, rotate: mode === "chars" ? 6 : 0, opacity: 0 }, {
        yPercent: 0, rotate: 0, opacity: 1, duration: 0.9, stagger: mode === "chars" ? 0.018 : 0.06, ease: "power4.out",
        scrollTrigger: { trigger: el, start: "top 88%" },
      });
    });

    document.querySelectorAll("[data-reveal]:not([data-split])").forEach((el) => {
      const kind = el.dataset.reveal || "up";
      if (kind === "clip") el.style.overflow = "hidden";
      gsap.fromTo(el, REVEAL[kind] ?? REVEAL.up, {
        x: 0, y: 0, scale: 1, opacity: 1, clipPath: "inset(0 0 0% 0)",
        duration: 1, delay: parseFloat(el.dataset.revealDelay || "0"), ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
        onComplete: () => { el.style.clipPath = ""; },
      });
    });

    document.querySelectorAll("[data-reveal-group]").forEach((group) => {
      const items = group.querySelectorAll("[data-reveal-item]");
      if (!items.length) return;
      gsap.fromTo(items, { y: 30, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.8, stagger: 0.09, ease: "power3.out",
        scrollTrigger: { trigger: group, start: "top 86%", once: true },
      });
    });

    document.querySelectorAll("[data-parallax]").forEach((el) => {
      gsap.to(el, {
        yPercent: parseFloat(el.dataset.parallax || "0.12") * 100, ease: "none",
        scrollTrigger: { trigger: el.closest("section") || el, start: "top bottom", end: "bottom top", scrub: true },
      });
    });

    if (fine) {
      document.querySelectorAll("[data-magnetic]").forEach((el) => {
        const k = parseFloat(el.dataset.magnetic || "0.35");
        const mx = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3" });
        const my = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3" });
        let cx = 0, cy = 0;
        el.addEventListener("mouseenter", () => {
          const r = el.getBoundingClientRect();
          cx = r.left + r.width / 2;
          cy = r.top + r.height / 2;
        });
        el.addEventListener("mousemove", (e) => { mx((e.clientX - cx) * k); my((e.clientY - cy) * k); });
        el.addEventListener("mouseleave", () => { mx(0); my(0); });
      });
      document.querySelectorAll("[data-tilt]").forEach((el) => {
        const rx = gsap.quickTo(el, "rotationX", { duration: 0.5, ease: "power3" });
        const ry = gsap.quickTo(el, "rotationY", { duration: 0.5, ease: "power3" });
        gsap.set(el, { transformPerspective: 800 });
        let r = { left: 0, top: 0, width: 1, height: 1 };
        el.addEventListener("mouseenter", () => { r = el.getBoundingClientRect(); });
        el.addEventListener("mousemove", (e) => {
          ry(((e.clientX - r.left) / r.width - 0.5) * 10);
          rx(-((e.clientY - r.top) / r.height - 0.5) * 10);
        });
        el.addEventListener("mouseleave", () => { rx(0); ry(0); });
      });
    }

    // Marquee: half a turn in 24s, speeds up to 4x with scroll speed and then eases back to its own speed over .6s. Scrolling up makes it flow backward
    document.querySelectorAll("[data-marquee]").forEach((box) => {
      const track = box.querySelector("[data-marquee-track]");
      if (!track) return;
      const loop = gsap.to(track, { xPercent: -50, duration: parseFloat(box.dataset.marquee || "28"), ease: "none", repeat: -1 });
      ScrollTrigger.create({
        trigger: box, start: "top bottom", end: "bottom top",
        onUpdate: (self) => {
          const dir = self.direction === -1 ? -1 : 1;
          loop.timeScale(Math.min(4, 1 + Math.abs(self.getVelocity()) / 4000) * dir);
          gsap.to(loop, { timeScale: dir, duration: 0.6, overwrite: true, delay: 0.15 });
        },
      });
    });

    // Footer
    const cta = document.querySelector("[data-cta]");
    const badge = document.querySelector("[data-cta-badge]");
    cta?.addEventListener("mouseenter", () => {
      gsap.to(cta, { scale: 1.04, duration: 0.35, ease: "power3.out" });
      if (badge) gsap.to(badge, { rotate: -6, scale: 1.08, duration: 0.35, ease: "back.out(2)" });
    });
    cta?.addEventListener("mouseleave", () => {
      gsap.to(cta, { scale: 1, duration: 0.4, ease: "power3.out" });
      if (badge) gsap.to(badge, { rotate: 0, scale: 1, duration: 0.4 });
    });
    document.querySelectorAll("[data-arrow]").forEach((arrow) => {
      const a = arrow.closest("a");
      a?.addEventListener("mouseenter", () => gsap.to(arrow, { x: 4, y: -4, duration: 0.3 }));
      a?.addEventListener("mouseleave", () => gsap.to(arrow, { x: 0, y: 0, duration: 0.35 }));
    });
    const up = document.querySelector("[data-to-top]");
    if (up) gsap.to(up, { y: -3, duration: 0.7, yoyo: true, repeat: -1, ease: "sine.inOut" });
    const dot = document.querySelector("[data-foot-dot]");
    if (dot) gsap.to(dot, { opacity: 0.3, duration: 0.8, yoyo: true, repeat: -1, ease: "sine.inOut" });

    addEventListener("load", () => ScrollTrigger.refresh());
    if (root.classList.contains("is-loading")) {
      const all = ScrollTrigger.getAll();
      all.forEach((st) => st.disable(false));
      let on = false;
      const enable = () => {
        if (on) return;
        on = true;
        all.forEach((st) => st.enable());
        ScrollTrigger.refresh();
      };
      addEventListener("dd:loader-done", enable, { once: true });
      setTimeout(enable, 9000);
    }
  }

  window.ddMotion = { reduced, fine };

  // After the page script (index.js etc.) has built all its triggers, set up the shared reveal and loader
  addEventListener("DOMContentLoaded", () => {
    gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", motion);
    if (reduced || !loader) finish(); else runLoader(loader);
    cursor();
  });
})();
