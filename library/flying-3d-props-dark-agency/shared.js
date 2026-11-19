/* Shared by all pages — Lenis, first loader, menu drawer and footer 3D ironing board once per document, button fills, marquee, VIEW cursor and review Swiper in the body (<main>Attached to each ).
   The original is a single-page app, so only the body changes while the transition curtain stays covering — barba does this <main data-barba="container"> Just swap it out,
   Each section’s script is registered with TB.page(name, hook), hooked when the body comes in and released when it leaves. The transition-blocking part is the glow-veil-page part (nav: router).
   Body entrance is timed to tb:ready 250ms before the loader (or transition overlay) clears (original useTransitionReady). */
(() => {
  const html = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const cl = (v) => Math.max(0, Math.min(1, v));
  const io3 = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const outC = (t) => 1 - Math.pow(1 - t, 3);
  const expo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
  const span = (t, a, b) => cl((t - a) / (b - a));
  gsap.registerPlugin(ScrollTrigger);

  // ── Smooth scroll ──
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  window.tbLenis = lenis;

  // ── Ready signal — original useTransitionReady: 250ms before the loader lifts or the transition curtain lifts. Lowered again when the content changes ──
  let ready = false;
  // The original draws line entrances and smoke titles only after ready — it moves the part names in data-tb-later to data-fx at that point so fx-core attaches them
  const later = () => document.querySelectorAll("[data-tb-later]").forEach((el) => { el.dataset.fx = `${el.dataset.fx ? el.dataset.fx + " " : ""}${el.dataset.tbLater}`; el.removeAttribute("data-tb-later"); });
  const fireReady = () => { if (ready) return; ready = true; html.classList.add("tb-ready"); document.body.classList.remove("is-loading"); later(); dispatchEvent(new CustomEvent("tb:ready")); ScrollTrigger.sort(); ScrollTrigger.refresh(); };
  window.tbWhenReady = (fn) => (ready ? fn() : addEventListener("tb:ready", fn, { once: true }));

  // ── Attach · release — clears at once all GSAP (tweens·ScrollTrigger), window listeners, WebGL and draw loops created by one body.
  // If not cleaned up, pinned spots and window listeners pile up as the body is swapped several times and WebGL contexts exceed the limit (16) ──
  function scope() {
    const ac = new AbortController(), offs = [], ctx = gsap.context(() => {});
    const S = {
      alive: true,
      on: (target, type, fn, o) => target.addEventListener(type, fn, { ...o, signal: ac.signal }),
      add: (off) => (offs.push(off), off),
      run: (fn) => ctx.add(fn),
      ready: (fn) => tbWhenReady(() => S.alive && ctx.add(fn)),
      kill() { if (!S.alive) return; S.alive = false; ac.abort(); offs.splice(0).reverse().forEach((off) => off()); ctx.revert(); },
    };
    return S;
  }
  const box = () => document.querySelector('[data-barba="container"]');
  const pages = new Map();
  let now = null;
  // TB3D (stage.js) leaves renderer and loop cleanup to the scope of the body that hooks it
  const TB = (window.TB = {
    scope: null,
    page(ns, fn) { pages.set(ns, fn); const c = box(); if (!now && c?.dataset.barbaNamespace === ns) mount(c); },
  });
  function mount(root) {
    const S = scope();
    TB.scope = S;
    S.run(() => { common(root, S); TB.trail?.(root, S); pages.get(root.dataset.barbaNamespace)?.(S, root); });
    TB.scope = null;
    now = { root, S };
  }
  // Bodies without a section script also get the shared utilities
  document.addEventListener("DOMContentLoaded", () => { if (!now && box()) mount(box()); });

  const loader = document.querySelector(".tb-loader");
  if (!loader || reduce) {
    loader?.setAttribute("hidden", "");
    setTimeout(fireReady, 0);
  } else runLoader(loader);

  function runLoader(root) {
    document.body.classList.add("is-loading");
    scrollTo(0, 0);
    const glow = root.querySelector(".tb-loader__glow"), grain = root.querySelector(".tb-loader__grain");
    const word = root.querySelector(".tb-loader__word"), count = root.querySelector(".tb-loader__count"), num = root.querySelector(".tb-loader__num");
    const svg = root.querySelector(".tb-loader__logo");
    const dash = (el) => { const L = el.getTotalLength ? el.getTotalLength() || 1 : 1; el.style.strokeDasharray = L; el.style.strokeDashoffset = L; return { el, L }; };
    const plots = [...svg.querySelectorAll(".ln")].map(dash), fills = [...svg.querySelectorAll(".lf")], guides = [...svg.querySelectorAll(".lg")].map(dash), marks = [...svg.querySelectorAll(".lm")];
    const setLogo = (p) => {
      plots.forEach((d, i) => {
        const k = 0.06 * i; d.el.style.strokeDashoffset = d.L * (1 - outC(span(p, k, 0.24 + k)));
        d.el.style.opacity = 1 - span(p, 0.3 + k, 0.35 + k);
        if (fills[i]) fills[i].style.clipPath = `inset(${(1 - io3(span(p, 0.06 + k, 0.3 + k))) * 100}% 0 0 0)`;
      });
      const g = [io3(span(p, 0.3, 0.74)), outC(span(p, 0.74, 0.85)), outC(span(p, 0.85, 0.96))];
      guides.forEach((d, i) => { d.el.style.strokeDashoffset = d.L * (1 - g[i]); d.el.style.opacity = 1 - span(p, [0.74, 0.85, 0.96][i], [0.8, 0.9, 1][i]); });
      marks.forEach((m, i) => (m.style.opacity = String(g[i] ?? g[0])));
      svg.style.transform = `scale(${1 + 0.018 * (1 - outC(p))})`;
    };
    setLogo(0);
    const t0 = performance.now();
    let z = -1;
    const count1 = (now) => {
      const t = now - t0, a = expo(cl((t - 260) / 800)), b = expo(cl((t - 260) / 420));
      count.style.opacity = a; count.style.transform = `translateY(${(1 - a) * 14}px)`;
      word.style.opacity = b; word.style.transform = `translateY(${(1 - b) * 10}px)`;
      setLogo(cl((t - 260) / 2094.4));
      const r = cl((t - 540) / 2100), e = r;
      glow.style.setProperty("--fx-reveal", (e * (0.55 + 0.45 * e) * 0.65).toFixed(4));
      const n = Math.round(100 * r); if (n !== z) { z = n; num.textContent = String(n).padStart(3, "0"); }
      if (t < 2640) requestAnimationFrame(count1); else { num.textContent = "100"; glow.style.setProperty("--fx-reveal", "0.65"); exit(performance.now()); }
    };
    const exit = (s0) => {
      const f = (now) => {
        const n = now - s0, r = io3(cl(n / 380)), s = cl(n / 1500);
        word.style.opacity = count.style.opacity = 1 - r;
        word.style.transform = `translateY(${-14 * r}px)`; count.style.transform = `translateY(${-10 * r}px)`;
        glow.style.setProperty("--fx-reveal", (0.65 + 0.35 * s).toFixed(4)); glow.style.setProperty("--fx-exit", s.toFixed(4));
        grain.style.opacity = 0.32 * (1 - cl((s - 0.55) / 0.35));
        if (s < 1) requestAnimationFrame(f); else fade(performance.now());
      };
      requestAnimationFrame(f);
    };
    const fade = (s0) => {
      const f = (now) => { const n = io3(cl((now - s0) / 50)); root.style.opacity = 1 - n; if (n < 1) requestAnimationFrame(f); else { root.setAttribute("hidden", ""); fireReady(); } };
      requestAnimationFrame(f);
    };
    requestAnimationFrame(count1);
  }

  // ── Menu drawer — circle clip-path in 1.2s expo.inOut, links in .08s turns of .8s expo.out, three lines turn into an X ──
  const burger = document.querySelector(".tb-burger"), drawer = document.querySelector(".tb-drawer"), veil = document.querySelector(".tb-drawer-veil");
  let closeDrawer = () => {};
  if (burger && drawer && veil) {
    const lines = [...burger.querySelectorAll("path")];
    lines.forEach((p) => { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = lines.indexOf(p) > 1 ? L : 0; });
    const items = [...drawer.querySelectorAll(".tb-drawer__links > *, .tb-drawer__info > *")];
    // Remove closed drawers from the document — so hidden links can’t be clicked or focused
    const tl = gsap.timeline({ paused: true, defaults: { duration: 0.6, ease: "expo.inOut" }, onReverseComplete: () => gsap.set([drawer, veil], { display: "none" }) })
      .to(veil, { autoAlpha: 1, duration: 0.5 }, 0)
      .to(lines[0], { strokeDashoffset: (i, t) => t.getTotalLength() }, 0)
      .to(lines[1], { strokeDashoffset: (i, t) => t.getTotalLength() }, 0.05)
      .set([lines[2], lines[3]], { opacity: 1 }, 0.2)
      .to(lines[2], { strokeDashoffset: 0 }, 0.2)
      .to(lines[3], { strokeDashoffset: 0 }, 0.25)
      .fromTo(drawer, { clipPath: "circle(0% at 95% 5%)", scale: 0.9, rotation: 2, autoAlpha: 1 }, { clipPath: "circle(150% at 0% 5%)", scale: 1, rotation: 0, autoAlpha: 1, duration: 1.2, ease: "expo.inOut" }, 0)
      .fromTo(items, { y: 20, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.8, ease: "expo.out" }, 0.4);
    gsap.set(drawer, { autoAlpha: 0, display: "none" }); gsap.set(veil, { display: "none" });
    let open = false;
    const set = (v) => {
      open = v; burger.setAttribute("aria-expanded", String(v)); burger.setAttribute("aria-label", v ? "Close Menu" : "Open Menu");
      if (v) { gsap.set(drawer, { display: "flex" }); gsap.set(veil, { display: "block" }); lenis?.stop(); document.body.style.overflow = "hidden"; tl.play(); } else { lenis?.start(); document.body.style.overflow = ""; tl.reverse(); }
    };
    burger.addEventListener("click", () => set(!open));
    veil.addEventListener("click", () => set(false));
    addEventListener("keydown", (e) => e.key === "Escape" && open && set(false));
    let w = innerWidth; addEventListener("resize", () => { if (open && innerWidth !== w) set(false); w = innerWidth; });
    // Close just under the slide curtain — when the curtain lifts, the new body without a drawer shows right away
    closeDrawer = () => { if (!open) return; set(false); tl.progress(0).pause(); gsap.set([drawer, veil], { display: "none" }); };
    drawer.querySelectorAll(".tb-fill").forEach((a) => {
      const over = a.querySelector(".tb-fill__over"); if (!over) return;
      a.addEventListener("pointerenter", () => !a.classList.contains("is-here") && gsap.to(over, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.15, ease: "expo.out", overwrite: "auto" }));
      a.addEventListener("pointerleave", () => !a.classList.contains("is-here") && gsap.to(over, { clipPath: "inset(0% 100% 0% 0%)", duration: 0.9, ease: "power2.inOut", overwrite: "auto" }));
    });
  }
  // Match the drawer’s ”Current section” marker to the address
  const markHere = () => drawer?.querySelectorAll(".tb-fill").forEach((a) => {
    const here = a.pathname === location.pathname && !a.hash;
    a.classList.toggle("is-here", here);
    gsap.set(a.querySelector(".tb-fill__over"), { clearProps: "clipPath" });
  });

  // ── VIEW cursor — a green circle follows the cursor only over the work stage ──
  const cursor = fine && !reduce ? document.querySelector(".tb-cursor") : null;
  const curTo = cursor && { x: gsap.quickTo(cursor, "x", { duration: 0.45, ease: "power3.out" }), y: gsap.quickTo(cursor, "y", { duration: 0.45, ease: "power3.out" }) };
  let inZone = false;
  const curAt = (e, jump) => { const x = e.clientX - cursor.offsetWidth / 2, y = e.clientY - cursor.offsetHeight / 2; jump ? (curTo.x(x, x), curTo.y(y, y)) : (curTo.x(x), curTo.y(y)); };
  const curHide = () => { inZone = false; gsap.to(cursor, { opacity: 0, scale: 0.4, duration: 0.3, ease: "power2.in", overwrite: "auto" }); };
  // Follows only inside the work stage — outside it doesn’t change position either (so an invisible circle doesn’t travel across the screen)
  if (cursor) addEventListener("pointermove", (e) => inZone && curAt(e), { passive: true });

  // ── Shared hooks attached to every page body ──
  function common(root, S) {
    // Button fill — the circle center follows the hand position
    root.querySelectorAll(".tb-btn").forEach((b) => {
      const at = (e) => { const r = b.getBoundingClientRect(); if (!r.width || !r.height) return; b.style.setProperty("--btn-mx", `${((e.clientX - r.left) / r.width) * 100}%`); b.style.setProperty("--btn-my", `${((e.clientY - r.top) / r.height) * 100}%`); };
      b.addEventListener("pointerenter", at); b.addEventListener("pointermove", at); b.addEventListener("pointerleave", at);
    });

    // Marquee — .5px per frame, pauses when off-screen
    root.querySelectorAll(".tb-marquee").forEach((m) => {
      const track = m.querySelector(".tb-marquee__track"), first = track?.firstElementChild;
      if (!first) return;
      const speed = +(m.dataset.speed || 0.5), dir = m.dataset.dir === "right" ? 1 : -1;
      let unit = 0, x = 0, raf = 0;
      const build = () => {
        [...track.children].slice(1).forEach((c) => c.remove());
        unit = first.offsetWidth; if (!unit) return;
        const n = Math.ceil(m.offsetWidth / unit) + 2;
        for (let i = 0; i < n; i++) { const c = first.cloneNode(true); c.setAttribute("aria-hidden", "true"); track.append(c); }
      };
      build();
      const ro = new ResizeObserver(() => { const u = first.offsetWidth; if (u && Math.abs(u - unit) > 1) build(); }); ro.observe(m);
      S.add(() => ro.disconnect());
      if (reduce) return;
      const tick = () => { x += speed * dir; if (x <= -unit) x += unit; else if (x >= 0 && dir > 0) x -= unit; track.style.transform = `translate3d(${x}px,0,0)`; raf = requestAnimationFrame(tick); };
      const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { if (!raf) raf = requestAnimationFrame(tick); } else { cancelAnimationFrame(raf); raf = 0; } }, { rootMargin: "64px 0px" }); io.observe(m);
      S.add(() => { io.disconnect(); cancelAnimationFrame(raf); });
    });

    if (cursor) {
      root.querySelectorAll("[data-tb-view]").forEach((z) => {
        z.addEventListener("pointerenter", (e) => { inZone = true; curAt(e, true); gsap.to(cursor, { opacity: 1, scale: 1, duration: 0.4, ease: "power3.out", overwrite: "auto" }); });
        z.addEventListener("pointerleave", curHide);
      });
      S.add(() => inZone && curHide());
    }

    // Testimonials — Swiper creative (previous/next slides -6%/6%·-2%·-160, ±6°, .96x, bottom-center axis)
    if (window.Swiper) root.querySelectorAll(".tb-love .swiper").forEach((el) => {
      const box = el.closest(".tb-love");
      const sw = new Swiper(el, {
        effect: "creative", grabCursor: true, loop: true, speed: 700, slidesPerView: 1, centeredSlides: true, watchSlidesProgress: true,
        creativeEffect: { limitProgress: 2, perspective: true, prev: { translate: ["-6%", "-2%", -160], rotate: [0, 0, -6], scale: 0.96, opacity: 1, origin: "bottom center" }, next: { translate: ["6%", "-2%", -160], rotate: [0, 0, 6], scale: 0.96, opacity: 1, origin: "bottom center" } },
        navigation: { prevEl: box.querySelector(".tb-love__prev"), nextEl: box.querySelector(".tb-love__next") },
      });
      S.add(() => sw.destroy(true, false));
    });
  }

  // ── Transition — as in the original, only swap the body while the overlay stays covered: from fill-up 1.7s → fully filled .9s <main> Swap → lifts off at 1.5s (prepare 250ms before that) ──
  const veilOf = () => document.body.fxGlowVeil;
  const labelOf = (t) => (t?.nodeType === 1 ? t.dataset.veilLabel || t.textContent || "" : "").replace(/\s+/g, " ").trim();
  if (window.barba && box()) {
    history.scrollRestoration = "manual";
    barba.init({
      preventRunning: true,
      // In-page anchor links and current-section links are left to the browser
      prevent: ({ el }) => !!el && (el.pathname === location.pathname || !!el.hash),
      transitions: [{
        name: "veil",
        async leave(data) {
          await veilOf()?.cover(labelOf(data.trigger));
          closeDrawer();
          now?.S.kill(); now = null;
        },
        async enter(data) {
          data.current.container?.remove();
          lenis?.scrollTo(0, { immediate: true, force: true }); scrollTo(0, 0);
          ready = false; html.classList.remove("tb-ready");
          markHere();
          mount(data.next.container);
          ScrollTrigger.refresh();
          const v = veilOf();
          if (v) await v.reveal({ early: 250, onEarly: fireReady });
          fireReady();
        },
      }],
    });
  }

  // ── Footer — a standing ironing board rises from below spinning one full turn (top 80% → top top, scrub 1), and tilts following the pointer ──
  const foot = document.querySelector(".tb-foot"), fc = foot?.querySelector(".tb-foot__canvas");
  if (foot && fc && window.TB3D) {
    const { T, renderer, environment, lights, board, fit, loop } = TB3D;
    const r = renderer(fc), scene = new T.Scene(), cam = new T.PerspectiveCamera(36, 1, 0.1, 60);
    environment(r, scene); const L = lights(scene); L.glow.position.set(-0.3, -2.2, -0.5); L.glow.intensity = 11;
    const b = board(); b.fold(1);
    const tilt = new T.Group(), spinG = new T.Group();
    spinG.add(b.group); tilt.add(spinG); scene.add(tilt);
    const rest = { y: -0.95, rx: 1.4384, ry: -1.5616, rz: 0.0084, spin: 0 }, st = { ...rest, y: -5, spin: Math.PI * 2 };
    const place = () => {
      const wide = innerWidth / innerHeight;
      cam.position.set(0, 1.2, 5.8 * (wide >= 16 / 9 ? 1 : Math.min(1.6, Math.pow((16 / 9) / wide, 0.55)))); cam.lookAt(0, -0.1, 0); fit(r, cam, fc);
    };
    place(); addEventListener("resize", place);
    if (!reduce) gsap.timeline({ scrollTrigger: { trigger: foot, start: "top 80%", end: "top top", scrub: 1 } }).to(st, { ...rest, ease: "none" });
    else Object.assign(st, rest);
    const m = { k: 0, kt: 0, s: 0, st: 0 };
    if (fine && !reduce) addEventListener("mousemove", (e) => { const t = (e.clientX / innerWidth) * 2 - 1; m.kt = 0.95 * t; m.st = t * Math.PI * 2; });
    loop(fc, () => {
      m.s += (m.st - m.s) * 0.12; m.k += (m.kt - m.k) * 0.08;
      spinG.position.y = st.y; spinG.rotation.set(st.rx, st.ry, st.rz); b.group.rotation.x = st.spin + m.s; tilt.rotation.z = -m.k;
      r.render(scene, cam);
    });
  }
})();
