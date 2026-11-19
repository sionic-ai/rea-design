// Business motion. Original values: orbit 360° 100s (only while on screen) · eyeball .25s power2.out (.35s back in place on leave) · strengths·staff Swiper loop 1s·every 3.5s·gap 20/0 centered
// Flow: number back.out(1.7) .45 · text y·blur .6 power2.out · dotted line clip .22s stagger · map 1s power3.out → pieces .55 back.out(1.7) .12 stagger
(() => {
  const { reduced, blobPath, eyes, mm } = window.VS;

  // Orbit: original initStrengths — ten circles placed from the bottom (90°) at −36° steps, plus an angle making one turn per 100s, moving only their positions (text always stays upright)
  const orbit = document.querySelector(".orbit");
  const list = orbit.querySelector(".orbit__list");
  const labels = [["01", "STRENGTH ONE"], ["02", "STRENGTH TWO"], ["03", "STRENGTH THREE"], ["04", "STRENGTH FOUR"], ["05", "STRENGTH FIVE"]];
  const items = Array.from({ length: 10 }, (_, i) => {
    const el = document.createElement("div");
    el.className = "orbit__item";
    const [n, t] = labels[i % labels.length];
    el.innerHTML = `<b>${n}</b><small>${t}</small>`;
    list.append(el);
    return el;
  });
  const turn = { deg: 0 };
  const placeOrbit = () => {
    const r = orbit.offsetWidth / 2;
    items.forEach((el, i) => {
      const w = el.offsetWidth, a = ((90 - (360 / items.length) * i + turn.deg) * Math.PI) / 180;
      gsap.set(el, { x: r + Math.cos(a) * r - w / 2, y: r + Math.sin(a) * r - w / 2 });
    });
  };
  placeOrbit();
  addEventListener("resize", placeOrbit);
  if (!reduced) {
    const spin = gsap.to(turn, { deg: 360, duration: 100, ease: "none", repeat: -1, paused: true, onUpdate: placeOrbit });
    new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? spin.play() : spin.pause())), { threshold: 0 }).observe(document.querySelector(".strengths"));
  }

  // Eyeballs follow the mouse
  const allEyes = [...document.querySelectorAll(".eye")].filter((eye) => !eye.closest(".vs-slider-nav"));
  // Original formula: from the white radius subtract the pupil radius and 12, if the cursor is within 120, scale by that distance — the small eyes below have no room left so they stay as is
  const look = (e) => allEyes.forEach((eye) => {
    const p = eye.querySelector(".eye__pupil"), r = eye.getBoundingClientRect(), q = p.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2), ang = Math.atan2(dy, dx), k = Math.min(1, Math.hypot(dx, dy) / 120);
    const rx = Math.max(0, r.width / 2 - q.width / 2 - 12), ry = Math.max(0, r.height / 2 - q.height / 2 - 12);
    gsap.to(p, { x: Math.cos(ang) * rx * k, y: Math.sin(ang) * ry * k, duration: 0.25, ease: "power2.out", overwrite: true });
  });
  if (!reduced && matchMedia("(hover: hover)").matches) {
    addEventListener("pointermove", look);
    document.documentElement.addEventListener("pointerleave", () => allEyes.forEach((eye) => gsap.to(eye.firstElementChild, { x: 0, y: 0, duration: 0.35, ease: "power2.out", overwrite: true })));
  }

  // Strengths cards · staff row: same Swiper loop as the original. If there are too few slides they are cloned to fill, as in the original (10 for strengths, 8 if staff is 4 or fewer)
  const fill = (wrap, min) => {
    const base = [...wrap.children];
    for (let i = 0; wrap.children.length < min; i++) wrap.append(base[i % base.length].cloneNode(true));
  };
  const loopOpts = (gap, prevEl, nextEl) => ({
    loop: true, speed: 1000, slidesPerView: "auto", slidesPerGroup: 1, spaceBetween: gap, centeredSlides: true, grabCursor: true,
    autoplay: reduced ? false : { delay: 3500, disableOnInteraction: false, pauseOnMouseEnter: true },
    navigation: { prevEl, nextEl },
  });
  fill(document.querySelector(".ss__track"), 10);
  new Swiper(".ss__slider", loopOpts(20, ".ss__nav .is-prev", ".ss__nav .is-next"));
  const members = document.querySelector(".members__track");
  if (members.children.length <= 4) fill(members, 8);
  new Swiper(".members__slider", loopOpts(0, ".members .is-prev", ".members .is-next"));
  document.querySelectorAll(".vs-slider-nav").forEach((nav) => {
    const eyesEl = nav.querySelector(".vs-slider-nav__eyes");
    const look = (side) => () => { eyesEl.classList.toggle("is-look-left", side === "left"); eyesEl.classList.toggle("is-look-right", side === "right"); };
    [["is-prev", "left"], ["is-next", "right"]].forEach(([c, side]) => {
      const btn = nav.querySelector(`.${c}`);
      ["pointerenter", "focus"].forEach((ev) => btn.addEventListener(ev, look(side)));
      ["pointerleave", "blur"].forEach((ev) => btn.addEventListener(ev, look(null)));
    });
  });

  // Green spiky-ball character in the flow steps
  const spiky = (seed) => `<svg viewBox="0 0 120 110"><path d="${blobPath(60, 58, 48, seed, 16, 0.2)}" fill="var(--site-green)"/>${eyes(40, 52, 1.6, 16)}</svg>`;
  document.querySelector(".flow__chara.is-1").innerHTML = spiky(41);
  document.querySelector(".flow__chara.is-2").innerHTML = spiky(12);

  // Regional map: twelve angular pieces gather into one mass
  const map = document.querySelector(".sarea__map svg");
  const pieces = [[120, 40], [190, 60], [250, 90], [150, 110], [215, 140], [280, 160], [130, 190], [200, 215], [270, 240], [170, 280], [240, 310], [300, 350]];
  map.innerHTML = pieces.map(([x, y], i) => {
    const r = 34 + (i % 3) * 6, k = 5 + (i % 3);
    const pts = Array.from({ length: k }, (_, j) => { const a = (j / k) * Math.PI * 2 + i; const rr = r * (0.75 + ((i * 7 + j * 3) % 5) * 0.08); return `${(x + Math.cos(a) * rr).toFixed(1)},${(y + Math.sin(a) * rr).toFixed(1)}`; });
    return `<path d="M${pts.join("L")}Z"/>`;
  }).join("");

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.utils.toArray(".flow__item").forEach((it, i) => {
      const num = it.querySelector(".flow__num"), body = it.querySelector(".flow__content");
      gsap.set(num, { autoAlpha: 0, scale: 0.6 });
      gsap.set(body, { autoAlpha: 0, y: 20, filter: "blur(8px)" });
      ScrollTrigger.create({ trigger: it, start: "top 88%", once: true, onEnter: () => gsap.timeline({ delay: 0.22 * (i % 2) })
        .to(num, { autoAlpha: 1, scale: 1, duration: 0.45, ease: "back.out(1.7)" }, 0)
        .to(".flow__line", { clipPath: `inset(0 0 ${100 - ((i + 1) / 4) * 100}% 0)`, duration: 1, ease: "power1.out" }, 0.08)
        .to(body, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.6, ease: "power2.out" }, 0.16) });
    });
    gsap.to(".flow__chara.is-1", { y: -14, rotation: 6, duration: 1.4, ease: "sine.inOut", yoyo: true, repeat: -1 });
    gsap.to(".flow__chara.is-2", { y: -24, x: 10, duration: 2, ease: "sine.inOut", yoyo: true, repeat: -1 });
    const parts = map.querySelectorAll("path");
    gsap.set(map, { autoAlpha: 0, scale: 0.9, filter: "blur(10px)" });
    gsap.set(parts, { scale: 0, transformOrigin: "50% 50%" });
    ScrollTrigger.create({ trigger: ".sarea__map", start: "top 75%", once: true, onEnter: () => gsap.timeline()
      .to(map, { autoAlpha: 1, filter: "blur(0px)", scale: 1, duration: 1, ease: "power3.out" })
      .to(parts, { scale: 1, duration: 0.55, stagger: 0.12, ease: "back.out(1.7)" }, "-=.15") });
  });
  if (reduced) gsap.set(".flow__line", { clipPath: "inset(0 0 0% 0)" });
})();
