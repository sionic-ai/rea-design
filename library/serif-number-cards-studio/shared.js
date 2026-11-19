// Common to all pages: draws in the header bar, phone menu and footer wordmark, and Framer reveal (from 100px below, .4s spring bounce .2),
// Applies the wordmark blur-clear. The original uses Framer (a motion runtime) — same values in GSAP and CSS.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";
  const DS = (window.DS = { reduced });
  const star = '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 0l1.6 4.2L14 2.6l-2.3 4L16 8l-4.3 1.4L14 13.4l-4.4-1.6L8 16l-1.6-4.2L2 13.4l2.3-4L0 8l4.3-1.4L2 2.6l4.4 1.6z"/><circle cx="8" cy="8" r="2.6" fill="var(--kf-bg)"/></svg>';
  const links = [["works", "works.html", "Work"], ["services", "index.html#services", "Service"], ["testi", "index.html#testimonials", "Endorsement"], ["about", "about.html", "About"], ["news", "news.html", "Text"]];

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.className = "ds-nav";
    head.innerHTML = `
      <div class="ds-nav__in">
        <a class="ds-logo" href="index.html" aria-label="Home">${star}<span data-label="Your studio English name here">Studio Name</span></a>
        <nav class="ds-nav__links" aria-label="Main menu">${links.map(([k, h, t]) => `<a href="${h}"${k === page ? ' aria-current="page"' : ""}>${t}</a>`).join("")}<a class="ds-btn" href="#contact">Contact Us</a></nav>
        <button class="ds-burger" type="button" aria-label="Menu"><i></i><i></i></button>
      </div>
      <div class="ds-mmenu" data-slot="mobile-menu"><div><nav>${links.map(([, h, t]) => `<a href="${h}">${t}</a>`).join("")}<a class="ds-btn" href="#contact">Contact Us</a></nav></div></div>`;
    head.querySelector(".ds-burger").addEventListener("click", () => head.classList.toggle("is-open"));
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.className = "ds-foot";
    foot.id = "contact";
    foot.innerHTML = `<div class="ds-foot__mark"><svg viewBox="0 0 1200 127" aria-label="Studio Name" data-label="Your studio English wordmark here"><text x="600" y="118" text-anchor="middle" font-size="150" textLength="1196" lengthAdjust="spacingAndGlyphs" fill="currentColor">Studio Name</text></svg></div>`;
  }

  // Framer entrance — items marked like the logo band rise from 100px below with a .4s spring (bounce .2)
  if (!reduced) {
    document.querySelectorAll("[data-appear]").forEach((el) => {
      gsap.from(el, { y: 100, duration: 0.6, ease: "back.out(1.1)", scrollTrigger: { trigger: el, start: "top bottom", once: true } });
    });
    const mark = document.querySelector(".ds-foot__mark");
    if (mark) gsap.fromTo(mark, { filter: "blur(12px)", yPercent: 20 }, { filter: "blur(0px)", yPercent: 0, ease: "none", scrollTrigger: { trigger: ".ds-foot", start: "top bottom", end: "bottom bottom", scrub: true } });
  }
})();
