// Home page — in the case list, turns on the case at screen center (the cluster ring moves to that frame), plus the scenes and progress bar of the pinned process section.
(() => {
  const H = () => innerHeight;

  // Work: the item closest to screen center turns on and the name on the left gets darker
  const cases = [...document.querySelectorAll(".case")];
  const titles = [...document.querySelectorAll(".cases__titles button")];
  let on = -1;
  const pickCase = () => {
    let best = 1e9, k = 0;
    cases.forEach((c, i) => { const r = c.getBoundingClientRect(), d = Math.abs(r.top + r.height / 2 - H() / 2); if (d < best) { best = d; k = i; } });
    if (k === on) return;
    on = k;
    cases.forEach((c, i) => (c.dataset.on = String(i === k)));
    titles.forEach((t, i) => t.setAttribute("aria-current", String(i === k)));
  };
  titles.forEach((t, i) => t.addEventListener("click", () => {
    const to = cases[i];
    if (!to) return;
    if (window.rkLenis) window.rkLenis.scrollTo(to, { offset: -innerHeight / 2 + to.offsetHeight / 2 });
    else to.scrollIntoView({ block: "center", behavior: "smooth" });
  }));
  // A ”View more” tag follows the cursor over the photo
  document.querySelectorAll(".case__shot > a").forEach((a) => {
    const tag = a.querySelector(".rk-follow");
    if (!tag) return;
    a.addEventListener("pointermove", (e) => {
      const r = a.getBoundingClientRect();
      tag.style.transform = `translate(${Math.min(e.clientX - r.left + 14, r.width - tag.offsetWidth)}px, ${Math.min(e.clientY - r.top + 14, r.height - tag.offsetHeight)}px)`;
    });
  });

  // Process: one scene per 1.3 screen heights — past halfway it moves to the next scene, and the bar below shows progress within that scene
  const track = document.querySelector(".proc__track");
  const scenes = [...document.querySelectorAll(".proc__scene")];
  const bars = [...document.querySelectorAll(".proc__bar li")];
  let scene = -1;
  const proc = () => {
    if (!track) return;
    const p = (scrollY - (track.getBoundingClientRect().top + scrollY)) / (1.3 * H());
    const k = Math.max(0, Math.min(scenes.length - 1, Math.round(p)));
    if (k !== scene) {
      scene = k;
      scenes.forEach((s, i) => s.classList.toggle("is-on", i === k));
      bars.forEach((b, i) => b.classList.toggle("is-on", i === k));
    }
    bars.forEach((b, i) => b.style.setProperty("--p", String(Math.max(0, Math.min(1, p - i + 0.5)))));
  };

  const tick = () => { pickCase(); proc(); };
  tick();
  addEventListener("scroll", tick, { passive: true });
  addEventListener("resize", tick);
})();
