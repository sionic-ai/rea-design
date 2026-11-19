// First page: when the loader (spiral-ring-loader) fires fx:cue, the big title letters pop up .6s later per line + .05s later per letter,
// At 3s the video replays via fx:open. The section-name strip and photo strip use Splide auto-scroll, and the interview cards advance one every 3 seconds (original other.js options unchanged).
(() => {
  const title = document.querySelector(".cp-fv__title");
  document.querySelectorAll(".cp-fv__line").forEach((line) => {
    const chars = [...line.textContent.trim()];
    line.textContent = "";
    chars.forEach((c, j) => {
      const outer = document.createElement("span");
      outer.className = c === " " ? "cp-fv__ch is-space" : "cp-fv__ch";
      const inner = document.createElement("span");
      inner.style.animationDelay = `${(j + 12) * 0.05}s`;
      inner.textContent = c;
      outer.append(inner);
      line.append(outer);
    });
  });
  const video = document.querySelector(".cp-fv__screen video");
  const loader = document.querySelector(".cp-loader");
  document.addEventListener("fx:cue", () => title && title.classList.add("is-active"));
  document.addEventListener("fx:open", () => video && video.play().catch(() => {}));
  if (!loader) title && title.classList.add("is-active");

  const mm = gsap.matchMedia();
  mm.add({ motion: "(prefers-reduced-motion: no-preference)", still: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    const { motion } = ctx.conditions;
    const ext = motion && window.splide ? window.splide.Extensions : {};
    const made = [];
    document.querySelectorAll(".cp-text-splide").forEach((el) => {
      made.push(new Splide(el, {
        type: "loop", perPage: 1, autoWidth: true, gap: "96px",
        autoScroll: { speed: -0.5, pauseOnHover: false },
        arrows: false, pagination: false, drag: false,
        breakpoints: { 768: { perPage: 1, autoWidth: true, gap: "24px" } },
      }).mount(ext));
    });
    const works = document.querySelector(".cp-works__splide");
    if (works) made.push(new Splide(works, {
      type: "loop", perPage: 2, gap: "32px",
      autoScroll: { speed: 0.5, pauseOnHover: false },
      arrows: false, pagination: false, drag: true,
      breakpoints: { 768: { perPage: 3, gap: "8px" } },
    }).mount(ext));
    const iv = document.querySelector(".cp-interview__splide");
    if (iv) {
      const s = new Splide(iv, {
        type: "loop", gap: "6.4rem", autoWidth: true, pagination: false, arrows: false,
        autoplay: motion, interval: 3000, pauseOnHover: false, pauseOnFocus: false,
        speed: motion ? 400 : 0,
        breakpoints: { 768: { gap: "48px" } },
      });
      s.mount();
      made.push(s);
      const cur = document.querySelector(".cp-pager__cur"), total = document.querySelector(".cp-pager__total");
      const pad = (n) => String(n).padStart(2, "0");
      if (total) total.textContent = pad(s.length);
      const show = (i) => { if (cur) cur.textContent = pad(i + 1); };
      show(s.index);
      s.on("move", show);
      const prev = document.querySelector(".cp-pager__prev"), next = document.querySelector(".cp-pager__next");
      const goPrev = () => s.go("<"), goNext = () => s.go(">");
      prev && prev.addEventListener("click", goPrev);
      next && next.addEventListener("click", goNext);
      ctx.add(() => () => { prev && prev.removeEventListener("click", goPrev); next && next.removeEventListener("click", goNext); });
    }
    return () => made.forEach((s) => s.destroy(true));
  });
})();
