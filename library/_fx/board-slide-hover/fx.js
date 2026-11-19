(() => {
  // Original (menu, button and arrow cell): on hover, the current text (graphic) exits 100% toward the set side and the same one enters from the opposite side in .4s.
  // Nothing happens on leave — it runs once on each entry. Keyboard focus (:focus-visible) is also handled by hand
  kfFx.register("board-slide-hover", (el, { options, reduce, hover }) => {
    const boards = [...el.querySelectorAll('[data-fx-part="board"]')];
    if (!boards.length && el.firstElementChild) { el.setAttribute("data-fx-part", "board"); boards.push(el); }
    const sets = boards.map((b) => ({ b, tpl: b.firstElementChild?.cloneNode(true) })).filter((s) => s.tpl);
    if (!sets.length || reduce || !window.gsap) return;
    const dur = +(options.dur ?? 0.4), ease = kfFx.ease(options.ease || "0.4,0.2,0.12,0.96", "power3.out");
    const dirs = { top: [[0, -100], [0, 100]], right: [[100, 0], [-100, 0]], bottom: [[0, 100], [0, -100]], left: [[-100, 0], [100, 0]] };
    const run = () => sets.forEach(({ b, tpl }) => {
      const [out, inn] = dirs[b.dataset.dir || options.dir || "top"] || dirs.top;
      const old = [...b.children].filter((c) => !c.classList.contains("is-fx-out")), next = tpl.cloneNode(true);
      gsap.set(next, { xPercent: inn[0], yPercent: inn[1] });
      b.append(next);
      old.forEach((o) => o.classList.add("is-fx-out"));
      gsap.to(old, { xPercent: out[0], yPercent: out[1], duration: dur, ease, onComplete: () => old.forEach((o) => o.remove()) });
      gsap.to(next, { xPercent: 0, yPercent: 0, duration: dur, ease });
    });
    let on = false;
    const enter = () => { if (on) return; on = true; run(); };
    const leave = () => { on = false; };
    const focus = () => { if (el.matches(":focus-visible")) enter(); };
    if (hover) { el.addEventListener("mouseenter", enter); el.addEventListener("mouseleave", leave); }
    el.addEventListener("focus", focus); el.addEventListener("blur", leave);
    return () => {
      el.removeEventListener("mouseenter", enter); el.removeEventListener("mouseleave", leave); el.removeEventListener("focus", focus); el.removeEventListener("blur", leave);
      sets.forEach(({ b, tpl }) => { gsap.killTweensOf(b.children); b.replaceChildren(tpl.cloneNode(true)); });
    };
  });
})();
