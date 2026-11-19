/* Home: loader → first photo opens, verse lines float up, half-photos alternate, interview darkens, a photo curtain before job types, floating topic cards */
LH.page("home", (box) => {
  const root = document.documentElement;
  const reduce = LH.reduce;
  const mv = box.querySelector("#mv");
  const offs = [];
  const wait = (ms) => new Promise((r) => setTimeout(r, reduce ? 0 : ms));
  const frame = () => new Promise((r) => requestAnimationFrame(() => r()));
  const KEY = "lh-mv-played";

  /* Hero title: the group before the comma starts at .2s, the group after at 1.08s, 70ms per letter */
  mv.querySelectorAll(".mv__line").forEach((line, li) => {
    line.innerHTML = Array.from(line.textContent, (c, i) => `<span class="ch" aria-hidden="true" style="--d:${((li ? 1.08 : 0.2) + i * 0.07).toFixed(2)}s">${c === " " ? "&nbsp;" : c}</span>`).join("");
  });
  mv.querySelector(".wf-img").addEventListener("animationend", (e) => e.animationName === "mv-blur" && mv.classList.add("is-done"));

  /* Loader — original values: each time an image or font visible on the first screen finishes, the progress line advances to (done / total) × 80, pauses .25s + .2s at 40,
     Wait at least .6s and at most 8s, then 80 → 100 (1.2s) → .5s → text disappears → .4s → line moves to the center of the first photo in .7s → curtain lifts and the photo opens up and down */
  const loader = document.querySelector(".lh-loader");
  const runLoader = async () => {
    try { sessionStorage.setItem(KEY, "1"); } catch (e) {}
    LH.lenis && LH.lenis.stop();
    const imgs = [...document.images].filter((im) => {
      if (im.closest(".lh-loader") || im.loading === "lazy") return false;
      const r = im.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.top < innerHeight && r.bottom > 0;
    });
    const jobs = [...imgs.map((im) => (im.complete ? Promise.resolve() : new Promise((r) => { im.addEventListener("load", r, { once: true }); im.addEventListener("error", r, { once: true }); }))), document.fonts ? document.fonts.ready : Promise.resolve()];
    let done = 0, shown = 0, counting = true, chain = Promise.resolve();
    const setP = (v) => { shown = Math.max(shown, Math.min(Math.max(v, 0), 100)); loader.style.setProperty("--p", shown / 100); };
    const setAria = (v) => loader.setAttribute("aria-valuenow", String(Math.round(Math.min(Math.max(v, 0), 100))));
    const step = (v, label = v) => {
      const to = Math.min(Math.max(v, 0), 80);
      setAria(label);
      chain = chain.then(async () => {
        for (const w of [40].filter((w) => w > shown && w <= to)) { setP(w); await wait(250); await wait(200); }
        if (to > shown) { setP(to); await wait(250); }
      });
    };
    const all = Promise.allSettled(jobs.map(async (j) => { try { await j; } finally { done += 1; if (counting) { const pct = (done / jobs.length) * 100; step(pct * 0.8, pct); } } }));
    await Promise.all([Promise.race([all, wait(8000)]), wait(600)]);
    counting = false;
    step(80, 100);
    await chain;
    loader.classList.add("is-completing");
    await frame();
    setP(100); setAria(100);
    await wait(500);
    loader.classList.add("is-label-hidden");
    await wait(400);
    const r = mv.querySelector("[data-mv-img]").getBoundingClientRect();
    loader.style.setProperty("--t-left", r.left + "px");
    loader.style.setProperty("--t-top", r.top + r.height / 2 + "px");
    loader.style.setProperty("--t-width", r.width + "px");
    loader.classList.add("is-aligning");
    root.classList.add("is-line-handoff");
    await wait(700);
    const gone = new Promise((res) => {
      let fin = false;
      const end = () => { if (fin) return; fin = true; loader.remove(); res(); };
      loader.addEventListener("transitionend", (e) => e.target === loader && e.propertyName === "opacity" && end());
      setTimeout(end, 700);
    });
    loader.classList.add("is-hidden");
    await frame();
    root.classList.add("is-mv-playing");
    root.classList.remove("is-site-loading", "is-line-handoff");
    LH.lenis && LH.lenis.start();
    await gone;
  };
  if (root.classList.contains("is-site-loading") && loader) runLoader();
  else {
    loader && loader.remove();
    let played = false;
    try { played = !!sessionStorage.getItem(KEY); sessionStorage.setItem(KEY, "1"); } catch (e) {}
    // If you entered via another page and navigated, open only the Hero without the loader (same as the original)
    root.classList.add(played ? "is-mv-visited" : "is-mv-playing");
  }

  /* After the hero, the latest topic card appears at the bottom right and hides when the footer is visible */
  const card = box.querySelector(".ftopic");
  const foot = box.querySelector("footer");
  let pastMv = false, footIn = false;
  const sync = () => { const on = pastMv && !footIn; card.classList.toggle("is-visible", on); card.setAttribute("aria-hidden", !on); card.inert = !on; };
  const io1 = new IntersectionObserver(([e]) => { pastMv = !e.isIntersecting && e.boundingClientRect.bottom <= 0; sync(); });
  const io2 = new IntersectionObserver(([e]) => { footIn = e.isIntersecting; sync(); });
  io1.observe(mv); io2.observe(foot);
  offs.push(() => { io1.disconnect(); io2.disconnect(); });

  if (!window.gsap) return () => offs.forEach((f) => f());
  const mm = gsap.matchMedia();
  const Q = (s) => [...box.querySelectorAll(s)];

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    /* Serif verse: each line floats up from 20px below over 1.8s, line gap .14s */
    Q("[data-lines]").forEach((el) => {
      gsap.fromTo(el.children, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 1.8, ease: "power2.out", stagger: 0.14, scrollTrigger: { trigger: el, start: "top bottom", once: true } });
    });
    /* Interview: while the text travels from bottom to top, gradient goes 0 → 1, fully black in the last 35% */
    const media = box.querySelector("[data-interview-media]");
    const tl = gsap.timeline({ scrollTrigger: { trigger: box.querySelector("[data-interview-text]"), start: "top bottom", end: "top top", scrub: true } });
    tl.fromTo(media, { "--g": 0, "--b": 0 }, { "--g": 1, duration: 1, ease: "none" }, 0).to(media, { "--b": 1, duration: 0.35, ease: "none" }, 0.65);
  });

  mm.add("(max-width: 1023px) and (prefers-reduced-motion: no-preference)", () => {
    Q("[data-sp-img]").forEach((el) => gsap.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 85%", once: true } }));
  });

  /* Wide screen: the photo frame opens with a mask at 50% above the section, and when the text group changes the left photo is withdrawn and the right photo drops down to cover */
  const revealFrame = (stage, frameEl) => ScrollTrigger.create({
    trigger: stage, start: "top 50%", end: "bottom bottom", invalidateOnRefresh: true,
    onToggle: (self) => frameEl.classList.toggle("is-revealed", self.isActive),
  });
  mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
    const motions = Q("[data-concept-motion]");
    const stages = Q("[data-concept-text-stage]");
    const scales = Q("[data-concept-scale]");
    const trig = box.querySelector("[data-concept-trigger]");
    const stageWrap = box.querySelector("[data-concept-stage]");
    const HIDE = { autoAlpha: 1, "--mp": "100%" };
    const SHOW = { autoAlpha: 1, "--mp": "0%" };
    const modes = [{ enter: "none", leave: "mask" }, { enter: "mask", leave: "none" }];
    motions.forEach((m, i) => {
      const { enter, leave } = modes[i];
      const st = (mode, v) => (mode === "mask" ? (v ? SHOW : HIDE) : { autoAlpha: 1 });
      const r = stages[i].getBoundingClientRect();
      gsap.set(m, r.bottom <= 0 ? st(leave, false) : r.top >= innerHeight ? st(enter, false) : { autoAlpha: 1 });
      const go = (v, mode) => gsap.to(m, { ...st(mode, v), duration: mode === "none" ? 0 : 1.2, ease: "power2.out", overwrite: "auto" });
      ScrollTrigger.create({ trigger: stages[i], start: "top bottom", end: "bottom top",
        onEnter: () => go(true, enter), onLeave: () => go(false, leave), onEnterBack: () => go(true, leave), onLeaveBack: () => go(false, enter) });
    });
    revealFrame(stageWrap, box.querySelector("[data-concept-frame]"));
    revealFrame(box.querySelector("[data-posq-stage]"), box.querySelector("[data-posq-frame]"));
    [[scales[0], stageWrap, "top 50%"], [scales[1], trig, "top 80%"], [scales[2], stages[1], "top bottom"]].forEach(([el, t, s]) =>
      gsap.fromTo(el, { scale: 1.08 }, { scale: 1, duration: 7, ease: "sine.inOut", scrollTrigger: { trigger: t, start: s, once: true } }));
    gsap.fromTo(box.querySelector("[data-concept-second]"), { "--mp": "100%" }, { "--mp": "0%", ease: "none", scrollTrigger: { trigger: trig, start: "top 80%", end: "top 30%", scrub: true } });
  });

  mm.add("(prefers-reduced-motion: reduce)", () => {
    gsap.set(Q("[data-lines] > *"), { autoAlpha: 1, y: 0 });
    gsap.set(Q("[data-concept-motion]"), { autoAlpha: 1 });
    Q("[data-concept-frame],[data-posq-frame]").forEach((f) => f.classList.add("is-revealed"));
    box.querySelector("[data-interview-media]").style.setProperty("--g", 1);
  });

  return () => { mm.revert(); offs.forEach((f) => f()); };
});
