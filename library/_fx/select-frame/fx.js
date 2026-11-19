// One box layer per board — since moving to another layer must start from the previous position, don’t make a box per layer.
(() => {
  kfFx.register("select-frame", (el, { options, reduce, hover }) => {
    // On phone there is no picking as in the original. Nothing is hooked so presses aren’t intercepted
    if (!hover) return;
    const fly = +(options.fly ?? 0.45), pop = +(options.pop ?? 0.35);
    const showGuides = options.guides !== "0";
    const wrap = document.createElement("div");
    wrap.className = "fx-sf-layer";
    wrap.setAttribute("aria-hidden", "true");
    wrap.innerHTML = `<div class="fx-sf-guides"><i></i><i></i><i></i><i></i></div>
      <div class="fx-sf-hover"><span class="fx-sf-tag"></span></div>
      <div class="fx-sf-frame"><span class="fx-sf-tag"></span><span class="fx-sf-dim"></span>${["nw", "n", "ne", "e", "se", "s", "sw", "w"].map((h) => `<i data-h="${h}"></i>`).join("")}</div>`;
    document.body.append(wrap);
    const [guides, hoverBox, frame] = wrap.children;
    const lines = [...guides.children];
    const handles = [...frame.querySelectorAll("i")];
    const dim = frame.querySelector(".fx-sf-dim");
    const ac = new AbortController(), on = { signal: ac.signal };
    const move = { p: 1, from: null };
    let selected = null, hovered = null, raf = 0, tween = null, timer = 0;

    const layerOf = (t) => {
      const l = t instanceof Element ? t.closest('[data-fx-part="layer"]') : null;
      return l && el.contains(l) ? l : null;
    };
    const rectOf = (n) => { const r = n.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; };
    const place = (box, r) => {
      box.style.transform = `translate3d(${r.x}px, ${r.y}px, 0)`;
      box.style.width = `${r.w}px`;
      box.style.height = `${r.h}px`;
      box.dataset.top = r.y < 30 ? "in" : "out";
    };
    const tick = () => {
      raf = 0;
      if (selected && !selected.isConnected) select(null);
      if (selected) {
        const real = rectOf(selected);
        const f = move.from, p = move.p;
        const r = f && p < 1 ? { x: f.x + (real.x - f.x) * p, y: f.y + (real.y - f.y) * p, w: f.w + (real.w - f.w) * p, h: f.h + (real.h - f.h) * p } : real;
        place(frame, r);
        dim.textContent = `${Math.round(real.w)} × ${Math.round(real.h)}`;
        lines[0].style.transform = `translate3d(0, ${r.y}px, 0)`;
        lines[1].style.transform = `translate3d(0, ${r.y + r.h}px, 0)`;
        lines[2].style.transform = `translate3d(${r.x}px, 0, 0)`;
        lines[3].style.transform = `translate3d(${r.x + r.w}px, 0, 0)`;
      }
      if (hovered) place(hoverBox, rectOf(hovered));
      if (selected || hovered) raf = requestAnimationFrame(tick);
    };
    const wake = () => { if (!raf) raf = requestAnimationFrame(tick); };
    const select = (layer) => {
      if (layer === selected) return;
      const prev = selected;
      selected = layer;
      tween?.kill();
      if (!layer) {
        frame.removeAttribute("data-on");
        guides.removeAttribute("data-on");
      } else {
        frame.querySelector(".fx-sf-tag").textContent = layer.dataset.label || "";
        frame.setAttribute("data-on", "");
        showGuides && guides.setAttribute("data-on", "");
        if (prev && prev.isConnected && !reduce) {
          move.from = rectOf(prev);
          move.p = 0;
          tween = gsap.to(move, { p: 1, duration: fly, ease: "expo.out" });
        } else {
          move.from = null;
          if (!reduce) tween = gsap.fromTo(handles, { scale: 0 }, { scale: 1, duration: pop, ease: "back.out(2)", stagger: 0.02 });
        }
        if (hovered === layer) setHover(null);
      }
      el.dispatchEvent(new CustomEvent("fx:select", { detail: layer }));
      wake();
    };
    const setHover = (layer) => {
      hovered = layer && layer !== selected ? layer : null;
      if (hovered) {
        hoverBox.querySelector(".fx-sf-tag").textContent = hovered.dataset.label || "";
        hoverBox.setAttribute("data-on", "");
        wake();
      } else hoverBox.removeAttribute("data-on");
    };

    el.addEventListener("pointerover", (e) => setHover(layerOf(e.target)), on);
    el.addEventListener("pointerleave", () => setHover(null), on);
    document.addEventListener("pointerdown", (e) => {
      if (e.button !== 0 || e.pointerType === "touch") return;
      select(layerOf(e.target));
    }, on);
    addEventListener("keydown", (e) => e.key === "Escape" && select(null), on);
    if (options.auto != null) {
      timer = setTimeout(() => {
        const first = el.querySelector('[data-fx-part="layer"][data-selected]');
        if (!selected && first) select(first);
      }, +options.auto * 1000);
    }
    return () => {
      ac.abort();
      clearTimeout(timer);
      cancelAnimationFrame(raf);
      tween?.kill();
      wrap.remove();
    };
  });
})();
