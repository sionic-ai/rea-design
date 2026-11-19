// Shared by the design department pages: menu panel (signature-line button), text blocks on scroll pages come into focus from blur on entering view (.9s), long line drawn as you scroll (About page).
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const menuBtn = document.querySelector(".k-menu-btn");
  const menu = document.querySelector(".k-menu");
  if (menuBtn && menu) {
    const toggle = (open) => {
      menu.classList.toggle("is-open", open);
      menuBtn.setAttribute("aria-expanded", String(open));
      menu.querySelectorAll(".k-blur").forEach((el) => el.classList.toggle("is-in", open));
    };
    menuBtn.addEventListener("click", () => toggle(!menu.classList.contains("is-open")));
    addEventListener("keydown", (e) => e.key === "Escape" && toggle(false));
  }

  // Careers page (same jQuery as original common.js): phone menu uses fadeToggle('fast'), same-page anchors use .25s swing, FAQ uses slideToggle
  if (window.jQuery && document.querySelector(".k-rhead")) {
    const $ = window.jQuery;
    $(() => {
      $(".k-rhead__burger").on("click", function () {
        const open = $(".k-rhead").toggleClass("is-open").hasClass("is-open");
        $(this).attr("aria-expanded", String(open));
        $(".k-rhead__nav").stop(true, true).fadeToggle(reduce ? 0 : "fast");
      });
      $('a[href^="#"]').not(".k-rc-movie__link").on("click", function () {
        const href = $(this).attr("href");
        const $t = $(href === "#" || href === "" ? "html" : href);
        if (!$t.length) return;
        const sp = matchMedia("(max-width: 739px)").matches;
        $("html, body").animate({ scrollTop: $t.offset().top - (sp ? 50 : 72) }, reduce ? 0 : 250, "swing");
        return false;
      });
      $(".k-acc dt").on("click", function () {
        $(this).next().stop(true, true).slideToggle(reduce ? 0 : 400);
        $(this).toggleClass("is-open");
      });
    });
  }

  // Settles once when it enters above the bottom 15% of the screen
  const blurs = document.querySelectorAll("[data-blur]");
  if (reduce) blurs.forEach((el) => el.classList.add("is-in"));
  else {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -15% 0px" });
    blurs.forEach((el) => io.observe(el));
  }

  // Long line: drawn as far as the document has scrolled (the leading end follows .02 later each)
  const path = document.querySelector(".k-flow path");
  if (path) {
    const len = path.getTotalLength();
    path.style.strokeDasharray = len;
    let shown = 0;
    const target = () => (reduce ? 1 : Math.min(1, scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)) * 0.9 + 0.1);
    const tick = () => {
      shown += (target() - shown) * 0.08;
      path.style.strokeDashoffset = len * (1 - shown);
      requestAnimationFrame(tick);
    };
    tick();
  }
})();
