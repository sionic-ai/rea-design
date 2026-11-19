// Hero — threat tags light up in turn, three pixel titles swap on a pinned plate by scroll (the second with a red glow), the accuracy number rolls up, and the case tab switches
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tags = [...document.querySelectorAll(".et-tag")];
  if (tags.length && !reduce) {
    // Like the original ‹detected visible›, tags switch on one after another and stay (in a section carried over, they are on from the start)
    if (document.documentElement.classList.contains("et-arrived")) tags.forEach((t) => t.classList.add("is-on"));
    else tags.forEach((t, k) => setTimeout(() => t.classList.add("is-on"), 600 + k * 150));
  }
  const issue = document.querySelector(".et-issue");
  if (issue && window.gsap && window.ScrollTrigger && !reduce) {
    const slides = [...issue.querySelectorAll(".et-issue__slide")];
    let cur = 0;
    const show = (n) => {
      if (n === cur) return;
      cur = n;
      slides.forEach((s, k) => {
        if (k === n) {
          s.classList.add("is-on");
          const lines = s.querySelectorAll("h2, p");
          gsap.fromTo(lines.length ? lines : s, { opacity: 0, filter: "blur(8px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.5, stagger: 0.15, ease: "power2.out" });
          gsap.set(s, { opacity: 1 });
        } else { s.classList.remove("is-on"); gsap.to(s, { opacity: 0, duration: 0.3, ease: "power2.in" }); }
      });
      issue.classList.toggle("is-warn", n === 1);
    };
    ScrollTrigger.create({ trigger: issue, start: "top top", end: "bottom bottom", onUpdate: (st) => show(Math.min(slides.length - 1, Math.floor(st.progress * slides.length * 0.999))) });
  }
  const roll = document.querySelector(".et-roll__track");
  if (roll && window.gsap && !reduce) {
    const n = roll.children.length;
    gsap.fromTo(roll, { yPercent: 0 }, { yPercent: -100 * (n - 1) / n, duration: 2, ease: "power4.out", scrollTrigger: { trigger: roll, start: "top 85%", once: true } });
  } else if (roll) roll.style.transform = `translateY(${-100 * (roll.children.length - 1) / roll.children.length}%)`;
  document.querySelectorAll(".et-bars span").forEach((b, i) => b.style.setProperty("--h", `${(i * 37) % 80}%`));
  const btns = [...document.querySelectorAll("[data-case]")], panes = [...document.querySelectorAll("[data-pane]")];
  btns.forEach((b) => b.addEventListener("click", () => {
    btns.forEach((x) => { const on = x === b; x.classList.toggle("is-on", on); x.setAttribute("aria-selected", String(on)); });
    panes.forEach((p) => p.classList.toggle("is-on", p.dataset.pane === b.dataset.case));
  }));
})();
