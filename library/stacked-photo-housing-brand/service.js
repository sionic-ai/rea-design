// Services — the header photo grows from a square size to screen height (scrub 1), a collapsible support list, and a closing photo that changes every 5 seconds
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const head = document.querySelector("[data-fv1]");
  const text = document.querySelector("[data-fv2]");
  // Entry: title underline after .3s, text rises in .6s after 1s
  const ready = window.ai.page({ change: "-40%", main: "none" });
  if (reduce) { head.classList.add("is-active"); gsap.set(text, { opacity: 1, y: 0 }); text.classList.add("is-active"); }
  else gsap.timeline()
    .add(() => head.classList.add("is-active"), "+=0.3")
    .to(text, { opacity: 1, y: 0, duration: 0.6, ease: "sine.out" }, "+=1")
    .add(() => { text.classList.add("is-active"); window.ai.split(); ready(); }, "<");

  gsap.matchMedia().add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
    const c = innerWidth / 1488;
    const lead = document.querySelector("[data-sv-lead]"), img = document.querySelector("[data-sv-image]");
    const tl = gsap.timeline({ scrollTrigger: { trigger: "[data-sv-trigger]", start: "top top", end: "bottom bottom", scrub: 1 } });
    tl.to(lead, { y: -130 * c, duration: 0.5, onStart: () => document.querySelector("[data-sv-lead-image]").classList.add("is-active") })
      .fromTo(img, { width: 344 * c, height: 374 * c, xPercent: -7 }, { width: 744 * c, height: innerHeight, xPercent: 0 }, "<")
      .fromTo("[data-sv-lead-image]", { x: 0 }, { x: 100 * c }, "<")
      .to("[data-sv-square]", { opacity: 0 }, ">");
  });

  // Accordion — pressing opens it to the inner height, pressing again sets it to 0
  document.querySelectorAll("[data-acc]").forEach((it) => {
    const t = it.querySelector("[data-acc-target]");
    it.querySelector("[data-acc-trigger]").addEventListener("click", () => {
      const open = !it.classList.contains("is-open");
      it.classList.toggle("is-open", open);
      t.style.height = open ? `${t.firstElementChild.clientHeight}px` : "0px";
    });
  });

  // Closing photo — every 5 sec the next one seeps up from below, the previous one stays underneath
  const slider = document.querySelector("[data-slider]");
  const slides = slider.querySelectorAll(".sv-slider__bgItem");
  let cur = 0;
  slides[0].classList.add("is-active");
  slides[2 % slides.length].classList.add("is-next");
  if (!reduce) setInterval(() => {
    const prev = cur;
    cur = (cur + 1) % slides.length;
    slider.setAttribute("data-slide", String(cur + 1));
    slides.forEach((s, i) => { s.classList.remove("is-active", "is-next"); if (i === cur) s.classList.add("is-active"); else if (i === prev) s.classList.add("is-next"); });
  }, 5000);
})();
