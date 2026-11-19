// Draws the header, menu and footer, and like the original #page uses the inner panel ([data-scroller]) as the scroll panel, applying per-section background color, line splitting, block rise and parallax.
// Values are the original inline script as is (after window load) — background 1.5s, lines 1.2s·0.2s sequence power2.out, block 24px 1.2s delayed 0.3s.
(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const XL = (window.XL = { reduced });
  document.documentElement.classList.add("js");
  const scroller = (XL.scroller = document.querySelector("[data-scroller]"));
  ScrollTrigger.defaults({ scroller });
  const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  const MARK = '<svg viewBox="0 0 77 77" aria-hidden="true"><g fill="currentColor"><path d="M10 10h11l17.5 21.5L56 10h11L44 38.5 67 67H56L38.5 45.5 21 67H10l23-28.5z"/><path d="M10 10h6l22.5 27.7L61 10h6L41.5 41.5 67 67h-6L38.5 39.3 16 67h-6l25.5-25.5z" opacity=".55"/></g></svg>';
  const head = document.querySelector("[data-slot=header]");
  if (head) {
    head.outerHTML = `
<header class="xl-head" data-slot="header">
  <a class="xl-logo" href="index.html" aria-label="To the first page">${MARK}<b>Organization name<br>Second row</b></a>
  <button class="xl-burger" type="button" aria-expanded="false" aria-controls="xl-menu" aria-label="Open Menu" data-burger><span class="xl-burger__icon"><i></i><i></i><i></i></span></button>
  <nav class="xl-menu" id="xl-menu" data-menu aria-label="Main menu">
    <div class="xl-menu__list">
      <a class="xl-nav" href="#xl-intro">Menu 1</a>
      <a class="xl-nav" href="#xl-collection">Menu 2</a>
      <button class="xl-nav is-drop" type="button" aria-expanded="false" data-sub-toggle>Menu 3<span class="xl-nav__pm"></span></button>
      <div class="xl-sub" data-sub><a href="#">Sub Menu 1</a><a href="#">Sub Menu 2</a></div>
      <button class="xl-nav is-drop" type="button" aria-expanded="false" data-sub-toggle>Menu 4<span class="xl-nav__pm"></span></button>
      <div class="xl-sub" data-sub><a href="#">Sub Menu 3</a><a href="#">Sub Menu 4</a></div>
      <a class="xl-nav" href="#">Menu 5</a>
      <a class="xl-nav" href="#">Menu 6</a>
    </div>
  </nav>
</header>
<button class="xl-user" type="button" aria-label="Log in"><svg viewBox="0 0 14 14" fill="currentColor" aria-hidden="true"><path d="M0 0h14v14H0zM1.5 1.5v11h11v-11zM7 3.2a2.1 2.1 0 1 1 0 4.2 2.1 2.1 0 0 1 0-4.2zM3.4 11.2c.5-1.8 1.9-2.8 3.6-2.8s3.1 1 3.6 2.8z"/></svg></button>
<div class="xl-veil" data-veil></div>`;
  }
  const foot = document.querySelector("[data-slot=footer]");
  if (foot) {
    const col = (t, a, b) => `<div><span class="xl-mono">${t}</span><a href="#">${a}</a><br><a href="#">${b}</a></div>`;
    foot.outerHTML = `
<footer class="xl-foot" data-slot="footer"><div class="xl-foot__wrap">
  <div class="xl-foot__top"><div class="xl-foot__mark">${MARK}</div>
    <div class="xl-foot__cols">${col("Browse", "Menu 1", "Menu 2")}${col("Citizens & Students", "Menu 3", "Menu 4")}${col("Company", "Menu 5", "Menu 6")}${col("Guide", "News", "Contact info")}</div></div>
  <hr>
  <div class="xl-foot__partners"><span>Your operating agency name here<br>Your donation copy here<br>Your sponsor organization name here</span><span class="wf-logo">Sponsor logo 1</span><span class="wf-logo">Sponsor logo 2</span></div>
  <hr>
  <div class="xl-foot__legal"><nav><a href="#">Personal information</a><a href="#">Cookie Policy</a><a href="#">Where it’s made</a><a href="#">Cookie Settings</a></nav><span>0000 Organization Name. All rights reserved.</span></div>
</div></footer>`;
  }

  // ── Menu: pressing the button drops the panel down by height in .35s and lays a blurred veil in .4s. Close with the veil or Esc. Sub-groups open to max height in .5s
  const burger = document.querySelector("[data-burger]"), menu = document.querySelector("[data-menu]"), veil = document.querySelector("[data-veil]");
  if (burger && menu) {
    const set = (open) => {
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
      menu.style.height = open ? menu.scrollHeight + "px" : "0px";
      veil.classList.toggle("is-on", open);
      if (scroller) scroller.style.overflowY = open ? "hidden" : "";
    };
    burger.addEventListener("click", () => set(burger.getAttribute("aria-expanded") !== "true"));
    veil.addEventListener("click", () => set(false));
    addEventListener("keydown", (e) => e.key === "Escape" && set(false));
    menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => set(false)));
    menu.querySelectorAll("[data-sub-toggle]").forEach((b) => b.addEventListener("click", () => {
      const open = b.getAttribute("aria-expanded") !== "true";
      b.setAttribute("aria-expanded", String(open));
      b.nextElementSibling.classList.toggle("is-open", open);
      if (burger.getAttribute("aria-expanded") === "true") requestAnimationFrame(() => (menu.style.height = menu.scrollHeight + "px"));
    }));
  }

  // Same-page links (#) inside the inner panel scroll the panel smoothly
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute("href").length < 2) return;
    const t = document.querySelector(a.getAttribute("href"));
    if (!t || !scroller) return;
    e.preventDefault();
    scroller.scrollTo({ top: t.getBoundingClientRect().top + scroller.scrollTop, behavior: reduced ? "auto" : "smooth" });
  });

  const start = () => {
    const main = document.querySelector("[data-main]");
    // ── Per-section background: when a section passes the screen center the text color changes at once and the background over 1.5s to that section’s color (original data-body-color)
    const colored = gsap.utils.toArray("[data-body-color]");
    if (main && colored.length) {
      colored.forEach((sec) => {
        const [bg, ink] = sec.dataset.bodyColor.split(" ");
        ScrollTrigger.create({ trigger: sec, start: "top center", end: "bottom center",
          onToggle: (self) => {
            if (!self.isActive) return;
            gsap.set(main, { color: cssVar(ink) });
            gsap.to(main, { backgroundColor: cssVar(bg), overwrite: "auto", duration: reduced ? 0 : 1.5 });
          } });
      });
      gsap.set(main, { backgroundColor: cssVar("--site-sand-deep"), color: cssVar("--kf-ink") });
    }
    // ── Parallax (768 and up): yPercent = (1 − speed) × 100, from when the section enters from the bottom of the screen until it exits at the top
    gsap.matchMedia().add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      document.querySelectorAll("[data-scroll-speed]").forEach((el) => {
        gsap.to(el, { yPercent: (1 - (parseFloat(el.dataset.scrollSpeed) || 1)) * 100, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
      });
    });
    const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
    fonts.then(() => {
      // ── Line splitting: each line, inside its mask, rises from 100% below over 1.2s power2.out at 0.2s intervals — once when it reaches 90% of the screen
      document.querySelectorAll("[data-split]").forEach((el) => {
        const op = +(el.dataset.splitOp ?? 1);
        gsap.set(el, { opacity: 1 });
        SplitText.create(el, { type: "lines", linesClass: "line", mask: "lines", autoSplit: true,
          onSplit: (self) => {
            gsap.set(self.lines, { opacity: op });
            if (reduced) return;
            return gsap.from(self.lines, { yPercent: 100, duration: 1.2, stagger: 0.2, ease: "power2.out",
              scrollTrigger: { trigger: el, start: "top 90%", end: "bottom 10%", toggleActions: "play none none reverse", once: true } });
          } });
      });
      // ── Block float-up: when it reaches 95% of the screen it rises from 24px below in 1.2s power2.out, delayed 0.3s (if marked sequential, plus order × 0.2s)
      gsap.utils.toArray("[data-reveal-block]").forEach((el, i) => {
        const op = +(el.dataset.revealOp ?? 1);
        const delay = 0.3 + (el.hasAttribute("data-stagger") ? i * 0.2 : 0);
        if (reduced) return gsap.set(el, { opacity: op });
        ScrollTrigger.create({ trigger: el, start: "top 95%", end: "bottom 5%",
          onEnter: (self) => { gsap.fromTo(el, { y: 24, opacity: 0 }, { y: 0, opacity: op, duration: 1.2, delay, ease: "power2.out" }); self.kill(); } });
      });
      ScrollTrigger.refresh();
    });
  };
  // Original attaches this after window load
  document.readyState === "complete" ? start() : addEventListener("load", start);
})();
