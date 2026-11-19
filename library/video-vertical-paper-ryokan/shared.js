// Shared by all pages: Lenis, barba transition (@barba/css blur fade), light/dark of the right button column, and frosted glass menu are hooked up just once,
// Attaches vertical name letter entrance, brush-stroke photo reveal, Swiper slider and video modal to each panel (container), and removes them on transition.
(() => {
  gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);
  const body = document.body;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mm = gsap.matchMedia();
  const pc = () => innerWidth >= 1024;

  let lenis = null;
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    lenis = new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => { gsap.ticker.remove(tick); lenis.destroy(); lenis = null; };
  });
  const lock = (on) => {
    body.classList.toggle("is-locked", on);
    if (lenis) on ? lenis.stop() : lenis.start();
  };
  const toTop = () => (lenis ? lenis.scrollTo(0, { immediate: true, force: true }) : scrollTo(0, 0));
  const pages = {};
  window.gora = { reduce, mm, lock, page: (ns, fn) => { pages[ns] = fn; } };

  // Menu: three lines slide out to the left and an X comes in, with a blurred glass panel on the right half
  const burger = document.querySelector(".g-burger");
  const setMenu = (open) => {
    body.classList.toggle("is-menu", open);
    burger?.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
    lock(open);
  };
  burger?.addEventListener("click", () => setMenu(!body.classList.contains("is-menu")));
  document.querySelectorAll(".g-menu a").forEach((a) => a.addEventListener("click", () => body.classList.contains("is-menu") && setMenu(false)));

  // Original slider common values: speed 1600ms, auto advance 5000ms (runs only when the section reaches 80% of the screen)
  const SPEED = 1600, DELAY = 5000;
  const circle = '<svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="4.5" fill="none" stroke="currentColor" stroke-width="1"/></svg>';
  // Left and right half flip on wide screens — the small circle inside is drawn clockwise on hover (DrawSVG -100%) and retracted on leave
  const addNav = (el) => {
    const nav = document.createElement("div");
    nav.className = "g-nav";
    nav.innerHTML = `<div class="g-nav__prev"><i>${circle}</i></div><div class="g-nav__next"><i>${circle}</i></div>`;
    el.append(nav);
    nav.querySelectorAll(".g-nav__prev, .g-nav__next").forEach((b) => {
      const c = b.querySelector("circle");
      gsap.set(c, { drawSVG: "0%" });
      b.addEventListener("mouseenter", () => gsap.to(c, { drawSVG: "-100%", duration: 0.6, ease: "power2.inOut" }));
      b.addEventListener("mouseleave", () => gsap.to(c, { drawSVG: "0%", duration: 0.6, ease: "power2.inOut" }));
    });
    return { nextEl: nav.querySelector(".g-nav__next"), prevEl: nav.querySelector(".g-nav__prev") };
  };
  // Inside the panel, auto-advance only while the section is within 80% of the screen
  const playWhileSeen = (trigger, start, stop) =>
    ScrollTrigger.create({ trigger, start: "top 80%", end: "bottom top", onToggle: (s) => (s.isActive ? start() : stop()) });

  const enterShared = (root) => {
    const swipers = [];
    const offs = [];
    const ctx = gsap.context(() => {
      // Button row and small logo: when a light panel (data-light) covers the screen center, a black button with no background, and over video frosted glass with white text
      const rail = document.querySelector(".g-rail");
      const logoTop = document.querySelector(".g-logo-top");
      const light = root.querySelector("[data-light]");
      rail?.classList.remove("is-fv");
      if (light) {
        logoTop?.classList.add("is-white", "is-hide");
        rail?.classList.remove("is-light");
        ScrollTrigger.create({
          trigger: light, start: "top center", endTrigger: root, end: "bottom center",
          onToggle: (self) => {
            rail?.classList.toggle("is-light", self.isActive);
            logoTop?.classList.toggle("is-white", !self.isActive);
          },
        });
      } else {
        rail?.classList.add("is-light");
        logoTop?.classList.remove("is-white", "is-hide");
      }

      // Vertical name: split into letters and shown once when it reaches the bottom edge of the screen (CSS delays each letter by .1s)
      root.querySelectorAll(".g-vttl").forEach((el) => {
        if (!el.querySelector(".ch")) {
          const text = el.textContent.trim();
          el.setAttribute("aria-label", text);
          el.innerHTML = [...text].map((c, i) => `<span class="ch" aria-hidden="true" style="--i:${i}">${c}</span>`).join("");
        }
        ScrollTrigger.create({ trigger: el, start: "top 100%", once: true, onEnter: () => el.classList.add("is-show") });
      });
      // Button text: wrap one character at a time to delay the hover wave blink per character (from the 1st character, --i)
      root.querySelectorAll(".g-btn > span:first-child").forEach((el) => {
        if (el.querySelector(".ch")) return;
        const text = el.textContent;
        el.setAttribute("aria-label", text);
        el.innerHTML = [...text].map((c, i) => (c === " " ? " " : `<span class="ch" aria-hidden="true" style="--i:${i + 1}">${c}</span>`)).join("");
      });
      root.querySelectorAll(".g-mask:not([data-manual])").forEach((el) => {
        ScrollTrigger.create({ trigger: el, start: "top 80%", once: true, onEnter: () => el.classList.add("is-show") });
      });

      // Photo slider (original paginationSlider): loop, one at a time, parallax (outer photos scale 1.15), hand drag on phone only, dot press
      root.querySelectorAll('.g-swiper[data-swiper="pages"]').forEach((el) => {
        const s = new Swiper(el, {
          loop: true, spaceBetween: 0, slidesPerView: "auto", parallax: true, speed: SPEED, allowTouchMove: !pc(),
          navigation: addNav(el),
          autoplay: { delay: DELAY, pauseOnMouseEnter: false, disableOnInteraction: false, waitForTransition: true },
          pagination: { el: el.querySelector(".g-dots"), clickable: true },
        });
        s.autoplay.stop();
        swipers.push(s);
        if (!reduce) playWhileSeen(el, () => s.autoplay.start(), () => s.autoplay.stop());
      });
      // Stacked cross-changing photos (original homeSlidersDining): fade 1600ms · every 5000ms, not advanced by hand. The second one runs 200ms late
      const fades = [...root.querySelectorAll('.g-swiper[data-swiper="fade"]')].map((el) => {
        const s = new Swiper(el, {
          loop: true, spaceBetween: 0, slidesPerView: 1, speed: SPEED, effect: "fade",
          autoplay: { delay: DELAY, disableOnInteraction: true }, allowTouchMove: false, simulateTouch: false,
        });
        s.autoplay.stop();
        swipers.push(s);
        return s;
      });
      const fadeGroup = root.querySelector("[data-fade-group]");
      if (fades.length && fadeGroup && !reduce) {
        const ids = [];
        playWhileSeen(fadeGroup, () => {
          fades.forEach((s, i) => ids.push(setTimeout(() => !s.destroyed && s.autoplay.start(), i * 200)));
        }, () => { ids.splice(0).forEach(clearTimeout); fades.forEach((s) => s.autoplay.stop()); });
        offs.push(() => ids.forEach(clearTimeout));
      }
      // Horizontal card row (original sliderWH): cards lined up at their own width, drag bar (progress) · half-step paging on wide screens, dots on phones
      root.querySelectorAll('.g-swiper[data-swiper="cards"]').forEach((el) => {
        const s = new Swiper(el, {
          spaceBetween: 0, centeredSlides: false, slidesPerView: "auto", speed: SPEED,
          scrollbar: { el: el.querySelector(".g-scrollbar"), draggable: true, dragClass: "swiper-scrollbar-drag" },
          navigation: addNav(el),
          pagination: { el: el.querySelector(".g-dots") },
        });
        swipers.push(s);
        el.classList.add("is-bare");
        const pic = el.querySelector(".swiper-slide .g-photo");
        const fit = () => pic && el.style.setProperty("--nav-h", `${pic.offsetHeight}px`);
        fit();
        const ro = new ResizeObserver(fit);
        if (pic) ro.observe(pic);
        offs.push(() => ro.disconnect());
      });

      // Video modal: the backdrop fades in over .6s and the video cell expands over 1s from a crop of 50% horizontal and 5% vertical. Buttons rise in turn from 10px below
      const movie = root.querySelector(".g-movie");
      if (movie) {
        const video = movie.querySelector("video");
        const fill = movie.querySelector(".g-movie__bar i");
        const bar = movie.querySelector(".g-movie__bar");
        const play = movie.querySelector(".g-movie__play");
        const mute = movie.querySelector(".g-movie__mute");
        const x = movie.querySelector(".g-movie__x");
        const open = () => {
          lock(true);
          movie.classList.add("is-open");
          movie.classList.remove("is-paused");
          movie.setAttribute("aria-hidden", "false");
          video.play().catch(() => movie.classList.add("is-paused"));
          if (reduce) return;
          if (innerWidth > 1024) gsap.from([play, mute, bar, x], { autoAlpha: 0, y: 10, duration: 1.5, ease: "power2.inOut", stagger: 0.12, delay: 0.2 });
          else {
            gsap.from([play, bar, mute], { autoAlpha: 0, y: 10, duration: 1, delay: 0.3, ease: "power2.inOut", stagger: 0.1 });
            gsap.from(x, { autoAlpha: 0, y: -10, duration: 1.2, ease: "power2.inOut", delay: 0.6 });
          }
        };
        const close = () => {
          lock(false);
          movie.classList.remove("is-open");
          movie.setAttribute("aria-hidden", "true");
          fill.style.transform = "scaleX(0)";
          video.pause();
          video.currentTime = 0;
        };
        root.querySelectorAll("[data-movie]").forEach((b) => b.addEventListener("click", open));
        x.addEventListener("click", close);
        movie.querySelector(".g-movie__bg").addEventListener("click", close);
        play.addEventListener("click", () => {
          if (video.paused) video.play();
          else video.pause();
          movie.classList.toggle("is-paused", video.paused);
        });
        mute.addEventListener("click", () => { video.muted = !video.muted; movie.classList.toggle("is-muted", video.muted); });
        video.addEventListener("timeupdate", () => { fill.style.transform = `scaleX(${video.currentTime / (video.duration || 1)})`; });
        const seek = (e) => { video.currentTime = (e.offsetX / bar.offsetWidth) * (video.duration || 0); };
        let drag = false;
        bar.addEventListener("click", seek);
        bar.addEventListener("mousedown", () => { drag = true; });
        bar.addEventListener("mousemove", (e) => drag && seek(e));
        const up = () => { drag = false; };
        const esc = (e) => e.key === "Escape" && movie.classList.contains("is-open") && close();
        addEventListener("mouseup", up);
        addEventListener("keydown", esc);
        offs.push(() => { removeEventListener("mouseup", up); removeEventListener("keydown", esc); if (movie.classList.contains("is-open")) close(); });
      }
    }, root);
    return {
      stop: () => swipers.forEach((s) => s.autoplay?.stop()),
      revert: () => { offs.forEach((f) => f()); swipers.forEach((s) => s.destroy(true, true)); ctx.revert(); },
    };
  };

  addEventListener("keydown", (e) => e.key === "Escape" && body.classList.contains("is-menu") && setMenu(false));

  // In-page anchor: like the original, 1.4s with Lenis, stopping 100px above the target
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    const id = a?.getAttribute("href");
    const to = id && id.length > 1 && document.querySelector(id);
    if (!to) return;
    e.preventDefault();
    if (body.classList.contains("is-menu")) setMenu(false);
    if (lenis) lenis.scrollTo(to, { offset: -100, duration: 1.4 });
    else to.scrollIntoView();
  });

  let current = null;
  // Barba quietly swallows errors inside the loop — errors raised while mounting the panel are surfaced in the console
  const start = (root) => {
    try {
      const shared = enterShared(root);
      const ns = root.dataset.barbaNamespace || body.dataset.page;
      const own = pages[ns]?.(root);
      current = { stop: shared.stop, revert: () => { own?.(); shared.revert(); } };
      ScrollTrigger.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  // If the page css·js used by the next panel aren’t there yet, attach them and wait until all are loaded (the original swaps the head tags)
  const syncHead = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const have = (sel, attr, url) => [...document.querySelectorAll(sel)].some((n) => n[attr] === url);
    const waits = [];
    doc.querySelectorAll('link[rel="stylesheet"]').forEach((l) => {
      const url = new URL(l.getAttribute("href"), location.href).href;
      if (have('link[rel="stylesheet"]', "href", url)) return;
      const n = document.createElement("link");
      n.rel = "stylesheet";
      n.href = url;
      waits.push(new Promise((r) => { n.onload = n.onerror = r; }));
      document.head.append(n);
    });
    doc.querySelectorAll("script[data-page-js]").forEach((s) => {
      const url = new URL(s.getAttribute("src"), location.href).href;
      if (have("script[src]", "src", url)) return;
      const n = document.createElement("script");
      n.src = url;
      waits.push(new Promise((r) => { n.onload = n.onerror = r; }));
      body.append(n);
    });
    return Promise.all(waits);
  };

  // @barba/css ends the transition with the first transitionend that rises from the panel — transitions of inner photos and text, or a zero-length transform end on the panel,
  // If it rises first the transition gets cut off early. Only while transitioning, it lets through just the end of the panel’s own opacity (the earliest to finish in the original css: leaving .8s · entering .7s)
  const guard = (c) => {
    const f = (e) => { if (e.target !== c || e.propertyName !== "opacity") e.stopImmediatePropagation(); };
    c.addEventListener("transitionend", f, true);
    return () => c.removeEventListener("transitionend", f, true);
  };
  let unguard = null;

  addEventListener("DOMContentLoaded", () => {
    const wrapper = document.querySelector('[data-barba="wrapper"]');
    const first = document.querySelector('[data-barba="container"]') || document;
    if (!wrapper || !window.barba || location.protocol === "file:") { start(first === document ? body : first); return; }
    barba.use(barbaCss);
    barba.init({
      timeout: 6000,
      preventRunning: true,
      prevent: ({ el }) => el.hasAttribute("data-barba-prevent") || /recruit\.html/.test(el.getAttribute("href") || ""),
      transitions: [{
        name: "fade",
        // @barba/css swaps once·leave·enter themselves for class transitions, so whatever needs hooking goes in the hooks before and after.
        // Keep the empty once·leave·enter — without them the plugin’s default transition (barba) gets removed, and neither the fade-* classes nor this hook runs (the original has the same shape)
        once() {},
        leave() {},
        enter() {},
        afterOnce: ({ next }) => start(next.container),
        beforeLeave: ({ current: cur }) => {
          guard(cur.container);
          current?.stop();
          ScrollTrigger.getAll().forEach((t) => t.kill());
          if (body.classList.contains("is-menu")) setMenu(false);
        },
        afterLeave: () => { current?.revert(); current = null; },
        beforeEnter: async ({ next, trigger }) => {
          unguard = guard(next.container);
          await syncHead(next.html);
          if (trigger !== "popstate" && !new URL(next.url.href).hash) toTop();
        },
        afterEnter: ({ next }) => {
          unguard?.();
          start(next.container);
          const hash = new URL(next.url.href).hash;
          const to = hash && next.container.querySelector(hash);
          if (to) lenis ? lenis.scrollTo(to, { offset: -100, duration: 1.4 }) : to.scrollIntoView();
        },
      }],
    });
  });
})();
