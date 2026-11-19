// Shared by all pages — smooth scroll, logo sunrays, loader, blood-pour effect on the phone menu and page transition, notice window, back to top.
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wide = matchMedia("(min-width: 1020px)");
  const SVG = "http://www.w3.org/2000/svg";
  const KEY = "d-transition";

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  // The original runs Lenis with a 1.2 second duration instead of lerp — one wheel tick glides a long way
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ duration: 1.2, smoothWheel: true, syncTouch: true, syncTouchLerp: 0.12, infinite: false });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  window.dLenis = lenis;

  // Logo rays — draw a 24-spike star, spin it by scroll speed, then let it stop
  const burst = (r1, r2, n) => {
    let d = "";
    for (let i = 0; i < n * 2; i++) {
      const a = (Math.PI * i) / n - Math.PI / 2, r = i % 2 ? r1 : r2 * (i % 4 === 0 ? 1 : 0.82);
      d += (i ? "L" : "M") + (60 + r * Math.cos(a)).toFixed(2) + "," + (52 + r * Math.sin(a)).toFixed(2);
    }
    return d + "Z";
  };
  const bursts = [...document.querySelectorAll("[data-sunburst]")];
  bursts.forEach((p) => p.setAttribute("d", burst(30, 48, 24)));
  if (!reduce && bursts.length) {
    let angle = 0, vel = 0, lastY = scrollY, raf = 0;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const spin = () => {
      angle += vel; vel *= 0.5;
      bursts.forEach((p) => p.closest(".d-loader") || (p.style.transform = `rotate(${angle}deg)`));
      raf = Math.abs(vel) > 0.04 ? requestAnimationFrame(spin) : 0;
    };
    addEventListener("scroll", () => {
      const dy = clamp(scrollY - lastY, -96, 96);
      lastY = scrollY;
      if (!dy) return;
      vel = clamp(vel + 0.2 * dy, -0.8, 0.8);
      raf ||= requestAnimationFrame(spin);
    }, { passive: true });
  }

  // Logo eyelids — when the cursor reaches the logo, top and bottom eyelids close in .15s power2.in, and open when it leaves. Idle, it blinks once every 2~6 seconds (.1s closing and .1s opening)
  document.querySelectorAll(".d-logo svg").forEach((svg, k) => {
    const id = `d-eye-clip-${k}`;
    const defs = document.createElementNS(SVG, "defs");
    defs.innerHTML = `<clipPath id="${id}"><path d="M24 52 Q60 24 96 52 Q60 80 24 52Z"/></clipPath>`;
    svg.prepend(defs);
    const g = document.createElementNS(SVG, "g");
    g.setAttribute("clip-path", `url(#${id})`);
    g.innerHTML = '<rect class="logo-fill d-lid d-lid--top" x="20" y="20" width="80" height="32"/><rect class="logo-fill d-lid d-lid--bottom" x="20" y="52" width="80" height="32"/>';
    svg.append(g);
    if (reduce) return;
    const logo = svg.closest(".d-logo");
    const blink = () => {
      logo.classList.add("is-blink");
      setTimeout(() => logo.classList.remove("is-blink"), 100);
      setTimeout(blink, 2000 + Math.random() * 4000);
    };
    setTimeout(blink, 2000 + Math.random() * 4000);
  });

  // Blood pour — the 13-point wave front comes down from above to cover (pour), and on the next page exits downward (exit)
  const WAVE = [0.1, 0.25, 1, 0.15, 0, 0.55, 0.1, 0.05, 0.85, 0.2, 0, 0.4, 0.1];
  const inOutQuad = (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
  const front = (y, t, amp) => WAVE.map((v, i) => {
    const edge = i === 0 || i === WAVE.length - 1;
    const swell = 1 + 0.3 * Math.sin(3.1 * t + 2.1 * i);
    const sway = edge ? 0 : 0.8 * Math.sin(3.7 * t + 0.9 * i);
    return [(i / (WAVE.length - 1)) * 100 + sway, y + v * amp * swell + 2.5 * Math.sin(2.4 * t + 1.3 * i)];
  });
  const smooth = (pts) => {
    const at = (i) => pts[Math.max(0, Math.min(pts.length - 1, i))];
    let d = "";
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
      d += `C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(2)},${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(2)},${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(2)},${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(2)},${p2[0].toFixed(2)},${p2[1].toFixed(2)}`;
    }
    return d;
  };
  function pour(host, ms) {
    const svg = document.createElementNS(SVG, "svg");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("aria-hidden", "true");
    const path = document.createElementNS(SVG, "path");
    svg.append(path);
    host.prepend(svg);
    let p = 0, dir = 0, raf = 0, last = 0, done = null, leaving = false;
    const draw = (t) => {
      const e = inOutQuad(p);
      if (leaving) {
        const pts = front(127 * e - 4.5, t, -18);
        path.setAttribute("d", `M${pts[0][0]},${pts[0][1].toFixed(2)}${smooth(pts)}L100,105L0,105Z`);
      } else {
        const pts = front(127 * e - 22.5, t, 18).reverse();
        path.setAttribute("d", `M0,-5L100,-5L${pts[0][0]},${pts[0][1].toFixed(2)}${smooth(pts)}Z`);
      }
    };
    const tick = (now) => {
      const dt = last ? Math.max(1, now - last) : 16;
      last = now;
      p = Math.max(0, Math.min(1, p + (dir * dt) / ms));
      draw(now / 1000);
      if ((dir > 0 && p >= 1) || (dir < 0 && p <= 0)) {
        raf = 0; last = 0; dir = 0;
        const cb = done; done = null; cb?.();
      } else raf = requestAnimationFrame(tick);
    };
    const run = (d, cb) => { dir = d; done = cb || null; raf ||= requestAnimationFrame(tick); };
    const set = (v) => { cancelAnimationFrame(raf); raf = 0; last = 0; dir = 0; done = null; leaving = false; p = Math.max(0, Math.min(1, v)); draw(0); };
    draw(0);
    return {
      pour: (cb) => { if (leaving) set(0); run(1, cb); },
      drain: (cb) => run(-1, cb),
      exit: (cb) => { set(0); leaving = true; draw(0); run(1, cb); },
      set,
    };
  }

  // Page transition — on wide screens, clicking an internal link covers the page with blood and then navigates, and on the arrival page it drops away downward
  if (!reduce) {
    const veil = document.createElement("div");
    veil.className = "d-transition";
    document.body.append(veil);
    const flow = pour(veil, 750);
    const tone = (t) => veil.classList.toggle("is-black", t === "black");
    let arriving = null;
    try { arriving = sessionStorage.getItem(KEY); sessionStorage.removeItem(KEY); } catch {}
    if (arriving) {
      tone(arriving);
      veil.classList.add("is-active");
      flow.set(1);
      requestAnimationFrame(() => flow.exit(() => veil.classList.remove("is-active")));
    }
    document.addEventListener("click", (e) => {
      if (!wide.matches || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest?.("a[href]");
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname || url.protocol === "mailto:") return;
      e.preventDefault();
      const t = document.body.classList.contains("page--inverted") ? "black" : "red";
      tone(t);
      veil.classList.add("is-active");
      flow.pour(() => {
        try { sessionStorage.setItem(KEY, t); } catch {}
        location.href = url.href;
      });
    }, true);
    addEventListener("pageshow", (e) => { if (e.persisted) { flow.set(0); veil.classList.remove("is-active"); } });
  }

  // Phone menu — covered by the same blood pour (.85s), text rises from .4s at .08 intervals
  const toggle = document.querySelector(".d-burger");
  const menu = document.querySelector(".d-menu");
  if (toggle && menu) {
    const flow = pour(menu, 850);
    menu.classList.add("has-pour");
    const isOpen = () => document.body.classList.contains("d-menu-open");
    const onKey = (e) => { if (e.key === "Escape") { e.preventDefault(); close(); } };
    const open = () => {
      if (isOpen() || wide.matches) return;
      document.body.classList.add("d-menu-open");
      menu.classList.add("is-active");
      reduce ? flow.set(1) : flow.pour();
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close Menu");
      document.addEventListener("keydown", onKey);
    };
    const close = () => {
      if (!isOpen()) return;
      document.body.classList.remove("d-menu-open");
      const off = () => menu.classList.remove("is-active");
      reduce ? (flow.set(0), off()) : flow.drain(off);
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open Menu");
      document.removeEventListener("keydown", onKey);
    };
    toggle.addEventListener("click", () => (isOpen() ? close() : open()));
    menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
    wide.addEventListener("change", (e) => { if (e.matches) { close(); flow.set(0); menu.classList.remove("is-active"); } });
    // On the first page stage, hide the center menu after scrolling just 40px
    if (document.querySelector(".d-stage")) {
      const hide = () => menu.classList.toggle("is-hidden", scrollY > 40);
      hide();
      addEventListener("scroll", hide, { passive: true });
    }
  }

  // Two notice windows — is-open is added after two frames so the panel floats up, and on close it hides after transitionend (at most .45 seconds)
  document.querySelectorAll("[data-d-modal]").forEach((trigger) => {
    const modal = document.getElementById(trigger.getAttribute("aria-controls"));
    const panel = modal?.querySelector(".d-modal__panel");
    if (!modal || !panel) return;
    let back = null;
    const onKey = (e) => { if (e.key === "Escape") { e.preventDefault(); hide(); } };
    const show = () => {
      if (!modal.hidden) return;
      back = document.activeElement;
      modal.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
      document.addEventListener("keydown", onKey);
      requestAnimationFrame(() => requestAnimationFrame(() => { modal.classList.add("is-open"); panel.focus(); }));
    };
    const hide = () => {
      if (modal.hidden) return;
      modal.classList.remove("is-open");
      let gone = false;
      const finish = () => {
        if (gone) return;
        gone = true;
        panel.removeEventListener("transitionend", onEnd);
        clearTimeout(timer);
        modal.hidden = true;
        trigger.setAttribute("aria-expanded", "false");
        document.removeEventListener("keydown", onKey);
        (back || trigger).focus?.();
      };
      const onEnd = (e) => e.target === panel && finish();
      panel.addEventListener("transitionend", onEnd);
      const timer = setTimeout(finish, 450);
    };
    trigger.addEventListener("click", (e) => { e.preventDefault(); show(); });
    modal.querySelectorAll("[data-d-close]").forEach((b) => b.addEventListener("click", hide));
  });
  document.querySelectorAll(".d-switch").forEach((sw) => sw.addEventListener("click", () => {
    sw.setAttribute("aria-checked", sw.getAttribute("aria-checked") === "true" ? "false" : "true");
  }));

  // Back to top — glides up over 2.5s
  document.querySelectorAll("[data-d-top]").forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    lenis ? lenis.scrollTo(0, { duration: 2.5 }) : scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }));

  // Loader — lifts .1s after the typeface has fully loaded and only after 2.2s from the start. The sunrays turn .35° per frame until it lifts
  const loader = document.querySelector(".d-loader");
  const born = performance.now();
  window.dReady = new Promise((resolve) => {
    if (!loader) return resolve();
    let raf = 0, angle = 0, last = 0;
    const sun = loader.querySelector("[data-sunburst]");
    if (!reduce && sun) {
      const turn = (now) => {
        const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
        last = now; angle += 60 * dt * 0.35;
        sun.style.transform = `rotate(${angle}deg)`;
        raf = requestAnimationFrame(turn);
      };
      raf = requestAnimationFrame(turn);
    }
    document.fonts.ready.then(() => setTimeout(() => {
      setTimeout(() => {
        loader.classList.add("is-hidden");
        cancelAnimationFrame(raf);
        resolve();
      }, reduce ? 0 : Math.max(0, 2200 - (performance.now() - born)));
    }, 100));
  });
  root.classList.add("js");
})();
