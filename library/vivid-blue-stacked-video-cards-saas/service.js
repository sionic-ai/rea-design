// Feature intro — swap preview panel · sticky TOC current category marker · question toggle
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Old way ↔ new way: toggles on click, and on first view switches once to the new way after 1.2s (first play spot of the original Rive version)
  document.querySelectorAll("[data-py-toggle]").forEach((box) => {
    const sw = box.querySelector(".py-toggle__sw");
    const set = (on) => { box.classList.toggle("is-on", on); sw.setAttribute("aria-checked", on ? "true" : "false"); };
    sw.addEventListener("click", () => set(!box.classList.contains("is-on")));
    if (reduce) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setTimeout(() => set(true), 1200); io.disconnect(); } }, { threshold: 0.5 });
    io.observe(box);
  });

  // Sticky contents — the category passing the screen center gets a blue dot and blue text
  const links = [...document.querySelectorAll("[data-py-spy]")];
  const secs = links.map((a) => document.getElementById(a.dataset.pySpy));
  const spy = () => {
    let on = 0;
    secs.forEach((s, i) => { if (s && s.getBoundingClientRect().top <= innerHeight * 0.5) on = i; });
    links.forEach((a, i) => a.classList.toggle("is-on", i === on));
  };
  addEventListener("scroll", spy, { passive: true });
  spy();

  // Questions — open and close one at a time (.4s)
  document.querySelectorAll(".py-faq__q").forEach((q) => {
    q.addEventListener("click", () => {
      const li = q.parentElement, on = !li.classList.contains("is-open");
      li.classList.toggle("is-open", on);
      q.setAttribute("aria-expanded", on ? "true" : "false");
    });
  });
})();
