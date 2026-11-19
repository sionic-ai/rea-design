// Home page — the Hero is clipped from below as it gets covered · progress cells for two feature panels · swap the big photo and name via person thumbnails · stats slot roll · book card unfold.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const glitch = (el) => el?.dispatchEvent(new Event("fx:glitch"));

  // Hero — while the next section head rises from the screen bottom, the hero bottom is cropped by the same amount (the covered spot)
  const hero = document.querySelector(".hero"), next = hero?.nextElementSibling;
  if (hero && next && !reduce) {
    ScrollTrigger.create({ trigger: next, start: "top bottom", end: "top top", scrub: true, onUpdate: (st) => { hero.style.clipPath = `inset(0 0 ${(st.progress * 100).toFixed(2)}% 0)`; } });
  }

  // Feature — lights the progress cell of the panel currently at screen center, and plays one glitch on that panel’s photo when it changes
  const feats = [...document.querySelectorAll("[data-feat]")], fdots = [...document.querySelectorAll("[data-feat-dots] i")];
  feats.forEach((f, i) => ScrollTrigger.create({ trigger: f, start: "top center", end: "bottom center", onToggle: (st) => {
    if (!st.isActive) return;
    fdots.forEach((d, j) => d.classList.toggle("is-on", i === j));
    glitch(f.querySelector('[data-fx~="hud-photo-gl"]'));
  } }));
  fdots.forEach((d, i) => d.addEventListener("click", () => { const y = feats[i].getBoundingClientRect().top + scrollY; window.kfLenis ? window.kfLenis.scrollTo(y, { duration: 1.2 }) : scrollTo(0, y); }));

  // People — pressing a thumbnail glitches the big photo and changes the name, and arrows push the strip one slot at a time
  const thumbs = [...document.querySelectorAll("[data-thumb]")], name = document.querySelector("[data-char-name]"), big = document.querySelector(".chars__gl");
  const track = document.querySelector("[data-thumbs]"), cdots = [...document.querySelectorAll("[data-char-dots] i")];
  let cur = 0, shift = 0;
  const pick = (i) => {
    cur = (i + thumbs.length) % thumbs.length;
    thumbs.forEach((t, j) => t.classList.toggle("is-on", j === cur));
    if (name) name.textContent = thumbs[cur].querySelector(".thumb__name").textContent;
    glitch(big);
    if (name && !reduce) name.animate([{ opacity: 1 }, { opacity: 0 }, { opacity: 1 }, { opacity: 0 }, { opacity: 1 }], { duration: 120, easing: "steps(1, end)" });
  };
  thumbs.forEach((t, i) => t.addEventListener("click", () => pick(i)));
  const slide = (d) => {
    if (!track) return;
    const step = (thumbs[0]?.offsetWidth || 109) + 12, max = Math.max(0, track.scrollWidth - track.parentElement.clientWidth);
    shift = Math.min(max, Math.max(0, shift + d * step));
    track.style.transform = `translateX(${-shift}px)`;
    pick(cur + d);
  };
  document.querySelector("[data-thumb-prev]")?.addEventListener("click", () => slide(-1));
  document.querySelector("[data-thumb-next]")?.addEventListener("click", () => slide(1));
  cdots.forEach((d, i) => d.addEventListener("click", () => { cdots.forEach((x, j) => x.classList.toggle("is-on", i === j)); glitch(big); }));

  // Book card — the arrow expands and collapses the intro text
  document.querySelectorAll("[data-drop]").forEach((b) => b.addEventListener("click", () => b.closest(".card").classList.toggle("is-open")));
})();
