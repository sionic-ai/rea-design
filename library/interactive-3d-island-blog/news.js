// Post list — when opened, the list panel rises from 22% below in .76s (opacity .42s linear), and the field stays at the approached spot (bottom strip).
// With 「Sound on」, hovering a row shows the first sentence and a red sound bar instead of the summary. 「Back to the field」 lifts off as the board drops 6%, then goes to the Hero
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const reader = $(".bb-reader"), mast = $(".bb-mast");
  try { sessionStorage.removeItem("bb-walk"); } catch (e) { /* Without transition indicator */ }
  requestAnimationFrame(() => requestAnimationFrame(() => reader.setAttribute("data-shown", "")));
  reader.addEventListener("scroll", () => mast.toggleAttribute("data-veiled", reader.scrollTop > 8), { passive: true });

  const sound = $(".bb-reader__sound");
  let on = false;
  sound.addEventListener("click", () => {
    on = !on;
    sound.setAttribute("aria-pressed", String(on));
    sound.lastElementChild.textContent = on ? "Sound Off" : "Sound On";
  });
  $$(".bb-reader__row").forEach((row) => {
    // On hover the first sentence appears, and 220ms later when the preview starts the red sound bar moves (Sound on only turns on real sound — this frame has no sound)
    let t = 0;
    row.addEventListener("pointerenter", () => { row.setAttribute("data-voice", ""); clearTimeout(t); t = setTimeout(() => row.setAttribute("data-audible", ""), 220); });
    row.addEventListener("pointerleave", () => { clearTimeout(t); row.removeAttribute("data-voice"); row.removeAttribute("data-audible"); });
  });

  $$("a[data-back]").forEach((a) => a.addEventListener("click", (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    e.preventDefault();
    try { sessionStorage.setItem("bb-walk", "out"); } catch (err) { /* Simply skipped */ }
    if (reduce) { location.href = a.getAttribute("href"); return; }
    reader.setAttribute("data-closing", "");
    setTimeout(() => { location.href = a.getAttribute("href"); }, 480);
  }));
})();
