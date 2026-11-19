// What the company aims for: side contents — paint as current the last section whose dialogue-section top edge has risen above 32% of screen height (measured batched in one rAF, like the original)
(() => {
  const blocks = [...document.querySelectorAll(".vs-theme__main article[id^='theme']")];
  const links = [...document.querySelectorAll(".vs-side__link")];
  if (!blocks.length) return;
  let raf = 0;
  const update = () => {
    raf = 0;
    const line = innerHeight * 0.32;
    let now = blocks[0].id;
    blocks.forEach((b) => { if (b.getBoundingClientRect().top <= line) now = b.id; });
    links.forEach((l) => {
      const on = l.getAttribute("href").slice(1) === now;
      l.classList.toggle("is-active", on);
      on ? l.setAttribute("aria-current", "true") : l.removeAttribute("aria-current");
    });
  };
  const ask = () => { if (!raf) raf = requestAnimationFrame(update); };
  update();
  addEventListener("scroll", ask, { passive: true });
  addEventListener("resize", ask);
})();
