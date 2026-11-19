// Motion used by all pages — Lenis (1.5s exponential curve) wired to ScrollTrigger, on phones the logo hides upward on scroll down, AOS fade,
// + menu panel (.4s), + expand (.4s), 15px square cursor, fitting text to cells, aligning menu rows and footer margins.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dur = reduce ? 0.01 : 0.4;
  const root = document.documentElement;
  const css = (name) => getComputedStyle(document.body).getPropertyValue(name).trim();
  // Once the font arrives (1.5s at the latest), finish fitting and then show — the original loads the font straight from its own server and swaps within the .5s it takes to appear,
  // In the copy, the web font arrives late, so after everything is shown the large text swaps in a single frame
  const fontsReady = Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 1500))]);

  // The original cursor is a 15px square image (white on dark panels, black on light panels, blue over links) — baked on the spot from skin colors
  const square = (color) => `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15"><rect width="15" height="15" fill="${color}"/></svg>`)}") 0 0, auto`;
  const paintCursor = () => {
    root.style.setProperty("--site-cursor", square(css("--site-ink")));
    root.style.setProperty("--site-cursor-hover", square(css("--site-link-hover")));
  };

  // Original fitText(element, .25) — font size = Cell width ÷ (10 × ratio)
  const fit = () => {
    document.querySelectorAll("[data-fit]").forEach((el) => { el.style.fontSize = el.clientWidth / (10 * +el.dataset.fit) + "px"; });
    // Wordmark — text width set to n% of window width (data-fill="150") or parent width (data-fill="box"Matched to )
    document.querySelectorAll("[data-fill]").forEach((el) => {
      const want = el.dataset.fill === "box" ? el.parentElement.clientWidth : (innerWidth * +el.dataset.fill) / 100;
      el.style.fontSize = "100px";
      const w = el.scrollWidth || 1;
      el.style.fontSize = (100 * want) / w + "px";
    });
  };

  const navLines = () => {
    const lines = document.querySelector(".sa-menu__lines");
    if (lines) lines.style.height = innerHeight - lines.getBoundingClientRect().top - 32 + "px";
  };

  // Original: at 1280 and above, if (window width − footer column width)/2 is larger than the row panel margin 70, the space below the footer is raised by that difference
  const footerPad = () => {
    const box = document.querySelector(".sa-footer__in");
    if (!box) return;
    const side = (innerWidth - box.clientWidth) / 2;
    box.style.paddingBottom = innerWidth >= 1280 && side > 70 ? side - 70 + "px" : "";
  };

  addEventListener("DOMContentLoaded", () => {
    paintCursor();
    fit();
    footerPad();
    fontsReady.then(() => {
      fit();
      window.ScrollTrigger && ScrollTrigger.refresh();
      // CSS animations run only on the compositor, so on the first page and Work list screen recordings missed the in-between frames — the same .5s ease-in-out is applied with gsap every frame
      gsap.fromTo(document.body, { opacity: 0.001 }, { opacity: 1, duration: reduce ? 0 : 0.5, ease: "power1.inOut", onComplete: () => document.body.classList.add("is-in") });
    });

    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.normalizeScroll(true);
    const logo = document.querySelector(".sa-logo");
    const lenis = new Lenis({
      orientation: "vertical", gestureOrientation: "vertical", duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 1, touchMultiplier: 1, smoothWheel: !reduce, smoothTouch: false, infinite: false,
    });
    window.saLenis = lenis;
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    let prev = 0;
    lenis.on("scroll", (e) => {
      ScrollTrigger.update();
      if (innerWidth <= 1024 && logo) {
        logo.style.top = prev > e.scroll || scrollY < 52 ? "0" : "-52px";
        prev = e.scroll;
      }
    });
    setTimeout(() => window.AOS && AOS.init(), 300);

    // In-page # targets glide there via Lenis
    const hashOf = (a) => (a.host === location.host && a.pathname === location.pathname && a.hash ? a.hash : "");
    const glide = (hash, e) => {
      const t = hash && document.querySelector(hash);
      if (!t) return;
      e && e.preventDefault();
      lenis.scrollTo(t, { offset: -(parseFloat(getComputedStyle(t).scrollMarginTop) || 0) });
    };
    document.querySelectorAll("a[href]").forEach((a) => a.addEventListener("click", (e) => glide(hashOf(a), e)));

    // Blue square cursor over links — only those with the ”change-cursor” mark, like the original
    document.querySelectorAll("a.change-cursor, button.change-cursor").forEach((el) => {
      el.addEventListener("mouseover", () => el.classList.add("hover-cursor"));
      el.addEventListener("mouseout", () => el.classList.remove("hover-cursor"));
    });

    // ───── Plus menu panel ─────
    const btn = document.getElementById("saNavBtn"), menu = document.getElementById("saMenu"), page = document.querySelector(".sa-page");
    // While the menu is open, everything except the header (logo, ＋) and the menu panel is made inert — like the original, Tab cycles only inside the panel
    const lock = (on) => page && [...page.children].forEach((n) => { if (n === menu || n.matches("header")) return; on ? n.setAttribute("inert", "") : n.removeAttribute("inert"); });
    const focusables = () => [btn, ...[...menu.querySelectorAll("a[href], button")].filter((n) => n.offsetParent !== null)];
    if (btn && menu) {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const open = btn.classList.contains("nav-open");
        const tl = gsap.timeline({
          defaults: { duration: dur },
          onStart: () => {
            // The original locks with body overflow:hidden, but html is overflow-y:scroll so scrolling is not actually blocked and it only repaints the long page — we stop Lenis and keep it in the same place
            lenis.stop();
            if (!open) {
              menu.hidden = false;
              navLines();
              btn.setAttribute("aria-expanded", "true");
              lock(true);
              menu.querySelector("a[href]")?.focus({ preventScroll: true });
              document.body.classList.add("sa-menu-open");
            }
          },
          onComplete: () => {
            if (!open) return;
            lenis.start();
            menu.hidden = true;
            btn.setAttribute("aria-expanded", "false");
            lock(false);
            btn.focus({ preventScroll: true });
            document.body.classList.remove("sa-menu-open");
          },
        });
        tl.to(btn.querySelector("svg"), { rotation: open ? 0 : 45 });
        tl.to(menu, { opacity: open ? 0 : 1 }, "-=0.4");
        btn.classList.toggle("nav-open");
      });
      document.addEventListener("keydown", (e) => {
        if (!btn.classList.contains("nav-open")) return;
        if (e.key === "Escape") { e.preventDefault(); btn.click(); return; }
        if (e.key !== "Tab") return;
        const f = focusables(), first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      });
    }

    // ───── ＋ expands — the ＋ turns 45° and the answer panel opens to full height in .4s ─────
    document.querySelectorAll("[data-toggle]").forEach((t) => {
      t.addEventListener("click", (e) => {
        e.preventDefault();
        const target = document.querySelector(`[data-toggle-id="${t.dataset.toggle}"]`);
        if (!target) return;
        const open = t.classList.contains("toggle-open");
        const tl = gsap.timeline({ defaults: { duration: dur } });
        tl.to(t.querySelector("svg"), { rotation: open ? 0 : 45 });
        tl.to(target, { height: open ? 0 : target.scrollHeight + "px" }, "<");
        t.classList.toggle("toggle-open");
        t.setAttribute("aria-expanded", open ? "false" : "true");
      });
    });

    let w = innerWidth;
    addEventListener("resize", () => {
      navLines();
      footerPad();
      if (innerWidth !== w) { w = innerWidth; fit(); }
    });
  });
})();
