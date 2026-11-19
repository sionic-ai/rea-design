// Motion shared by the whole site — load-finished flag (start of the hero sequence), turn on 0.2s after becoming visible, 1s anchor scroll, phone drawer,
// Blueprint dropdown and expand rows, photo parallax (Rellax), smooth scroll (Lenis — as in the original, only on desktop browsers that are not on phones or the laptop platform with native smooth scroll)
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const body = document.body;

  // Original anchor move: 1000ms, 1 - (1 - t)^4
  const glide = (y, dur = 1000) => {
    if (reduce) { scrollTo(0, y); return; }
    const from = scrollY, dist = y - from, t0 = performance.now();
    const step = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      scrollTo(0, from + dist * (1 - Math.pow(1 - p, 4)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const targetOf = (href) => (href === "#" || href === "#top" || href === "") ? document.documentElement : document.querySelector(href);

  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const t = targetOf(a.getAttribute("href"));
    if (!t) return;
    e.preventDefault();
    glide(t === document.documentElement ? 0 : t.getBoundingClientRect().top + scrollY);
  });

  // Phone drawer — the button turns into an x and the drawer slides in from the right in 0.7s
  const menuBtn = document.querySelector(".cb-menu-btn");
  const nav = document.querySelector(".cb-nav");
  if (menuBtn && nav) {
    const set = (on) => {
      menuBtn.classList.toggle("on", on);
      nav.classList.toggle("on", on);
      menuBtn.setAttribute("aria-expanded", String(on));
    };
    menuBtn.addEventListener("click", () => set(!nav.classList.contains("on")));
    nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => set(false)));
  }

  // Expand: opens max-height from 0 → scrollHeight, and back to 0 when closing
  const toggleOpen = (btn, list) => {
    btn.classList.toggle("active");
    if (list.classList.contains("active")) {
      list.style.maxHeight = "0";
      list.classList.remove("active");
    } else {
      list.style.maxHeight = "0px";
      list.classList.add("active");
      requestAnimationFrame(() => { list.style.maxHeight = `${list.scrollHeight}px`; });
    }
  };
  document.addEventListener("click", (e) => {
    const dl = e.target.closest(".cb-dl__title");
    if (dl && dl.nextElementSibling?.tagName === "UL") { toggleOpen(dl, dl.nextElementSibling); return; }
    const acc = e.target.closest(".cb-acc__btn");
    if (acc && acc.nextElementSibling?.classList.contains("cb-acc__list")) toggleOpen(acc, acc.nextElementSibling);
  });

  // Turn on when visible: when 10% is visible within 1% inside the screen, is-active after 0.2s
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) setTimeout(() => en.target.classList.add("is-active"), 200);
    });
  }, { root: null, rootMargin: "-1% 0px", threshold: 0.1 });
  const watch = () => document.querySelectorAll(".in-view").forEach((el) => {
    if (reduce) el.classList.add("is-active"); else io.observe(el);
  });
  window.cbWatch = watch;

  let lenis = null;
  addEventListener("load", () => {
    if (!reduce && window.Rellax && document.querySelector(".js-rellax")) {
      new Rellax(".js-rellax", { speed: -2, center: false, wrapper: null, round: true, vertical: true, horizontal: false });
    }
    const ua = navigator.userAgent.toLowerCase();
    if (!reduce && window.Lenis && !/android|ipod|ipad|iphone|macintosh/.test(ua) && ua.includes("safari") && !ua.includes("mobile")) {
      lenis = new Lenis({ duration: 2 });
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
    addEventListener("resize", () => lenis && lenis.resize());

    body.classList.add("is-load");
    const hash = location.hash;
    if (hash && hash.length > 1) {
      scrollTo(0, 0);
      setTimeout(() => {
        const t = document.querySelector(hash);
        if (t) glide(t.getBoundingClientRect().top + scrollY);
      }, 500);
    }
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", watch);
  else watch();
})();
