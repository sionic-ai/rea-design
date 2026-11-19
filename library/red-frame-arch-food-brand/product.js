// Motion unique to the product About page: the production flow slider — the same Splide as the original (one slide per .6s, snap to end, drag flickPower 600) with
// Sets the progress bar and the arrows that turn off at both ends using the original formula (last cell’s right edge within panel right +5px · within 2px at the start).
(() => {
  const flow = document.querySelector("[data-flow]");
  if (!flow) return;
  const prev = flow.querySelector("[data-flow-prev]");
  const next = flow.querySelector("[data-flow-next]");
  const fill = flow.querySelector("[data-flow-fill]");
  const s = new Splide(flow.querySelector(".p-flow__slider"), {
    type: "slide", perPage: "auto", autoWidth: true, gap: "10px", pagination: false, arrows: false, drag: true,
    flickMaxPages: 1, perMove: 1, focus: 0, trimSpace: true, speed: 600, flickPower: 600, breakpoints: { 768: { gap: "12px" } },
  });
  prev?.addEventListener("click", () => s.go("<"));
  next?.addEventListener("click", () => s.go(">"));
  s.on("mounted moved scrolled resized updated", () => {
    const move = s.Components.Move;
    const pos = move.getPosition(), lim = move.getLimit(true);
    const slides = s.Components.Slides.get();
    const last = slides[slides.length - 1]?.slide, track = s.root.querySelector(".splide__track");
    const atEnd = (last && track && last.getBoundingClientRect().right <= track.getBoundingClientRect().right + 5) || (Number.isFinite(pos) && Number.isFinite(lim) && Math.abs(pos - lim) <= 5);
    const atStart = !Number.isFinite(pos) || Math.abs(pos) <= 2;
    if (fill) fill.style.width = `${100 * (atEnd ? 1 : Number.isFinite(pos) && Number.isFinite(lim) && lim !== 0 ? Math.min(Math.max(pos / lim, 0), 1) : 1)}%`;
    if (prev) prev.disabled = atStart;
    if (next) next.disabled = atEnd;
  });
  s.mount();
})();
