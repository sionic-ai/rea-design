// Motion shared by all pages — values exactly as in the original (Nuxt).
// Loader (number strip + three lines, timeline at 3.5x speed) · Lenis · nav hide · menu drawer · title letters flying in (effect-12) · label line raise (slide-y)
// · corner ticks · photo cover · parallax · number marquee · pinned horizontal strip.
(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
  const mm = gsap.matchMedia();
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const desktop = () => matchMedia("(min-width: 800px)").matches;
  const site = (window.PR = { ready: [], lenis: null });
  const whenReady = (fn) => (site.isReady ? fn() : site.ready.push(fn));

  // Lenis 1.3.23 — original default (lerp .1)
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = site.lenis = new Lenis({ lerp: 0.1, autoRaf: false });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Loader — value p goes to 45~55 in 1.8s (power2.inOut) after .8s, then to 100 in 1.2s (power3.inOut). Timeline 3.5×.
  // On each value change, ones · tens · hundreds strips roll at .6/.8/1 (÷3.5)s power3.out, and three lines stretch to match value ranges (0–50 · 20–75 · 45–100).
  const loader = document.querySelector(".pr-loader");
  const finish = () => {
    site.isReady = true;
    site.ready.splice(0).forEach((fn) => fn());
    ScrollTrigger.refresh();
  };
  // The original runs the loader only on first entry, and when moving around inside (in-app navigation) the new page appears right away
  const KEY = "pr-entered";
  const inside = sessionStorage.getItem(KEY) === "1" && document.referrer && new URL(document.referrer).origin === location.origin
    && performance.getEntriesByType("navigation")[0]?.type === "navigate";
  sessionStorage.setItem(KEY, "1");
  if (loader && inside) loader.style.transition = "none";
  if (loader && !reduce && !inside) {
    lenis?.stop();
    const SPEED = 3.5, g = 1 / SPEED;
    const units = loader.querySelector('[data-digits="units"]');
    const tens = loader.querySelector('[data-digits="tens"]');
    const hundreds = loader.querySelector('[data-digits="hundreds"]');
    const [l1, l2, l3] = loader.querySelectorAll(".pr-loader__line");
    const fill = (el, loops) => {
      el.innerHTML = Array.from({ length: loops * 10 }, (_, i) => `<span>${i % 10}</span>`).join("");
    };
    fill(units, 12);
    fill(tens, 3);
    const clamp = (v, a, b) => Math.min(1, Math.max(0, (v - a) / (b - a)));
    gsap.set(l1, { scaleY: 0, transformOrigin: "top" });
    gsap.set(l2, { scaleX: 0, transformOrigin: "left" });
    gsap.set(l3, { scaleY: 0, transformOrigin: "top" });
    const state = { p: 0 };
    const draw = () => {
      const z = Math.min(100, state.p);
      gsap.to(units, { yPercent: -(z / 120) * 100, duration: 0.6 * g, ease: "power3.out", overwrite: "auto" });
      gsap.to(tens, { yPercent: -(Math.floor(z / 10) / 30) * 100, duration: 0.8 * g, ease: "power3.out", overwrite: "auto" });
      gsap.to(hundreds, { yPercent: -(Math.floor(z / 100) / 2) * 100, duration: 1 * g, ease: "power3.out", overwrite: "auto" });
      gsap.to(l1, { scaleY: clamp(z, 0, 50), duration: 0.5 * g, ease: "power2.out", overwrite: "auto" });
      gsap.to(l2, { scaleX: clamp(z, 20, 75), duration: 0.5 * g, ease: "power2.out", overwrite: "auto" });
      gsap.to(l3, { scaleY: clamp(z, 45, 100), duration: 0.5 * g, ease: "power2.out", overwrite: "auto" });
    };
    const counter = loader.querySelector(".pr-loader__counter");
    const lines = loader.querySelector(".pr-loader__lines");
    counter.classList.add("is-visible");
    lines.classList.add("is-visible");
    gsap.timeline({
      timeScale: SPEED,
      onUpdate: draw,
      onComplete: () => {
        gsap.delayedCall(0.35, () => {
          counter.classList.add("is-hidden");
          lines.classList.add("is-hidden");
        });
        gsap.delayedCall(0.85, () => {
          loader.classList.add("is-done");
          lenis?.start();
          finish();
        });
      },
    })
      .to(state, { p: gsap.utils.random(45, 55, 1), duration: 1.8, ease: "power2.inOut", delay: 0.8 })
      .to(state, { p: 100, duration: 1.2, ease: "power3.inOut" })
      .timeScale(SPEED);
  } else {
    loader?.classList.add("is-done");
    requestAnimationFrame(finish);
  }

  // Nav — hides when scrolling down past 100px and shows when scrolling up. The top of pinned cells changes along with it
  const nav = document.querySelector(".pr-nav");
  if (nav) {
    let last = scrollY;
    const onScroll = () => {
      const y = scrollY, dir = Math.sign(y - last);
      last = y;
      let show = !nav.classList.contains("is-hidden");
      if (y < 100) show = true;
      else if (dir === 1) show = false;
      else if (dir === -1) show = true;
      if (document.documentElement.classList.contains("pr-menu-open")) show = true;
      nav.classList.toggle("is-hidden", !show);
      document.documentElement.style.setProperty("--site-header-offset", show ? "var(--site-header)" : "0px");
    };
    if (lenis) lenis.on("scroll", onScroll);
    else addEventListener("scroll", onScroll, { passive: true });
  }

  // Menu drawer (phone) — clip-path top→bottom .75s expo.inOut, rows yPercent 50→0 .55s staggered .07 power3.out (-.3s overlap)
  const menu = document.querySelector(".pr-menu");
  const menuBtn = document.querySelector(".pr-nav__menu");
  const shade = document.querySelector(".pr-menu-shade");
  if (menu && menuBtn) {
    const parts = () => [menu.querySelector(".pr-menu__head"), ...menu.querySelectorAll(".pr-menu__item"), menu.querySelector(".pr-menu__lang")].filter(Boolean);
    gsap.set(menu, { clipPath: "inset(0% 0% 100% 0%)", pointerEvents: "none" });
    gsap.set(parts(), { yPercent: 50, opacity: 0 });
    let open = false, tl = null;
    const setOpen = (v) => {
      open = v;
      document.documentElement.classList.toggle("pr-menu-open", v);
      menuBtn.querySelector(".pr-nav__inner").classList.toggle("is-open", v);
      menuBtn.setAttribute("aria-expanded", String(v));
      shade?.classList.toggle("is-open", v);
      v ? lenis?.stop() : lenis?.start();
      tl?.kill();
      tl = gsap.timeline();
      if (v) {
        gsap.set(menu, { pointerEvents: "auto" });
        tl.to(menu, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.75, ease: "expo.inOut" })
          .to(parts(), { yPercent: 0, opacity: 1, duration: 0.55, stagger: 0.07, ease: "power3.out" }, "-=0.3");
      } else {
        tl.to(parts(), { yPercent: -50, opacity: 0, duration: 0.25, stagger: 0.04, ease: "power2.in" })
          .to(menu, {
            clipPath: "inset(0% 0% 100% 0%)", duration: 0.6, ease: "expo.inOut",
            onComplete: () => { gsap.set(menu, { pointerEvents: "none" }); gsap.set(parts(), { yPercent: 50, opacity: 0 }); },
          }, "-=0.1");
      }
    };
    menuBtn.addEventListener("click", () => setOpen(!open));
    shade?.addEventListener("click", () => setOpen(false));
    addEventListener("keydown", (e) => e.key === "Escape" && open && setOpen(false));
  }

  // Corner ticks — 2.5x when the mouse enters the cell (parent)
  document.querySelectorAll(".pr-bl").forEach((bl) => {
    if (!bl.children.length) bl.innerHTML = "<i></i><i></i><i></i><i></i>";
    const host = bl.parentElement;
    host.addEventListener("pointerenter", () => bl.classList.add("is-hovered"));
    host.addEventListener("pointerleave", () => bl.classList.remove("is-hovered"));
  });

  // Photo cover — when visible, it folds relative to the bottom. Length = Height/1000×1.25 clamped to .65~1.2s
  const covers = document.querySelectorAll(".pr-cover");
  covers.forEach((c) => {
    const h = c.getBoundingClientRect().height || c.parentElement.offsetHeight;
    c.style.setProperty("--reveal-duration", `${Math.min(1.2, Math.max(0.65, (h / 1000) * 1.25))}s`);
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      whenReady(() => e.target.classList.add("is-revealed"));
      io.unobserve(e.target);
    });
  });
  covers.forEach((c) => io.observe(c));

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Parallax — screen width × speed × .1, zoom goes 1 → scale
    document.querySelectorAll("[data-parallax]").forEach((box) => {
      const speed = +(box.dataset.parallax ?? 1), scale = +(box.dataset.scale ?? 1);
      const target = box.querySelector(".pr-par__target");
      box.style.setProperty("--parallax-offset", `${speed * 10}vw`);
      const t = () => innerWidth * speed * 0.1;
      gsap.fromTo(target, { y: () => -t(), scale: 1 }, {
        y: () => t(), scale, ease: "none",
        scrollTrigger: { trigger: box, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true },
      });
    });

    // Number marquee — one line per 15 seconds, stops over 1 second on hover (original pause-on-hover)
    document.querySelectorAll(".pr-marquee").forEach((mq) => {
      const wrap = mq.querySelector(".pr-marquee__wrap");
      const first = wrap.querySelector(".pr-marquee__inner");
      const rev = mq.dataset.reversed === "true", dur = +(mq.dataset.duration ?? 15);
      const anim = { tw: null };
      const build = () => {
        anim.tw?.kill();
        if (!desktop() && mq.dataset.mobile !== "on") { gsap.set(wrap, { x: 0 }); return; }
        const a = first.getBoundingClientRect().width;
        anim.tw = gsap.fromTo(wrap, { x: rev ? -a : 0 }, {
          x: rev ? 0 : -a, ease: "none", duration: dur, repeat: -1,
          modifiers: { x: gsap.utils.unitize((v) => parseFloat(v) % a) },
          scrollTrigger: { trigger: mq, start: "top-=100% bottom", end: "bottom top", toggleActions: "play pause resume pause" },
        });
      };
      build();
      addEventListener("resize", gsap.utils.debounce ? gsap.utils.debounce(build, 200) : build);
      if (mq.dataset.pause === "hover") {
        mq.addEventListener("pointerenter", () => anim.tw && gsap.to(anim.tw, { timeScale: 0, duration: 1 }));
        mq.addEventListener("pointerleave", () => anim.tw && gsap.to(anim.tw, { timeScale: 1, duration: 1 }));
      }
    });

    // Fixed horizontal band — top and bottom covers scaleY→0 (2), band y −c/2→c (2, after .2), flows sideways (6), exits upward (2, at 7.8). scrub .25
    document.querySelectorAll(".pr-strip").forEach((sec) => {
      if (!desktop()) return;
      const y = sec.querySelector(".pr-strip__y"), track = sec.querySelector(".pr-strip__track");
      const covers2 = sec.querySelectorAll(".pr-strip__cover");
      const e = { tx: 0, c: 0, total: 0 };
      const measure = () => {
        e.tx = -(track.scrollWidth - sec.clientWidth);
        e.c = (innerHeight - y.offsetHeight) / 2;
        e.total = (e.c + Math.abs(e.tx) + e.c) * 2;
      };
      measure();
      if (e.tx >= 0) return;
      const t = 2, x = 6, b = 2;
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: sec, start: "top-=250px center", end: () => `+=${e.total + 250}px`, scrub: 0.25, invalidateOnRefresh: true,
          onRefreshInit: () => { measure(); sec.style.height = `${e.total}px`; },
        },
      });
      tl.to(covers2, { scaleY: 0, duration: t }, 0)
        .fromTo(y, { y: () => -e.c / 2 }, { y: () => e.c, duration: t }, t * 0.1)
        .to(track, { x: () => e.tx, duration: x }, t)
        .to(y, { y: () => e.c * 2, duration: b }, t + x - b * 0.1);
      return () => { sec.style.height = ""; };
    });
  });

  // Title letters — fly in from the left at xPercent −250 · 45° · 6× width over .3s power2.out, letter gap .015 (not split on phones, as in the original)
  // Label — per line yPercent 110→0 1.5s expo, stagger .12
  mm.add("(min-width: 800px) and (prefers-reduced-motion: no-preference)", () => {
    // Does not wait for fonts — autoSplit re-splits when the font loads and the lines change, and carries the progress over
    const splits = [];
    document.querySelectorAll("[data-split='fly']").forEach((el) => {
      el.classList.add("pr-split");
      const st = SplitText.create(el, {
        type: "chars,words", mask: "chars", charsClass: "char", wordsClass: "word", autoSplit: true, aria: "auto",
        onSplit: (self) => {
          gsap.set(self.chars, { xPercent: -250, rotationZ: 45, scaleX: 6, transformOrigin: "100% 50%" });
          return gsap.to(self.chars, {
            xPercent: 0, rotationZ: 0, scaleX: 1, duration: 0.3, ease: "power2.out", stagger: 0.015,
            scrollTrigger: { trigger: el, start: el.dataset.start || "top bottom-=10%", toggleActions: "play none none none" },
          });
        },
      });
      splits.push(st);
    });
    document.querySelectorAll("[data-split='lines']").forEach((el) => {
      el.classList.add("pr-split");
      const st = SplitText.create(el, {
        type: "lines", mask: "lines", linesClass: "line", autoSplit: true, aria: "auto",
        onSplit: (self) => gsap.fromTo(self.lines, { yPercent: 110 }, {
          yPercent: 0, duration: 1.5, ease: "expo", stagger: 0.12,
          scrollTrigger: { trigger: el, start: "top bottom-=10%", toggleActions: "play none none none" },
        }),
      });
      splits.push(st);
    });
    return () => splits.forEach((s) => s.revert());
  });

  // Same-page # links scroll smoothly with Lenis
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      lenis ? lenis.scrollTo(t, { offset: 0 }) : t.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    });
  });
})();
