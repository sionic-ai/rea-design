// Motion shared by all pages — stencil wordmark, Lenis, header row that hides on scroll down, menu where letters shuffle as brackets light up,
// Phone menu, contact band text shuffle, next work card entrance, page transition (to Home a black veil, elsewhere the body exits upward then rises from below).
(() => {
  const html = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMaxMd = () => matchMedia("(max-width: 767px)").matches;
  gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin);

  // Stencil wordmark — six letters drawn with 16 pieces. The opening and logo flicker fade out and in separately per piece (path)
  const MARK = [
    "M40 0H115V32H40Z", "M0 32L32 0V82H0Z", "M40 66H83V98H40Z", "M83 82H115V132L83 164Z", "M0 132H75V164H0Z",
    "M175 0H300V32H175Z", "M221 40H253V164H221Z",
    "M365 0H397V128H365Z", "M448 0H480V164H448Z", "M365 136H440V164H389Z",
    "M545 0H577V164H545Z", "M585 0H622V32H585Z", "M585 132H622V164H585Z", "M630 0L660 34V130L630 164Z",
    "M730 0H762V96H730Z", "M730 104H762V164H730Z",
    "M885 40L925 0H937V32H929L917 44V164H885Z", "M1000 124L960 164H948V132H956L968 120V0H1000Z",
  ];
  const markSvg = `<svg viewBox="0 0 1000 164" aria-hidden="true" focusable="false">${MARK.map((d) => `<path d="${d}"/>`).join("")}</svg>`;
  document.querySelectorAll("[data-wordmark]").forEach((el) => { el.insertAdjacentHTML("beforeend", markSvg); });

  // Original ReactLenis defaults (lerp .1 · wheel multiplier 1) as is
  const lenis = reduce ? null : new Lenis({ lerp: 0.1, wheelMultiplier: 1, autoRaf: false });
  if (lenis) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  window.fgLenis = lenis;
  const rem = () => parseFloat(getComputedStyle(html).fontSize) || 16;

  // Scrolling down hides the header row upward, scrolling up brings it back (.4s power2.inOut, from beyond 80px)
  const header = document.querySelector(".fg-header");
  let hidden = false;
  const onScroll = (scroll, velocity) => {
    if (!header) return;
    if (velocity > 0 && !hidden && scroll > 80) {
      gsap.to(header, { yPercent: -100, duration: 0.4, ease: "power2.inOut", overwrite: true });
      hidden = true;
    } else if (velocity < 0 && hidden) {
      gsap.to(header, { yPercent: 0, duration: 0.4, ease: "power2.inOut", overwrite: true });
      hidden = false;
    }
  };
  if (lenis) lenis.on("scroll", (e) => onScroll(e.scroll, e.velocity));
  else {
    let last = scrollY;
    addEventListener("scroll", () => { onScroll(scrollY, scrollY - last); last = scrollY; }, { passive: true });
  }

  // Menu text: on entering, the letters are empty with the brackets lit, then re-written as they mix in (.8s power3.out, .1s late).
  // As in the original, no width is set, so the link narrows when the text is empty and returns within .25s as characters are added
  const LETTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  document.querySelectorAll("[data-nav-scramble]").forEach((link) => {
    const label = link.querySelector("[data-label-text]");
    const wrap = link.querySelector(".fg-bracket");
    if (!label || reduce) return;
    const text = label.textContent;
    link.addEventListener("mouseenter", () => {
      if (isMaxMd()) return;
      gsap.set(label, { whiteSpace: "nowrap" });
      label.textContent = "";
      wrap && wrap.classList.add("is-hovering");
      gsap.to(label, {
        duration: 0.8, delay: 0.1, ease: "power3.out", overwrite: true,
        scrambleText: { text, chars: LETTERS, speed: 1 },
        onComplete: () => { gsap.set(label, { clearProps: "all" }); wrap && wrap.classList.remove("is-hovering"); },
      });
    });
  });

  // Arrow links (Studio ↗ · Contact ↗ · home footer link): on desktop, entering holds the size, blends from ”F”, and rewrites itself over .5s
  document.querySelectorAll(".fg-arrow").forEach((link) => {
    const label = link.querySelector("span");
    if (!label || reduce) return;
    const text = label.textContent;
    link.addEventListener("mouseenter", () => {
      if (isMaxMd()) return;
      const r = label.getBoundingClientRect();
      gsap.set(label, { display: "inline-block", width: r.width, height: r.height });
      label.textContent = "F";
      gsap.to(label, {
        duration: 0.5, ease: "power2.inOut", overwrite: true,
        scrambleText: { text, chars: "abcdefghijklmnopqrstuvwxyz", speed: 1 },
        onComplete: () => gsap.set(label, { clearProps: "all" }),
      });
    });
  });

  // Phone menu: button text blends between Menu↔Close, items open from the left with letters blending in. Closing clips away to the right
  const btn = document.querySelector(".fg-menu-btn");
  const menu = document.querySelector(".fg-mobile-menu");
  if (btn && menu) {
    const btnLabel = btn.querySelector("span");
    const items = [...menu.querySelectorAll("[data-menu-label]")];
    items.forEach((el) => { el.dataset.text = el.textContent; });
    let open = false;
    const set = (next) => {
      open = next;
      btn.setAttribute("aria-expanded", String(open));
      menu.classList.toggle("is-open", open);
      menu.setAttribute("aria-hidden", String(!open));
      menu.querySelectorAll(".fg-count").forEach((c) => gsap.set(c, { opacity: open ? 1 : 0 }));
      if (reduce) {
        btnLabel.textContent = open ? "Close" : "Menu";
        items.forEach((el) => gsap.set(el, { clipPath: open ? "none" : "inset(0 100% 0 0)" }));
        return;
      }
      gsap.to(btnLabel, { duration: 0.5, ease: "power2.inOut", scrambleText: { text: open ? "Close" : "Menu", chars: LETTERS, speed: 1 } });
      items.forEach((el, i) => {
        gsap.killTweensOf(el);
        if (open) {
          gsap.set(el, { clipPath: "none" });
          el.textContent = "";
          gsap.to(el, { duration: 0.5, delay: 0.02 * i, ease: "power2.out", scrambleText: { text: el.dataset.text, chars: LETTERS, speed: 1 } });
        } else {
          gsap.to(el, {
            clipPath: "inset(0 0 0 100%)", duration: 0.2, delay: 0.02 * i, ease: "power2.in",
            onComplete: () => { gsap.set(el, { clipPath: "inset(0 100% 0 0)" }); el.textContent = el.dataset.text; },
          });
        }
      });
    };
    btn.addEventListener("click", () => set(!open));
    menu.addEventListener("click", (e) => { if (e.target.closest("a")) set(false); });
  }

  // Contact band: on desktop, when entering the band the large text is erased and then rewritten with a shuffle (1s power2.inOut)
  document.querySelectorAll("[data-touch]").forEach((band) => {
    const big = band.querySelector("[data-touch-text]");
    if (!big || reduce) return;
    const text = big.textContent;
    band.addEventListener("mouseenter", () => {
      if (isMaxMd()) return;
      big.textContent = "";
      gsap.to(big, { duration: 1, ease: "power2.inOut", overwrite: true, scrambleText: { text, chars: "abcdefghijklmnopqrstuvwxyz", speed: 1 } });
    });
  });

  // Next work card: when it reaches the bottom edge of the screen it floats up from 60px below at 1.01× (.9s power3.out)
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll("[data-next-wrap]").forEach((wrap) => {
      // When everything has floated up, the original adds is-active to the document’s first ”flip” cell (the first work row·tile, or this card if there is none) — on phones that cell is painted gray-brown
      const card = document.querySelector(".fg-row, .fg-tile") || wrap.querySelector(".fg-next__card");
      gsap.fromTo(wrap, { y: 60, opacity: 0, scale: 1.01 }, {
        y: 0, opacity: 1, scale: 1, duration: 0.9, ease: "power3.out",
        onComplete: () => { if (isMaxMd() && card) card.classList.add("is-active"); },
        onReverseComplete: () => { if (card) card.classList.remove("is-active"); },
        scrollTrigger: { trigger: wrap, start: "top bottom", toggleActions: "play none none reverse" },
      });
    });
  });

  // Photo panel parallax (first page footer photo · studio first scene): while the panel crosses the screen, the inner photo moves from the bottom end to the top end (scrub).
  // Each time it measures, the photo floats up in .3s, and the plate goes .9→1 and the photo 1.1→1 in scale over .5s
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll("[data-parallax]").forEach((box) => {
      const inner = box.querySelector("[data-parallax-inner]");
      if (!inner) return;
      gsap.fromTo(inner, { y: () => box.offsetHeight - inner.offsetHeight }, {
        y: 0, ease: "none",
        scrollTrigger: {
          trigger: box, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true,
          onRefresh: () => {
            gsap.to(inner, { opacity: 1, duration: 0.3 });
            gsap.fromTo(box, { scale: 0.9 }, { scale: 1, duration: 0.5 });
            gsap.from(inner, { scale: 1.1, duration: 0.5 });
          },
        },
      });
    });
  });
  mm.add("(prefers-reduced-motion: reduce)", () => {
    document.querySelectorAll("[data-parallax-inner]").forEach((el) => gsap.set(el, { opacity: 1 }));
  });

  // Back to top
  document.querySelectorAll('a[href="#top"]').forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    lenis ? lenis.scrollTo(0) : scrollTo(0, 0);
  }));

  // ── Page Turn ──
  // The original transitions inside the Next router. Since this is a static page, the leaving effect finishes, then it navigates, and the arriving page picks up the entering effect
  const overlay = document.querySelector(".fg-overlay");
  const main = document.querySelector("[data-transition-main]");
  const KEY = "fg-transition";
  const isHome = (url) => /(^|\/)index\.html$/.test(url.pathname) || url.pathname.endsWith("/");
  const go = (url) => {
    html.classList.add("is-leaving");
    lenis && lenis.stop();
    if (reduce) { location.href = url.href; return; }
    if (isHome(url)) {
      sessionStorage.setItem(KEY, "home");
      gsap.to(overlay, { autoAlpha: 1, duration: 0.4, ease: "power4.in", onComplete: () => { location.href = url.href; } });
    } else {
      sessionStorage.setItem(KEY, "default");
      gsap.to(main, {
        autoAlpha: 0, y: "-1.5rem", duration: 0.4, ease: "power2.inOut",
        onComplete: () => { html.classList.add("is-page-leaving"); location.href = url.href; },
      });
    }
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0 || a.target === "_blank") return;
    const url = new URL(a.getAttribute("href"), location.href);
    if (url.origin !== location.origin || !/\.html$/.test(url.pathname)) return;
    if (url.pathname === location.pathname) {
      if (url.hash) return;
      e.preventDefault();
      return;
    }
    e.preventDefault();
    go(url);
  });
  addEventListener("pageshow", (e) => {
    if (!e.persisted) return;
    html.classList.remove("is-leaving", "is-page-leaving");
    gsap.set([overlay, main], { clearProps: "all" });
    lenis && lenis.start();
  });

  // Header bar logo: each time it enters, pieces randomly blur (.3s) then sharpen again (.5s)
  const flickerLogo = () => {
    const paths = document.querySelectorAll(".fg-header__logo path");
    if (!paths.length || reduce) return;
    const stagger = { amount: 0.3, from: "random" };
    gsap.timeline()
      .to(paths, { opacity: 0, filter: "blur(10px)", stagger, ease: "power1.out", duration: 0.3 })
      .to(paths, { opacity: 1, filter: "blur(0px)", stagger, ease: "power1.in", duration: 0.5 });
  };

  const arrived = sessionStorage.getItem(KEY);
  sessionStorage.removeItem(KEY);
  window.fgArrived = arrived;
  // The arrival marks the header script attached (first image curtain, hidden body) are taken over as inline values and then removed
  if (arrived === "home" && overlay && !reduce) {
    gsap.set(overlay, { autoAlpha: 1 });
    html.classList.remove("is-arriving-home");
    gsap.to(overlay, { autoAlpha: 0, duration: 0.6, ease: "power4.out" });
  } else if (arrived === "default" && main && !reduce) {
    gsap.set(main, { autoAlpha: 0, y: "1rem" });
    html.classList.remove("is-arriving");
    gsap.to(main, { autoAlpha: 1, y: 0, duration: 0.8, ease: "expo.out", clearProps: "transform" });
    flickerLogo();
  }
  html.classList.remove("is-arriving-home", "is-arriving");

  window.fgShared = { lenis, rem, reduce, isMaxMd, LETTERS };
})();
