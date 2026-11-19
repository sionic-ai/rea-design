// Site-wide shared behavior — lenis (1.1s expo), loader lifts → logo opens, menu pill width (text Menu only at the top), cookie, footer title line rising, star spinning
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  gsap.registerPlugin(ScrollTrigger);

  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ duration: 1.1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    window.owLenis = lenis;
  }

  // Intro (first page only) — original IntroAnimation timeline: cells 0.1s · gather and strokes 2.3s · fill and labels 4.8s · door 6.3s · reveal 7.2s (header logo opens) · blur-out 8.3s · end 8.8s.
  // Skip goes to the door right there (reveal .9s · blur 1.8s · end 2.3s). Other pages open right .6s after fonts are ready
  // A page arriving from within the same site (with the transition curtain marker) only lifts the curtain without an intro, as in the original
  const viaNav = !reduce && sessionStorage.getItem("ow-curtain") === "1";
  const loader = document.querySelector(".ow-loader"), logo = document.querySelector(".ow-head .ow-logo");
  const cookie = document.querySelector(".ow-cookie");
  const ready = () => { document.documentElement.classList.add("is-ready"); logo?.classList.add("is-in"); };
  // Cookie panel — opens on any page and enters 1.2s later (original CookieBanner). On the home page it sits under the intro curtain and shows once the intro lifts
  setTimeout(() => cookie?.classList.add("is-in"), reduce ? 0 : 1200);
  if (loader && !reduce && !viaNav) {
    // Skip button is removed once the door starts closing, like the original (removed, not hidden)
    const timers = [], at = (ms, fn) => timers.push(setTimeout(fn, ms)), phase = (c) => loader.classList.add(c), skip = loader.querySelector(".ow-loader__skip");
    lenis?.stop();
    const out = (t, fade, end) => {
      at(t, () => { phase("is-exit"); skip?.remove(); });
      at(t + 900, () => { phase("is-reveal"); ready(); });
      at(t + fade, () => phase("is-fade"));
      at(t + end, () => { phase("is-done"); lenis?.start(); });
    };
    at(100, () => phase("is-grid"));
    at(2300, () => phase("is-logo"));
    at(4800, () => phase("is-tag"));
    out(6300, 2000, 2500);
    skip?.addEventListener("click", () => { timers.forEach(clearTimeout); timers.length = 0; out(0, 1800, 2300); }, { once: true });
  } else {
    loader?.classList.add("is-done");
    if (reduce) ready();
    else Promise.race([document.fonts?.ready || Promise.resolve(), new Promise((r) => setTimeout(r, 2000))]).then(() => setTimeout(ready, 600));
  }

  // On the home page, the header line and menu button appear in .6s when entering the first photo screen past the cream first section, and hide again on return (original brand:hero-entered)
  const heroSec = document.querySelector(".ow-hero"), barEl = document.querySelector(".ow-head"), burgerEl = document.querySelector(".ow-burger");
  if (heroSec && document.querySelector(".ow-intro")) {
    const show = (v) => { barEl?.classList.toggle("is-hidden", !v); burgerEl?.classList.toggle("is-hidden", !v); };
    show(false);
    ScrollTrigger.create({ trigger: heroSec, start: "top 60%", onEnter: () => show(true), onLeaveBack: () => show(false) });
  }

  // Menu pill: at the very top (within 80px) the ”Menu” text is spread open, and on scrolling down only the line remains (.8s)
  const burger = document.querySelector(".ow-burger");
  if (burger) {
    const wide = () => burger.classList.toggle("is-wide", scrollY < 80);
    wide();
    addEventListener("scroll", wide, { passive: true });
  }

  // Cursor — the original CustomCursor math as is: the dot velocity follows by .15 each frame, stretching B = Stretches to (1+B, 1−B/2) by min(.04×speed, .6) and rotates toward that side.
  // The ring follows by 1 − e^(−dt/70) and stretches by min(.06×speed, .35) of its own speed. Every 3 frames it checks under the cursor, and on a link or button the ring becomes 52px (dot hidden),
  // Over a [data-scrollable] panel (just the center half if over 80% of the screen) or [data-cursor-label], a 104px ink-colored circle with a name tag
  const dotEl = document.querySelector(".ow-cursor__dot"), ringEl = document.querySelector(".ow-cursor__ring");
  if (dotEl && ringEl && matchMedia("(hover: hover) and (pointer: fine)").matches && !reduce) {
    const label = ringEl.querySelector(".ow-cursor__label");
    const lerp = (a, b, t) => a + (b - a) * t;
    let x = 0, y = 0, px = 0, py = 0, rx = 0, ry = 0, prx = 0, pry = 0, vx = 0, vy = 0, ang = 0, sx = 1, sy = 1, n = 0, on = false, last = performance.now(), big = false, ox = -1, oy = -1, os = -1;
    const draw = () => { dotEl.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${ang}deg) scale(${sx}, ${sy})`; };
    document.documentElement.classList.add("ow-has-cursor");
    const seen = (v) => { on = v; dotEl.classList.toggle("is-on", v); ringEl.classList.toggle("is-on", v); };
    document.addEventListener("mousemove", (e) => { x = e.clientX; y = e.clientY; draw(); if (!on) seen(true); }, { passive: true });
    document.addEventListener("mouseleave", () => seen(false));
    document.addEventListener("mouseenter", () => seen(true));
    const look = () => {
      const el = document.elementFromPoint(x, y);
      let click = false, name = null;
      if (el) {
        click = !!el.closest("a, button, [data-clickable]");
        const lab = el.closest("[data-cursor-label]");
        if (lab) name = lab.dataset.cursorLabel || "";
        else {
          const sc = el.closest("[data-scrollable]");
          if (sc) {
            const r = sc.getBoundingClientRect();
            const mid = r.width > 0.8 * innerWidth && r.height > 0.8 * innerHeight ? x > 0.25 * innerWidth && x < 0.75 * innerWidth && y > 0.25 * innerHeight && y < 0.75 * innerHeight : true;
            if (mid) name = "Scroll";
          }
        }
      }
      // Original passes the verdict through React state and the ring changes after a re-render — switched 12ms later to match the average measured over three pages
      const nb = name !== null;
      setTimeout(() => {
        big = nb;
        ringEl.classList.toggle("is-big", nb);
        ringEl.classList.toggle("is-click", click && !nb);
        dotEl.classList.toggle("is-hidden", nb || click);
        if (label && nb) label.textContent = name;
      }, 12);
    };
    const tick = () => {
      const now = performance.now(), dt = Math.min(now - last, 64);
      last = now;
      if (on && n++ % 3 === 0 && (x !== ox || y !== oy || scrollY !== os)) { ox = x; oy = y; os = scrollY; look(); }
      vx = lerp(vx, x - px, 0.15); vy = lerp(vy, y - py, 0.15); px = x; py = y;
      const sp = Math.hypot(vx, vy), B = Math.min(0.04 * sp, 0.6);
      ang = (Math.atan2(vy, vx) * 180) / Math.PI; sx = 1 + B; sy = 1 - 0.5 * B;
      draw();
      const k = 1 - Math.exp(-dt / 70);
      rx = lerp(rx, x, k); ry = lerp(ry, y, k);
      const dx = rx - prx, dy = ry - pry; prx = rx; pry = ry;
      const W = Math.hypot(dx, dy), F = Math.min(0.06 * W, 0.35), I = (Math.atan2(dy, dx) * 180) / Math.PI;
      ringEl.style.transform = big ? `translate(${rx}px, ${ry}px) translate(-50%, -50%)` : `translate(${rx}px, ${ry}px) translate(-50%, -50%) rotate(${I}deg) scale(${1 + F}, ${1 - 0.5 * F})`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // Menu — pressing the button spreads the panel circle (CSS .6s), then .2s later the top row and pillars rise. Closes on pressing again, Esc, or a link inside the panel
  const menu = document.querySelector(".ow-menu"), burger2 = menu?.querySelector(".ow-burger");
  if (menu && burger2) {
    let t = 0;
    const set = (v) => {
      menu.classList.toggle("is-open", v); burger2.classList.toggle("is-open", v);
      burger2.setAttribute("aria-expanded", String(v)); burger2.setAttribute("aria-label", v ? "Close Menu" : "Open Menu");
      clearTimeout(t);
      if (v) t = setTimeout(() => menu.classList.add("is-shown"), reduce ? 0 : 200); else menu.classList.remove("is-shown");
      if (lenis) v ? lenis.stop() : lenis.start();
    };
    burger2.addEventListener("click", () => set(!menu.classList.contains("is-open")));
    menu.querySelectorAll(".ow-menu__panel a").forEach((a) => a.addEventListener("click", () => set(false)));
    addEventListener("keydown", (e) => e.key === "Escape" && menu.classList.contains("is-open") && set(false));
  }

  // Page transition. A link to another page within the same site lowers the curtain in .54s to cover, then navigates, and the new page opens covered and lifts the curtain (original PageTransition)
  const curtain = document.querySelector(".ow-curtain");
  if (curtain && !reduce) {
    if (viaNav) { sessionStorage.removeItem("ow-curtain"); curtain.classList.add("is-back"); }
    curtain.addEventListener("animationend", (e) => e.animationName === "ow-rise" && curtain.classList.remove("is-back"));
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target) return;
      const u = new URL(a.href, location.href);
      if (u.origin !== location.origin || u.pathname === location.pathname) return;
      e.preventDefault();
      curtain.classList.remove("is-back");
      curtain.classList.add("is-out");
      sessionStorage.setItem("ow-curtain", "1");
      setTimeout(() => location.assign(u.href), 540);
    });
    addEventListener("pageshow", (e) => e.persisted && curtain.classList.remove("is-out"));
  }

  // The cookie panel drops out right after a choice is made (the original takes the panel down in place — no exit motion)
  document.querySelectorAll("[data-cookie]").forEach((b) => b.addEventListener("click", () => b.closest(".ow-cookie").remove()));

  // Footer — title lines rise from 115% below the mask at 1s power4.out (.12 apart), and the star pops out from 0 at 1.2s elastic.out(1, .6) and turns once every 28 seconds
  const foot = document.querySelector(".ow-foot");
  if (foot && !reduce) {
    const lines = foot.querySelectorAll(".ow-foot__title .ow-mask > span");
    gsap.fromTo(lines, { yPercent: 115 }, { yPercent: 0, duration: 1, ease: "power4.out", stagger: 0.12, scrollTrigger: { trigger: foot, start: "top 70%" } });
    const ast = foot.querySelector(".ow-ast");
    if (ast) {
      gsap.to(ast, { rotation: "+=360", duration: 28, ease: "none", repeat: -1 });
      gsap.fromTo(ast, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.2, ease: "elastic.out(1, 0.6)", scrollTrigger: { trigger: foot, start: "top 70%" } });
    }
  }

  // Question accordion — opens one at a time
  document.querySelectorAll(".ow-faq").forEach((faq) => faq.querySelectorAll(".ow-faq__item").forEach((item) => {
    const q = item.querySelector(".ow-faq__q"), a = item.querySelector(".ow-faq__a");
    q.addEventListener("click", () => {
      const open = !item.classList.contains("is-open");
      faq.querySelectorAll(".ow-faq__item.is-open").forEach((o) => { if (o === item) return; const oa = o.querySelector(".ow-faq__a"); oa.style.height = oa.scrollHeight + "px"; oa.offsetHeight; oa.style.height = "0px"; o.classList.remove("is-open"); });
      item.classList.toggle("is-open", open); q.setAttribute("aria-expanded", String(open));
      a.style.height = a.scrollHeight + "px";
      if (!open) { a.offsetHeight; a.style.height = "0px"; }
    });
    a.addEventListener("transitionend", () => { if (item.classList.contains("is-open")) a.style.height = "auto"; ScrollTrigger.refresh(); });
  }));

  addEventListener("load", () => ScrollTrigger.refresh());
})();
