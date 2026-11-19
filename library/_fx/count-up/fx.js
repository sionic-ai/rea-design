// Keeps the number cell as the original text (end value) and swaps in the start value on attach — if the script doesn’t run, the end value stays visible
(() => {
  kfFx.register("count-up", (el, { options, reduce, scroller }) => {
    gsap.registerPlugin(ScrollTrigger);
    const nums = [...el.querySelectorAll('[data-fx-part="num"]')];
    if (!nums.length && el.textContent.trim()) nums.push(el);
    const items = nums
      .map((n) => ({ n, text: n.textContent, to: parseFloat(n.dataset.to ?? n.textContent.replace(/[^\d.-]/g, "")), from: +(n.dataset.from ?? 0), dec: ((n.textContent.match(/\.(\d+)/) || [])[1] || "").length }))
      .filter((it) => Number.isFinite(it.to));
    if (!items.length) return;
    // round: the original floors decimals down to integers. With round it rounds, and with a number it keeps decimals to that place,
    // With text, each cell keeps the decimal places written in the text (5 · 7.2 on one line — as on a reference site)
    const fixAll = options.round === "round" ? Math.round : /^\d+$/.test(options.round || "") ? (v) => v.toFixed(+options.round) : Math.floor;
    const fixOf = (it) => (options.round === "text" ? (v) => (it.dec ? v.toFixed(it.dec) : String(Math.round(v))) : fixAll);
    // pad: on — while counting, pads the front with 0s to the digit count of the end value (000 → 600, Brand)
    const pad = options.pad === "on";
    // group: on — thousands comma on the integer part (1,380 · Brand)
    const group = options.group === "on";
    const fmt = (s) => (group ? s.replace(/^-?\d+/, (m) => Number(m).toLocaleString("en-US")) : s);
    const show = (it, v) => { const fix = fixOf(it); it.n.textContent = fmt(pad ? String(fix(v)).padStart(String(Math.round(it.to)).length, "0") : String(fix(v))); };
    // ring — a circle drawn around the number along with it (svg circle · path). Fills as much as the number out of max (default 100) (percent ring 0 → 50 on a product site)
    const max = +(options.max || 100);
    const rings = [...el.querySelectorAll('[data-fx-part="ring"]')].map((r) => {
      const len = r.getTotalLength?.() || 0;
      r.style.strokeDasharray = `${len}`;
      r.style.strokeDashoffset = `${len}`;
      return { r, len };
    });
    const draw = (v) => rings.forEach(({ r, len }) => { r.style.strokeDashoffset = `${len * (1 - Math.min(1, v / max))}`; });
    if (reduce) { items.forEach((it) => show(it, it.to)); draw(items[0].to); return () => items.forEach((it) => (it.n.textContent = it.text)); }
    const dur = +(options.dur ?? 2), delay = +(options.delay ?? 0), ease = kfFx.ease(options.ease || "power1.out", "power1.out");
    items.forEach((it) => show(it, it.from));
    const tweens = items.map((it, i) => {
      const o = { v: it.from };
      return gsap.to(o, {
        v: it.to, duration: dur, delay, ease, onUpdate: () => { show(it, o.v); if (i === 0) draw(o.v); },
        scrollTrigger: { trigger: el, ...(scroller && { scroller }), start: options.start || "top center" },
      });
    });
    return () => {
      tweens.forEach((t) => { t.scrollTrigger?.kill(); t.kill(); });
      items.forEach((it) => (it.n.textContent = it.text));
      rings.forEach(({ r }) => { r.style.removeProperty("stroke-dasharray"); r.style.removeProperty("stroke-dashoffset"); });
    };
  });
})();
