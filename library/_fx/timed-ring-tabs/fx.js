// A time-driven switcher — pressing goes to that panel and restarts the count from zero (original TimedSwitcher: clearInterval then setInterval again)
(() => {
  const NS = "http://www.w3.org/2000/svg";
  kfFx.register("timed-ring-tabs", (el, { options, reduce }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (items.length < 2) return;
    const tabs = [...el.querySelectorAll('[data-fx-part="tab"]')];
    const prevs = [...el.querySelectorAll('[data-fx-part="prev"]')], nexts = [...el.querySelectorAll('[data-fx-part="next"]')];
    const every = +(options.every || 10);
    el.style.setProperty("--fx-every", `${every}s`);
    const rings = tabs.map((t) => {
      const svg = document.createElementNS(NS, "svg");
      svg.setAttribute("class", "fx-trt-ring");
      svg.setAttribute("viewBox", "0 0 100 100");
      svg.setAttribute("aria-hidden", "true");
      const c = document.createElementNS(NS, "circle");
      c.setAttribute("cx", "50"); c.setAttribute("cy", "50"); c.setAttribute("r", "50");
      svg.append(c);
      t.append(svg);
      return svg;
    });
    let i = 0, timer = 0;
    const show = (k) => {
      i = (k + items.length) % items.length;
      items.forEach((it, n) => it.classList.toggle("is-on", n === i));
      tabs.forEach((t, n) => { if (n === i) t.setAttribute("aria-current", "true"); else t.removeAttribute("aria-current"); });
    };
    const run = () => { clearInterval(timer); if (!reduce) timer = setInterval(() => show(i + 1), every * 1000); };
    const onTab = (e) => { e.preventDefault(); show(tabs.indexOf(e.currentTarget)); run(); };
    const onPrev = (e) => { e.preventDefault(); show(i - 1); run(); };
    const onNext = (e) => { e.preventDefault(); show(i + 1); run(); };
    tabs.forEach((t) => t.addEventListener("click", onTab));
    prevs.forEach((b) => b.addEventListener("click", onPrev));
    nexts.forEach((b) => b.addEventListener("click", onNext));
    show(0);
    run();
    return () => {
      clearInterval(timer);
      tabs.forEach((t) => { t.removeEventListener("click", onTab); t.removeAttribute("aria-current"); });
      prevs.forEach((b) => b.removeEventListener("click", onPrev));
      nexts.forEach((b) => b.removeEventListener("click", onNext));
      rings.forEach((r) => r.remove());
      items.forEach((it) => it.classList.remove("is-on"));
    };
  });
})();
