// Used by all pages — header band hiding, phone menu, today’s date, footer photo swap, fade up from blur (js-fadein), photo parallax (js-object), accordion
(() => {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  // The original locks GSAP to 60 frames — so scrub’s catch-up feel is the same regardless of screen refresh rate
  gsap.ticker.fps(60);
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const EASE = { transform: CustomEase.create("site-transform", "M0,0 C0.44,0.05 0.17,1 1,1") };
  const mm = gsap.matchMedia();
  window.siteMM = mm;

  // Header bar — hides upward while scrolling down past the header height, returns right away on scroll up
  const header = $(".header");
  if (header) {
    let last = 0;
    const h = () => header.offsetHeight;
    const onScroll = () => {
      const y = scrollY;
      header.style.top = y > last && y > h() ? `-${h()}px` : "0";
      last = y;
    };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("load", onScroll);
  }

  // Phone menu
  const btn = $(".menu-btn");
  const menu = $(".menu");
  if (btn && menu) {
    btn.addEventListener("click", () => {
      const open = document.body.classList.toggle("is-menu-open");
      btn.setAttribute("aria-expanded", String(open));
      btn.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
      menu.setAttribute("aria-hidden", String(!open));
    });
  }

  // Today’s date on the right vertical strip — the original has the server print the current date
  const day = $(".page-fixed__time");
  if (day) {
    const d = new Date();
    const wd = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
    day.textContent = `( ${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} ${wd} )`;
  }

  // Footer photos — 1s crossfade every 3s (swiper fade)
  const foot = $(".footer__slide");
  if (foot && window.Swiper) {
    const sw = new Swiper(foot, { effect: "fade", fadeEffect: { crossFade: true }, loop: true, speed: 1000, autoplay: { delay: 3000 } });
    // Not advanced when off-screen — the tempo while visible matches the original, only the unseen painting is cut down
    sw.autoplay.stop();
    new IntersectionObserver(([e]) => (e.isIntersecting ? sw.autoplay.start() : sw.autoplay.stop())).observe(foot);
  }

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const narrow = () => innerWidth < 768;
    // The block rises from below over 1s shedding a 20px blur, and hides in reverse when scrolled back up
    $$(".js-fadein").forEach((el) => {
      const sp = narrow();
      gsap.from(el, { autoAlpha: 0, y: sp ? 30 : 50, filter: "blur(20px)", duration: 1, ease: "power2.out", scrollTrigger: { trigger: el, start: el.dataset.start || (sp ? "top 90%" : "center bottom"), toggleActions: "play none none reverse" } });
    });
    // Photo flows inside the cell from 5vw → -10vw, bound to scroll
    $$(".js-object").forEach((el) => {
      gsap.fromTo(el, { y: el.dataset.from || "5vw" }, { y: el.dataset.to || "-10vw", ease: "none", scrollTrigger: { trigger: el, start: el.dataset.startAt || "top bottom", end: el.dataset.end || "bottom top", scrub: true } });
    });
  });

  // Accordion — opens and closes the height with the original curve over .6s
  $$(".js-accordion-btn").forEach((b) => {
    const box = b.closest(".js-accordion")?.querySelector(".js-accordion-contents");
    if (!box) return;
    b.addEventListener("click", () => {
      const open = !b.classList.contains("is-open");
      b.classList.toggle("is-open", open);
      box.classList.toggle("is-open", open);
      b.setAttribute("aria-expanded", String(open));
      gsap.to(box, { height: open ? "auto" : 0, duration: 0.6, ease: EASE.transform });
    });
    if (b.getAttribute("role") === "button") b.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); b.click(); } });
  });
})();
