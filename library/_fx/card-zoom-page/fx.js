// Card cell turns into a page transition (the Brand hero): the triple-size panel inside the card (shrunk to 1/3) is scaled back up 3x so the pressed cell covers the screen, then it goes to that address.
// Cell width goes from the current width (like 43·33·24%) → an equally divided width, the panel stretches to cell count × screen width and is pulled up by the card top (1s cubic-bezier(.54,.15,.15,1)).
// On return (coming back to this card in the same tab) it starts from that cell and shrinks into the card in 1s cubic-bezier(.85,0,.45,.85). On phones (under 1024) the cells stack vertically and unfold vertically.
(() => {
  const KEY = "kf-card-zoom";
  kfFx.register("card-zoom-page", (el, { options, reduce }) => {
    const scale = el.querySelector('[data-fx-part="scale"]'), stretch = el.querySelector('[data-fx-part="stretcher"]');
    const cols = [...el.querySelectorAll('[data-fx-part="column"]')];
    if (!scale || !stretch || !cols.length) return;
    const n = cols.length;
    const dur = reduce ? 0 : +(options.dur ?? 1);
    const easeIn = kfFx.ease(options.ease || "0.54,0.15,0.15,1", "power3.inOut");
    const easeOut = kfFx.ease(options["out-ease"] || "0.85,0,0.45,0.85", "power2.inOut");
    const wide = () => matchMedia("(min-width: 1024px)").matches;
    const gap = () => window.innerWidth - document.documentElement.clientWidth;
    const widths = () => cols.map((c) => `${(c.getBoundingClientRect().width / stretch.getBoundingClientRect().width) * 100}%`);
    const even = `${100 / n - 0.0001}%`;
    // The share to shift the panel so that cell k is on screen — what % of the panel width (cell count × screen)
    const shiftOf = (k) => `${(300 * ((n - 1) / 2 - k)) / n}%`;
    const zoomed = (k, top) => (wide()
      ? { width: (innerWidth - gap()) * n, y: -top * 3, scale: 3, x: shiftOf(k) }
      : { width: innerWidth, height: innerHeight * n, scale: 3, y: -(top * 3 + innerHeight * k * 3) });
    let tl = null, busy = false;

    const go = (e) => {
      const link = e.target.closest("a[href]");
      const col = link && cols.find((c) => c.contains(link));
      if (!col || busy || e.metaKey || e.ctrlKey || e.button) return;
      e.preventDefault();
      busy = true;
      const k = cols.indexOf(col), top = el.getBoundingClientRect().top, from = widths();
      tl = gsap.timeline({ onComplete: () => { sessionStorage.setItem(KEY, String(k)); location.href = link.href; } });
      tl.fromTo(el, { "--fx-progress": 1 }, { "--fx-progress": 0, duration: dur, ease: easeIn }, 0);
      tl.to(stretch, { ...zoomed(k, top), duration: dur, ease: easeIn }, 0);
      cols.forEach((c, i) => tl.fromTo(c, wide() ? { width: from[i] } : { height: c.style.height || "32%" }, { ...(wide() ? { width: even } : { height: `${100 / n - 0.0001}%`, padding: 0, marginBottom: 0 }), duration: dur, ease: easeIn }, 0));
      el.dispatchEvent(new CustomEvent("fx:card-zoom-page", { bubbles: true, detail: { index: k, href: link.href, dir: "in" } }));
    };
    el.addEventListener("click", go);

    // Return path: start with that cell stretched to full screen, then shrink it to a card
    const back = sessionStorage.getItem(KEY);
    if (back !== null && options.back !== "0") {
      sessionStorage.removeItem(KEY);
      const k = Math.min(n - 1, Math.max(0, +back)), top = el.getBoundingClientRect().top, to = widths();
      gsap.set(stretch, zoomed(k, top));
      cols.forEach((c) => gsap.set(c, wide() ? { width: even } : { height: `${100 / n - 0.0001}%`, padding: 0, marginBottom: 0 }));
      tl = gsap.timeline({ delay: 0.02 });
      tl.fromTo(el, { "--fx-progress": 0 }, { "--fx-progress": 1, duration: dur, ease: easeOut }, 0);
      tl.to(stretch, { width: () => scale.getBoundingClientRect().width * 3, height: wide() ? undefined : () => scale.getBoundingClientRect().height * 3, x: 0, y: 0, scale: 1, duration: dur, ease: easeOut, clearProps: "all" }, 0);
      cols.forEach((c, i) => tl.to(c, { ...(wide() ? { width: to[i] } : {}), duration: dur, ease: easeOut, clearProps: "all" }, 0));
    }
    return () => {
      el.removeEventListener("click", go);
      tl?.kill();
      gsap.set([stretch, ...cols, el], { clearProps: "all" });
    };
  });
})();
