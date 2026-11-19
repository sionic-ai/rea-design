// Journal: titles rise from below line by line, text lines come in one by one as they enter. A pill switch changes the paper color and remembers it for next time.
(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText);
  const body = document.body, btn = document.querySelector(".nw-theme");
  const set = (dark) => { body.classList.toggle("is-dark", dark); btn.setAttribute("aria-pressed", dark); btn.querySelector("b").textContent = dark ? "Light" : "Dark"; };
  set(localStorage.getItem("dk-journal-dark") === "1");
  btn.addEventListener("click", () => { const d = !body.classList.contains("is-dark"); set(d); localStorage.setItem("dk-journal-dark", d ? "1" : "0"); });

  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    const lines = new SplitText(".nw-head h1", { type: "lines", mask: "lines" });
    gsap.set(lines.lines, { yPercent: 100 });
    gsap.set([".nw-eyebrow", ".nw-desc"], { opacity: 0, y: 16 });
    document.addEventListener("dk:reveal", () => {
      gsap.to(lines.lines, { yPercent: 0, duration: 1.1, stagger: 0.08, ease: "expo.out", delay: 0.3 });
      gsap.to([".nw-eyebrow", ".nw-desc"], { opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: "expo.out", delay: 0.45 });
    }, { once: true });
    gsap.utils.toArray(".nw-item, .nw-list__head").forEach((el) => gsap.from(el, { opacity: 0, y: 30, duration: 0.9, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 90%" } }));
  });
})();
