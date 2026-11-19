// Home page — header title shrink·first screen push, title letter rise, photo train, big text swap under the line vase, photo ring, size picker, collection title, flower arranging.
(() => {
  const W = () => innerWidth;
  const mm = gsap.matchMedia();
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const hero = document.querySelector(".hero"), story = document.querySelector(".story");
  const title = document.querySelector(".ot-head__title");

  // Interaction reactions and presses work regardless of the reduced-motion setting
  // Size picker — name, dimensions and value roll with .6s otto, delayed by .05 each (upward when going to the bigger one)
  const sizes = [...document.querySelectorAll(".card__size")];
  const marks = ["I", "II", "III"];
  const cardName = document.querySelector(".card__name .roll"), cardDim = document.querySelector(".card__dim"), cardBuy = document.querySelector(".card__buy .roll");
  let size = sizes.findIndex((b) => b.classList.contains("is-on"));
  sizes.forEach((b, i) => b.addEventListener("click", () => {
    if (i === size) return;
    const up = i > size;
    size = i;
    sizes.forEach((o) => { o.classList.toggle("is-on", o === b); o.setAttribute("aria-selected", String(o === b)); });
    window.otRoll(cardName, `Object One (${marks[i]})`, up);
    window.otRoll(cardDim, `W 000 × D 00 × H 000 mm (${marks[i]})`, up, 0.05);
    window.otRoll(cardBuy, "Buy from €0000", up, 0.1);
  }));
  const hits = [...document.querySelectorAll(".bq__hit")];
  hits.forEach((b) => b.addEventListener("click", () => { document.getElementById(b.dataset.flower)?.classList.add("is-in"); b.disabled = true; }));

  // Flower arranging gesture — once the stage is over 55% visible, from 1.2s later and every 3s, if no hand is over a flower and unplaced flowers remain, the ‹Press› label rolls once with the same letters (1.4s otto-inout)
  const bqStage = document.querySelector(".bq__stage"), bqClick = document.querySelector(".bq__click");
  if (bqStage && bqClick && !reduce) {
    const word = bqClick.textContent.trim();
    let seen = false, near = -1, timer = null;
    hits.forEach((b, i) => {
      b.addEventListener("pointerenter", () => (near = i));
      b.addEventListener("pointerleave", () => near === i && (near = -1));
    });
    const nudge = () => {
      if (seen && near < 0 && hits.some((b) => !b.disabled)) window.otRoll(bqClick, word, true, 0, 1.4, "otto-inout");
      timer = gsap.delayedCall(3, nudge);
    };
    new IntersectionObserver(([e]) => {
      const was = seen;
      seen = e.isIntersecting;
      if (seen && !was) { timer?.kill(); timer = gsap.delayedCall(1.2, nudge); }
    }, { threshold: 0.55 }).observe(bqStage);
  }

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Center header title: shrinks to .24x while the hero scrolls past and settles at header-bar height
    if (title && hero) {
      gsap.fromTo(title, { scale: 1, y: 0 }, {
        scale: W() < 768 ? 1 : 0.24, y: () => 5 * (W() / 1440), ease: "none", transformOrigin: "50% 0%",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom 85%", scrub: 0.6, invalidateOnRefresh: true },
      });
    }
    // While the story section rises, the first photo is pushed 32% and the shade goes to .55
    gsap.timeline({ scrollTrigger: { trigger: story, start: "top bottom", end: "top top", scrub: true }, defaults: { ease: "none" } })
      .to(".hero__stage", { yPercent: 32 }, 0).to(".hero__shade", { opacity: 0.55 }, 0);

    // Big title — each letter rises from 150% below in 1.25s otto, .028 between letters·.16 between lines (once at 62% of the screen)
    const lines = [...document.querySelectorAll(".story__title .line__in")];
    const splits = lines.map((l) => new SplitText(l, { type: "words,chars", wordsClass: "w" }));
    splits.forEach((s) => gsap.set(s.chars, { yPercent: 150 }));
    const tl = gsap.timeline({ paused: true });
    splits.forEach((s, i) => tl.to(s.chars, { yPercent: 0, duration: 1.25, ease: "otto", stagger: 0.028 }, i * 0.16));
    ScrollTrigger.create({ trigger: story, start: "top 62%", once: true, onEnter: () => tl.play() });

    // Photo train — each photo rises from 90% down and sticks, front photo first (tied to scroll, scrub .4) · the whole group drifts up against the scroll by −5%
    const pics = [...document.querySelectorAll(".story__picture")];
    gsap.set(pics, { yPercent: 90 });
    const train = gsap.timeline({ paused: true });
    pics.forEach((p, i) => train.to(p, { yPercent: 0, duration: 1.2 - i * 0.12, ease: "power3.out" }, i * 0.12));
    ScrollTrigger.create({ trigger: story, start: "top bottom", endTrigger: pics[pics.length - 1], end: "center 82%", scrub: 0.4, animation: train });
    const col = document.querySelector(".story__pictures"), setY = gsap.quickSetter(col, "y", "px");
    ScrollTrigger.create({ trigger: story, start: "top bottom", end: "bottom top", onUpdate: () => setY((scrollY - story.offsetTop) * -0.05) });

    // Intro text — each line from 150% below with 1.15s otto · .07 stagger, once at 88% of the screen
    const leads = [...document.querySelectorAll(".story__lead .line__in, .story__details .line__in")];
    const buy = document.querySelectorAll(".story__buy a");
    gsap.set(leads, { yPercent: 150 });
    gsap.set(buy, { opacity: 0 });
    ScrollTrigger.create({ trigger: ".story__lead", start: "top 88%", once: true, onEnter: () => {
      gsap.to(leads, { yPercent: 0, duration: 1.15, ease: "otto", stagger: 0.07 });
      gsap.to(buy, { opacity: 1, duration: 0.8, ease: "otto", delay: 0.07 * leads.length });
    } });

    // Big text under the line vase — changes at progress 55%, 70%, 85% (out .35s power2.in → in .8s otto)
    const big = document.querySelector(".spin__big .line__in"), side = [...document.querySelectorAll(".spin__side li")];
    const words = ["Four forms", "Three tubes", "One object"];
    let step = -1;
    gsap.set(big, { yPercent: 150 });
    const swap = (to) => {
      const down = to > step;
      side.forEach((li, i) => li.classList.toggle("is-on", i === to));
      if (step < 0) { big.textContent = words[to]; gsap.fromTo(big, { yPercent: 150 }, { yPercent: 0, duration: 1.1, ease: "otto", overwrite: true }); }
      else if (to < 0) gsap.to(big, { yPercent: 150, duration: 0.6, ease: "otto", overwrite: true });
      else gsap.to(big, { yPercent: down ? -150 : 150, duration: 0.35, ease: "power2.in", overwrite: true, onComplete: () => { big.textContent = words[to]; gsap.fromTo(big, { yPercent: down ? 150 : -150 }, { yPercent: 0, duration: 0.8, ease: "otto" }); } });
      step = to;
    };
    ScrollTrigger.create({ trigger: ".spin", start: "top top", end: "bottom bottom", onUpdate: (s) => {
      const p = s.progress, to = p < 0.55 ? -1 : p < 0.7 ? 0 : p < 0.85 ? 1 : 2;
      if (to !== step) swap(to);
    } });

    // Photo ring — nine photos on a tilted circle turn about half of 1.4 turns with scroll, and at the end gather to the center while fading
    const items = [...document.querySelectorAll(".gal__item")], ring = document.querySelector(".gal__ring");
    const gn = document.querySelector(".gal__n .line__in"), gc = document.querySelector(".gal__cap .line__in");
    const caps = ["Your photo caption 1", "Your photo caption 2", "Your photo caption 3", "Your photo caption 4", "Your photo caption 5", "Your photo caption 6", "Your photo caption 7", "Your photo caption 8", "Your photo caption 9"];
    let front = -1;
    const place = (p) => {
      const R = Math.min(innerWidth, innerHeight) * 0.3, spin = p * Math.PI * 1.4, gather = gsap.parseEase("otto-inout")(Math.max(0, (p - 0.78) / 0.22));
      let best = -1e9, bi = 0;
      items.forEach((it, i) => {
        const a = (i / items.length) * Math.PI * 2 + spin;
        const x = Math.cos(a) * R * 1.35 * (1 - gather), z = Math.sin(a) * R * 1.1 * (1 - gather), y = Math.sin(a + 0.6) * R * 0.32 * (1 - gather);
        it.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${y}px, ${z}px) rotateY(${(-a * 180) / Math.PI * 0.25}deg)`;
        it.style.opacity = String(1 - gather);
        if (z > best) { best = z; bi = i; }
      });
      ring.style.transform = "rotateX(-12deg) rotateZ(-14deg)";
      if (bi !== front) {
        const down = bi > front;
        if (front < 0) { gn.textContent = String(bi + 1).padStart(2, "0"); gc.textContent = caps[bi]; }
        else [gn, gc].forEach((e, k) => gsap.to(e, { yPercent: down ? -150 : 150, duration: 0.35, delay: k * 0.06, ease: "power2.in", overwrite: true, onComplete: () => {
          e.textContent = k ? caps[bi] : String(bi + 1).padStart(2, "0");
          gsap.fromTo(e, { yPercent: down ? 150 : -150 }, { yPercent: 0, duration: 0.8, ease: "otto" });
        } }));
        front = bi;
      }
    };
    const orbit = { p: 0 };
    gsap.to(orbit, { p: 1, ease: "none", onUpdate: () => place(orbit.p), scrollTrigger: { trigger: ".gal", start: "top top", end: "bottom bottom", scrub: 0.4 } });
    place(0);

    // Pick card — name, size, dimensions, and location rise in turn where the photo rings gather (1.1s otto · .08)
    const cardParts = document.querySelectorAll(".card__name, .card__size, .card__dims, .card__buy");
    gsap.set(cardParts, { opacity: 0, y: 12 });
    ScrollTrigger.create({ trigger: ".store", start: "top 55%", once: true, onEnter: () => gsap.to(cardParts, { opacity: 1, y: 0, duration: 1.1, ease: "otto", stagger: 0.08 }) });

    // Collection title — each chunk from 150% below, 1.25s otto, .1 apart
    const co = document.querySelectorAll(".co__title .line__in");
    gsap.set(co, { yPercent: 150 });
    ScrollTrigger.create({ trigger: ".co", start: "top 80%", once: true, onEnter: () => gsap.to(co, { yPercent: 0, duration: 1.25, ease: "otto", stagger: 0.1 }) });
    return () => splits.forEach((s) => s.revert());
  });
  if (reduce) document.querySelector(".spin__big .line__in").textContent = "Four forms";
})();
