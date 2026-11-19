// Cross-page parts — header blur panel (once scrolled down 1px), opening and closing the phone menu panel, bottom fixed footer reveal, section transition
(() => {
  const root = document.documentElement;
  const header = document.querySelector(".nk-header");
  const footer = document.querySelector(".nk-footer");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const compact = () => header?.classList.toggle("is-compact", scrollY >= 1);
  addEventListener("scroll", compact, { passive: true });
  compact();

  // The footer is pinned to the bottom of the screen and shows once the bottom margin below the body (footer height) enters the viewport
  const sizeFooter = () => { if (footer) root.style.setProperty("--nk-footer-h", `${footer.offsetHeight}px`); };
  const showFooter = () => {
    if (!footer) return;
    const bottom = scrollY + innerHeight + footer.offsetHeight >= root.scrollHeight;
    footer.classList.toggle("is-bottom", bottom);
    document.querySelector(".nk-bgtext")?.classList.toggle("is-hidden", bottom);
  };
  new ResizeObserver(() => { sizeFooter(); showFooter(); }).observe(footer || document.body);
  addEventListener("scroll", showFooter, { passive: true });
  addEventListener("resize", showFooter);
  sizeFooter(); showFooter();

  // Phone menu — navy panel turns on in .2s, items rise from 20px below at .04s stagger (power3.out), the contact button comes .2s later from 10px
  const toggle = document.querySelector(".nk-toggle");
  const nav = document.querySelector(".nk-nav");
  const label = toggle?.querySelector(".nk-toggle__txt");
  const items = () => {
    const main = [...nav.querySelectorAll(".nk-nav__main > li, .nk-nav__sub > li:not(.nk-nav__contact)")];
    return { main, contact: [...nav.querySelectorAll(".nk-nav__contact")], info: [...nav.querySelectorAll(".nk-nav__info > li")] };
  };
  const setMenu = (open) => {
    root.classList.toggle("is-menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    label.textContent = open ? "Close" : "Menu";
    if (!matchMedia("(max-width: 1024px)").matches || reduce) return;
    const { main, contact, info } = items();
    const all = [...main, ...contact, ...info];
    gsap.killTweensOf(all);
    if (open) {
      gsap.set(main, { opacity: 0, y: 20 }); gsap.set(contact, { opacity: 0, y: 10 }); gsap.set(info, { opacity: 0, y: 20 });
      gsap.to(main, { opacity: 1, y: 0, ease: "power3.out", stagger: 0.04, overwrite: "auto" });
      gsap.to(info, { opacity: 1, y: 0, ease: "power3.out", stagger: 0.04, overwrite: "auto" });
      gsap.to(contact, { opacity: 1, y: 0, duration: 0.5, delay: 0.2, ease: "power3.out", overwrite: "auto" });
    } else {
      gsap.to(all, { opacity: 0, y: 12, duration: 0.2, stagger: 0.02, overwrite: "auto", onComplete: () => gsap.set(all, { clearProps: "all" }) });
    }
  };
  toggle?.addEventListener("click", () => setMenu(!root.classList.contains("is-menu-open")));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && root.classList.contains("is-menu-open")) setMenu(false); });
  matchMedia("(max-width: 1024px)").addEventListener("change", (m) => { if (!m.matches && root.classList.contains("is-menu-open")) setMenu(false); });

  // Section transition — for sections in the same folder, walks and hands off in .2s right on press. The arriving section’s entrance is turned on by a short script in the header that reads the marker
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
    const href = a.getAttribute("href");
    if (!/^[\w-]+\.html(#.*)?$/.test(href) || reduce) return;
    e.preventDefault();
    root.classList.add("is-leaving");
    try { sessionStorage.setItem("nk-nav", "1"); } catch {}
    setTimeout(() => { location.href = href; }, 200);
  });
  addEventListener("pageshow", (e) => { if (e.persisted) root.classList.remove("is-leaving"); });
  document.body.addEventListener("animationend", (e) => { if (e.target === document.body) root.classList.remove("is-entering"); });

  // Sub-page header strip — appears over 1s (ease none) at .8s after the two photo rows open (original LowerCaption: delay .5 + .3).
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    const strips = document.querySelectorAll(".nk-caption__strip");
    if (strips.length) gsap.fromTo(strips, { opacity: 0 }, { opacity: 1, duration: 1, ease: "none", delay: 0.8 });
  });

  // Color panels and list cells enter from 40px to the right in .6s (once at the 75% point of the screen)
  gsap.registerPlugin(ScrollTrigger);
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll("[data-nk-in]").forEach((el) => {
      const targets = el.matches("[data-nk-in=children]") ? [...el.children] : [el];
      gsap.set(targets, { opacity: 0, x: 40 });
      ScrollTrigger.create({ trigger: el, start: "top 75%", once: true, onEnter: () => gsap.to(targets, { opacity: 1, x: 0, duration: 0.6, ease: "power2.out", stagger: 0.08, delay: +(el.dataset.nkDelay || 0), overwrite: "auto" }) });
    });
  });
})();
