// The ring graphic is run by keyframes in fx.css switched by the hover state (:hover) — here the ring SVG is drawn in (gradient id separate per button), and it only floats up once when entering the screen
(() => {
  let n = 0;
  const svg = (id) =>
    `<svg class="fx-rr__svg" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><defs><linearGradient id="${id}" x1="90.48%" y1="77.1%" x2="13.07%" y2="15%">` +
    `<stop offset="0" style="stop-color: var(--fx-ring-a, var(--kf-accent-text))"/><stop offset=".487" style="stop-color: var(--fx-ring-b, var(--kf-accent))"/><stop offset="1" style="stop-color: var(--fx-ring-c, var(--kf-accent))"/></linearGradient></defs>` +
    `<circle class="fx-rr__c fx-rr__c--base" cx="15.8" cy="15.8" r="15.35" fill="none" stroke="url(#${id})"/>` +
    `<circle class="fx-rr__c fx-rr__c--track" cx="15.8" cy="15.8" r="15.35" fill="none"/>` +
    `<circle class="fx-rr__c fx-rr__c--draw" cx="15.8" cy="15.8" r="15.35" fill="none" stroke="url(#${id})"/>` +
    `<g transform="translate(13.5 15.5) rotate(-45) scale(.38)"><rect class="fx-rr__arrow" x="0" y="6" width="8" height="2"/><rect class="fx-rr__arrow" transform="translate(7 4) rotate(-270) translate(-7 -4)" x="3" y="3" width="8" height="2"/></g></svg>`;

  kfFx.register("ring-redraw-btn", (el, { options, reduce, scroller }) => {
    const icon = el.querySelector('[data-fx-part="icon"]');
    if (!icon) return;
    const made = !icon.querySelector("svg");
    if (made) icon.innerHTML = svg(`fx-rr-${++n}`);
    const enter = options.enter !== "none" && !reduce;
    let io = null;
    if (enter) {
      el.classList.add("fx-rr-armed");
      // Fires once when it reaches the line at the screen bottom minus start (default 20%)
      const start = parseFloat(options.start ?? 20);
      io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { el.classList.add("fx-rr-in"); io.disconnect(); } }), { root: scroller || null, rootMargin: `0px 0px -${start}% 0px`, threshold: 0 });
      io.observe(el);
    }
    return () => { io?.disconnect(); el.classList.remove("fx-rr-armed", "fx-rr-in"); if (made) icon.replaceChildren(); };
  });
})();
