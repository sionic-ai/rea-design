/* Features page: sections that float up when visible, a version list that rotates by itself, and a playback position that sweeps both panels together */

/* ---------- Rises from 20px below when visible ---------- */
// The original (Framer Motion whileInView) watches each element separately and rises if even one pixel is visible — if we order them as one batch,
// Even elements above that were passed by a jump (TOC·anchor) queue up, so on-screen elements appear 1~2 seconds late.
// Comparison panel (data-rise="panel") is .6s easeInOut, step cards (data-rise="card") is delayed .1s per turn, Framer defaults — opacity .3s, position is a spring.
// As in the original, hide by opacity 0 only — turning off visibility too would make buttons inside unclickable and unfocusable while they have not appeared yet
CustomEase.create("sd.inOut", "M0,0 C0.42,0 0.58,1 1,1");
CustomEase.create("sd.fade", "M0,0 C0.25,0.1 0.35,1 1,1");
// Unfolds Framer’s default position spring (stiffness 500 · damping 25 · mass 1) into a time curve — overshoots 12% and settles within .45 seconds
const SPRING_DUR = 0.45;
CustomEase.create("sd.spring", (() => {
  const w0 = Math.sqrt(500), z = 25 / (2 * w0), wd = w0 * Math.sqrt(1 - z * z);
  const pts = Array.from({ length: 46 }, (_, i) => {
    const t = (i / 45) * SPRING_DUR;
    const x = Math.exp(-z * w0 * t) * (Math.cos(wd * t) + ((z * w0) / wd) * Math.sin(wd * t));
    return `${(i / 45).toFixed(4)},${(1 - x).toFixed(4)}`;
  });
  return `M${pts[0]} L${pts.slice(1).join(" ")}`;
})());
const RISE = {
  panel: () => ({ opacity: 1, y: 0, duration: 0.6, ease: "sd.inOut" }),
  card: (i) => [{ opacity: 1, duration: 0.3, ease: "sd.fade", delay: 0.1 * i }, { y: 0, duration: SPRING_DUR, ease: "sd.spring", delay: 0.1 * i }],
};
function initRise({ reduce }) {
  const els = $$("[data-rise]");
  if (reduce) return;
  gsap.set(els, { opacity: 0, y: 20 });
  const sts = els.map((el) => {
    const kind = el.dataset.rise === "card" ? "card" : "panel";
    const i = kind === "card" ? $$('[data-rise="card"]', el.parentElement).indexOf(el) : 0;
    return ScrollTrigger.create({
      trigger: el,
      start: "top bottom",
      once: true,
      onEnter: () => [RISE[kind](i)].flat().forEach((v) => gsap.to(el, v)),
    });
  });
  return () => sts.forEach((st) => st.kill());
}

/* ---------- Version list: advances to the next version every 3.6s, hover or press to select that version ---------- */
// Default curve easeOut of the original (Framer Motion) = CSS ease-out
CustomEase.create("sd.easeOut", "M0,0 C0,0 0.58,1 1,1");
const tree = $("[data-tree]");
const treeRows = $$(".tree-row", tree);
let diff = $("[data-diff]", tree);
let tag = $("[data-tree-tag]", tree);
const applyFrom = $(".apply-box:not(.is-to)", tree);
const applyArrow = $(".apply-arrow", tree);
const applyTo = $(".apply-box.is-to", tree);
const applyOk = $("[data-apply-ok]", tree);
// Changed-spot markers enter in a different shape for each type
const DIFF_IN = {
  indent: { from: { opacity: 0, scaleX: 0.85 }, duration: 0.35, ease: "sd.easeOut" },
  comment: { from: { opacity: 0, y: 4 }, duration: 0.35, ease: "sd.easeOut" },
  replace: { from: { opacity: 0, scaleX: 0 }, duration: 0.4, ease: EASE.out },
};
// The original redraws the label and table for each version (AnimatePresence) — instead of changing color or width on the same element, insert a new element and take out the previous one
const fresh = (old) => {
  const el = old.cloneNode(true);
  old.after(el);
  return el;
};
const dropOld = (old, vars) => gsap.to(old, { opacity: 0, ease: "sd.easeOut", ...vars, onComplete: () => old.remove() });
let treeAt = 1;
let tagTl = null;
let applyTl = null;
const paintDiff = (el, row) => {
  const kind = row.dataset.kind;
  el.dataset.kind = kind;
  el.style.setProperty("--dc", row.style.getPropertyValue("--c"));
  el.style.setProperty("--row", row.dataset.track);
  el.style.setProperty("--at", row.dataset.at);
  el.style.setProperty("--w", row.dataset.w);
  $("span", el).textContent = kind === "replace" ? `⇄ ${row.dataset.chip}` : row.dataset.chip;
};
const paintTag = (el, row) => {
  el.style.setProperty("--c", row.style.getPropertyValue("--c"));
  $("[data-tree-chip]", el).textContent = row.dataset.chip;
};
// Apply row: when changed it returns to its initial form, then the front box revives at .4s, the arrow at 1.4s, and the back box and ✓ at 2.6s
const playApply = () => {
  applyTl?.kill();
  applyTl = gsap.timeline({ defaults: { ease: "sd.easeOut" } })
    .to(applyFrom, { x: -8, opacity: 0.4, duration: 0.4 }, 0)
    .to(applyArrow, { opacity: 0.3, duration: 0.3 }, 0)
    .to(applyTo, { scale: 0.96, opacity: 0.5, duration: 0.4 }, 0)
    .to(applyOk, { opacity: 0, scale: 0.5, duration: 0.3 }, 0)
    .to(applyFrom, { x: 0, opacity: 1, duration: 0.4 }, 0.4)
    .to(applyArrow, { opacity: 1, duration: 0.3 }, 1.4)
    .to(applyTo, { scale: 1, opacity: 1, duration: 0.4 }, 2.6)
    .to(applyOk, { opacity: 1, scale: 1, duration: 0.3 }, 2.6);
};
const pickVersion = (i, reduce) => {
  treeAt = i;
  const row = treeRows[i];
  // In the original, lines, dots and tags each swap their own markers (class, style) — the dot’s glow and tag color aren’t hung on a descendant selector of the line marker but kept in the same structure
  treeRows.forEach((r) => [r, r.firstElementChild, r.lastElementChild].forEach((el) => el.classList.toggle("is-on", r === row)));
  tree.style.setProperty("--c", row.style.getPropertyValue("--c"));
  $$("[data-tree-name]", tree).forEach((el) => (el.textContent = row.dataset.name));
  $("[data-tree-note]", tree).textContent = ` · ${row.dataset.note}`;
  if (reduce) { paintDiff(diff, row); paintTag(tag, row); return; }
  // Display: the old one fades out over the same length (overlap), and the new one enters in its final form
  const oldDiff = diff;
  diff = fresh(oldDiff);
  oldDiff.removeAttribute("data-diff");
  gsap.killTweensOf(oldDiff);
  if (oldDiff.dataset.kind !== "none") dropOld(oldDiff, { duration: DIFF_IN[oldDiff.dataset.kind]?.duration || 0.35 });
  else oldDiff.remove();
  paintDiff(diff, row);
  const into = DIFF_IN[row.dataset.kind];
  if (into) gsap.fromTo(diff, into.from, { opacity: 1, scaleX: 1, y: 0, duration: into.duration, ease: into.ease });
  // Table: the old one fully leaves by .4 after a .15 delay, then the new one rises from 6px below by .4 after a .15 delay
  tagTl?.progress(1);
  const oldTag = tag;
  tag = fresh(oldTag);
  oldTag.removeAttribute("data-tree-tag");
  paintTag(tag, row);
  gsap.set(tag, { opacity: 0, y: 6, position: "absolute", visibility: "hidden" });
  tagTl = gsap.timeline()
    .to(oldTag, { opacity: 0, duration: 0.4, delay: 0.15, ease: "sd.easeOut" })
    .add(() => { oldTag.remove(); gsap.set(tag, { clearProps: "position,visibility" }); })
    .to(tag, { opacity: 1, y: 0, duration: 0.4, delay: 0.15, ease: "sd.easeOut" });
  playApply();
};

