// First page — intro (original DRzmvrgl.js values), boxed masonry layout (stacked per column), category tab switch (.3s power2.in to .8× and transparent → .3s power2.out back), photo carousel.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wide = matchMedia("(min-width: 1024px)");

  /* ── Box masonry layout — data-col (start column on wide screens) and data-span stack column heights separately. Phones use two columns, lowest column first ── */
  const grid = document.querySelector("[data-grid]");
  const layout = () => {
    if (!grid) return;
    const cols = wide.matches ? 4 : 2, gap = 4, colW = wide.matches ? 353 : (375 - 16 - gap) / 2;
    const h = new Array(cols).fill(0);
    grid.querySelectorAll(".g").forEach((it) => {
      if (it.hidden) return;
      const span = Math.min(cols, +it.dataset.span || 1);
      let col = wide.matches && it.dataset.col != null ? +it.dataset.col : -1;
      if (col < 0 || col + span > cols) {
        let best = 0, bestTop = Infinity;
        for (let c = 0; c + span <= cols; c++) { const t = Math.max(...h.slice(c, c + span)); if (t < bestTop) { bestTop = t; best = c; } }
        col = best;
      }
      const top = Math.max(...h.slice(col, col + span));
      it.style.left = `${col * (colW + gap)}px`;
      it.style.top = `${top}px`;
      it.style.width = `${span * colW + (span - 1) * gap}px`;
      const ht = parseFloat(getComputedStyle(it).height) || 0;
      for (let c = col; c < col + span; c++) h[c] = top + ht + gap;
    });
    grid.style.height = `${Math.max(...h)}px`;
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  };
  layout();
  wide.addEventListener("change", layout);
  document.fonts?.ready.then(layout);

  /* ── Category tabs — original: old cell opacity 1→0·scale 1→.8 .3s power2.in → hide → new cell 0→1·.8→1 .3s power2.out ── */
  const tabs = document.querySelectorAll(".tf__tabs li");
  let busy = false;
  tabs.forEach((li) => li.addEventListener("click", async () => {
    if (busy || li.classList.contains("is-active")) return;
    busy = true;
    tabs.forEach((t) => t.classList.toggle("is-active", t === li));
    const cat = li.dataset.filter, items = [...grid.querySelectorAll(".g")];
    const shown = items.filter((it) => !it.hidden), next = items.filter((it) => it.dataset.cat.split(" ").includes(cat));
    if (!reduce && window.gsap) await gsap.fromTo(shown, { opacity: 1, scale: 1 }, { opacity: 0, scale: 0.8, duration: 0.3, ease: "power2.in" });
    // After falling, roll to the grid header (original measurement: the tab background changes on the pressed frame, and the screen rolls after that)
    const top = grid.getBoundingClientRect().top + scrollY - 160;
    window.mbLenis ? window.mbLenis.scrollTo(top, { immediate: true }) : scrollTo(0, top);
    items.forEach((it) => { it.hidden = !next.includes(it); });
    layout();
    if (!reduce && window.gsap) await gsap.fromTo(next, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" });
    busy = false;
  }));

  /* Photo carousel (career story, talk session) — Splide fade, every 4s, pagination where only the selected one stretches to 37px */
  if (typeof Splide === "function") {
    document.querySelectorAll(".g-slider__splide").forEach((el) => {
      if (el.querySelectorAll(".splide__slide").length < 2) { el.classList.add("is-initialized"); return; }
      new Splide(el, { type: "fade", rewind: true, speed: 1000, easing: "linear", autoplay: !reduce, interval: 4000, arrows: false, pagination: el.hasAttribute("data-pages"), drag: false }).mount();
    });
  }

  /* ── Big photo panel opening — original: back lime panel opacity 1 .2s + photo panel rotate3d(0,1,0,−15deg) .5s power3.out (simultaneous). On wide screens it plays on raise and reverse-plays on release,
        Phone (1023px and below) rests for 3s, then repeats opening and closing ── */
  if (window.gsap && !reduce) {
    const touch = !wide.matches;
    document.querySelectorAll(".g-slider__photo").forEach((a) => {
      const tl = gsap.timeline({ paused: !touch, repeat: touch ? -1 : 0, repeatDelay: touch ? 3 : 0, yoyo: touch })
        .to(a.querySelector(".g-shape"), { opacity: 1, duration: 0.2 })
        .to(a.querySelector(".g-inner"), { transform: "rotate3d(0, 1, 0, -15deg)", duration: 0.5, ease: "power3.out" }, "<");
      if (touch) return;
      a.addEventListener("mouseenter", () => tl.play());
      a.addEventListener("mouseleave", () => tl.reverse());
    });
  }

  /* ── Intro — lime door in the center of a gray panel. The whole panel scales from .7x to 10x (5s power3.in), the door opens to −90° after 1s over 3s power1.in, and
        3s: the lime curtain covers over 2s. Then a one-line text floats up in 1s, stays 1s, and fades in 1s, the letter board stands, and the curtain rests 1s then lifts in 1s ── */
  const kv = document.querySelector(".kv"), wall = kv?.querySelector(".kv__wall"), intro = kv?.querySelector(".kv__intro");
  const T = window.mbTile;
  // When the intro ends, the lime door in the center opens at −50°, and a line of text beside it slides out after .5s over .5s power3.out (original .letter-item.is-main .copy x 0%·scale 1)
  const done = () => {
    wall?.dispatchEvent(new Event("fx:open"));
    wall?.dispatchEvent(new Event("fx:play"));
    const main = wall?.querySelector(".fx-door.is-main");
    if (!main || main.querySelector(".kv__catch")) return;
    main.insertAdjacentHTML("beforeend", '<span class="kv__catch">Reaching further<br>Gets stronger</span>');
    if (window.gsap && !reduce) gsap.fromTo(main.querySelector(".kv__catch"), { xPercent: -30, scale: 0.6, opacity: 0 }, { xPercent: 0, scale: 1, opacity: 1, duration: 0.5, ease: "power3.out", delay: 0.5 });
  };
  if (!kv || !intro || !T) return;
  const iw = intro.querySelector(".kv__introwall");
  const shapes = [T.v, T.b, T.s, T.h];
  for (let r = 0; r < 5; r++) {
    const row = document.createElement("div");
    row.className = "kv__irow";
    if (r % 2) row.style.marginLeft = "-327px";
    for (let c = 0; c < 7; c++) {
      const main = r === 2 && c === 3;
      row.insertAdjacentHTML("beforeend", `<div class="kv__itile${main ? " is-main" : ""}"><svg viewBox="0 0 267 150"><path d="${shapes[(r + c) % 4]}"/></svg>${main ? '<div class="kv__ileaf"></div>' : ""}</div>`);
    }
    iw.append(row);
  }
  if (reduce || !window.gsap || sessionStorage.getItem("mb-intro")) { intro.remove(); gsap?.set(wall, { autoAlpha: 1 }); done(); return; }
  sessionStorage.setItem("mb-intro", "1");
  gsap.set(wall, { autoAlpha: 0 });
  gsap.timeline({ onComplete: () => { intro.remove(); done(); } })
    .to(iw, { scale: 10, duration: 5, ease: "power3.in" })
    .to(intro.querySelector(".kv__overlay"), { opacity: 1, duration: 2, ease: "none" }, 3)
    .to(iw.querySelector(".kv__ileaf"), { rotateY: -90, duration: 3, ease: "power1.in" }, 1)
    .to(intro.querySelector(".kv__copy"), { autoAlpha: 1, duration: 1, ease: "power1.in" })
    .to(intro.querySelector(".kv__copy"), { delay: 1, autoAlpha: 0, duration: 1, ease: "none" })
    .set(wall, { autoAlpha: 1 })
    .to(intro, { opacity: 0, duration: 1, delay: 1, ease: "none" });
})();
