// Home motion — the Hero is the original TopMv timeline as is: four text groups open from 0 height and width over 1s, letters light up at .15 intervals, rest 1s, then return to place,
// After 1s, eight cells appear with a .1 offset and rotateY +360 (.6s), then on a 32s loop (8s for cells 1·3·6·8, 16s for 2·4·5·7) each cell
// Cycles four scenes (0 · 4 · 16 · 20s): 「play props · letters → working people · notes · work letters → back-side color play → work」. Number cards · speech-bubble rows · role models · roundtable (Swiper).
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ILL = window.crIll;
  gsap.registerPlugin(SplitText);

  // ---------- Eight cells — front · back colors are original values, props · people · text are ours ----------
  const PANELS = [
    ["--site-p-orange", "--site-p-gray", "tent", "bag"],
    ["--site-p-sky", "--site-green", "cup", "van"],
    ["--site-p-lemon", "--site-p-peach", "vase", "watch"],
    ["--site-p-mint", "--site-p-violet", "tools", "key"],
    ["--site-p-gray-2", "--site-p-apricot", "phone", "lipstick"],
    ["--site-green", "--site-p-sky", "tire", "loupe"],
    ["--site-p-peach", "--site-p-lemon", "memo", "car"],
    ["--site-p-violet-2", "--site-p-mint-2", "pin", "cup"],
  ];
  const tiles = [...document.querySelectorAll("[data-tile]")];
  tiles.forEach((t, i) => {
    const [front, back, a, b] = PANELS[i];
    t.style.cssText = `--front: var(${front}); --back: var(${back});${i === 1 ? " --ink: var(--kf-surface);" : ""}`;
    t.innerHTML = `<div class="tile__in"><span class="tile__bg"></span>
      <span class="tile__prop is-a">${ILL[a]()}</span><span class="tile__prop is-b">${ILL[b]()}</span>
      <p class="tile__asobi">#Play ${i + 1}</p>
      <span class="tile__human">${ILL.person()}</span><i class="tile__mark is-1"></i><i class="tile__mark is-2"></i><i class="tile__mark is-3"></i>
      <p class="tile__work">Day ${i + 1}</p></div>`;
  });

  const boxes = [...document.querySelectorAll("[data-mvbox]")];
  if (reduce) gsap.set([...tiles, ...document.querySelectorAll(".tile__prop")], { autoAlpha: 1 });
  else hero();
  function hero() {
  const boxChars = boxes.map((b) => new SplitText(b, { type: "chars" }).chars);

  // ---------- 32s scene of one cell: timings of the original p1TL (o 1.4 · a 4 · l 5 · m 16 · s 17.4 · p 20 · f 21) ----------
  const panelTL = (tile) => {
    const inner = tile.querySelector(".tile__in");
    const props = [...tile.querySelectorAll(".tile__prop")];
    const human = tile.querySelector(".tile__human"), marks = [...tile.querySelectorAll(".tile__mark")], work = tile.querySelector(".tile__work");
    const chars = new SplitText(tile.querySelector(".tile__asobi"), { type: "chars", charsClass: "char" }).chars;
    const tl = gsap.timeline({ paused: true });
    const play = (at, side) => {
      tl.add(() => tile.classList.toggle("u-ura", side), at);
      if (at) tl.to(inner, { rotateY: "+=360", duration: 0.6 }, at);
      else tl.to(inner, { rotateY: "+=360", duration: 0.6 }, 0);
      if (at) {
        tl.set(work, { autoAlpha: 0 }, at + 0.1);
        tl.to([human, ...marks], { autoAlpha: 0, y: -10, duration: 0.4 }, at + 0.1);
      }
      const p0 = at ? at + 0.5 + (side ? 0 : 0) : 0.7;
      props.forEach((el, n) => tl.fromTo(el, { autoAlpha: 0.5, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.4, immediateRender: false }, p0 + n * 0.2));
      tl.set(chars, { autoAlpha: 0 }, at + 1.4);
      tl.fromTo(chars, { autoAlpha: 0.8 }, { autoAlpha: 1, duration: 0, stagger: 0.12, immediateRender: false }, at + 1.4);
    };
    const workScene = (at) => {
      tl.to(inner, { rotateY: "+=360", duration: 0.6 }, at);
      tl.set(chars, { autoAlpha: 0 }, at + 0.1);
      tl.to(props, { autoAlpha: 0, y: -10, duration: 0.4 }, at + 0.1);
      tl.fromTo(human, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.4 }, at + 0.6);
      marks.forEach((m, n) => tl.fromTo(m, { autoAlpha: 0, y: 10, scale: 0.4, transformOrigin: "center bottom" }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.2 }, at + 1.1 + n * 0.3));
      tl.fromTo(work, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, immediateRender: false }, at + 1);
    };
    play(0, false);
    workScene(4);
    play(16, true);
    workScene(20);
    return tl;
  };
  const pTL = tiles.map(panelTL);

  const loopTL = gsap.timeline({ repeat: -1, paused: true });
  gsap.matchMedia().add({ narrow: "(max-width: 768px)", wide: "(min-width: 769px)" }, ({ conditions }) => {
    const [g1, g2] = conditions.narrow ? [[0, 3, 5, 6], [1, 2, 4, 7]] : [[0, 2, 5, 7], [1, 3, 4, 6]];
    loopTL.clear();
    loopTL.add(() => g1.forEach((n) => pTL[n].play(0)), 8);
    loopTL.add(() => g2.forEach((n) => pTL[n].play(0)), 16);
    loopTL.add(() => {}, 32);

    const tl = gsap.timeline();
    const vw = (v) => (conditions.narrow ? `${v}vw` : 0);
    const groups = [["height", 36, 3.333], ["width", 0, 0], ["height", -36, -3.333], ["width", -72, -6.666]];
    boxes.forEach((b, n) => {
      const [dim, x, y] = groups[n];
      tl.from(b, { [dim]: 0, duration: 1 }, n ? ">-0.2" : 1);
      tl.fromTo(b, { autoAlpha: 0, x, y: vw(y) }, { autoAlpha: 1, duration: 1 }, "<");
      tl.fromTo(boxChars[n], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.1, stagger: 0.15 }, "<0.6");
    });
    tl.to([boxes[0], boxes[2], boxes[3]], { x: 0, duration: 1 }, ">1");
    if (conditions.narrow) tl.to([boxes[0], boxes[2], boxes[3]], { y: 0, duration: 1 }, ">");
    tiles.forEach((t, n) => {
      tl.to(t, { autoAlpha: 1, duration: 0 }, n ? "<0.1" : ">1");
      tl.from(t.querySelector(".tile__in"), { rotateY: "+=360", duration: 0.6 }, ">");
      tl.fromTo(t.querySelector(".tile__in"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, "<");
    });
    tl.add(() => loopTL.play(7.9), ">");
    return () => { loopTL.pause(0); pTL.forEach((p) => p.pause(0)); };
  });
  }

  const mm = gsap.matchMedia();

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Original TopComponent — map scenery and shops drop from 120px above at .9 scale with bounce.out, people rise from below
    const land = document.querySelector("[data-landscape]"), shop = document.querySelector("[data-shop]"), persons = document.querySelector("[data-persons]");
    if (land) {
      const t = gsap.timeline({ scrollTrigger: { trigger: land, start: "bottom 80%" } });
      [[land, 0], [shop, 0.3]].forEach(([el, at]) => {
        if (!el) return;
        t.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: "power3.out" }, at);
        t.fromTo(el, { marginTop: -120, scale: 0.9, transformOrigin: "50% 100%" }, { marginTop: 0, scale: 1, duration: 1, ease: "bounce.out" }, at);
      });
      if (persons) {
        const p = gsap.timeline({ scrollTrigger: { trigger: land, start: "bottom 60%" } });
        p.fromTo(persons, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power3.out" }, 0);
        p.fromTo(persons, { marginBottom: -60, scale: 1.2, transformOrigin: "50% 100%" }, { marginBottom: 0, scale: 1, duration: 1, ease: "power4.out" }, 0);
      }
    }
    // Endless flowing row: number cards chained in two sets, speech bubbles in three, shifting by one set’s length
    document.querySelectorAll("[data-marquee]").forEach((row) => {
      const copies = row.closest(".voice") ? 3 : 2;
      const dist = () => row.scrollWidth / copies;
      const rev = row.hasAttribute("data-reverse");
      gsap.fromTo(row, { x: () => (rev ? -dist() : 0) }, { x: () => (rev ? 0 : -dist()), duration: +row.dataset.marquee, ease: "none", repeat: -1 });
    });
  });

  // Role model — original RolemodelSlider: next slide every 8s, pressing re-measures the clock. The previous slide stays covered in place and vanishes over 1s while the next appears over 1s
  const slides = [...document.querySelectorAll(".rm__slide")];
  let cur = 0, timer = 0;
  const change = (from, to) => {
    gsap.set(slides[from], { display: "grid", position: "absolute", left: 0, top: 0 });
    gsap.to(slides[from], { autoAlpha: 0, duration: reduce ? 0 : 1 });
    gsap.set(slides[to], { opacity: 0, display: "grid", position: "relative" });
    gsap.to(slides[to], { autoAlpha: 1, duration: reduce ? 0 : 1 });
  };
  const restart = () => { clearInterval(timer); if (!reduce) timer = setInterval(() => go(1), 8000); };
  const go = (d) => {
    restart();
    const next = (cur + d + slides.length) % slides.length;
    change(cur, next);
    cur = next;
  };
  if (slides.length) {
    slides.forEach((s, i) => gsap.set(s, i ? { display: "none" } : { display: "grid", position: "relative", autoAlpha: 1 }));
    document.querySelector("[data-rm-next]").addEventListener("click", () => go(1));
    document.querySelector("[data-rm-prev]").addEventListener("click", () => go(-1));
    restart();
  }

  // Roundtable — original DiscussionSlider: Swiper (init false) is started after 1.1s, and when the section changes the TYPE badge text reappears after .7s over .5s
  const disc = document.querySelector("[data-disc]");
  if (disc && window.Swiper) {
    const sw = new Swiper(disc, {
      init: false, loop: true, loopAdditionalSlides: 3, slidesPerView: "auto", spaceBetween: 36, speed: reduce ? 0 : 1000,
      navigation: { nextEl: "[data-disc-next]", prevEl: "[data-disc-prev]" },
      autoplay: reduce ? false : { delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true },
      breakpoints: { 481: { spaceBetween: 80 } },
    });
    sw.on("slideChange", (s) => {
      const badge = s.slides[s.activeIndex]?.querySelector(".ds__type");
      if (badge && !reduce) gsap.fromTo(badge, { opacity: 0.6 }, { opacity: 1, delay: 0.7, duration: 0.5, ease: "power3.out" });
    });
    setTimeout(() => sw.init(), reduce ? 0 : 1100);
  }
})();