function initTree({ reduce }) {
  pickVersion(treeAt, true);
  // As in the original, hovering or pressing a row picks that version, and it doesn’t rotate while a hand is over the row.
  // The original spin keeps going every 3.6 seconds even off-screen, and once released it starts counting 3.6 seconds again
  let rotate = null;
  const start = () => { rotate?.kill(); rotate = reduce ? null : gsap.delayedCall(3.6, function tick() { pickVersion((treeAt + 1) % treeRows.length, false); rotate = gsap.delayedCall(3.6, tick); }); };
  const choose = (row) => {
    const i = treeRows.indexOf(row);
    if (i !== treeAt) pickVersion(i, reduce);
  };
  const onClick = (e) => {
    const row = e.target.closest(".tree-row");
    if (row) choose(row);
  };
  const onEnter = (e) => {
    rotate?.kill();
    rotate = null;
    choose(e.currentTarget);
  };
  tree.addEventListener("click", onClick);
  treeRows.forEach((r) => { r.addEventListener("pointerenter", onEnter); r.addEventListener("pointerleave", start); });
  const off = () => {
    tree.removeEventListener("click", onClick);
    treeRows.forEach((r) => { r.removeEventListener("pointerenter", onEnter); r.removeEventListener("pointerleave", start); });
    rotate?.kill();
  };
  if (reduce) return off;
  playApply();
  start();

  const head = $("[data-playhead]", tree);
  const sweep = gsap.fromTo(head, { "--x": 0 }, { "--x": 1, duration: beats(16), ease: "none", repeat: -1, paused: true });
  const st = ScrollTrigger.create({
    trigger: tree,
    start: "top bottom",
    end: "bottom top",
    onToggle: (s) => (s.isActive ? sweep.play() : sweep.pause()),
  });
  return () => {
    off();
    sweep.kill();
    st.kill();
  };
}

/* ---------- Listening side by side: the same playback position passes through both sides together ---------- */
function initAB({ reduce }) {
  const ab = $("[data-ab]");
  const lanes = $$(".ab-lane", ab);
  if (reduce) return gsap.set(lanes, { "--p": 0.5 });
  const play = gsap.fromTo(lanes, { "--p": 0 }, { "--p": 1, duration: beats(16), ease: "none", repeat: -1, paused: true });
  const st = ScrollTrigger.create({ trigger: ab, start: "top bottom", end: "bottom top", onToggle: (s) => (s.isActive ? play.play() : play.pause()) });
  return () => {
    play.kill();
    st.kill();
  };
}

document.fonts.ready.then(() => {
  gsap.matchMedia().add(MEDIA, (ctx) => {
    const c = ctx.conditions;
    const offs = [initRise(c), initTree(c), initAB(c)];
    ScrollTrigger.refresh();
    return () => offs.forEach((f) => typeof f === "function" && f());
  });
});
