// Event list parts — filter dropdown and result swapping. The original fetches results from the server on selection,
// The copy only shuffles the order, with the same motion (old cards up 20px .3s power2.in · .03s stagger → new cards from 20px below .5s power2.out · .04s stagger)
(() => {
  const RB = (window.RB = window.RB || {});
  RB.pageModules = RB.pageModules || [];
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const archive = (root) => $$("[data-events-archive]", root).map((block) => {
    const drops = $$("[data-events-dropdown]", block);
    const results = block.querySelector("[data-events-results]");
    let tl = null;
    const closeAll = (except) => drops.forEach((d) => d !== except && (d.removeAttribute("data-open"), d.querySelector("[data-events-dropdown-trigger]").setAttribute("aria-expanded", "false")));
    const swap = () => {
      tl?.kill();
      const items = [...results.children];
      if (reduce) return;
      tl = gsap.timeline()
        .to(items, { autoAlpha: 0, y: -20, duration: 0.3, ease: "power2.in", stagger: 0.03 })
        .add(() => { gsap.utils.shuffle(items).forEach((el) => results.append(el)); ScrollTrigger.refresh(); })
        .fromTo(() => [...results.children], { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.04, clearProps: "transform,opacity,visibility" });
    };
    const onClick = (e) => {
      const trig = e.target.closest("[data-events-dropdown-trigger]");
      if (trig) {
        const d = trig.closest("[data-events-dropdown]"), open = !d.hasAttribute("data-open");
        closeAll(d);
        d.toggleAttribute("data-open", open);
        trig.setAttribute("aria-expanded", String(open));
        return;
      }
      const opt = e.target.closest("[data-events-filter]");
      if (opt) {
        const d = opt.closest("[data-events-dropdown]");
        d.querySelector("[data-events-dropdown-label]").textContent = opt.textContent;
        const opts = [...d.querySelectorAll("[data-events-filter]")];
        opts.forEach((o) => o.setAttribute("aria-current", String(o === opt)));
        d.toggleAttribute("data-active", opt !== opts[0]);
        closeAll();
        swap();
      }
    };
    const onDoc = (e) => !block.contains(e.target) && closeAll();
    const onKey = (e) => e.key === "Escape" && closeAll();
    block.addEventListener("click", onClick);
    document.addEventListener("click", onDoc);
    document.addEventListener("keydown", onKey);
    return { freeze: () => closeAll(), destroy: () => { tl?.kill(); block.removeEventListener("click", onClick); document.removeEventListener("click", onDoc); document.removeEventListener("keydown", onKey); } };
  });

  RB.pageModules.push(archive);
})();
