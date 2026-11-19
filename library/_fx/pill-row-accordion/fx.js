// Several upright panels — only the open one becomes a wide rounded panel (width = line width − folded panels, height 480, radius 20) and the rest are 95px pill columns (height 400, radius 47.5).
// When a hand is on a pillar (mouse only) its panel opens, changing width, height and corners over .75s power3.inOut, the vertical name switches off in .375s, and the text and images inside the panel
// Rises from 14px below after .26s, staggered .05s apart. Below 1024px they stack vertically and only the pressed panel opens in height (a studio’s service accordion)
(() => {
  kfFx.register("pill-row-accordion", (el, { options, reduce }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')].filter((i) => i.parentElement === el);
    if (!items.length) return;
    const o = {
      collapsed: +(options.collapsed ?? 95), height: +(options.height ?? 480), low: +(options.low ?? 400), gap: +(options.gap ?? 10),
      radius: +(options.radius ?? 20), bp: +(options.breakpoint ?? 1024), dur: +(options.dur ?? 0.75), ease: options.ease || "power3.inOut",
      stagger: +(options.stagger ?? 0.05), start: +(options.start ?? 0), hover: options.trigger !== "click",
    };
    const parts = items.map((item) => ({
      item,
      trigger: item.querySelector('[data-fx-part="trigger"]'),
      panel: item.querySelector('[data-fx-part="panel"]'),
      body: item.querySelector('[data-fx-part="body"]'),
      tab: item.querySelector('[data-fx-part="tab"]'),
      bits: [...item.querySelectorAll('[data-fx-part="reveal"]')],
    }));
    let mode = "stack", open = Math.min(Math.max(o.start, 0), items.length - 1), wide = 0, rem = 1;
    const modeNow = () => (innerWidth >= o.bp ? "row" : "stack");
    const measure = () => {
      rem = parseFloat(getComputedStyle(document.documentElement).fontSize) / 16 || 1;
      wide = el.clientWidth - (items.length - 1) * (o.collapsed + o.gap) * rem;
    };
    const sizeRow = () => {
      measure();
      el.style.gap = `${o.gap * rem}px`;
      el.style.height = `${o.height * rem}px`;
      parts.forEach(({ body }) => body && (body.style.width = `${wide}px`));
    };
    const clear = () => parts.forEach(({ item, panel, body, tab, bits }) => {
      gsap.killTweensOf([item, panel, tab, ...bits].filter(Boolean));
      gsap.set(item, { clearProps: "width,height,borderRadius" });
      if (panel) gsap.set(panel, { clearProps: "height" });
      if (body) body.style.removeProperty("width");
      const fade = [tab, ...bits].filter(Boolean);
      if (fade.length) gsap.set(fade, { clearProps: "opacity,visibility,transform" });
    });
    const mark = (i, on) => {
      const { item, trigger, panel } = parts[i];
      trigger?.setAttribute("aria-expanded", String(on));
      item.toggleAttribute("data-open", on);
      if (panel) panel.inert = !on;
    };
    const go = (n, instant = false) => {
      open = n;
      const d = instant || reduce ? 0 : o.dur;
      parts.forEach(({ item, panel, tab, bits }, i) => {
        const on = i === open;
        mark(i, on);
        if (mode === "row") {
          gsap.to(item, { width: on ? wide : o.collapsed * rem, height: (on ? o.height : o.low) * rem, borderRadius: (on ? o.radius : o.collapsed / 2) * rem, duration: d, ease: o.ease, overwrite: true });
          if (tab) gsap.to(tab, { opacity: on ? 0 : 1, duration: d * 0.5, delay: on ? 0 : d * 0.4, ease: "power2.out", overwrite: true });
        } else if (panel) {
          gsap.to(panel, { height: on ? "auto" : 0, duration: d * 0.8, ease: "power3.inOut", overwrite: true });
        }
        if (bits.length) gsap.to(bits, { autoAlpha: on ? 1 : 0, y: on ? 0 : 14, duration: d * 0.8, delay: on ? d * 0.35 : 0, stagger: on ? o.stagger : 0, ease: "power2.out", overwrite: true });
      });
      el.dispatchEvent(new CustomEvent("fx:open", { detail: { index: open } }));
    };
    const refresh = () => {
      clear();
      mode = modeNow();
      el.dataset.mode = mode;
      if (mode === "row") { sizeRow(); if (open < 0) open = Math.min(Math.max(o.start, 0), items.length - 1); }
      else { el.style.removeProperty("gap"); el.style.removeProperty("height"); }
      go(open, true);
    };
    const pick = (i) => (mode === "stack" ? go(i === open ? -1 : i) : i !== open && go(i));
    const offs = [];
    const on = (t, type, fn) => { t.addEventListener(type, fn); offs.push(() => t.removeEventListener(type, fn)); };
    parts.forEach(({ item, trigger }, i) => {
      if (trigger) {
        on(trigger, "click", () => pick(i));
        on(trigger, "focus", () => { if (mode === "row" && i !== open) go(i); });
      }
      on(item, "pointerenter", (e) => { if (mode === "row" && o.hover && e.pointerType === "mouse" && i !== open) go(i); });
    });
    let lastW = innerWidth;
    const onResize = () => {
      if (innerWidth === lastW) return;
      lastW = innerWidth;
      if (modeNow() !== mode) refresh();
      else if (mode === "row") { sizeRow(); go(open, true); }
    };
    addEventListener("resize", onResize);
    const ro = new ResizeObserver(() => { if (mode === "row") { const w = wide; sizeRow(); if (Math.abs(w - wide) > 1) go(open, true); } });
    ro.observe(el);
    refresh();
    return () => {
      removeEventListener("resize", onResize);
      ro.disconnect();
      offs.forEach((f) => f());
      clear();
      parts.forEach(({ panel }) => panel && (panel.inert = false));
      el.style.removeProperty("gap"); el.style.removeProperty("height");
      delete el.dataset.mode;
    };
  });
})();
