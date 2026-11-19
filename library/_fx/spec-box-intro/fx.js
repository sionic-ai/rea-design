// On open, a blueprint layer is drawn for every element in the panel — a dashed box with corner brackets around the element, a ”name · width×height” dimension label above, passing through the box’s top and bottom edges,
// Horizontal guide lines and a vertical guide line passing the right edge. Horizontal lines go from the left with 1s expo.inOut (.04 stagger), vertical lines from the top .1s later (.06 stagger), and the box turns on from .35s over .3s
// The label is typed from .4s at .07 intervals with the symbol running ahead (.5s). On clearing (fx:clear or after hold seconds) label .4s → box .6s → the line folds to the opposite side in .9s and the layers are removed.
// Original Brand hero·subpage hero [data-bp] blueprint layer values.
(() => {
  const GLYPHS = "01<>/_#*+=-xyz";
  const scramble = (node, dur) => {
    const text = node.dataset.text || "";
    const s = { p: 0 };
    node.textContent = "";
    return gsap.to(s, {
      p: 1, duration: dur, ease: "none",
      onUpdate: () => {
        const n = Math.floor(s.p * text.length);
        let tail = "";
        for (let i = 0; i < Math.min(4, text.length - n); i++) tail += GLYPHS[(Math.random() * GLYPHS.length) | 0];
        node.textContent = text.slice(0, n) + tail;
      },
      onComplete: () => { node.textContent = text; },
    });
  };

  kfFx.register("spec-box-intro", (el, { options, reduce }) => {
    const specs = [...el.querySelectorAll('[data-fx-part="spec"]')];
    if (reduce || !specs.length) return;
    const layer = document.createElement("div");
    layer.className = "fx-sbi";
    layer.setAttribute("aria-hidden", "true");
    el.append(layer);
    const host = el.getBoundingClientRect();
    const boxes = [], labels = [], hs = new Set(), vs = new Set();
    specs.forEach((sp) => {
      const r = sp.getBoundingClientRect();
      const box = document.createElement("div");
      box.className = "fx-sbi__box";
      box.style.cssText = `left:${r.left - host.left}px;top:${r.top - host.top}px;width:${r.width}px;height:${r.height}px`;
      const label = document.createElement("span");
      label.className = "fx-sbi__label";
      label.dataset.text = `${sp.dataset.spec || sp.tagName.toLowerCase()} · ${Math.round(r.width)}×${Math.round(r.height)}`;
      box.append(label);
      layer.append(box);
      boxes.push(box);
      labels.push(label);
      hs.add(Math.round(r.top - host.top));
      hs.add(Math.round(r.bottom - host.top));
      vs.add(Math.round(r.right - host.left));
    });
    const line = (cls, prop, v) => { const g = document.createElement("span"); g.className = `fx-sbi__guide ${cls}`; g.style[prop] = `${v}px`; layer.append(g); return g; };
    const gh = [...hs].map((v) => line("fx-sbi__guide--h", "top", v));
    const gv = [...vs].map((v) => line("fx-sbi__guide--v", "left", v));
    gsap.set(gh, { scaleX: 0 });
    gsap.set(gv, { scaleY: 0 });
    gsap.set(boxes, { opacity: 0 });
    const draw = gsap.timeline({ delay: +(options.delay ?? 0) })
      .to(gh, { scaleX: 1, duration: 1, ease: "expo.inOut", stagger: 0.04 }, 0)
      .to(gv, { scaleY: 1, duration: 1, ease: "expo.inOut", stagger: 0.06 }, 0.1)
      .to(boxes, { opacity: 1, duration: 0.3, stagger: 0.07 }, 0.35);
    labels.forEach((l, i) => draw.add(scramble(l, 0.5), 0.4 + i * 0.07));
    let cleared = null, timer = 0;
    const clear = () => {
      if (cleared) return;
      clearTimeout(timer);
      cleared = gsap.timeline({ onComplete: () => layer.remove() })
        .to(labels, { opacity: 0, duration: 0.4, stagger: 0.03 })
        .to(boxes, { opacity: 0, duration: 0.6, stagger: 0.04 }, "<0.1")
        .to(gh, { scaleX: 0, transformOrigin: "right center", duration: 0.9, ease: "expo.inOut", stagger: 0.03 }, "<")
        .to(gv, { scaleY: 0, transformOrigin: "center bottom", duration: 0.9, ease: "expo.inOut" }, "<");
    };
    el.addEventListener("fx:clear", clear);
    if (options.hold !== "event") timer = setTimeout(clear, (+(options.delay ?? 0) + +(options.hold ?? 4.2)) * 1000);
    return () => {
      el.removeEventListener("fx:clear", clear);
      clearTimeout(timer);
      draw.kill();
      cleared?.kill();
      layer.remove();
    };
  });
})();
