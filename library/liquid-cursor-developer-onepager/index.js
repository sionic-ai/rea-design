(() => {
  const site = window.aqSite;
  const { reduce, touch, CHARS } = site;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const hero = $(".aq-hero");

  // Hero entrance — once the loader lifts, title lines rise from below (1.5s expo.out, .1 apart, the whole wrapped in power1.out),
  // Small text is written in over .5s, shuffling in blank space (1.2s expo.out), and bars · buttons · dots grow from 0 (expo.inOut)
  const scrambles = [...$$(".aq-glitch", hero), ...$$(".aq-header .aq-roll__a > span")].filter((el) => !el.children.length || el.tagName === "P");
  const texts = scrambles.map((el) => el.innerHTML);
  if (!reduce) scrambles.forEach((el) => (el.textContent = ""));
  const lines = $$(".aq-hero__line");
  const intro = gsap.timeline({ paused: true });
  const titleTl = gsap.timeline({ paused: true });
  lines.forEach((l, i) => titleTl.lineIn(l, { duration: 1.5, ease: "expo.out" }, i * .1).set(l, { clearProps: "clipPath" }, ">"));
  const prog = { v: 0 };
  intro.to(prog, { v: 1, duration: titleTl.duration(), ease: "power1.out", onUpdate: () => titleTl.progress(prog.v) }, 0);
  scrambles.forEach((el, i) => {
    const html = texts[i];
    const late = el.closest(".aq-hero__discover") ? .15 : 0;
    intro.to(el, { scrambleText: { text: el.tagName === "P" ? html.replace(/<br\s*\/?>/g, "\n") : html, chars: CHARS, speed: .6 }, duration: 1.2, ease: "expo.out", onComplete: () => (el.innerHTML = html) }, .5 + late);
  });
  intro.from(".aq-progress", { scaleX: 0, transformOrigin: "left", duration: 1, ease: "expo.inOut" }, .5)
    .fromTo(".aq-progress__num", { xPercent: 50, clipPath: "inset(0% 50% 0% 50%)" }, { xPercent: 0, clipPath: "inset(0% 0% 0% 0%)", duration: .6, ease: "expo.out" }, 1)
    .from(".aq-hero__next", { scale: 0, transformOrigin: "left bottom", duration: .7, ease: "expo.inOut" }, .5)
    .from(".aq-header__contact", { scaleX: 0, transformOrigin: "right", duration: 1, ease: "expo.inOut" }, .5)
    .lineIn(".aq-header__contact .aq-flip__text", { duration: 1, ease: "expo.out" }, 1.2)
    .from([...$$(".aq-eggs .aq-sq"), ".aq-hero__square", ".aq-hero .aq-dot"], { scale: 0, duration: 1, ease: "expo.inOut" }, .5)
    .from([...$$(".aq-hero .aq-cta__arrow"), ...$$(".aq-header .aq-cta__arrow"), ...$$(".aq-corner")], { scale: 0, ease: "expo.inOut", duration: .6 }, .8);
  const nextSq = site.squares.find((s) => s.btn.classList.contains("aq-hero__next"));
  if (nextSq) {
    gsap.set(nextSq.a, { yPercent: -175 });
    intro.to(nextSq.a, { yPercent: 0, duration: .67, ease: "expo.inOut" }, .8);
    nextSq.btn.addEventListener("click", () => site.scrollTo(innerHeight));
  }
  if (reduce) intro.progress(1);
  else gsap.set(lines, { yPercent: 110, clipPath: "inset(-50% 0% 150% 0%)" });
  site.onReady.push(() => { if (!reduce) intro.play(); });

  // Hidden device — sound slot: from the bottom right corner it grows straight at .85 → with expo.out while the text is written scrambled, and ten bars each stretch and shrink in a wave.
  const audio = $('[data-egg="audio"]');
  if (audio) {
    const pop = $("[data-pop]", audio), btn = $("button.aq-sq", audio), cover = $(".aq-pop__cover", audio), text = $(".aq-pop__text", audio);
    const songs = [["Song Title", "- Artist Name"], ["Second Track", "- Band Name"], ["Third Song", "- Singer Name"]];
    let song = 0, open = false;
    const openTl = gsap.timeline({ paused: true, defaults: { ease: "none", duration: .85 } })
      .from(pop, { scale: 0, transformOrigin: "bottom right", immediateRender: false }, 0)
      .from(cover, { opacity: 0, duration: .25 }, "<+=0.6")
      .from(text.children, { scrambleText: { text: "", chars: CHARS, speed: .5 }, duration: .3, ease: "expo.out" }, .15);
    gsap.set(pop, { scale: 0 });
    const KEYS = [[.5, [3, 1]], [.5, [1.8, 1]], [1, [2, 3, 1]], [1, [2, 3, 1]], [1, [.8, 1.5, 1]], [.75, [.4, 1]], [.75, [.4, 1]], [.75, [.4, 1]], [.75, [.4, 1]], [.75, [.4, 1]]];
    const bars = gsap.timeline({ paused: true });
    $$(".aq-bars rect", audio).forEach((r, i) => {
      const [d, key] = KEYS[i % KEYS.length];
      bars.to(r, { keyframes: { scaleY: key, ease: "none" }, duration: d, delay: .05 * i, ease: "none", repeat: -1, yoyo: true }, 0);
    });
    btn.addEventListener("click", () => {
      open = !open;
      btn.setAttribute("aria-expanded", open);
      pop.classList.toggle("is-open", open);
      if (open) { openTl.tweenTo(openTl.duration(), { ease: "expo.out" }); bars.play(); }
      else { openTl.tweenTo(0, { ease: "expo.out", duration: .6 }); bars.pause(); }
    });
    $(".aq-pop__next", audio).addEventListener("click", () => {
      const prev = songs[song];
      song = (song + 1) % songs.length;
      const spans = text.children;
      [1, 2].forEach((k) => {
        spans[k].textContent = songs[song][k - 1];
        gsap.from(spans[k], { scrambleText: { text: prev[k - 1], chars: CHARS, speed: .2 }, duration: .6, ease: "expo.out" });
      });
      gsap.from(cover, { opacity: 0, duration: 1, delay: .3 });
    });
  }
  // Message cell: the band slides in from the right by its own width, revealing from the left (the sound cell shifts aside too), and the text is written scrambled in .8s
  const textEgg = $('[data-egg="text"]');
  if (textEgg && audio) {
    const box = $(".aq-msg__box", textEgg), msg = $("[data-msg-text]", textEgg), btn = $("button.aq-sq", textEgg);
    const words = msg.textContent;
    let open = false, tl, write;
    const build = () => {
      const w = box.clientWidth;
      tl?.revert();
      tl = gsap.timeline({ paused: true, defaults: { ease: "none", duration: 1 } })
        .fromTo(box, { x: w, clipPath: "inset(0% 100% 0% 0%)" }, { x: 0, clipPath: "inset(0% 0% 0% 0%)" })
        .from(audio, { x: w }, "<");
      tl.progress(open ? 1 : 0);
    };
    write = gsap.timeline({ paused: true }).fromTo(msg, { scrambleText: { text: "" } }, { scrambleText: { text: words, chars: CHARS, speed: .2 }, duration: .8, ease: "expo.out" }, .1);
    build();
    new ResizeObserver(build).observe(box);
    btn.addEventListener("click", () => {
      open = !open;
      btn.setAttribute("aria-expanded", open);
      if (open) { tl.tweenTo(tl.duration(), { ease: "expo.out" }); write.tweenTo(write.duration()); }
      else tl.tweenTo(0, { ease: "expo.out", onComplete: () => write.seek(0) });
    });
  }

  // Big sentence — split into lines, each rises all the way at once (power1.out) after passing the bottom 25% of the screen, and resets to the start when it leaves upward again.
  // If the font loads late or the width changes, SplitText restores the original HTML and splits again, so hover interactions, repeats and shuffles are re-attached to the new elements every time it splits.
  const STAR = [{ scale: 1.1, duration: .1 }, { scale: .9, duration: .1 }, { scale: 1, duration: .1 }, { scale: .9, duration: .1 }, { scale: 1, duration: .1 }, { scale: 1.1, duration: .1, delay: .2 }, { scale: .9, duration: .1 }, { scale: 1, duration: .1 }, { scale: .9, duration: .1 }, { scale: 1, duration: .1 }, { scale: 1.1, duration: .1, delay: .2 }, { scale: .9, duration: .1 }, { scale: 1, duration: .1 }];
  const wire = (box, lines, state) => {
    const tl = gsap.timeline({ paused: true });
    const topBefore = box.dataset.topBefore || "";
    const subs = $$(".aq-top-text, .aq-bottom-text", box).map((el) => {
      const top = el.classList.contains("aq-top-text");
      el.classList.add("aq-glitch");
      const words = (top ? topBefore : "") + (el.dataset.words ||= el.textContent);
      return { at: top ? 0 : 3, tw: gsap.fromTo(el, { scrambleText: { text: "" } }, { scrambleText: { text: words, chars: CHARS, speed: .6 }, duration: .6, ease: "expo.out", paused: true }) };
    });
    lines.forEach((l, i) => {
      tl.lineIn(l, { duration: 1.5, ease: "expo.out" }, i * .1).set(l, { clearProps: "clipPath" }, ">");
      const s = subs.find((x) => x.at === i);
      if (s) tl.add(s.tw.play(), i * .1 + .9);
    });
    tl.addLabel("end");
    if (state.done) tl.progress(1);
    ScrollTrigger.create({
      trigger: box, start: "top bottom", end: "top bottom-=25%",
      onLeaveBack: () => { state.done = false; tl.seek(0); },
      onLeave: () => { state.done = true; tl.tweenTo("end", { ease: "power1.out" }); },
    });
    const star = $(".aq-picto--star", box), plus = $(".aq-more > span", box);
    if (star) gsap.to(star, { keyframes: STAR, repeat: -1, transformOrigin: "center", ease: "none" });
    if (plus) gsap.to(plus, { keyframes: [{ rotate: -180, xPercent: 50, ease: "expo.inOut" }, { rotate: 0, xPercent: 0, ease: "expo.inOut" }], duration: 2, transformOrigin: "center 57%", repeat: -1, repeatDelay: 1 });
    if (touch) return;
    $$("a[data-link]", box).forEach((a) => {
      const svg = $(".aq-link-arrow", a), one = $(".aq-roll__a", a), two = $(".aq-roll__b", a);
      const ltl = gsap.timeline({ paused: true, defaults: { duration: .8, ease: "none" } })
        .fromTo(svg, { rotate: 45 }, { rotate: 0, yPercent: 15, duration: .5 }, 0)
        .from(svg.lastElementChild, { drawSVG: "0% 62.75%", duration: .5 }, ">")
        .to([...one.children].slice(0, -1), { yPercent: -100, stagger: .06 }, 0)
        .to([...two.children].slice(0, -1), { yPercent: -100, stagger: .06 }, "<");
      a.addEventListener("mouseenter", () => ltl.tweenTo(ltl.duration(), { ease: "power3.out", duration: 1 }));
      a.addEventListener("mouseleave", () => ltl.tweenTo(0, { ease: "power3.out", duration: 1 }));
    });
  };
  $$("[data-statement]").forEach((box) => {
    $$("a[data-link]", box).forEach((a) => {
      const { wrap } = site.roll(a, "char");
      a.textContent = "";
      a.append(wrap, site.arrowSvg("aq-link-arrow"));
    });
    if (reduce) return;
    const state = { done: false };
    let ctx;
    const mm = gsap.matchMedia();
    mm.add({ all: "all", tab: "(min-aspect-ratio: 3/5) and (min-width: 768px)", desk: "(min-aspect-ratio: 3/5) and (min-width: 1200px)" }, () => {
      const split = SplitText.create(box.children, { type: "lines", linesClass: "aq-line", autoSplit: true, deepSlice: false, onSplit(self) {
        ctx?.revert();
        ctx = gsap.context(() => wire(box, self.lines, state));
      } });
      return () => { ctx?.revert(); split.revert(); };
    });
  });

  // Confidential text — once past 15% from the screen bottom it is written from blank in 2.2s expo.out, and pressing the document button erases it (.6), an underscore cursor blinks three times (1.2) and it is written again (2)
  const conf = $(".aq-conf");
  if (conf) {
    const ghost = $(".aq-conf__ghost", conf), live = $("[data-conf-live]", conf);
    const words = ghost.textContent;
    let write = gsap.to(live, { scrambleText: { text: words, chars: CHARS, speed: .1 }, duration: 2.2, ease: "expo.out", paused: true });
    let replay;
    if (reduce) live.textContent = words;
    else ScrollTrigger.create({ trigger: ghost, start: "top bottom", end: "top bottom-=15%", onEnter: () => { replay?.kill(); write.play(); }, onLeaveBack: () => { replay?.kill(); write.pause(0); } });
    $(".aq-conf__replay", conf).addEventListener("click", () => {
      write.pause();
      replay?.kill();
      replay = gsap.timeline()
        .to(live, { scrambleText: { text: "", chars: CHARS, speed: .8 }, duration: .6, ease: "expo.inOut" })
        .to(live, { keyframes: [{ textContent: "_" }, { textContent: "" }, { textContent: "_" }, { textContent: "" }, { textContent: "_" }, { textContent: "" }], duration: 1.2, ease: "none" })
        .to(live, { scrambleText: { text: words, chars: CHARS, speed: .1 }, duration: 2, ease: "expo.out" });
    });

    // Folder button — a small window grows from 0 around the button’s left-center (.85 straight → expo.out) and the text is written scrambled after .4s. .25s after opening, a shockwave ripples from the window center
    const gif = $("[data-gif]", conf), fbtn = $(".aq-folder-btn", conf), gtext = $("[data-gif-text]", conf), close = $(".aq-gif__close", conf);
    const gwords = $(".aq-gif__ghost", conf).textContent;
    let open = false;
    gsap.set(gif, { xPercent: 0, x: "-1.33em" });
    const gTl = gsap.timeline({ paused: true, defaults: { ease: "none", duration: .85 } }).addLabel("false").fromTo(gif, { scale: 0 }, { scale: 1 }).from(gif.children[0], { opacity: 0, duration: .25 }, "<+=0.6").addLabel("true");
    const wTl = gsap.timeline({ paused: true }).addLabel("false").fromTo(gtext, { scrambleText: { text: "" } }, { scrambleText: { text: gwords, chars: CHARS, speed: .2 }, duration: .8 }, .4).addLabel("true");
    const toggle = (want = !open) => {
      if (want === open) return;
      if (want) {
        const pr = gif.parentElement.getBoundingClientRect(), br = fbtn.getBoundingClientRect();
        gsap.set(gif, { transformOrigin: `${br.left - pr.left - gif.offsetLeft}px ${br.top + br.height / 2 - pr.top - gif.offsetTop}px` });
        gsap.delayedCall(.25, () => { const r = gif.getBoundingClientRect(); document.body.dispatchEvent(new CustomEvent("fx:shock", { detail: { x: r.left + r.width / 2, y: r.top + r.height / 2 } })); });
      }
      open = want;
      fbtn.setAttribute("aria-expanded", open);
      gif.classList.toggle("is-open", open);
      close.tabIndex = open ? 0 : -1;
      gTl.tweenTo(String(open), { ease: "expo.out" });
      wTl.tweenTo(String(open), { ease: "expo.out" });
    };
    // On first hover (or focus) it preloads the image in the window and floats it up at .4s — the original fetches the image then and shows it onload
    const img = $(".aq-gif__img", conf);
    gsap.set(img, { opacity: 0 });
    const preload = () => gsap.fromTo(img, { opacity: 0 }, { opacity: 1, duration: .4, delay: .04 });
    fbtn.addEventListener("mouseenter", preload, { once: true });
    fbtn.addEventListener("focus", preload, { once: true });
    fbtn.addEventListener("click", () => toggle());
    close.addEventListener("click", () => toggle(false));
  }

  // Coordinate cell — three globe lines flip and rotate every 2s and 4s, the arrow points toward the cursor, and the crosshair shifts ±1/6 of the cell width by cursor position
  const coords = $("[data-coords]");
  if (coords && !reduce) {
    gsap.timeline({ defaults: { duration: 2 } })
      .to(".aq-globe__m1", { scaleX: -1, transformOrigin: "center", ease: "none", repeat: -1 })
      .to(".aq-globe__m2", { scaleX: -1, transformOrigin: "center", ease: "none", delay: 1, repeat: -1 }, "<")
      .to(".aq-globe__lat", { scaleY: -1, transformOrigin: "center", ease: "none", duration: 4, repeat: -1 }, "<");
    const arrow = $("[data-arrow]", coords), ghost = $("[data-arrow-ghost]", coords), clip = $(".aq-coords__box--clip", coords);
    const cy = $("[data-cross-y]", coords), cx = $("[data-cross-x]", coords), cxy = $("[data-cross-xy]", coords);
    gsap.set(ghost, { autoAlpha: 0 });
    if (touch) {
      gsap.set(ghost, { autoAlpha: 1, xPercent: -150, yPercent: 150 });
      gsap.to([arrow, ghost], { yPercent: "-=150", xPercent: "+=150", ease: "expo.inOut", duration: 1.5, repeat: -1 });
      gsap.to(clip, { rotate: 360, ease: "expo.inOut", duration: 3, repeat: -1 });
    } else {
      let seen = false, dirty = true;
      new IntersectionObserver(([e]) => { seen = !!e?.isIntersecting; dirty = true; }).observe($(".aq-cofound"));
      const mark = () => (dirty = true);
      document.addEventListener("mousemove", mark, { passive: true });
      addEventListener("scroll", mark, { passive: true });
      addEventListener("resize", mark);
      gsap.ticker.add(() => {
        if (!seen || !dirty) return;
        dirty = false;
        const r = arrow.getBoundingClientRect(), mx = site.mouse.x, my = site.mouse.y;
        gsap.set(arrow, { rotation: Math.atan2(my - (r.top + r.height / 2), mx - (r.left + r.width / 2)) * 180 / Math.PI + 45, transformOrigin: "center center" });
        const c = clip.clientWidth / 6;
        const ux = gsap.utils.interpolate(-c, c, mx / innerWidth), uy = gsap.utils.interpolate(-c, c, my / innerHeight);
        gsap.set([cy, cxy], { y: uy });
        gsap.set([cx, cxy], { x: ux });
      });
    }
  }

  // Award row — when the row head rises one line above the screen bottom, it rises from below in 1s expo.out and is revealed, and hides again when passed upward.
  // Hovering a row rolls the name over one character at a time (.06) (power3.out 1s) — the liquid filling the row is a part (liquid-ink-gl)
  $$(".aq-row").forEach((row) => {
    if (!reduce) gsap.fromTo(row, { clipPath: "inset(0% 0% 100% 0%)", yPercent: 100 }, { clipPath: "inset(0% 0% 0% 0%)", yPercent: 0, duration: 1, ease: "expo.out", scrollTrigger: { trigger: row, start: "top-=100% bottom", end: "top-=100% bottom", toggleActions: "none play none reset" } });
    const h3 = $("h3", row);
    const { wrap, a, b } = site.roll(h3, "char");
    h3.textContent = "";
    h3.append(wrap);
    const tl = gsap.timeline({ paused: true, defaults: { duration: .8, ease: "none" } })
      .to(a.children, { yPercent: -110, stagger: .06 })
      .fromTo(b.children, { yPercent: 10 }, { yPercent: -100, stagger: .06 }, "<")
      .addLabel("end");
    if (touch) return;
    row.addEventListener("mouseenter", () => tl.tweenTo("end", { ease: "power3.out", duration: 1 }));
    row.addEventListener("mouseleave", () => tl.tweenTo(0, { ease: "power3.out", duration: 1 }));
  });

  // Closing — the satellite text mixes and settles as 0 and 1 while the section reaches the screen center (.6 expo.out, .1 gaps), and the binary line reshuffles every 2s
  const footer = $(".aq-footer");
  const title = $(".aq-footer__title");
  if (!reduce) {
    gsap.from($$("[data-sat]", footer), { scrambleText: { text: "", chars: "01 00 11", speed: .6 }, scrollTrigger: { trigger: title, start: "top bottom", end: "top center", toggleActions: "none play none reset" }, duration: .6, stagger: .1, ease: "expo.out" });
    $$("[data-bin]", footer).forEach((el, i) => {
      const fs = parseFloat(getComputedStyle(el).fontSize);
      if (getComputedStyle(el).display !== "inline") gsap.set(el, { width: `${el.clientWidth / fs}em`, height: `${el.clientHeight / fs}em` });
      const words = el.textContent;
      gsap.to(el, { scrambleText: { text: words, chars: "01 0 1", speed: .3, revealDelay: 2 }, scrollTrigger: { trigger: title, start: "top bottom", end: "top center", toggleActions: "reset play none reset" }, duration: 2, ease: "power1.out", repeat: -1, delay: .3 * i });
      el.textContent = "";
    });
  }
  // Mail — the whole line rolls (.8 straight → expo.out 1s), on press the brackets move .4em in and back out, and a copy tag follows the cursor in .2s
  const copy = $("[data-copy]");
  const tip = $(".aq-copy-tip"), ok = $(".aq-copy-tip__ok");
  if (copy) {
    const { wrap, a, b } = site.roll(copy, "line");
    copy.textContent = "";
    copy.append(wrap);
    a.firstChild.classList.add("aq-glitch");
    const roll = gsap.timeline({ paused: true, defaults: { duration: .8, ease: "none" } }).to(a.firstChild, { yPercent: -100 }, "<").to(b.firstChild, { yPercent: -100 }, "<");
    const pinch = gsap.timeline({ paused: true, defaults: { duration: .3, ease: "none" } }).fromTo(copy, { "--anim-progress": 0 }, { "--anim-progress": 1 }).to(copy, { "--anim-progress": 0 });
    const doCopy = async () => {
      pinch.tweenTo(pinch.duration(), { ease: "expo.out", duration: 1, onComplete: () => pinch.seek(0) });
      try { await navigator.clipboard.writeText(copy.dataset.copy); } catch (e) { return; }
      gsap.set(ok, { display: "block" });
    };
    copy.addEventListener("click", doCopy);
    copy.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); doCopy(); } });
    if (!touch) {
      copy.addEventListener("mouseenter", (e) => { gsap.set(tip, { autoAlpha: 1, x: e.clientX, y: e.clientY }); roll.tweenTo(roll.duration(), { ease: "expo.out", duration: 1 }); });
      copy.addEventListener("mouseleave", () => { gsap.set(tip, { autoAlpha: 0 }); gsap.set(ok, { display: "none" }); roll.tweenTo(0, { ease: "expo.out", duration: 1 }); });
      copy.addEventListener("mousemove", (e) => gsap.to(tip, { x: e.clientX, y: e.clientY, duration: .2 }));
    }
  }
  const credit = $("[data-roll-plain]");
  if (credit) {
    const { wrap, a, b } = site.roll(credit, "line");
    credit.textContent = "";
    credit.append(wrap);
    const roll = gsap.timeline({ paused: true, defaults: { duration: .8, ease: "none" } }).to(a.firstChild, { yPercent: -100 }, "<").to(b.firstChild, { yPercent: -100 }, "<");
    if (!touch) {
      credit.addEventListener("mouseenter", () => roll.tweenTo(roll.duration(), { ease: "expo.out", duration: 1 }));
      credit.addEventListener("mouseleave", () => roll.tweenTo(0, { ease: "expo.out", duration: 1 }));
    }
  }
})();
