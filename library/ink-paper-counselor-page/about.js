// About — hero title and name letters entrance, numbered paragraphs (the number sets first, then the paragraph follows), certificate mosaic (hover a list item to bring that card forward · click to enlarge)
(() => {
  const EG = window.EG;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const head = EG.charReveal($(".eg-pagehead__title"));
  const name = EG.charReveal($(".eg-ahero__name"), { span: 1 });
  EG.onIntro(() => { if (reduce) { head.progress(1); name.progress(1); return; } head.play(); name.delay(0.3).play(); });

  // Numbered paragraphs: the number settles in 1.35s from a 4px blur and .28em below, and from .18s later each paragraph follows .15s before the previous one ends
  $$(".eg-sitem").forEach((item) => {
    const num = $(".eg-sitem__num", item);
    const paras = $$("p", item).map((p) => EG.lineReveal(p));
    gsap.set(num, { autoAlpha: 0, filter: "blur(4px)", y: "0.28em" });
    const play = () => {
      if (reduce) { gsap.set(num, { autoAlpha: 1, filter: "none", y: 0 }); paras.forEach((t) => t.progress(1)); return; }
      gsap.to(num, { autoAlpha: 1, filter: "blur(0px)", y: 0, duration: 1.35, ease: "power2.out" });
      let at = 0.18;
      paras.forEach((t) => { t.delay(at).play(); at += Math.max(0, t.duration() - 0.15); });
    };
    ScrollTrigger.create({ trigger: item, start: "top 90%", once: true, onEnter: play });
  });

  // Certificates: hovering either the list or the mosaic lights up its pair together
  const items = $$(".eg-mosaic__item"), rows = $$(".eg-dlist__item");
  const pick = (i) => { items.forEach((m) => m.classList.toggle("is-on", +m.dataset.i === i)); rows.forEach((r) => r.classList.toggle("is-on", +r.dataset.i === i)); };
  pick(0);
  [...items, ...rows].forEach((el) => { el.addEventListener("pointerenter", () => pick(+el.dataset.i)); el.addEventListener("focus", () => pick(+el.dataset.i)); });

  // Enlarge: the mosaic section clears downward (.85s) and the window opens top to bottom. Reverse with close, overlay, Esc
  const modal = $(".eg-modal");
  let opened = null, closeT = 0;
  // As in the original, it opens only while idle — presses during opening, open, and closing are dropped
  const open = (i) => {
    if (!modal.hidden) return;
    opened = items[i];
    opened?.classList.add("is-zoomed");
    modal.hidden = false;
    modal.classList.remove("is-closing");
    requestAnimationFrame(() => requestAnimationFrame(() => modal.classList.add("is-open")));
    EG.lock(true);
    $(".eg-modal__close", modal).focus({ preventScroll: true });
  };
  const close = () => {
    if (modal.hidden || modal.classList.contains("is-closing")) return;
    modal.classList.remove("is-open");
    modal.classList.add("is-closing");
    EG.lock(false);
    closeT = setTimeout(() => { modal.hidden = true; modal.classList.remove("is-closing"); opened?.classList.remove("is-zoomed"); opened?.focus({ preventScroll: true }); }, reduce ? 0 : 850);
  };
  items.forEach((m) => m.addEventListener("click", () => open(+m.dataset.i)));
  rows.forEach((r) => { r.addEventListener("click", () => open(+r.dataset.i)); r.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(+r.dataset.i); } }); });
  $(".eg-modal__close", modal).addEventListener("click", close);
  $(".eg-modal__backdrop", modal).addEventListener("click", close);
  addEventListener("keydown", (e) => e.key === "Escape" && close());
})();
