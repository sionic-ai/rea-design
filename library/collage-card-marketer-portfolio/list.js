// Work: a word wall is attached behind and work cards flow by overlapping, staggered left and right — while the cards pass, the wall fades and then darkens again at the end
(() => {
  const { reduced } = WR;
  const wall = document.querySelector(".love__wall");
  const ROWS = 11, WORD = "Word "; // Same four-letter Latin words as the original wall, so the number of words per line (≈4.5) matches — the length over which the wall lights up (1000/14ms × word count ÷ 2) is the same too
  const w = (t) => `<span class="pr-w">${t}</span>`, loves = (n) => w(WORD.trim()).concat(" ").repeat(n);
  const red = (t) => t.split(" ").map((x) => `<b class="pr-w">${x}</b>`).join(" ");
  wall.innerHTML = Array.from({ length: ROWS }, (_, i) => {
    const o = (i * 0.37) % 1.2;
    if (i === 3) return `<span class="love__row" style="--o:${o}">${loves(2)}${red("Red line here")} ${loves(3)}</span>`;
    if (i === 4) return `<span class="love__row" style="--o:${o}">${red("Second red line")} ${loves(5)}</span>`;
    return `<span class="love__row" style="--o:${o}">${loves(7)}</span>`;
  }).join("");
  // When opened, words on screen light up in pairs, one from the top end and one from the bottom end (two every 1000/14ms) — at the moment they light they are stamped at 1.15× from the baseline, then return on the next beat
  const stomp = () => {
    const box = wall.getBoundingClientRect();
    const seen = [...wall.querySelectorAll(".pr-w")].map((el) => ({ el, r: el.getBoundingClientRect() }))
      .filter(({ r }) => r.right > box.left && r.left < box.right && r.top < box.bottom && r.bottom > box.top)
      .sort((a, b) => a.r.top - b.r.top || a.r.left - b.r.left).map(({ el }) => el);
    if (reduced || !seen.length) { wall.dataset.done = ""; return; }
    let k = 0, hot = [];
    const half = Math.ceil(seen.length / 2);
    const beat = () => {
      hot.forEach((el) => el.classList.remove("pr-stomp")); hot = [];
      for (const i of new Set([k, seen.length - 1 - k])) { seen[i]?.classList.add("pr-on", "pr-stomp"); hot.push(seen[i]); }
      if (++k < half) setTimeout(beat, 1000 / 14);
      else setTimeout(() => { hot.forEach((el) => el?.classList.remove("pr-stomp")); wall.dataset.done = ""; }, 1000 / 14);
    };
    beat();
  };
  // The original starts as soon as the screen is drawn (waiting for fonts) — if the word positions aren’t set yet, it measures again on the next frame
  const begin = () => (wall.getBoundingClientRect().height > 0 ? stomp() : requestAnimationFrame(begin));
  (document.fonts?.ready ?? Promise.resolve()).then(() => requestAnimationFrame(begin));

  // The wall stays attached until the end of the section (original sticky — pinned with ScrollTrigger since it is inside ScrollSmoother). 1→.25 when the top of the first card goes from screen bottom→center, .25→1 when the bottom of the last card goes from center→top
  const love = document.querySelector(".love"), pin = document.querySelector(".love__pin"), cards = [...document.querySelectorAll(".love__card")];
  ScrollTrigger.create({ trigger: love, start: "top top", end: () => `bottom ${pin.offsetHeight}px`, pin, pinSpacing: false, invalidateOnRefresh: true });
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    gsap.fromTo(wall, { opacity: 1 }, { opacity: .25, ease: "none", immediateRender: false, scrollTrigger: { trigger: cards[0], start: "top bottom", end: "top 50%", scrub: true } });
    gsap.fromTo(wall, { opacity: .25 }, { opacity: 1, ease: "none", immediateRender: false, scrollTrigger: { trigger: cards[cards.length - 1], start: "bottom 50%", end: "bottom top", scrub: true } });
  });
  // In when it enters the area excluding the bottom 25% of the screen, removed when fully off screen
  const links = cards.map((c) => c.querySelector(".love__link"));
  if (reduced) links.forEach((l) => l.classList.add("in"));
  else links.forEach((l) => {
    new IntersectionObserver((es) => es.at(-1).isIntersecting && l.classList.add("in"), { rootMargin: "0px 0px -25% 0px" }).observe(l);
    new IntersectionObserver((es) => !es.at(-1).isIntersecting && l.classList.remove("in")).observe(l);
  });
})();
