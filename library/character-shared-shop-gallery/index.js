// First page: chunk video and wordmark entrance, product·member carousel, welcome character, character hill
(() => {
  const { reduce } = window.brand;

  // ── Hero: the blob video (placeholder) works like the original. On a first visit, the loader circle starts to spread and 0.5s later (3.8s) the video plays, on a return visit, it plays right away.
  //    The wordmark rises with a 1.2s power4.out after the loader ends (4.9s · 1.1s on return) ──
  const movie = document.querySelector("[data-hero-movie]");
  const title = document.querySelector(".ix-hero__inner");
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const timer = setTimeout(() => movie.play().catch(() => {}), brand.firstVisit ? 3800 : 0);
    gsap.fromTo(title, { y: 0, yPercent: 100 }, { y: 0, yPercent: 0, duration: 1.2, ease: "power4.out", delay: brand.introDelay });
    return () => { clearTimeout(timer); movie.pause(); };
  });
  mm.add("(prefers-reduced-motion: reduce)", () => { gsap.set(title, { y: 0, yPercent: 0 }); });

  // ── Carousel: same Splide options as the original. Products auto-advance one slide at a time, centered, every 4s (default 400ms · cubic-bezier(.25,1,.5,1)),
  //    members are a drag free loop + AutoScroll 0.7px per frame (doesn’t stop on hover). With reduced motion, auto-advance and drift are turned off ──
  const products = new Splide('[data-carousel="products"]', {
    type: "loop", perPage: 3, perMove: 1, focus: "center", gap: "5px", padding: "14%",
    autoplay: !reduce, interval: 4000, pauseOnHover: false, arrows: true, pagination: false, updateOnMove: true,
    breakpoints: { 1024: { perPage: 2, padding: "6%" }, 750: { perPage: 1, gap: "5px", padding: { left: "7%", right: "13%" } } },
  });
  products.on("mounted", () => setTimeout(() => products.refresh(), 100));
  products.mount();
  const AutoScroll = window.splide?.Extensions?.AutoScroll;
  const members = new Splide('[data-carousel="members"]', {
    type: "loop", drag: "free", focus: "center", perPage: 3, gap: "40px", padding: "5%", arrows: false, pagination: false,
    autoScroll: { speed: reduce ? 0 : 0.7, pauseOnHover: false, autoStart: !reduce },
    breakpoints: { 1024: { perPage: 2, gap: "30px", padding: "8%" }, 768: { perPage: 1, gap: "20px", padding: "18%" } },
  });
  members.on("mounted", () => members.refresh());
  members.mount(AutoScroll ? { AutoScroll } : {});

  // ── Welcome character: only while the shop section is visible, hides when it touches the contact box.
  //    The original uses ease on "cubic-bezier(0.9, 0, 0.1, 1)" Text turns but CustomEase is absent, so GSAP runs on its default curve (power1.out) — follow what actually runs ──
  const welcome = document.querySelector(".ix-welcome");
  const store = document.querySelector(".ix-store");
  const cta = document.querySelector(".ix-cta");
  let inStore = false, pastCta = false;
  const showWelcome = () => {
    const on = inStore && !pastCta;
    gsap.to(welcome, on
      ? { opacity: 1, x: 0, y: 0, duration: reduce ? 0 : 0.5, ease: "power1.out", overwrite: "auto" }
      : { opacity: 0, x: -30, y: 30, duration: reduce ? 0 : 0.2, ease: "power2.out", overwrite: "auto" });
  };
  ScrollTrigger.create({ trigger: store, start: "top 90%", end: "bottom 10%",
    onToggle: (self) => { inStore = self.isActive; pastCta = false; showWelcome(); } });
  ScrollTrigger.create({ trigger: cta, start: "top 90%", end: "bottom 10%",
    onEnter: () => { pastCta = true; showWelcome(); }, onEnterBack: () => { pastCta = true; showWelcome(); } });

  // ── Character hill: the original GIF (2400×289 · 4.6s loop) doesn’t bounce, only the eyes close one after another for 0.2s —
  //    1.0s pink → 2.2s green · purple → 3.4s orange · sky blue. Redrawn in the same position · stacking order, and the winding-back timing is set with a CSS delay ──
  const hills = document.querySelector("[data-hills]");
  const v = (name) => `style="fill:var(--site-${name})"`;
  const s = (name) => `style="stroke:var(--site-${name})"`;
  const pair = (pts, fn) => pts.map(([x, y]) => fn(x, y)).join("");
  const shut = (pts, tilt = 0) => `<g class="ix-hill__shut" ${s("eye")} stroke-width="4" stroke-linecap="round">${pair(pts, (x, y) => `<path d="M${x - 10} ${y}h20" transform="rotate(${tilt} ${x} ${y})"/>`)}</g>`;
  const EYES = {
    sand: (p) => `<g>${pair(p, (x, y) => `<ellipse cx="${x}" cy="${y}" rx="10" ry="7" ${v("eye")} transform="rotate(-20 ${x} ${y})"/><circle cx="${x}" cy="${y}" r="4" ${v("pink")}/>`)}</g>`,
    diamond: (p) => `<g>${pair(p, (x, y) => `<path d="M${x} ${y - 11}l11 11-11 11-11-11z" ${v("eye")}/><circle cx="${x}" cy="${y}" r="4" ${v("navy")}/>`)}</g>`,
    blob: (p) => `<g>${pair(p, (x, y) => `<ellipse cx="${x}" cy="${y}" rx="10" ry="9" ${v("eye")}/>`)}</g>`,
    flower: (p) => `<g>${pair(p, (x, y) => `<g transform="translate(${x} ${y})">${[0, 60, 120, 180, 240, 300].map((r) => `<ellipse rx="4.6" ry="7" cy="-6" ${v("eye")} transform="rotate(${r})"/>`).join("")}<rect x="-4" y="-4" width="8" height="8" ${v("orange")}/></g>`)}</g>`,
    rect: (p, pupil) => `<g>${pair(p, (x, y) => `<rect x="${x - 13}" y="${y - 8}" width="26" height="16" rx="2" ${v("eye")}/><rect x="${x - 4}" y="${y - 4}" width="8" height="8" ${v(pupil)}/>`)}</g>`,
    ring: (p) => `<g>${pair(p, (x, y) => `<circle cx="${x}" cy="${y}" r="10" ${v("eye")}/><circle cx="${x}" cy="${y}" r="5" ${v("blue")}/>`)}</g>`,
    slot: (p) => `<g>${pair(p, (x, y) => `<rect x="${x - 16}" y="${y - 9}" width="32" height="18" rx="2" ${v("eye")}/><rect x="${x - 9}" y="${y - 1}" width="18" height="10" ${v("purple")}/>`)}</g>`,
    arch: (p) => `<g fill="none" stroke-width="7" ${s("yellow")}>${pair(p, (x, y) => `<path d="M${x - 11} ${y + 6}a11 11 0 0 1 22 0"/>`)}</g>`,
  };
  // Back to front: beige · purple · pink · green · yellow · orange · sky · navy (the original GIF overlap as is)
  const HILLS = [
    { c: "beige", l: 230, px: 400, py: 6, r: 680, eyes: "sand", at: [[430, 70], [482, 50]] },
    { c: "purple", l: 930, px: 1300, py: 36, r: 1800, eyes: "blob", at: [[1120, 124], [1174, 114]], blink: "b2", tilt: -12 },
    { c: "pink", l: -300, px: 150, py: 44, r: 490, eyes: "diamond", at: [[254, 176], [314, 176]], blink: "b1" },
    { c: "green", l: 470, px: 740, py: 90, r: 980, eyes: "flower", at: [[690, 156], [738, 206]], blink: "b2", tilt: 50 },
    { c: "yellow", l: 830, px: 980, py: 176, r: 1135, eyes: "rect", at: [[934, 230], [986, 230]], pupil: "green" },
    { c: "orange", l: 1315, px: 1480, py: 150, r: 1665, eyes: "ring", at: [[1408, 244], [1474, 224]], blink: "b3", tilt: -16 },
    { c: "blue", l: 1705, px: 1870, py: 90, r: 2015, eyes: "slot", at: [[1824, 174], [1906, 174]], blink: "b3" },
    { c: "navy", l: 1795, px: 2200, py: 88, r: 2800, eyes: "arch", at: [[2166, 184], [2226, 184]] },
  ];
  const B = 289;
  hills.innerHTML = HILLS.map((h) => {
    const k = (B - h.py) * 0.35;
    const d = `M${h.l} ${B + 2}C${h.l} ${h.py + k} ${h.px - (h.px - h.l) * 0.6} ${h.py} ${h.px} ${h.py}C${h.px + (h.r - h.px) * 0.6} ${h.py} ${h.r} ${h.py + k} ${h.r} ${B + 2}Z`;
    const eyes = EYES[h.eyes](h.at, h.pupil);
    return `<g class="ix-hill${h.blink ? ` is-${h.blink}` : ""}"><path d="${d}" ${v(h.c)}/>${h.blink ? `<g class="ix-hill__open">${eyes}</g>${shut(h.at, h.tilt)}` : eyes}</g>`;
  }).join("");
})();
