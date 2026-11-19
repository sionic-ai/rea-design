// First page scene. Numbers as in the original — section title entrance "top center+=25%", photo parallax scrub .8,
// MV stacking scrub .8 (thumbnail gap .8), blind 20 lines scrub true (.1 gap), last photo scrub 1.
(() => {
  const { $, $$, reduce, isSp } = window.HS;
  const enter = "top center+=25%";
  const mm = gsap.matchMedia();

  // Performance card: four venues swap with a blink every 3s and the dot becomes a cross — pressing a dot goes to that venue
  const infoItems = $$(".hs-live__info-item");
  const infoDots = $$(".hs-live__progress .hs-dot");
  let infoIndex = 1;
  const showInfo = (i) => {
    [...infoItems, ...infoDots].forEach((el) => el.removeAttribute("data-active"));
    $(`.hs-live__info-item[data-index="${i}"]`)?.setAttribute("data-active", "");
    $(`.hs-live__progress .hs-dot[data-index="${i}"]`)?.setAttribute("data-active", "");
  };
  if (infoItems.length) {
    showInfo(1);
    setInterval(() => showInfo((infoIndex = infoIndex >= infoItems.length ? 1 : infoIndex + 1)), 3000);
    infoDots.forEach((d) => d.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      showInfo((infoIndex = +d.dataset.index));
    }));
  }

  // Post-show photos: hovering a card (on phones, the card swiped to center) raises its photo up in .6s
  const bgs = $$(".hs-live__bg-image");
  let bgZ = 1;
  let bgCurrent = "1";
  gsap.set(bgs, { opacity: 0, zIndex: 0 });
  gsap.set('.hs-live__bg-image[data-index="1"]', { opacity: 1, zIndex: bgZ });
  const switchBg = (i) => {
    if (i === bgCurrent) return;
    const bg = $(`.hs-live__bg-image[data-index="${i}"]`);
    if (!bg) return;
    bgCurrent = i;
    bg.style.zIndex = ++bgZ;
    gsap.fromTo(bg, { opacity: 0 }, { opacity: 1, duration: reduce ? 0 : 0.6, ease: "power2.out", overwrite: "auto" });
  };
  const liveItems = $$(".hs-live__item");
  liveItems.forEach((it) => it.addEventListener("mouseenter", () => switchBg(it.dataset.index)));
  const liveList = $(".hs-live__list");
  let liveTimer = null;
  liveList?.addEventListener("scroll", () => {
    if (!isSp()) return;
    clearTimeout(liveTimer);
    liveTimer = setTimeout(() => {
      const r = liveList.getBoundingClientRect();
      const mid = r.left + r.width / 2;
      let best = null, min = Infinity;
      liveItems.forEach((it) => {
        const b = it.getBoundingClientRect();
        const d = Math.abs(mid - (b.left + b.width / 2));
        if (d < min) [min, best] = [d, it];
      });
      if (best) switchBg(best.dataset.index);
    }, 100);
  });

  // Light up the MV title, info and dot with the same index
  const showMv = (i) => {
    $$(".hs-mv__info-title span, .hs-mv__meta-item, .hs-mv__progress .hs-dot").forEach((el) => el.removeAttribute("data-active"));
    if (!i) return;
    [".hs-mv__info-title span", ".hs-mv__meta-item", ".hs-mv__progress .hs-dot"].forEach((s) =>
      $(`${s}[data-index="${i}"]`)?.setAttribute("data-active", ""));
  };

  // Blind strips, 20 rows
  const kvLine = $(".hs-mv__kv-line");
  for (let i = 0; i < 20; i++) kvLine.appendChild(document.createElement("i"));
  const lines = $$("i", kvLine);

  mm.add("(prefers-reduced-motion: reduce)", () => {
    gsap.set(".hs-first__logo", { opacity: 1 });
    const items = $$(".hs-mv__item");
    items.slice(0, -1).forEach((it) => it.setAttribute("data-prev", ""));
    showMv(items.length);
  });

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Hero: logo, label characters, news band and MENU in one tempo
    const job = new SplitText(".hs-first__job", { type: "chars", reduceWhiteSpace: false });
    const name = new SplitText(".hs-first__name", { type: "chars", reduceWhiteSpace: false });
    gsap.set([job.chars, name.chars, ".hs-first__news", ".hs-header"], { opacity: 0 });
    gsap.timeline()
      .fadeIn(".hs-first__logo", "show")
      .fadeInRandom(job.chars, "show")
      .fadeInRandom(name.chars, "show")
      .fadeIn(".hs-first__news, .hs-header", "show");

    // Large title: characters slide in from 50rem on the right and light up
    const titleIn = (sel) => {
      const split = new SplitText(sel, { type: "chars" });
      gsap.set(split.chars, { opacity: 0 });
      return gsap.timeline({ scrollTrigger: { trigger: sel, start: enter } }).fadeInLeft(split.chars, "show");
    };

    // News
    titleIn(".hs-topics__title");
    gsap.set([".hs-topics__cat-title", ".hs-topics__list"], { opacity: 0 });
    $$(".hs-topics__cat").forEach((cat) => {
      gsap.timeline({ scrollTrigger: { trigger: cat, start: enter } })
        .flicker($(".hs-topics__cat-title", cat), "show")
        .flicker($(".hs-topics__list", cat), "show");
    });
    gsap.set(".hs-topics__kv--1 .hs-photo", { scale: 1.1, yPercent: -5 });
    gsap.set(".hs-topics__kv--2 .hs-photo", { scale: 1.2, yPercent: -15 });
    gsap.to(".hs-topics__kv--1 .hs-photo", { yPercent: 5, ease: "none", scrollTrigger: { trigger: ".hs-topics__kv--1", start: "top bottom", end: "bottom top", scrub: 0.8 } });
    gsap.to(".hs-topics__kv--2 .hs-photo", { yPercent: 10, ease: "none", scrollTrigger: { trigger: ".hs-topics__kv--2", start: "top bottom", end: "bottom top", scrub: 0.8 } });

    // Performance: three cards flash on at 0 / .05 / .15s
    titleIn(".hs-live__title");
    gsap.set(".hs-live__inner", { opacity: 0 });
    gsap.timeline({ scrollTrigger: { trigger: ".hs-live__inner", start: enter } })
      .flicker(".hs-live__inner--1", "show")
      .flicker(".hs-live__inner--2", "show+=0.05")
      .flicker(".hs-live__inner--3", "show+=0.15");

    // Albums: the remaining jackets at random .03 intervals, the big center jacket at .75s
    const discoTitle = titleIn(".hs-disco__title");
    gsap.set(".hs-disco__item", { opacity: 0 });
    discoTitle
      .flicker('.hs-disco__item:not([data-index="1"])', { stagger: { from: "random", each: 0.03 } }, "show+=0.25")
      .flicker('.hs-disco__item[data-index="1"]', "show+=0.75");
    const timers = [];
    const flickerLoop = (el) => {
      timers.push(setTimeout(() => {
        el.setAttribute("data-flicker", "");
        el.addEventListener("animationend", () => { el.removeAttribute("data-flicker"); flickerLoop(el); }, { once: true });
      }, Math.random() * 10000));
    };
    $$(".hs-disco__text").forEach(flickerLoop);

    // MV: while pinned, thumbnails rise from below (100vh, .6x) and stack up, and after all are up the 10% border is peeled off
    titleIn(".hs-mv__title");
    const items = $$(".hs-mv__item");
    const stack = gsap.timeline({ scrollTrigger: { trigger: ".hs-mv__container", start: "top top", end: "bottom bottom", scrub: 0.8, pin: ".hs-mv__contents" } });
    items.forEach((it, i) => {
      stack.fromTo(it, { y: () => innerHeight, scale: 0.6 }, {
        y: 0, scale: 1, duration: 1, ease: "none",
        onComplete: () => { if (i > 0) items[i - 1].dataset.prev = ""; showMv(i + 1); },
        onReverseComplete: () => { if (i > 0) delete items[i - 1].dataset.prev; showMv(i); },
      }, i * 0.8);
      stack.fromTo(it, { clipPath: "inset(10% 10% 10% 10%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "none" });
      if (i > 0) stack.fromTo($(".hs-mv__overlay", items[i - 1]), { opacity: 0 }, { opacity: 0.75, duration: 0.6, ease: "none" }, "<");
    });

    // Blinds: fill up from the bottom row at .1 intervals
    const blind = gsap.timeline({ scrollTrigger: { trigger: ".hs-mv__kv", start: isSp() ? "top center" : "top top", end: "bottom top", scrub: true } });
    lines.forEach((l, i) => blind.to(l, { scaleY: 1, duration: 1, ease: "none" }, i * 0.1));
    gsap.set(".hs-mv__kv-img", { scale: 1.1, yPercent: isSp() ? -5 : -10 });
    gsap.to(".hs-mv__kv-img", { yPercent: isSp() ? 5 : 10, ease: "none", scrollTrigger: { trigger: ".hs-mv__kv", start: "top bottom", end: "bottom top", scrub: 1 } });

    return () => {
      timers.forEach(clearTimeout);
      [job, name].forEach((s) => s.revert());
    };
  });
})();
