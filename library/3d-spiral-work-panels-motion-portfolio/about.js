// About: pinned sentence words brighten (scrub) · thumbnail strip clone · sticker trail.
// Original values: each word sits at timeline position i with length 1, opacity .5 → 1, the icon at i+.2 with length 1.5, scale 0 → 1.5 (back.out(1.7)),
// One sticker per 80px of mouse movement — 0 → 1 in .4s (power2.out, inner 2.5 → 1), vanishing .45s later over .4s.
(() => {
  const { audio, reduce } = window.pp;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  gsap.registerPlugin(ScrollTrigger, SplitText);

  // ── Fixed sentence ──
  const wrap = $(".pp-about-text");
  const text = $(".text", wrap);
  const split = new SplitText(text, { type: "words", wordsClass: "word", tag: "span" });
  const tokens = [];
  let wi = -1;
  [...text.childNodes].forEach((n) => {
    if (n.nodeType !== 1) return;
    if (n.classList.contains("word")) { wi++; tokens.push({ el: n, type: "word" }); }
    if (n.classList.contains("about-icon")) tokens.push({ el: n, type: "icon", after: wi });
  });
  const icons = $$(".about-icon", text);
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.set(split.words, { opacity: 0.5 });
    gsap.set(icons, { scale: 0, opacity: 0, transformOrigin: "center center" });
    const tl = gsap.timeline({ scrollTrigger: { trigger: wrap, start: "top top", end: "bottom bottom", scrub: true } });
    split.words.forEach((w, i) => {
      tl.to(w, { opacity: 1, duration: 1 }, i);
      tokens.filter((t) => t.type === "icon" && t.after === i).forEach((t) => tl.to(t.el, { scale: 1.5, opacity: 1, duration: 1.5, ease: "back.out(1.7)" }, i + 0.2));
    });
  });

  // ── Thumbnail strip: like the original, the same row chained twice, -100% over 40s ──
  const track = $(".pp-carousel .track");
  const copy = track.cloneNode(true);
  copy.setAttribute("aria-hidden", "true");
  $$("a", copy).forEach((a) => a.setAttribute("tabindex", "-1"));
  track.after(copy);
  $$(".pp-carousel .thumb").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); audio.play("longclick"); }));
  $$(".pp-socials .social-link").forEach((a) => a.addEventListener("mouseenter", () => audio.play("hover")));

  // ── Sticker trail (only on devices with a mouse) ──
  if (!pp.finePointer || reduce) return;
  const trail = $(".pp-trail");
  const C = ["--kf-accent", "--kf-accent-soft", "--site-pop-blue", "--site-pop-orange", "--kf-ink", "--site-pop-navy"];
  const fillOf = (i) => `style="fill: var(${C[i % C.length]})"`;
  const ink = 'style="fill: var(--kf-bg)"';
  // Sticker set of 12 — our own drawings at the same size instead of the original sticker photos
  const STICKERS = [
    (i) => `<path d="M50 6l12 30 32 2-25 20 9 32-28-18-28 18 9-32L6 38l32-2z" ${fillOf(i)}/>`,
    (i) => `<circle cx="50" cy="50" r="40" ${fillOf(i)}/><circle cx="36" cy="42" r="5" ${ink}/><circle cx="64" cy="42" r="5" ${ink}/><path d="M32 60c8 12 28 12 36 0" fill="none" style="stroke: var(--kf-bg)" stroke-width="6" stroke-linecap="round"/>`,
    (i) => `<path d="M22 30c10-22 50-20 58 4s4 46-22 50-50-6-44-26 0-14 8-28z" ${fillOf(i)}/>`,
    (i) => `<path d="M58 4L22 56h24l-6 40 38-56H54z" ${fillOf(i)}/>`,
    (i) => `<rect x="12" y="24" width="76" height="52" rx="26" ${fillOf(i)}/><text x="50" y="57" text-anchor="middle" style="fill: var(--kf-bg); font: 600 18px var(--kf-font-sans)">Hello</text>`,
    (i) => `${[0, 60, 120, 180, 240, 300].map((r) => `<ellipse cx="50" cy="28" rx="12" ry="22" transform="rotate(${r} 50 50)" ${fillOf(i)}/>`).join("")}<circle cx="50" cy="50" r="12" ${ink}/>`,
    (i) => `<circle cx="50" cy="50" r="28" ${fillOf(i)}/><ellipse cx="50" cy="50" rx="46" ry="12" fill="none" style="stroke: var(--kf-ink)" stroke-width="5" transform="rotate(-18 50 50)"/>`,
    (i) => `<path d="M6 50c20-30 68-30 88 0-20 30-68 30-88 0z" ${fillOf(i)}/><circle cx="50" cy="50" r="14" ${ink}/>`,
    (i) => `<path d="M6 60c12-20 22-20 33 0s22 20 33 0 16-16 22-6" fill="none" style="stroke: var(${C[i % C.length]})" stroke-width="12" stroke-linecap="round"/>`,
    (i) => `<path d="M50 50m-4 0a4 4 0 118 0 12 12 0 11-24 0 20 20 0 1140 0 28 28 0 11-56 0 36 36 0 1172 0" fill="none" style="stroke: var(${C[i % C.length]})" stroke-width="7" stroke-linecap="round"/>`,
    (i) => `<path d="M50 6c18 26 30 42 30 58a30 30 0 01-60 0c0-16 12-32 30-58z" ${fillOf(i)}/>`,
    (i) => `<path d="M50 8l38 20v44L50 92 12 72V28z" ${fillOf(i)}/><path d="M50 50l38-22M50 50L12 28M50 50v42" style="stroke: var(--kf-bg)" stroke-width="3"/>`,
  ];
  const items = Array.from({ length: 24 }, (_, k) => {
    const el = document.createElement("div");
    el.className = "sticker";
    el.innerHTML = `<svg class="inner" viewBox="0 0 100 100">${STICKERS[k % 12](k)}</svg>`;
    trail.append(el);
    return { el, inner: el.firstElementChild, rect: null };
  });
  const measure = () => items.forEach((it) => { gsap.set(it.el, { opacity: 0, scale: 1 }); it.rect = it.el.getBoundingClientRect(); });
  measure();
  addEventListener("resize", measure);
  const mouse = { x: 0, y: 0 }, lastMouse = { x: 0, y: 0 }, smooth = { x: 0, y: 0 };
  let idx = 0, z = 1;
  trail.addEventListener("mousemove", (e) => {
    const b = trail.getBoundingClientRect();
    mouse.x = e.clientX - b.left;
    mouse.y = e.clientY - b.top;
  });
  const showNext = () => {
    const it = items[idx];
    idx = (idx + 1) % items.length;
    z++;
    audio.play("tick");
    gsap.killTweensOf(it.el);
    gsap.timeline()
      .fromTo(it.el, { opacity: 1, scale: 0, x: smooth.x - it.rect.width / 2, y: smooth.y - it.rect.height / 2, zIndex: z }, { duration: 0.4, scale: 1, x: mouse.x - it.rect.width / 2, y: mouse.y - it.rect.height / 2, ease: "power2.out" }, 0)
      .fromTo(it.inner, { scale: 2.5 }, { scale: 1, duration: 0.4 }, 0)
      .to(it.el, { opacity: 0, scale: 0.2, duration: 0.4 }, 0.45);
  };
  gsap.ticker.add(() => {
    smooth.x += (mouse.x - smooth.x) * 0.1;
    smooth.y += (mouse.y - smooth.y) * 0.1;
    if (Math.hypot(mouse.x - lastMouse.x, mouse.y - lastMouse.y) > 80) {
      showNext();
      lastMouse.x = mouse.x;
      lastMouse.y = mouse.y;
    }
  });
})();
