// Subpages — About text lines rising, flower cover spinning, product detail moving photos to the small thumbnails and selecting
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mark = document.querySelector(".ab__mark");
  if (mark) {
    mark.innerHTML = window.otFlower || "";
    const svg = mark.querySelector("svg");
    if (!reduce) mark.addEventListener("pointerenter", () => gsap.fromTo(svg, { rotate: 0 }, { rotate: 360, duration: 1.4, ease: "otto", overwrite: true }));
    const lines = document.querySelectorAll(".ab__text .line__in");
    if (!reduce) gsap.from(lines, { yPercent: 110, duration: 1.15, ease: "otto", stagger: 0.07, delay: 0.2 });
  }

  const thumbs = [...document.querySelectorAll(".pdp__thumbs button")], photos = [...document.querySelectorAll(".pdp__photo")];
  thumbs.forEach((b) => b.addEventListener("click", () => {
    const to = photos[+b.dataset.to];
    if (!to) return;
    const y = to.getBoundingClientRect().top + scrollY - 125 * (innerWidth / 1440);
    if (window.otLenis) window.otLenis.scrollTo(y, { duration: 1.2, easing: (t) => 1 - Math.pow(1 - t, 3) });
    else scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
  }));
  if (photos.length) {
    const on = () => {
      let k = 0, best = 1e9;
      photos.forEach((p, i) => { const r = p.getBoundingClientRect(), d = Math.abs(r.top + r.height / 2 - innerHeight / 2); if (d < best) { best = d; k = i; } });
      thumbs.forEach((b, i) => b.classList.toggle("is-on", i === k));
    };
    addEventListener("scroll", on, { passive: true });
    on();
  }
  // Picker — the name rolls and the value follows rolling .04 later, the description line exits with .35s power2.in then returns with .8s otto (upward when going toward the smaller one)
  const opts = [...document.querySelectorAll(".pdp__opt-row button")];
  const pdpName = document.querySelector(".pdp__left h1 .roll"), pdpPrice = document.querySelector(".pdp__price .roll"), desc = document.querySelector(".pdp__desc");
  const splitDesc = () => new SplitText(desc, { type: "lines", linesClass: "line__in", mask: "lines" });
  let pick = opts.findIndex((b) => b.classList.contains("is-on")), split = desc && window.SplitText && !reduce ? splitDesc() : null;
  opts.forEach((b, i) => b.addEventListener("click", () => {
    if (i === pick) return;
    const up = i < pick;
    pick = i;
    opts.forEach((o) => o.classList.toggle("is-on", o === b));
    window.otRoll(pdpName, `Object One ${b.textContent.trim()}`, up);
    window.otRoll(pdpPrice, "€0000", up, 0.04);
    if (split) gsap.to(split.lines, { yPercent: up ? 110 : -110, duration: 0.35, ease: "power2.in", stagger: 0.03, overwrite: true, onComplete: () => {
      split.revert();
      split = splitDesc();
      gsap.fromTo(split.lines, { yPercent: up ? -110 : 110 }, { yPercent: 0, duration: 0.8, ease: "otto", stagger: 0.04 });
    } });
  }));

  // Add button — when the mouse hovers, the same text rolls once (.6s otto)
  const add = document.querySelector(".pdp__add"), addRoll = add?.querySelector(".roll");
  if (addRoll) {
    const label = addRoll.textContent.trim();
    add.addEventListener("pointerenter", (e) => e.pointerType === "mouse" && window.otRoll(addRoll, label, true));
  }
})();
