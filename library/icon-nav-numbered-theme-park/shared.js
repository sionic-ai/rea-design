// Motion shared by several pages: language list, menu drawer, phone header collapse, switching between hours panel and ticket panel, title rising.
// Original values: menu open .5s / close .4s Cubic.easeOut, panel switch .4s power2.out (back panel .1s later), float up 30/1440vw 1.3s cubic.out "top 90%".
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const small = matchMedia("(max-width: 960px)");
  const root = document.documentElement;
  const unit = () => innerWidth / (small.matches ? 375 : 1440);
  window.EZ = { reduced, small, unit };
  if (!reduced) root.classList.add("js-motion");

  // Buttons built as a and div like the original (menu, language, accordion, guidebook) — keyboard Enter and Space also count as a press
  document.addEventListener("keydown", (e) => {
    const el = e.target.closest?.('[role="button"]:not(button)');
    if (el && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); el.click(); }
  });

  // ── Language List ──
  const langBtn = document.querySelector(".ez-lang__btn");
  const langList = document.getElementById("ez-lang-list");
  const setLang = (open) => {
    langBtn.setAttribute("aria-expanded", String(open));
    langList.classList.toggle("is-open", open);
  };
  langBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    setLang(!langList.classList.contains("is-open"));
  });
  document.addEventListener("click", (e) => {
    if (langList?.classList.contains("is-open") && !e.target.closest(".ez-lang")) setLang(false);
  });

  // ── Menu Drawer ──
  const burger = document.querySelector(".ez-burger");
  const menu = document.getElementById("ez-menu");
  const setMenu = (open) => {
    burger.setAttribute("aria-expanded", String(open));
    root.classList.toggle("is-menu", open);
    header.classList.toggle("is-menu", open);
    header.querySelector(".ez-header__inner")?.classList.toggle("is-menu", open);
    document.body.classList.toggle("is-modal", open);
    gsap.killTweensOf(menu);
    if (open) {
      menu.hidden = false;
      menu.querySelector(".ez-menu__inner").scrollTop = 0;
      gsap.to(menu, { opacity: 1, duration: reduced ? 0 : 0.5, ease: "cubic.out" });
    } else {
      gsap.to(menu, { opacity: 0, duration: reduced ? 0 : 0.4, ease: "cubic.out", onComplete: () => (menu.hidden = true) });
    }
  };
  burger?.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
  menu?.addEventListener("click", (e) => e.target.closest("a") && setMenu(false));
  addEventListener("keydown", (e) => e.key === "Escape" && burger?.getAttribute("aria-expanded") === "true" && setMenu(false));

  // ── Phone: on scroll the logo row drops out and only the icon row remains ──
  const header = document.querySelector(".ez-header");
  const onScroll = () => header.classList.toggle("is-scrolled", scrollY > 10);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ── Opening-hours panel ↔ floating ticket panel ──
  const float = document.querySelector(".ez-float");
  const kvnav = document.querySelector(".ez-kvnav");
  const off = (el) => el.offsetHeight + 30;
  let floatOn = false;
  const floatIn = () => {
    if (floatOn) return;
    floatOn = true;
    gsap.killTweensOf([float, kvnav]);
    if (small.matches || !kvnav) {
      gsap.set(float, { y: off(float), opacity: small.matches ? 0 : 1 });
      gsap.to(float, { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" });
      return;
    }
    gsap.to(kvnav, {
      y: off(kvnav), duration: 0.4, ease: "power2.out",
      onComplete: () => {
        gsap.set(float, { y: off(float), opacity: 1 });
        gsap.to(float, { y: 0, duration: 0.4, delay: 0.1, ease: "power2.out" });
      },
    });
  };
  const floatOut = () => {
    if (!floatOn) return;
    floatOn = false;
    gsap.killTweensOf([float, kvnav]);
    gsap.to(float, {
      y: off(float), duration: 0.4, ease: "power2.out",
      onComplete: () => {
        if (!kvnav || small.matches) return;
        gsap.set(kvnav, { y: off(kvnav) });
        gsap.to(kvnav, { y: 0, duration: 0.4, delay: 0.05, ease: "power2.out" });
      },
    });
  };
  if (float) {
    // The original switches over when the block after the Hero reaches the top of the screen
    const after = document.querySelector("[data-float-after]") || document.querySelector("main > section:nth-of-type(2)") || document.body;
    ScrollTrigger.create({ trigger: after, start: "top top", onEnter: floatIn, onLeaveBack: floatOut });
    small.addEventListener("change", () => {
      floatOn = false;
      gsap.set([float, kvnav].filter(Boolean), { clearProps: "transform,opacity" });
      ScrollTrigger.refresh();
    });
  }

  // ── Headline rise (.gs-anime from below, .gs-anime-r from the right) ──
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const rise = (sel, axis) =>
      gsap.utils.toArray(sel).forEach((el) => {
        gsap.fromTo(el, { autoAlpha: 0, [axis]: () => 30 * unit() }, {
          autoAlpha: 1, [axis]: 0, duration: 1.3, ease: "cubic.out",
          scrollTrigger: { trigger: el, start: "top 90%", once: true, invalidateOnRefresh: true },
        });
      });
    rise(".gs-anime", "y");
    rise(".gs-anime-r", "x");
  });
  mm.add("(prefers-reduced-motion: reduce)", () => {
    gsap.set(".gs-anime, .gs-anime-r", { autoAlpha: 1, clearProps: "transform" });
  });
})();
