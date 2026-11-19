// Common to all pages — white veil loader · menu panel (scroll lock) · menu link blur · language box · is-on once past the 70% line of the screen (80% on phones) · # links move with a .48s swing.
// The original attaches classes with jQuery and a css transition does the motion — attaches the same classes at the same moment.
(() => {
  const BREAK = 767;
  const html = document.documentElement, body = document.body;
  const isNarrow = () => innerWidth <= BREAK;
  const loading = document.getElementById("ge-loading");

  // If loading takes over 8s, force it to clear
  const offLoading = () => { loading?.classList.add("is-off"); body.classList.remove("now-loading"); };
  const force = setTimeout(offLoading, 8000);

  // Menu — pressing the button·outside the panel·side photo toggles it, and while open the body is fixed at its current position
  const block = document.getElementById("ge-header-block");
  const btn = document.getElementById("ge-menu-btn");
  const nav = document.getElementById("ge-nav");
  let st = 0;
  const toggleMenu = () => {
    block?.classList.toggle("is-open");
    btn?.classList.toggle("is-open");
    nav?.classList.toggle("is-active");
    if (body.classList.contains("oh-open")) {
      body.classList.remove("oh-open");
      body.style.top = "0";
      scrollTo(0, st);
    } else {
      st = scrollY;
      body.classList.add("oh-open");
      body.style.top = `${-st}px`;
    }
  };
  btn?.addEventListener("click", toggleMenu);
  document.getElementById("ge-nav-side")?.addEventListener("click", toggleMenu);

  // Menu and footer links: hover one and the others fade (PC)
  [[".ge-nav__link", "is-dim"], [".ge-footer__link", "is-dim"]].forEach(([sel, cls]) => {
    const links = [...document.querySelectorAll(sel)];
    links.forEach((a) => {
      a.addEventListener("mouseenter", () => { if (isNarrow()) return; links.forEach((x) => x.classList.toggle(cls, x !== a)); });
      a.addEventListener("mouseleave", () => links.forEach((x) => x.classList.remove(cls)));
    });
  });

  // Language box — desktop on hover, phone on tap
  const lang = document.getElementById("ge-lang"), box = document.getElementById("ge-lang-box");
  if (lang && box) {
    lang.addEventListener("mouseenter", () => { if (!isNarrow()) box.classList.add("is-active"); });
    lang.addEventListener("mouseleave", () => { if (!isNarrow()) box.classList.remove("is-active"); });
    lang.addEventListener("click", (e) => { if (isNarrow()) { e.stopPropagation(); box.classList.toggle("is-active"); } });
    addEventListener("click", () => { if (isNarrow()) box.classList.remove("is-active"); });
  }

  // Scroll reveal — fires once when an element’s top crosses above the 70% line of the screen (80% on phone)
  const ons = [...document.querySelectorAll("[data-ge-on]")];
  const check = () => {
    const line = innerHeight * (isNarrow() ? 0.8 : 0.7);
    for (const el of ons) if (!el.classList.contains("is-on") && el.getBoundingClientRect().top < line) el.classList.add("is-on");
  };
  addEventListener("scroll", check, { passive: true });

  addEventListener("load", () => {
    clearTimeout(force);
    html.style.setProperty("--vh", `${innerHeight * 0.01}px`);
    // Hero text — is-on 1s after load (then css turns it on 1.5s later over 1.5s)
    document.querySelectorAll("[data-ge-load]").forEach((el) => setTimeout(() => el.classList.add("is-on"), 1000));
    offLoading();
    check();
    if (window.gsap && window.ScrollToPlugin) {
      gsap.registerPlugin(ScrollToPlugin);
      const head = document.getElementById("ge-header");
      document.querySelectorAll('a[href^="#"]:not([data-nolink])').forEach((a) => {
        a.addEventListener("click", (e) => {
          const id = a.getAttribute("href");
          if (id.length < 2) return;
          const to = document.querySelector(id);
          e.preventDefault();
          if (!to) return;
          gsap.to(window, { duration: 0.48, ease: "sine.inOut", scrollTo: { y: to.getBoundingClientRect().top + scrollY - (head?.offsetHeight || 0), autoKill: false } });
        });
      });
    }
  });
})();
