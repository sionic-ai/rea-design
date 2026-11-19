// Shared motion of sub-pages (About · Work detail · Contact): first title line mask, line mask on scroll-in, gray → true color text fill, photo growth (like cell division),
// Photo parallax, flowing mail strip, metal drops. Original values: line mask power3.out stagger .1 · text fill scrub · strip loop 20s.
(() => {
  const SB = window.SB;
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  SB.ready.then(() => {
    const tl = gsap.timeline({ delay: 0.1 });
    $$("[data-intro]").forEach((el, i) => SB.clipLines(tl, el, i * 0.15));
    $$("[data-intro-fade]").forEach((el, i) => tl.from(el, { opacity: 0, y: 40, duration: 1, ease: "power3.out" }, 0.3 + i * 0.08));
  });

  $$("[data-lines]").forEach((el) => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 85%" } });
    SB.clipLines(tl, el, 0);
  });

  // Text that fills from gray to its true color line by line (original data-scroll="title")
  $$("[data-fill]").forEach((el) => {
    const lines = new SplitText(el, { type: "lines", linesClass: "fill-line" }).lines;
    gsap.fromTo(lines, { opacity: 0.25 }, { opacity: 1, stagger: 0.3, ease: "none", scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: true } });
  });

  // Like the original, six droplets merge to reveal the photo (shader) — the photo panel wobbles around the cursor
  $$("[data-grow]").forEach((el) => SB.media(el));
  // Four About hero photos: the original is a photo panel with only cursor wobble and no entrance (data-webgl-media, no entrance)
  $$("[data-media]").forEach((el) => SB.media(el, { mitosis: false }));

  $$("[data-parallax]").forEach((el) => {
    gsap.fromTo(el, { y: 0 }, { y: () => -Number(el.dataset.parallax) * innerHeight, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
  });

  // Contact: the whole screen is a mail link so the pill follows the cursor anywhere
  const ct = document.querySelector(".ct");
  // Original: only the 50rem cell at the bottom right of the name is a mail link — entering it makes the pill follow the cursor and the arrow cell opens (leaving folds it)
  const zone = document.querySelector(".ct__zone");
  if (zone) {
    const cta = zone.querySelector(".sb-cta"), follower = zone.querySelector(".ct__follower");
    // As in the original, the pill rests below the cell center, then follows the cursor (measured: when rising to the cell center, horizontal stays and only vertical moves up) — the same curve arrives over .95s (measured 95% at 550ms)
    const rest = () => gsap.set(follower, { x: (zone.offsetWidth - follower.offsetWidth) / 2, y: zone.offsetHeight - follower.offsetHeight });
    rest();
    new ResizeObserver(rest).observe(zone);
    SB.follow(zone, follower, { fade: false, duration: 0.95, onOn: () => cta.classList.add("is-active"), onOff: () => cta.classList.remove("is-active") });
  }
  // Work detail ”Next work”: hovering the link shows that work’s preview card, which follows the cursor
  const next = document.querySelector(".wk-next");
  if (next) SB.follow(next, next.querySelector(".wk-next__card"), { trigger: next.querySelector(".wk-next__link") });

  const mq = document.querySelector(".marquee");
  if (mq) {
    const cta = mq.querySelector(".marquee__follower .sb-cta");
    SB.follow(mq, mq.querySelector(".marquee__follower"), { duration: 0.55, proximity: mq.querySelector(".marquee__link"), onOn: () => cta.classList.add("is-active"), onOff: () => cta.classList.remove("is-active") });
  }

  // Original settings as they are: a Work heading is an accent blob in that Work’s three colors (fills the background too), anything else is a soft blob in one color (size .7 · cursor 50px · appears when it enters the screen)
  // The Work header board ends at the center of the phone screen like the original (data-hero-mesh-boundary)
  $$("[data-blobs]").forEach((c) => SB.blobs(c, { colors: ["--wk-c1", "--wk-c2", "--wk-c3"], bound: c.parentElement.querySelector(".wk-phone") }));
  $$("[data-bubbles]").forEach((c) => {
    const b = SB.blobs(c, { soft: true, only: true, scale: 0.7, cursorPx: 50, opacity: 1, invert: c.dataset.bubbles === "invert", auto: c.closest(".ct") == null });
    // Original contact: entering the mail field hides the cursor blob, and leaving brings it back (mouse devices only)
    const mail = c.parentElement.querySelector(".ct__zone");
    if (!b || !mail || !matchMedia("(hover: hover), (pointer: fine)").matches) return;
    mail.addEventListener("mouseenter", () => b.cursor(false));
    mail.addEventListener("mouseleave", () => b.cursor(true));
  });
})();
