// Wraps each line’s text in one layer and lifts it above the band, turning on at screen bottom +50px (turns off when scrolled back down — original .on toggle)
(() => {
  kfFx.register("marker-rise-title", (el, { options, reduce, scroller }) => {
    let lines = [...el.querySelectorAll('[data-fx-part="line"]')];
    if (!lines.length) { if (!el.textContent.trim()) return; el.classList.add("fx-mark-solo"); lines = [el]; }
    const wraps = lines.map((line) => {
      const tx = document.createElement("span");
      tx.className = "fx-mark-tx";
      tx.append(...line.childNodes);
      line.append(tx);
      return tx;
    });
    const off = [];
    const on = (v) => el.classList.toggle("fx-on", v);
    if (reduce) on(true);
    else if (options.on === "load") {
      const t = setTimeout(() => on(true), +(options.delay ?? 0) * 1000);
      off.push(() => clearTimeout(t));
    } else {
      gsap.registerPlugin(ScrollTrigger);
      const st = ScrollTrigger.create({
        trigger: el, scroller, start: "top+=50 bottom", end: "max",
        onToggle: (s) => { if (s.isActive || options.replay !== "off") on(s.isActive); },
      });
      off.push(() => st.kill());
    }
    return () => {
      off.forEach((f) => f());
      wraps.forEach((tx) => { tx.replaceWith(...tx.childNodes); });
      el.classList.remove("fx-on", "fx-mark-solo");
    };
  });
})();
