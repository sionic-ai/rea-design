// Writes the header (logo, right vertical strip, menu drawer), loader, contact strip and footer in one place so the five pages use the same ones.
// In the original each page reloads fresh and the loader lifting is the whole page transition, so we add no separate transition effect here either.
(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const AC = (window.AC = { reduced, lenis: null });

  const MARK = `<svg viewBox="0 0 34 38" aria-hidden="true"><path d="M17 1 33 10v18L17 37 1 28V10z" fill="currentColor"/><path d="M17 9.5 25 14v9l-8 4.5L9 23v-9zM17 18.5V27.5M9 14l8 4.5 8-4.5" fill="none" stroke="var(--ac-logo-cut, var(--site-dark))" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
  const logo = (cls = "", cut = "") =>
    `<a class="ac-logo ${cls}" href="index.html" aria-label="Home" style="${cut ? `--ac-logo-cut:${cut}` : ""}">${MARK}<span class="ac-logo__txt"><b>STUDIO NAME.</b><small>studio subtitle</small></span></a>`;

  // Original pages that were not archived (office info, questions, columns, per-service pages) link to the nearest page of ours.
  const MAIN = [
    ["Home", "index.html"], ["What we do", "about.html"], ["Office Guide", "about.html"], ["Work case", "works.html"],
    ["Frequently asked questions", "index.html#questions"], ["Hiring guide", "recruit.html"], ["Inquiry", "recruit.html#entry"],
  ];
  const SERVICE = [1, 2, 3, 4, 5, 6].map((n) => [n === 5 ? "Task name 0" + n + " · A bit longer" : "Task name 0" + n, `about.html#arch-${n}`]);
  const NEWS = [["News", "news.html"], ["Column", "news.html"]];
  const list = (rows) => `<ul>${rows.map(([t, h]) => `<li><a class="ac-uline" href="${h}">${t}</a></li>`).join("")}</ul>`;

  const MAIL = `<svg viewBox="0 0 12 15" aria-hidden="true"><rect x="0.5" y="2.5" width="11" height="10" fill="none" stroke="currentColor"/><path d="M0.5 3 6 8.2 11.5 3" fill="none" stroke="currentColor"/></svg>`;
  const SNS = `<svg viewBox="0 0 18 18" aria-hidden="true"><rect x="1" y="1" width="16" height="16" rx="4.5" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="9" cy="9" r="3.8" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="13.6" cy="4.4" r="1" fill="currentColor"/></svg>`;

  // Large symbol laid behind the concept and subpage headers — a hexagonal mass of three faces interlocking with gaps
  const BIG = `<svg viewBox="0 0 513 648" aria-hidden="true" fill="currentColor"><path d="M256.5 48 478 176 256.5 304 35 176z"/><path d="M0 198 244 339v259L0 457z" fill-opacity=".7"/><path d="M269 339 513 198v259L269 598zM320 372v120l142-82V290z" fill-rule="evenodd" fill-opacity=".45"/></svg>`;
  document.querySelectorAll("[data-ac-mark]").forEach((el) => (el.innerHTML = BIG));

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("ac-header");
    head.innerHTML = `
      ${logo()}
      <div class="ac-utility">
        <button class="ac-menu-btn" type="button" aria-expanded="false" aria-controls="ac-drawer"><span class="ac-menu-btn__line"><span></span><span></span></span><span class="ac-menu-btn__txt">Menu</span></button>
        <a class="ac-contact" href="#contact">${MAIL}Contact</a>
      </div>
      <nav class="ac-drawer" id="ac-drawer" data-slot="menu-drawer" aria-label="Full menu">
        <div class="ac-drawer__panel">
          <div class="col">
            ${logo("is-ink", "var(--site-drawer)")}
            <p class="ac-drawer__txt">TEL. <a href="tel:0000000000">00-0000-0000</a><br>FAX. 00-0000-0000</p>
          </div>
          <div class="col">
            <p class="ac-drawer__ttl">Contents</p>
            <div class="ac-drawer__links">${list([...MAIN, ...NEWS])}${list(SERVICE)}</div>
          </div>
        </div>
      </nav>`;
  }

  // The loader is placed at the start of the HTML like the original — if inserted late with JS the first paint happens once without the loader and is then covered

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("ac-footer");
    foot.innerHTML = `
      <div class="ac-cta" id="contact" data-slot="footer-cta">
        <div class="ac-container">
          <div class="col">
            <p class="ac-cta__ttl" lang="en">Contact</p>
            <p>Add one line encouraging people to seek counseling. <br class="pc-only">Your slightly longer one line here on what matters you can consult about.</p>
          </div>
          <a class="ac-cta__btn" href="recruit.html#entry"><span>Your consultation / contact button text here</span><span class="ac-arrow is-white"></span></a>
        </div>
        <div class="ac-cta__bg js-parallax ac-dark-photo"><div class="wf-img is-label-corner" data-label="Several white architectural models · overcast gray-green light and wall shadows · full-bleed landscape"></div></div>
      </div>
      <div class="ac-footer__body" data-slot="footer">
        <div class="col">
          <p>${logo("", "var(--site-dark-2)")}</p>
          <p class="ac-footer__txt">〒000-0000 One line of your address here<br>TEL. <a href="tel:0000000000">00-0000-0000</a><br>FAX. 00-0000-0000</p>
          <a class="ac-footer__sns" href="#">${SNS}Instagram</a>
        </div>
        <div class="col">
          <div class="ac-footer__map">${list(MAIN)}${list(SERVICE)}${list(NEWS)}</div>
        </div>
        <div class="col">
          <div class="ac-footer__copy">
            <ul class="ac-footer__links2"><li><a class="ac-uline" href="index.html">HOME</a></li><li><a class="ac-uline" href="#">Privacy Policy</a></li></ul>
            <small>© 0000 STUDIO NAME. studio subtitle</small>
          </div>
        </div>
      </div>`;
  }

  // Split the button text into upper and lower copies and swap them on hover
  document.querySelectorAll(".ac-swap").forEach((el) => {
    const t = el.textContent;
    el.innerHTML = `<span class="first" aria-hidden="true">${t}</span><span class="second">${t}</span>`;
  });

  const html = document.documentElement;
  const btn = document.querySelector(".ac-menu-btn");
  const drawer = document.querySelector(".ac-drawer");
  const setOpen = (open) => {
    if (!btn) return;
    [btn, drawer, html].forEach((el) => el.classList.toggle("is-open", open));
    btn.setAttribute("aria-expanded", open);
  };
  btn?.addEventListener("click", () => setOpen(!drawer.classList.contains("is-open")));
  drawer?.querySelectorAll('a[href*="#"]').forEach((a) => a.addEventListener("click", () => setOpen(false)));
  document.addEventListener("click", (e) => {
    if (drawer?.classList.contains("is-open") && !e.target.closest(".ac-drawer__panel, .ac-menu-btn")) setOpen(false);
  });
  addEventListener("keydown", (e) => e.key === "Escape" && setOpen(false));

  // The original is a new Lenis( appended to the end of lenis.min.js{ anchors: true }) and its own rAF are all there is — 1.0.18 has no anchors option, so anchors just jump.
  // The npm UMD build’s global name is lenis (lowercase).
  const LenisCtor = window.Lenis || window.lenis;
  if (!reduced && LenisCtor) {
    const lenis = (AC.lenis = new LenisCtor({ anchors: true }));
    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }

  const io = new IntersectionObserver(
    (entries) => entries.forEach((en) => en.isIntersecting && en.target.classList.add("is-show")),
    { rootMargin: "0px 0px -40px" }
  );
  AC.reveal = (root = document) =>
    root.querySelectorAll(".js-fadein").forEach((el) => (reduced ? el.classList.add("is-show") : io.observe(el)));
  AC.reveal();

  const loader = document.getElementById("ac-loader");
  const showHead = () => document.querySelectorAll(".ac-page-head, .ac-contents").forEach((el) => el.classList.add("is-show"));
  if (loader) requestAnimationFrame(() => loader.classList.add("is-action"));
  reduced ? showHead() : setTimeout(showHead, 1000);

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    AC.mm = gsap.matchMedia();
    AC.mm.add("(prefers-reduced-motion: no-preference)", () => {
      document.querySelectorAll(".js-parallax > .wf-img").forEach((img) => {
        gsap.fromTo(img, { scale: 1.2 }, {
          scale: 1, ease: "none",
          scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: 1 },
        });
      });
    });
  }
})();
