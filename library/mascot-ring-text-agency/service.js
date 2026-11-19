// Services — goal cards rise from 80px below in .12 steps and tilt up to 30° following the mouse, and case tabs swap the photo and text
(() => {
  if (!window.gsap) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cards = [...document.querySelectorAll("[data-tilt]")];
  const mm = gsap.matchMedia();
  mm.add({ desk: "(min-width: 992px)", mob: "(max-width: 991px)" }, (c) => {
    if (reduce) return;
    gsap.from(cards, { y: 80, opacity: 0, stagger: 0.12, duration: 1, ease: "power3.out", scrollTrigger: { trigger: ".s-want", start: "top 70%" } });
    if (c.conditions.mob) return;
    const offs = cards.map((t) => {
      const move = (e) => { const b = t.getBoundingClientRect(); const r = (e.clientX - b.left) / b.width - 0.5, l = (e.clientY - b.top) / b.height - 0.5; gsap.to(t, { rotateY: 30 * r, rotateX: -(30 * l), duration: 0.5, ease: "power3.out", overwrite: "auto" }); };
      const out = () => gsap.to(t, { rotateX: 0, rotateY: 0, duration: 0.5, ease: "power3.out" });
      t.addEventListener("mousemove", move); t.addEventListener("mouseleave", out);
      return () => { t.removeEventListener("mousemove", move); t.removeEventListener("mouseleave", out); };
    });
    return () => offs.forEach((f) => f());
  });
  const tabs = [...document.querySelectorAll(".s-tabs__tab")];
  const media = document.querySelector(".s-tabs__media"), right = document.querySelector(".s-tabs__right");
  tabs.forEach((t) => t.addEventListener("click", () => {
    if (t.classList.contains("is-on")) return;
    tabs.forEach((x) => x.classList.toggle("is-on", x === t));
    gsap.fromTo([media, right], { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: reduce ? 0 : 0.6, ease: "power3.out", stagger: 0.08 });
  }));
})();
