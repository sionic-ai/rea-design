// Worldview story — regional scene pin section: pinned for scene count − 1 screens, and as progress advances the next scene is cut and peeled from bottom to top (inset)
// The previous scene is pushed up 20%. Text·progress bar·number change in the same place. Timeline·lookbook change by pressing cells.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const glitch = (el) => el?.dispatchEvent(new Event("fx:glitch"));
  const blink = (el) => { if (!reduce && el) el.animate([{ opacity: 1 }, { opacity: 0 }, { opacity: 1 }, { opacity: 0 }, { opacity: 1 }], { duration: 120, easing: "steps(1, end)" }); };

  const story = document.querySelector(".story");
  if (story) {
    const layers = [...story.querySelectorAll("[data-layer]")], copies = [...story.querySelectorAll("[data-copy]")];
    const bar = story.querySelector(".story__bar"), now = story.querySelector("[data-count-now]");
    const n = layers.length - 1, PUSH = 20;
    let shown = 0;
    const clamp = (v) => Math.max(0, Math.min(1, v));
    const draw = (p) => {
      const r = p * n;
      layers.forEach((l, e) => {
        const c = clamp(r - e + 1);
        l.style.clipPath = `inset(${((1 - c) * 100).toFixed(2)}% 0 0 0)`;
        const y = c >= 1 ? -clamp(r - e) * PUSH : (1 - c) * PUSH;
        l.firstElementChild.style.transform = `translateY(${y.toFixed(2)}%)`;
      });
      const idx = Math.min(Math.floor(p * layers.length), layers.length - 1);
      if (idx !== shown) {
        shown = idx;
        copies.forEach((c, i) => { c.hidden = i !== idx; });
        blink(copies[idx]);
        glitch(layers[idx].firstElementChild);
        if (now) now.textContent = String(idx + 1).padStart(2, "0");
      }
      bar?.style.setProperty("--progress", `${(p * 100).toFixed(1)}%`);
    };
    if (reduce) draw(0);
    else ScrollTrigger.create({ trigger: story, start: "top top", end: () => `+=${n * 100}%`, pin: true, pinSpacing: true, scrub: true, invalidateOnRefresh: true, onUpdate: (st) => draw(st.progress), onRefresh: (st) => draw(st.progress) });
  }

  // Timeline — click a cell with a year or use the arrows to move. The line of the current cell turns white over .45s
  const segs = [...document.querySelectorAll("[data-seg].is-key")], year = document.querySelector("[data-seg-year]"), lore = document.querySelector(".lore__gl");
  let at = 0;
  const pickSeg = (i) => {
    at = (i + segs.length) % segs.length;
    document.querySelectorAll("[data-seg]").forEach((s) => s.classList.remove("is-on"));
    segs[at].classList.add("is-on");
    if (year) { year.textContent = segs[at].textContent.trim(); blink(year.parentElement); }
    glitch(lore);
  };
  segs.forEach((s, i) => s.addEventListener("click", () => pickSeg(i)));
  document.querySelector("[data-seg-prev]")?.addEventListener("click", () => pickSeg(at - 1));
  document.querySelector("[data-seg-next]")?.addEventListener("click", () => pickSeg(at + 1));

  // Lookbook — thumbnails swap the large scene
  const looks = [...document.querySelectorAll("[data-look]")], lname = document.querySelector("[data-look-name]"), big = document.querySelector(".look__gl");
  let li = 0;
  const pickLook = (i) => {
    li = (i + looks.length) % looks.length;
    looks.forEach((t, j) => t.classList.toggle("is-on", j === li));
    if (lname) { lname.textContent = looks[li].querySelector(".thumb__name").textContent; blink(lname); }
    glitch(big);
  };
  looks.forEach((t, i) => t.addEventListener("click", () => pickLook(i)));
  document.querySelector("[data-look-prev]")?.addEventListener("click", () => pickLook(li - 1));
  document.querySelector("[data-look-next]")?.addEventListener("click", () => pickLook(li + 1));
})();
