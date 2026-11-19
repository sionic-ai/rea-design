// Common to all pages — Lenis 1.3.11 default smooth scroll same as the original, header hide, light header, rise when visible, band spread, photo 1→1.1 scale,
// Back to top, cursor circle, phone menu and submenu, bottom-right notice close.
(() => {
  const mm = gsap.matchMedia();
  let lenis = null;
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    lenis = new Lenis();
    window.mbLenis = lenis;
    const raf = (t) => { lenis?.raf(t); if (lenis) requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    return () => { lenis.destroy(); lenis = null; window.mbLenis = null; };
  });

  const header = document.querySelector(".mb-hd");
  const pagetop = document.querySelector(".mb-pagetop");
  const dark = [...document.querySelectorAll(".js-dbg")];

  // Header: hides when it is lower than 1/4 of its height and scrolled down over 5px at once, shows when scrolled up over 5px or at the top
  if (header) {
    let last = 0, ticking = false;
    const d = header.clientHeight / 4;
    const step = () => {
      const y = scrollY, diff = y - last;
      if (y > d && diff > 5) header.classList.add("is-hide");
      if (y < d || diff < -5) header.classList.remove("is-hide");
      last = y;
      ticking = false;
    };
    addEventListener("scroll", () => { if (!ticking) { requestAnimationFrame(step); ticking = true; } }, { passive: true });
  }

  // Every 0.1s: things past the 80% line of the screen float up, photos grow as they pass, and over dark sections the header · back-to-top turn white
  const check = () => {
    const y = scrollY, h = innerHeight, line = y + 0.8 * h, low = y + 0.9 * h;
    document.querySelectorAll(".js-inview:not(.is-inview)").forEach((el) => line > el.getBoundingClientRect().top + y && el.classList.add("is-inview"));
    document.querySelectorAll(".js-show:not(.is-show)").forEach((el) => line > el.getBoundingClientRect().top + y && el.classList.add("is-show"));
    document.querySelectorAll(".js-img > :first-child").forEach((el) => {
      const r = el.getBoundingClientRect(), top = r.top + y, from = top - h, to = top + r.height;
      const p = Math.max(0, Math.min(1, (y - from) / (to - from)));
      el.style.transform = `scale(${1 + 0.1 * p})`;
    });
    let onDark = false, lowDark = false;
    dark.forEach((el) => {
      const s = el.offsetTop, e = s + el.offsetHeight;
      if (s <= y && e > y) onDark = true;
      if (s <= low) lowDark = true;
      if (e <= low) lowDark = false;
    });
    header?.classList.toggle("is-light", onDark);
    header?.classList.toggle("is-light-s", onDark);
    pagetop?.classList.toggle("is-light", lowDark);
    pagetop?.classList.toggle("is-show", y > 100);
  };
  let lastCheck = 0;
  addEventListener("scroll", () => {
    const now = Date.now();
    if (now - lastCheck > 100) { lastCheck = now; check(); }
  }, { passive: true });
  check();
  addEventListener("load", check);

  // Phone menu
  const nav = document.querySelector(".mb-nav");
  const open = () => { document.body.classList.add("is-fixed"); nav && (nav.inert = false); };
  const close = () => { document.body.classList.remove("is-fixed"); nav && (nav.inert = true); };
  document.querySelector(".mb-hd__btn")?.addEventListener("click", open);
  document.querySelector(".mb-nav__close")?.addEventListener("click", close);
  nav?.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));

  // Submenu — the header drops with a .8s bounce (closes when lowered more than 20px), and footer and phone menus unfold in .4s
  document.querySelectorAll(".mb-hd .mb-sub").forEach((sub) => sub.addEventListener("click", () => sub.classList.toggle("is-active")));
  addEventListener("scroll", () => scrollY >= 20 && document.querySelectorAll(".mb-hd .mb-sub.is-active").forEach((s) => s.classList.remove("is-active")), { passive: true });
  document.querySelectorAll(".mb-ft .mb-sub, .mb-nav .mb-sub").forEach((sub) => {
    const box = sub.querySelector(".mb-sub__box");
    sub.querySelector(".mb-sub__ttl").addEventListener("click", () => {
      const on = sub.classList.toggle("is-active");
      box.style.display = "block";
      const hgt = box.scrollHeight;
      const a = box.animate([{ height: on ? "0px" : hgt + "px", overflow: "hidden" }, { height: on ? hgt + "px" : "0px", overflow: "hidden" }], { duration: 400, easing: "ease" });
      a.onfinish = () => { box.style.display = on ? "block" : "none"; lenis?.resize(); };
    });
  });

  // Cursor circle: appears on first move, follows the cursor position 0.3 seconds late, and grows into a ”View” circle only over links
  const stalker = document.querySelector(".mb-stalker");
  if (stalker) {
    addEventListener("mousemove", (e) => {
      stalker.style.opacity = 1;
      stalker.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    });
    document.querySelectorAll("a, .js-link, .mb-sub").forEach((a) => {
      a.addEventListener("mouseenter", () => stalker.classList.add("is-hover"));
      a.addEventListener("mouseleave", () => stalker.classList.remove("is-hover"));
    });
  }

  document.querySelector(".mb-banner__close")?.addEventListener("click", () => document.querySelector(".mb-banner").classList.add("is-hide"));
  pagetop?.querySelector("a").addEventListener("click", (e) => {
    e.preventDefault();
    if (lenis) lenis.scrollTo(0); else scrollTo(0, 0);
  });
})();
