(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.tySplitTitles();

  // Three panels: the Overview panel is pressed down when the Jobs panel rises, and the Jobs panel when the Work panel rises
  const top = document.querySelector(".ty-svc__top"), jobs = document.querySelector(".ty-svc__jobs"), works = document.querySelector(".ty-svc__works");
  window.tySink(top, top.querySelector("[data-sink-content]"), jobs);
  window.tySink(jobs, jobs.querySelector("[data-sink-content]"), works);

  // ── Anchor bar: the cell starts 10px before the heading, before the very first cell the background folds away ──
  const bar = document.querySelector(".ty-anchor");
  const links = [...bar.querySelectorAll("[data-anchor-link]")];
  const current = bar.querySelector("[data-anchor-current]");
  const targets = links.map((a) => document.querySelector(a.getAttribute("href")));
  let tops = [], idx = -1, jumping = false;
  const measure = () => { tops = targets.map((t) => t.getBoundingClientRect().top + scrollY - 10); };
  const move = (i) => {
    if (idx === i) return;
    idx = i;
    if (i < 0) { current.style.width = "0px"; return; }
    current.style.left = `${links[i].offsetLeft}px`;
    current.style.width = `${links[i].offsetWidth}px`;
    if (innerWidth < 768) bar.scrollTo({ left: links[i].offsetLeft, behavior: "smooth" });
  };
  const spy = () => {
    if (jumping) return;
    if (scrollY < tops[0]) { move(-1); return; }
    let k = 0;
    tops.forEach((t, i) => { if (scrollY > t - 50) k = i; });
    move(k);
  };
  const jump = (i) => {
    jumping = true;
    move(i);
    scrollTo({ top: targets[i].getBoundingClientRect().top + scrollY, behavior: reduce ? "auto" : "smooth" });
    let t = setTimeout(() => { jumping = false; }, 100);
    const end = () => { clearTimeout(t); t = setTimeout(() => { removeEventListener("scroll", end); jumping = false; }, 100); };
    addEventListener("scroll", end);
  };
  links.forEach((a, i) => a.addEventListener("click", (e) => { e.preventDefault(); jump(i); }));
  // Same-page links in the header dropdown and footer also glide within this page
  document.querySelectorAll('a[href^="service.html#"]').forEach((a) => {
    const i = targets.findIndex((t) => `#${t.id}` === a.hash);
    if (i >= 0) a.addEventListener("click", (e) => { e.preventDefault(); jump(i); });
  });
  measure();
  addEventListener("resize", () => { measure(); spy(); });
  new ResizeObserver(() => { measure(); spy(); }).observe(document.body);
  addEventListener("scroll", spy, { passive: true });
  spy();

  // ── Job switch: underline moves to the next cell, content shifts 20% and fades out, then enters from the opposite side ──
  const root = document.querySelector("[data-switch-root]");
  root.querySelectorAll("[data-switch]").forEach((b) => b.addEventListener("click", () => {
    const d = b.dataset.switch === "director";
    for (const el of [root, jobs]) { el.classList.toggle("-director", d); el.classList.toggle("-producer", !d); }
    root.querySelectorAll("[data-switch]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    dispatchEvent(new Event("resize"));
  }));

  // ── Three sliders — same Swiper settings as the interview, only the slot gap differs ──
  const sliders = document.querySelectorAll("[data-slider]");
  sliders.forEach((box) => {
    const isWorks = box.classList.contains("ty-works__inner");
    window.tySwiper(box, (c) => ({
      slidesOffsetBefore: 5.3 * c, slidesOffsetAfter: 5.3 * c, spaceBetween: (isWorks ? 2 : 1) * c,
      breakpoints: { 821: { slidesOffsetBefore: (isWorks ? 6.8 : 13.5) * c, slidesOffsetAfter: (isWorks ? 6.8 : 13.5) * c, spaceBetween: (isWorks ? 1.4 : 2.2) * c } },
    }));
  });
})();
