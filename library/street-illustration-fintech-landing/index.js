// Home only: the application card in the hero, three swipers (reviews · topics · number cards on the phone).
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const slot = document.querySelector(".ix-kv-cta");
  if (slot && window.thCta) slot.outerHTML = window.thCta(false).replace('class="th-cta"', 'class="th-cta" data-slot="hero-cta"');
  window.thArrows?.();

  const ARROW = '<svg viewBox="0 0 24 24"><path d="M8.6 4.6 16 12l-7.4 7.4-1.8-1.8L12.4 12 6.8 6.4z"/></svg>';
  const arrows = (root) => {
    const box = root.querySelector(".splide__arrows");
    if (box && !box.children.length) box.innerHTML = `<button class="splide__arrow splide__arrow--prev" type="button">${ARROW}</button><button class="splide__arrow splide__arrow--next" type="button">${ARROW}</button>`;
  };
  const count = (s, root) => {
    const cur = root.querySelector(".ix-num .current"), tot = root.querySelector(".ix-num .total");
    if (cur) cur.textContent = s.index + 1;
    if (tot) tot.textContent = s.length;
  };
  if (!window.Splide) return;

  // Reviews: every 3.6s to the next in .6s, center-aligned loop, slide width is its own (phone 32px · wide screen 67px gap)
  const voice = document.querySelector(".ix-vs");
  if (voice) {
    arrows(voice);
    const s = new Splide(voice, { type: "loop", autoWidth: true, focus: "center", gap: "67px", speed: reduce ? 0 : 600, interval: 3600, autoplay: !reduce, pauseOnHover: false, pauseOnFocus: false, breakpoints: { 767: { gap: "32px" } } });
    s.on("ready move", () => count(s, voice));
    s.mount();
  }

  // Topic: same Tempo, the page indicator bar restarts from the beginning on each turn (autoplay paused briefly then resumed)
  const topics = document.querySelector(".ix-topics");
  if (topics) {
    arrows(topics);
    const s = new Splide(topics, { type: "loop", autoWidth: true, focus: "center", gap: "50px", speed: reduce ? 0 : 600, interval: 3600, autoplay: reduce ? false : "pause", pauseOnHover: false, pauseOnFocus: false, mediaQuery: "max", breakpoints: { 767: { gap: "20px" } } });
    s.on("ready", () => { count(s, topics); s.Components.Autoplay?.play(); });
    s.mount();
    s.on("move", () => { count(s, topics); const a = s.Components.Autoplay; if (!a || reduce) return; a.pause(); requestAnimationFrame(() => a.play()); });
  }

  // Number cards: swipe only on phones (768px and up unfolds into a three-column grid)
  const ig = document.querySelector(".ix-ig");
  if (ig) {
    arrows(ig);
    const wide = matchMedia("(min-width: 768px)");
    let s = null;
    const make = () => {
      if (wide.matches) { s?.destroy(); s = null; return; }
      s = new Splide(ig, { type: "loop", autoWidth: true, focus: "center", gap: "25px", speed: reduce ? 0 : 600, interval: 3600, autoplay: !reduce, pauseOnHover: false, pauseOnFocus: false });
      s.on("ready move", () => count(s, ig));
      s.mount();
    };
    make();
    wide.addEventListener("change", make);
  }
})();
