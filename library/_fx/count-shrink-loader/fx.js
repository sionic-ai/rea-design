// The 4px bar (fill) at the bottom of the hero curtain fills over dur while the number (num) counts 00 → 100, and the mark inside the logo slot (logo) rises from below over 1s after .5s.
// When the bar is full and all documents have arrived, the count group moves down 2rem and fades over .3s, the big logo cell folds to the to size in 1s, and the veil clears .15s later over .3s. fx:done at .5s
(() => {
  kfFx.register("count-shrink-loader", (el, { options, reduce }) => {
    const part = (n) => el.querySelector(`[data-fx-part="${n}"]`);
    const fill = part("fill"), num = part("num"), logo = part("logo"), mark = part("mark"), veil = part("veil");
    const counts = [...el.querySelectorAll('[data-fx-part="count"]')];
    const dur = +(options.dur ?? 3.8), ease = kfFx.ease(options.ease || "power2.inOut", "power2.inOut");
    const [toW, toH] = String(options.to || "7.375rem 1.625rem").split(/\s+/);
    const shrink = +(options.shrink ?? 1), out = +(options.out ?? 0.3);
    const tell = () => el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true }));
    const made = [];
    const end = () => {
      if (fill) fill.style.width = "100%";
      if (logo) gsap.set(logo, { width: toW, height: toH });
      if (veil) gsap.set(veil, { opacity: 0, display: "none" });
      if (counts.length) gsap.set(counts, { opacity: 0 });
      if (num) num.textContent = "100";
      tell();
    };
    if (reduce || !dur) { end(); return () => {}; }
    let barDone = false, loaded = document.readyState === "complete";
    const close = () => {
      if (!barDone || !loaded) return;
      const tl = gsap.timeline();
      if (counts.length) tl.to(counts, { y: "2rem", opacity: 0, duration: out, ease: "power2.inOut" }, 0);
      if (logo) tl.to(logo, { width: toW, height: toH, duration: shrink, ease: "power2.inOut" }, 0);
      if (veil) tl.to(veil, { opacity: 0, duration: out, ease: "power2.inOut", onComplete: () => gsap.set(veil, { display: "none" }) }, 0.15);
      tl.call(tell, null, 0.5);
      made.push(tl);
    };
    const onLoad = () => { loaded = true; close(); };
    if (!loaded) addEventListener("load", onLoad, { once: true });
    if (fill) fill.style.width = "0%";
    if (mark) gsap.set(mark, { yPercent: 100 });
    const prog = { p: 0 };
    made.push(gsap.to(prog, { p: 1, duration: dur, ease,
      onUpdate() {
        if (fill) fill.style.width = `${prog.p * 100}%`;
        if (num) { const p = Math.round(this.progress() * 100); num.textContent = (p < 10 ? "0" : "") + p; }
      },
      onComplete() { if (num) num.textContent = "100"; barDone = true; close(); } }));
    if (mark) made.push(gsap.to(mark, { yPercent: 0, duration: 1, ease: "power2.inOut", delay: 0.5 }));
    return () => {
      removeEventListener("load", onLoad);
      made.forEach((m) => m.kill());
      const all = [fill, mark, logo, veil, ...counts].filter(Boolean);
      if (all.length) gsap.set(all, { clearProps: "all" });
    };
  });
})();
