/* Used by all pages: loader (white curtain .6s + gradient curtain .7s), Locomotive smooth scroll (only above 1025px, lerp .15), 
   barba page transition (a gradient film comes down to cover, then a white film fills up), phone Menu pill and round dome menu, text block entrance, watercolor bloom,
   Layered-border button letter wave, subpage header vertical title, slanted line on section titles. Values are exactly as in the original app.js. */
(() => {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  const NM = (window.NM = { pages: {} });
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isPc = () => !matchMedia("(max-width: 1024px)").matches;
  // Bake skin variables (including color-mix and oklch) into rgb that GSAP can blend — draw one cell and read the pixel
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const cssv = (n) => {
    const s = document.createElement("span");
    s.style.cssText = `position:absolute;visibility:hidden;color:var(${n})`;
    document.body.append(s);
    const c = getComputedStyle(s).color;
    s.remove();
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = c;
    probe.fillRect(0, 0, 1, 1);
    const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
    return `rgb(${r}, ${g}, ${b})`;
  };
  NM.cssv = cssv;
  // Original constants (app.js) — text block y 20·1s·‹40% 100%›, menu delay .6, hash scroll .6 power4.inOut
  const C = { blockY: 20, blockDur: 1, blockStart: "40% 100%", blockEase: "power1.out", navDelay: 0.6, smoothDur: 0.6, smoothEase: "power4.inOut", loadDelay: 0 };
  NM.C = C;

  // ── Letter splitting: like the original letterSetting, letter spans sit directly under the text (only single-line titles and button text are split). Spaces are &nbsp; Kept as is without changing it ──
  // Use only on text that may wrap across lines, adding data-split-words to group it into word chunks (so Korean doesn’t break mid-word)
  NM.split = (el) => {
    if (el.dataset.split) return;
    el.dataset.split = "1";
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 1) { if (n.tagName !== "BR") walk(n); return; }
        if (n.nodeType !== 3 || !n.textContent.trim()) return;
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(document.createTextNode(part)); return; }
          const words = el.hasAttribute("data-split-words");
          const w = words ? document.createElement("span") : frag;
          if (words) w.className = "nm-w";
          [...part].forEach((ch) => { const c = document.createElement("span"); c.className = "nm-c"; c.textContent = ch; w.append(c); });
          if (words) frag.append(w);
        });
        n.replaceWith(frag);
      });
    };
    walk(el);
  };
  NM.chars = (el) => [...el.querySelectorAll(".nm-c")];

  // ── Watercolor decoration: distort three overlapping ellipses with noise and let them bleed — data-paint picks the type and seed ──
  const PAINT = {
    1: [["p-a", 60, 70, 46, 40, 0.55], ["p-b", 98, 92, 44, 36, 0.5], ["p-c", 74, 116, 30, 24, 0.45]],
    2: [["p-b", 70, 60, 50, 38, 0.55], ["p-a", 104, 88, 34, 30, 0.45]],
    3: [["p-c", 66, 80, 40, 52, 0.5], ["p-a", 92, 120, 36, 44, 0.5], ["p-b", 60, 150, 26, 22, 0.4]],
    4: [["p-a", 80, 70, 52, 34, 0.5], ["p-c", 60, 104, 30, 26, 0.45], ["p-b", 112, 108, 28, 24, 0.5]],
    5: [["p-b", 72, 72, 46, 46, 0.5], ["p-a", 72, 72, 26, 26, 0.35]],
  };
  NM.paint = (scope) => scope.querySelectorAll(".nm-paint:not([data-drawn])").forEach((el, i) => {
    el.dataset.drawn = "1";
    const k = el.dataset.paint || "1", seed = 3 + i * 7 + +k, id = `nmp-${k}-${seed}-${Math.random().toString(36).slice(2, 6)}`;
    const blobs = (PAINT[k] || PAINT[1]).map(([c, x, y, rx, ry, o]) => `<ellipse class="${c}" cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" opacity="${o}"/>`).join("");
    el.insertAdjacentHTML("afterbegin", `<svg viewBox="0 0 170 180" aria-hidden="true"><defs><filter id="${id}" x="-30%" y="-30%" width="160%" height="160%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="${seed}"/><feDisplacementMap in="SourceGraphic" scale="26"/><feGaussianBlur stdDeviation="2.4"/></filter></defs><g filter="url(#${id})">${blobs}</g></svg>`);
  });

  // ── Smooth scroll ──
  let loco = null;
  const scroller = "#nm-scroll";
  // Inside the gsap.context scope, text selectors are only found within the body, so pass the element in
  NM.scroller = () => (loco ? document.querySelector(scroller) : undefined);
  NM.y = () => (loco ? loco.scroll.instance.scroll.y : scrollY);
  const startLoco = () => {
    if (loco || reduce || !isPc() || !window.LocomotiveScroll) return;
    loco = NM.loco = new LocomotiveScroll({ el: document.querySelector(scroller), smooth: true, lerp: 0.15, getDirection: true, tablet: { smooth: false }, smartphone: { smooth: false } });
    loco.on("scroll", ScrollTrigger.update);
    ScrollTrigger.scrollerProxy(scroller, {
      scrollTop(v) { return arguments.length ? loco.scrollTo(v, { duration: 0, disableLerp: true }) : loco.scroll.instance.scroll.y; },
      getBoundingClientRect() { return { top: 0, left: 0, width: innerWidth, height: innerHeight }; },
      pinType: "transform",
    });
    ScrollTrigger.addEventListener("refresh", () => loco?.update());
    new ResizeObserver(() => loco?.update()).observe(document.querySelector(scroller));
  };
  const stopLoco = () => { if (!loco) return; loco.destroy(); loco = NM.loco = null; document.querySelectorAll("[data-scroll-section],[data-scroll]").forEach((e) => e.style.removeProperty("transform")); };
  matchMedia("(max-width: 1024px)").addEventListener("change", () => { isPc() ? startLoco() : stopLoco(); ScrollTrigger.refresh(); });

  NM.scrollTop = () => { if (loco) loco.scrollTo(0, { duration: 0, disableLerp: true }); else scrollTo(0, 0); };
  NM.scrollToEl = (el, instant) => {
    if (!el) return;
    if (loco) loco.scrollTo(el, instant ? { duration: 0, disableLerp: true } : { duration: 600 });
    else gsap.to(window, { duration: instant ? 0 : C.smoothDur, ease: C.smoothEase, scrollTo: { y: el.getBoundingClientRect().top + scrollY, autoKill: false } });
  };

  // ── Phone menu: the dome panel rises from 30px below in .4s, the inner list follows .3s later over .7s (open) · list first, then the panel in .2s .3s later (close) ──
  const nav = document.querySelector(".nm-nav"), block = document.querySelector(".nm-nav__main"), inner = document.querySelector(".nm-nav__in");
  const menuBtn = document.querySelector(".nm-menu");
  let menuBusy = false;
  NM.menu = (open) => {
    if (menuBusy || !nav || isPc()) return Promise.resolve();
    const now = root.classList.contains("is-menuopen");
    if (open === now) return Promise.resolve();
    menuBusy = true;
    root.classList.toggle("is-menuopen", open);
    menuBtn?.setAttribute("aria-expanded", String(open));
    const tl = gsap.timeline({ onComplete: () => { menuBusy = false; } });
    if (open) {
      gsap.set(nav, { autoAlpha: 1 });
      tl.fromTo(block, { y: 30, autoAlpha: 0 }, { duration: 0.4, ease: "power3.out", y: 0, autoAlpha: 1 })
        .fromTo(inner, { y: -5, autoAlpha: 0 }, { duration: 0.7, ease: "power3.out", y: 0, autoAlpha: 1 }, "<=.3");
    } else {
      tl.fromTo(inner, { y: 0, autoAlpha: 1 }, { duration: 0.3, ease: "power3.out", y: -5, autoAlpha: 0 })
        .fromTo(block, { y: 0, autoAlpha: 1 }, { duration: 0.2, ease: "power3.out", y: 30, autoAlpha: 0 })
        .set(nav, { autoAlpha: 0 });
    }
    return tl.then();
  };
  menuBtn?.addEventListener("click", () => NM.menu(!root.classList.contains("is-menuopen")));
  document.querySelector(".nm-navbg")?.addEventListener("click", () => NM.menu(false));
  addEventListener("scroll", () => root.classList.contains("is-menuopen") && NM.menu(false), { passive: true });
  const syncNav = () => { if (!nav) return; if (isPc()) { root.classList.remove("is-menuopen"); gsap.set([nav, block, inner], { clearProps: "all" }); } else if (!root.classList.contains("is-menuopen")) gsap.set(nav, { autoAlpha: 0 }); };
  matchMedia("(max-width: 1024px)").addEventListener("change", syncNav);

  // ── Letter wave on bordered buttons and photo links: from the first letter, pale blue-violet → grey-blue (.3s, spread .3 and .2), reversed on release ──
  const wave = (el) => {
    if (el.dataset.wave) return;
    el.dataset.wave = "1";
    const spans = el.querySelectorAll(".nm-c");
    if (!spans.length) return;
    const white = el.classList.contains("is-white");
    const c1 = cssv(white ? "--site-wave-w" : "--site-wave-1"), c2 = cssv(white ? "--site-wave-1" : "--site-wave-2");
    const tl = gsap.timeline({ paused: true })
      .to(spans, { ease: "sine.out", duration: 0.3, color: c1, stagger: { from: "start", amount: 0.3 } })
      .to(spans, { ease: "sine.out", duration: 0.3, color: c2, stagger: { from: "start", amount: 0.2 } }, "-=.3");
    el.addEventListener("mouseenter", () => tl.play());
    el.addEventListener("mouseleave", () => tl.reverse());
  };

  // ── Re-attached on every page ──
  let ctx = null;
  const mountPage = (container, first) => {
    ctx?.revert();
    container.querySelectorAll(".js-lt").forEach(NM.split);
    NM.paint(container);
    NM.paint(document.querySelector(".nm-f"));
    container.querySelectorAll(".js-wave").forEach(wave);
    ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add({ any: "all", pc: "(min-width: 1025px)", sp: "(max-width: 1024px)", rm: "(prefers-reduced-motion: reduce)" }, (c) => {
        const { pc, rm } = c.conditions;
        const blocks = gsap.utils.toArray(".u-animateblock", container);
        const paints = [...container.querySelectorAll(".nm-paint"), ...document.querySelectorAll(".nm-f .nm-paint")];
        if (rm) { gsap.set(blocks.concat(paints), { autoAlpha: 1, y: 0, scale: 1, filter: "none" }); return; }
        const sc = pc ? NM.scroller() : undefined;
        ScrollTrigger.batch(blocks, { scroller: sc, start: C.blockStart, once: true, onEnter: (b) => gsap.fromTo(b, { y: C.blockY }, { duration: C.blockDur, ease: C.blockEase, autoAlpha: 1, y: 0 }) });
        if (!pc) ScrollTrigger.batch(gsap.utils.toArray(".u-spanimateblock", container), { start: C.blockStart, once: true, onEnter: (b) => gsap.fromTo(b, { autoAlpha: 0, y: C.blockY }, { duration: C.blockDur, ease: C.blockEase, autoAlpha: 1, y: 0 }) });
        ScrollTrigger.batch(paints, {
          scroller: sc, start: C.blockStart, once: true,
          onEnter: (b) => gsap.fromTo(b, pc ? { autoAlpha: 0, scale: 0.5, filter: "blur(10px)" } : { autoAlpha: 0, scale: 0.5 }, pc ? { duration: 1.4, ease: "circ.out", autoAlpha: 1, scale: 1, filter: "blur(1px)" } : { duration: 1.4, ease: "circ.out", autoAlpha: 1, scale: 1 }),
        });
      });
      NM.pages[container.dataset.barbaNamespace]?.(container, { first, mm });
      if (container.dataset.under !== undefined) underPage(container, mm);
    }, container);
    requestAnimationFrame(() => { loco?.update(); ScrollTrigger.refresh(); });
  };

  // ── Subpage: header photo brightness 1.2→1 (.7s), then the vertical title letters stand up from skewX 10° in a .1s stagger as the 3px blur clears ──
  const underPage = (container, mm) => {
    const title = container.querySelector(".nm-umv__title"), img = container.querySelector(".nm-umv__img .wf-img");
    const chars = title ? NM.chars(title) : [];
    mm.add({ any: "all", big: "(min-width: 768.01px)", rm: "(prefers-reduced-motion: reduce)" }, (c) => {
      if (c.conditions.rm) { gsap.set(chars, { autoAlpha: 1, y: 0, skewX: 0, filter: "none" }); img && gsap.set(img, { filter: "brightness(1)" }); return; }
      gsap.set(chars, { y: -10, skewX: "10deg", autoAlpha: 0 });
      const tl = gsap.timeline();
      if (c.conditions.big) {
        if (img) tl.to(img, { ease: "sine.out", filter: "brightness(1)", duration: 0.7 });
        if (chars.length) tl.to(chars, { ease: "power3.out", autoAlpha: 1, y: 0, filter: "blur(3px)", skewX: "0deg", duration: 1.1, stagger: { from: "start", each: 0.1 } }, img ? "<+.3" : 0)
          .to(chars, { ease: "power3.out", filter: "blur(0px)", duration: 2, stagger: { from: "start", each: 0.1 } }, "<+.3");
      } else if (chars.length) {
        tl.to(chars, { ease: "power3.out", delay: 0.2, autoAlpha: 1, y: 0, filter: "blur(3px)", skewX: "0deg", stagger: { from: "start", each: 0.08 } })
          .to(chars, { ease: "power3.out", filter: "blur(0px)", stagger: { from: "start", each: 0.08 } }, "<+.3");
      }
    });
    // Section title: slanted line (.5s) + letters turn on every .08s from 3px blur and transparent, passing through blue-gray to ink
    const tint = cssv("--site-title-tint"), ink = cssv("--kf-ink");
    container.querySelectorAll(".nm-usec__title").forEach((t) => {
      const sp = NM.chars(t);
      mm.add({ any: "all", big: "(min-width: 768.01px)", pc: "(min-width: 1025px)", rm: "(prefers-reduced-motion: reduce)" }, (c) => {
        if (c.conditions.rm) { t.classList.add("is-load"); gsap.set(sp, { autoAlpha: 1, filter: "none" }); return; }
        const sc = c.conditions.pc ? NM.scroller() : undefined;
        gsap.set(sp, c.conditions.big ? { autoAlpha: 0, filter: "blur(3px)" } : { autoAlpha: 0 });
        ScrollTrigger.create({ trigger: t, start: "0% 100%", scroller: sc, once: true, onEnter: () => t.classList.add("is-load") });
        const tl = gsap.timeline({ delay: 0.4, scrollTrigger: { trigger: t.querySelector(".nm-usec__txt"), start: "0% 100%", scroller: sc, once: true } });
        if (c.conditions.big) tl.to(sp, { ease: "sine.out", autoAlpha: 1, stagger: { from: "start", each: 0.08 } })
          .to(sp, { ease: "sine.out", color: tint, filter: "blur(0px)", stagger: { from: "start", each: 0.08 } }, "<.06")
          .to(sp, { ease: "sine.out", color: ink, stagger: { from: "start", each: 0.08 } }, "<.25");
        else tl.to(sp, { ease: "sine.out", color: tint, autoAlpha: 1, stagger: { from: "start", each: 0.1 } })
          .to(sp, { ease: "sine.out", color: ink, stagger: { from: "start", each: 0.1 } }, "<.2");
      });
    });
  };

  // ── Loader lift: white curtain .6s sine.out, gradient curtain .3s later at .7s going down (background position 100% 100%) ──
  const loader = document.querySelector(".nm-loader"), all = loader?.querySelector(".nm-loader__all"), grad = loader?.querySelector(".nm-loader__grad");
  const loaderOut = () => {
    if (!loader) return;
    if (reduce) { loader.style.display = "none"; return; }
    gsap.to(all, { alpha: 0, duration: 0.6, ease: "sine.out" });
    gsap.to(grad, { backgroundPosition: "100% 100%", duration: 0.7, ease: "sine.out", delay: 0.3, onComplete: () => { loader.style.display = "none"; } });
  };
  // Transition cover: after .5s (+.6 if the menu is open) the gradient comes down in .4s, and the white sheet fills in .2s later over .7s
  const loaderIn = (a) => new Promise((done) => {
    loader.style.display = "";
    gsap.fromTo(grad, { backgroundPosition: "100% 100%" }, { backgroundPosition: "100% 0%", duration: 0.4, ease: "sine.out", delay: a });
    gsap.fromTo(all, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.7, ease: "sine.out", delay: a + 0.2, onComplete: done });
  });

  const header = document.querySelector(".nm-h"), hIn = document.querySelector(".nm-h__in");
  const start = () => {
    const first = document.querySelector("[data-barba='container']");
    startLoco();
    syncNav();
    if (isPc() && !reduce) gsap.set(header, { autoAlpha: 0 });
    root.classList.remove("is-booting");
    setTimeout(() => {
      if (location.hash) NM.scrollToEl(document.querySelector(location.hash), true);
      if (!reduce) gsap.to(header, { autoAlpha: 1, duration: 1, delay: isPc() ? 0.5 : 0 });
      loaderOut();
      setTimeout(() => mountPage(first, true), 500);
    }, C.loadDelay);
    if (!window.barba || !/^https?:$/.test(location.protocol)) return;
    barba.init({
      timeout: 6000,
      prevent: ({ el, href }) => {
        if (!el || el.closest(".wf-ui") || el.target === "_blank") return true;
        const raw = el.getAttribute("href") || "";
        if (!raw || raw.startsWith("#") || /^(mailto|tel):/.test(raw)) return true;
        try {
          const u = new URL(href, location.href);
          if (u.origin !== location.origin) return true;
          if (u.hash && u.pathname !== location.pathname) return true;
        } catch { return true; }
        return false;
      },
      transitions: [{
        name: "page-transition",
        sync: true,
        leave({ current, next }) {
          current.container.classList.add("is-old");
          next.container?.classList.add("is-new");
          let a = 0.5;
          if (!isPc() && root.classList.contains("is-menuopen")) { NM.menu(false); a += C.navDelay; }
          if (!isPc()) gsap.to(hIn, { duration: 0.3, ease: "sine.out", autoAlpha: 0, delay: a });
          return loaderIn(a).then(() => { current.container.classList.remove("is-old"); next.container?.classList.remove("is-new"); });
        },
        enter() {},
        after({ next }) {
          ScrollTrigger.getAll().forEach((t) => t.kill());
          document.body.dataset.page = next.container.dataset.barbaNamespace;
          document.title = next.html.match(/<title>([^<]*)<\/title>/)?.[1] || document.title;
          NM.scrollTop();
          loco?.update();
          setTimeout(() => {
            if (!isPc()) gsap.to(hIn, { duration: 0.2, delay: 0.5, ease: "sine.out", autoAlpha: 1 });
            loaderOut();
            setTimeout(() => mountPage(next.container, false), 500);
          }, 0);
        },
      }],
    });
  };
  document.querySelectorAll("a[href^='#']").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); NM.scrollToEl(document.querySelector(a.getAttribute("href"))); }));
  addEventListener("load", () => setTimeout(start, 0));
})();
