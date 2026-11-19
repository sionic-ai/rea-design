(() => {
  // Stretches the Q&A rows stickily — for each row, the top bar (question) and bottom panel (answer) are drawn in the same surface color and joined inside a gooey filter (blur 6 · alpha ×20 −9),
  // On click the answer panel grows with a 6px gap to the answer height over .5s expo.out, dropping out of the question bar like a water drop. The answer text rises .08s later from 8px below.
  // On closing, it shrinks along the same curve and melts back into the bar. With ”one: 1” only one opens at a time.
  let filterId = 0;
  kfFx.register("goo-accordion", (el, { options, reduce }) => {
    const rows = [...el.querySelectorAll('[data-fx-part="row"]')];
    if (!rows.length) return;
    const dur = reduce ? 0 : +(options.dur ?? 0.5), gap = +(options.gap ?? 6), one = +(options.one ?? 0) > 0;
    const id = `fx-goo-${++filterId}`;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("aria-hidden", "true"); svg.setAttribute("class", "fx-goo-accordion__defs");
    svg.innerHTML = `<filter id="${id}"><feGaussianBlur in="SourceGraphic" stdDeviation="6" result="b"/><feColorMatrix in="b" mode="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 20 -9"/></filter>`;
    el.prepend(svg);
    const made = [];
    const items = rows.map((row) => {
      const trig = row.querySelector('[data-fx-part="trigger"]'), panel = row.querySelector('[data-fx-part="panel"]');
      if (!trig || !panel) return null;
      const goo = document.createElement("div");
      goo.className = "fx-goo-accordion__goo"; goo.style.filter = `url(#${id})`;
      goo.innerHTML = '<i class="is-t"></i><i class="is-p"></i>';
      row.prepend(goo); made.push(goo);
      const body = panel.firstElementChild;
      trig.setAttribute("aria-expanded", "false");
      const it = { row, trig, panel, body, gp: goo.lastElementChild, open: false };
      const set = (on) => {
        it.open = on; row.classList.toggle("is-open", on); trig.setAttribute("aria-expanded", String(on));
        const th = trig.offsetHeight, h = on ? (body?.offsetHeight || panel.scrollHeight) : 0;
        gsap.to(panel, { height: h, duration: dur, ease: "expo.out" });
        gsap.to(it.gp, { height: h ? h + gap : 0, top: h ? th + gap : th, duration: dur, ease: "expo.out" });
        if (body) gsap.to(body, { autoAlpha: on ? 1 : 0, y: on ? 0 : 8, duration: on ? dur : Math.min(dur, 0.2), delay: on && dur ? 0.08 : 0, ease: "power2.out" });
      };
      it.click = () => { if (one && !it.open) items.forEach((o) => o && o !== it && o.open && o.set(false)); set(!it.open); };
      it.set = set;
      gsap.set(panel, { height: 0, overflow: "hidden" });
      if (body) gsap.set(body, { autoAlpha: 0, y: 8 });
      gsap.set(it.gp, { top: trig.offsetHeight, height: 0 });
      gsap.set(goo.firstElementChild, { height: trig.offsetHeight });
      trig.addEventListener("click", it.click);
      return it;
    });
    return () => {
      items.forEach((it) => { if (!it) return; it.trig.removeEventListener("click", it.click); gsap.killTweensOf([it.panel, it.gp, it.body].filter(Boolean)); gsap.set([it.panel, it.body].filter(Boolean), { clearProps: "all" }); it.row.classList.remove("is-open"); });
      made.forEach((g) => g.remove()); svg.remove();
    };
  });
})();
