// Spot guide — left table of contents: clicking goes to that section via Locomotive data-scroll-to (.5s easeOutCubic if there is no panel scroll), and the section crossing the 40% screen line is is-current (original js-ankNav rootMargin −40% 0 −60%)
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const links = [...document.querySelectorAll('.tm-side a[href^="#"]')];
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  const go = (y) => {
    if (reduce) { scrollTo(0, y); return; }
    const from = scrollY, t0 = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - t0) / 500);
      scrollTo(0, from + (y - from) * ease(t));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  // Original: Locomotive’s data-scroll-to moves the panel — only when there is no panel scroll (reduced motion) does it move the window directly
  links.forEach((a) => a.addEventListener("click", (e) => {
    if (window.tsScroll && window.tsScroll.loco) return;
    const sec = document.querySelector(a.getAttribute("href"));
    if (!sec) return;
    e.preventDefault();
    go(Math.max(0, sec.getBoundingClientRect().top + scrollY - 100));
  }));
  // Original js-ankNav — when a section listed in the table of contents hits the band, it moves the current marker, and 150ms later slides the contents box horizontally to that row (when the contents is a horizontal row on phones)
  const ank = document.querySelector(".tm-side-wrap [data-scroll-sticky]") || document.querySelector(".tm-side");
  const list = document.querySelector(".tm-side");
  let timer = null;
  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (!en.isIntersecting) return;
    const link = links.find((a) => a.getAttribute("href") === "#" + en.target.id);
    if (!link) return;
    links.forEach((a) => a.classList.remove("is-current"));
    link.classList.add("is-current");
    clearTimeout(timer);
    timer = setTimeout(() => ank.scrollTo(link.closest("li").getBoundingClientRect().x - list.getBoundingClientRect().x, 0), 150);
  }), { rootMargin: "-40% 0px -60%", threshold: 0 });
  document.querySelectorAll(".ab-sec").forEach((s) => io.observe(s));
  addEventListener("scroll", () => {
    if ((document.documentElement.scrollTop || document.body.scrollTop) !== 0) return;
    clearTimeout(timer);
    ank.scrollTo(0, 0);
    links.forEach((a, i) => a.classList.toggle("is-current", i === 0));
  });
})();
