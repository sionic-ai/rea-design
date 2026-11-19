// Measure the title width first and fix it, then grow only the outer frame’s width from 0 → 100% — the inner text stays tied to its own width so the lines don’t reflow and are revealed from the left.
// A faint shadow copy sits shift to the right showing the spot before painting, and is removed after hold seconds (look: fade sits in place and starts clearing .6s late)
(() => {
  kfFx.register("ghost-wipe-title", (el, { options, reduce, scroller }) => {
    if (!el.textContent.trim()) return;
    const html = el.innerHTML;
    const delay = +(options.delay ?? 0.5), hold = +(options.hold ?? 1), offset = +(options.offset ?? 100), pad = +(options.pad ?? 20);
    if (options.dur != null) el.style.setProperty("--fx-dur", `${+options.dur}s`);
    if (options.shift != null) el.style.setProperty("--fx-shift", `${+options.shift}px`);
    const main = document.createElement("span"), ink = document.createElement("span");
    main.className = "fx-gw__main"; ink.className = "fx-gw__ink";
    ink.innerHTML = html;
    main.append(ink);
    el.replaceChildren(main);
    if (reduce) { el.classList.add("fx-gw-on"); return () => { el.innerHTML = html; el.classList.remove("fx-gw-on"); }; }

    const ghost = document.createElement("span"), ghostInk = document.createElement("span");
    ghost.className = "fx-gw__ghost"; ghostInk.className = "fx-gw__ink-ghost";
    ghost.setAttribute("aria-hidden", "true");
    ghostInk.innerHTML = html;
    ghost.append(ghostInk);
    el.append(ghost);
    const w = main.offsetWidth + pad;
    el.style.width = `${w}px`;
    ink.style.width = `${w}px`;
    el.classList.add("fx-gw-armed");
    let t1 = 0, t2 = 0, done = false;
    const cleanup = () => {
      el.style.removeProperty("width");
      ink.style.removeProperty("width");
      ghost.remove();
    };
    const fire = () => {
      if (done) return;
      done = true;
      t1 = setTimeout(() => {
        el.classList.add("fx-gw-on");
        t2 = setTimeout(cleanup, hold * 1000);
      }, delay * 1000);
    };
    const st = ScrollTrigger.create({ trigger: el, scroller, start: `top+=${offset} bottom`, end: "max", once: true, onEnter: fire });
    return () => {
      st.kill(); clearTimeout(t1); clearTimeout(t2);
      el.classList.remove("fx-gw-armed", "fx-gw-on");
      el.style.removeProperty("width"); el.style.removeProperty("--fx-dur"); el.style.removeProperty("--fx-shift");
      el.innerHTML = html;
    };
  });
})();
