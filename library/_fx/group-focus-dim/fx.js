(() => {
  kfFx.register("group-focus-dim", (el, { options, hover }) => {
    if (!hover) return;
    const items = () => [...el.querySelectorAll('[data-fx-part="item"]')];
    if (options.dim != null) el.style.setProperty("--fx-dim", options.dim);
    const hidden = () => (options.hide ? [...document.querySelectorAll(options.hide)] : []);
    const fade = (v) => { const h = hidden(); if (h.length) gsap.to(h, { opacity: v, duration: 0.25, ease: "power1.out", overwrite: "auto" }); };
    let t = 0;
    const focus = (g) => { clearTimeout(t); items().forEach((it) => it.classList.toggle("fx-dim", it.dataset.group !== g)); fade(0); };
    const release = () => { clearTimeout(t); t = setTimeout(() => { items().forEach((it) => it.classList.remove("fx-dim")); fade(1); }, 0); };
    const over = (e) => { const it = e.target.closest?.('[data-fx-part="item"]'); if (it && el.contains(it)) focus(it.dataset.group); };
    const out = (e) => { const it = e.target.closest?.('[data-fx-part="item"]'); if (it && !it.contains(e.relatedTarget)) release(); };
    el.addEventListener("mouseover", over);
    el.addEventListener("mouseout", out);
    el.addEventListener("mouseleave", release);
    return () => { clearTimeout(t); el.removeEventListener("mouseover", over); el.removeEventListener("mouseout", out); el.removeEventListener("mouseleave", release); items().forEach((it) => it.classList.remove("fx-dim")); { const h = hidden(); if (h.length) gsap.set(h, { clearProps: "opacity" }); } el.style.removeProperty("--fx-dim"); };
  });
})();
