(() => {
  // Original bank side menu: pressing ☰ lays down an overlay, and a white panel hidden behind the card unfolds to the right in 0.3s, then once the panel is fully open, the list rows
  // Lines enter from 50px to the left, 0.2s each at 0.05s intervals. Switching to a different ☰ withdraws the old lines (0.175s after the first line ends) and sets up the new ones.
  // The ☰ inside the panel unfolds the gray 3-tier panel the same way. Cover or Esc makes the line vanish in 0.2s and the panel fold.
  kfFx.register("flyout-lineup-menu", (el, { options, reduce }) => {
    const parts = (role, root = el) => [...root.querySelectorAll(`[data-fx-part="${role}"]`)];
    const panel = parts("panel")[0];
    if (!panel || !parts("open").length) return;
    const panel3 = parts("panel3")[0], scrim = parts("scrim")[0];
    const k = reduce ? 0 : 1;
    const W = { closed: panel.offsetWidth, open: +(options.width ?? 496), open3: +(options.width3 ?? 750) };
    const T = { dur: +(options.dur ?? 0.3) * k, row: +(options.row ?? 0.2) * k, each: +(options.each ?? 0.05) * k, swap: +(options.swap ?? 0.175) * k, fade: +(options.fade ?? 0.2) * k };
    const from = +(options.from ?? -50);
    const ease = kfFx.ease("0.25,0.1,0.25,1", "power1.inOut");
    const listOf = (key) => parts("list").find((l) => l.dataset.key === key);
    const rowsOf = (list) => [...list.querySelectorAll("li")];
    const headsOf = (list) => parts("head", list);
    const ac = new AbortController(), on = { signal: ac.signal };
    let cur = null, cur3 = null, calls = [];
    const later = (fn, s) => calls.push(gsap.delayedCall(s, fn));
    const clearLater = () => { calls.forEach((c) => c.kill()); calls = []; };

    const lineup = (list) => {
      if (!list) return;
      gsap.killTweensOf([list, ...rowsOf(list), ...headsOf(list)]);
      gsap.set(list, { display: "block", opacity: 1 });
      const heads = headsOf(list);
      if (heads.length) gsap.fromTo(heads, { opacity: 0 }, { opacity: 1, duration: 0.3 * k, ease: "power1.out" });
      // The first line starts slightly early at -0.025s (original nth-child delays -0.025 · 0.025 · 0.075 …)
      rowsOf(list).forEach((r, i) => gsap.fromTo(r, { x: from, opacity: 0 }, { x: 0, opacity: 1, duration: T.row, ease, delay: Math.max(0, i * T.each - 0.025 * k) }));
    };
    const putAway = (list) => {
      if (!list) return;
      rowsOf(list).forEach((r, i) => gsap.to(r, { x: from, opacity: 0, duration: T.row, ease, delay: Math.max(0, i * T.each - 0.025 * k) }));
      if (headsOf(list).length) gsap.to(headsOf(list), { opacity: 0, duration: 0.3 * k, ease: "power1.out" });
    };
    const hide = (list) => list && gsap.set(list, { display: "none" });
    const mark = (btn, yes) => btn && btn.classList.toggle("is-on", yes);
    parts("list").forEach(hide);

    const open = (btn) => {
      if (btn === cur) return;
      clearLater();
      const next = listOf(btn.dataset.key);
      if (!cur) {
        el.classList.add("is-open");
        if (scrim) { gsap.set(scrim, { display: "block" }); gsap.to(scrim, { opacity: 1, duration: 0.3 * k, ease: "power1.out" }); }
        gsap.to(panel, { width: W.open, duration: T.dur, ease, onComplete: () => lineup(next) });
      } else {
        const old = listOf(cur.dataset.key);
        putAway(old);
        close3();
        later(() => { hide(old); lineup(next); }, T.swap);
      }
      mark(cur, false); mark(btn, true); cur = btn;
    };
    const open3 = (btn) => {
      if (!panel3 || btn === cur3) return;
      const next = listOf(btn.dataset.key);
      if (!cur3) gsap.to(panel3, { width: W.open3, duration: T.dur, ease, onComplete: () => lineup(next) });
      else { const old = listOf(cur3.dataset.key); putAway(old); later(() => { hide(old); lineup(next); }, T.swap); }
      mark(cur3, false); mark(btn, true); cur3 = btn;
    };
    function close3() {
      if (!cur3 || !panel3) return;
      const old = listOf(cur3.dataset.key);
      putAway(old);
      later(() => hide(old), T.swap);
      gsap.to(panel3, { width: W.closed, duration: T.dur, ease });
      mark(cur3, false); cur3 = null;
    }
    const close = () => {
      if (!cur) return;
      clearLater();
      const shown = parts("list").filter((l) => l.style.display !== "none");
      gsap.to(shown, { opacity: 0, duration: T.fade, ease: "sine.inOut" });
      later(() => {
        shown.forEach(hide);
        gsap.to([panel, panel3].filter(Boolean), { width: W.closed, duration: T.dur, ease });
        if (scrim) gsap.to(scrim, { opacity: 0, duration: 0.3 * k, ease: "power1.out", onComplete: () => gsap.set(scrim, { display: "none" }) });
        el.classList.remove("is-open");
      }, T.fade);
      mark(cur, false); mark(cur3, false); cur = cur3 = null;
    };

    el.addEventListener("click", (e) => {
      const b = e.target.closest('[data-fx-part="open"], [data-fx-part="open3"]');
      if (!b || !el.contains(b)) return;
      e.preventDefault();
      b.dataset.fxPart === "open3" ? open3(b) : open(b);
    }, on);
    scrim?.addEventListener("click", close, on);
    parts("close").forEach((b) => b.addEventListener("click", close, on));
    document.addEventListener("keydown", (e) => e.key === "Escape" && close(), on);
    return () => {
      ac.abort(); clearLater();
      const all = [panel, panel3, scrim, ...parts("list"), ...parts("list").flatMap((l) => [...rowsOf(l), ...headsOf(l)])].filter(Boolean);
      gsap.killTweensOf(all);
      gsap.set(all, { clearProps: "all" });
      parts("open").concat(parts("open3")).forEach((b) => b.classList.remove("is-on"));
      el.classList.remove("is-open");
    };
  });
})();
