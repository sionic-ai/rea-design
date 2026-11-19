(() => {
  // Original (first page, 3 sections, 600vh): pins the section to the screen and scrubs the video by scroll — up to the hold frame (72/154) over 4 cells,
  // After that, for each callout the line stretches from 58px and transparent to 8.06vw (1 step) while the title line rises with it, and 1.2 steps later the description lines rise at .2-step intervals.
  // After the last description, the mark (icon) turns on, rests for 5 cells, then all descriptions turn off and the video rewinds to the end over 12 cells. You may also use only description lines without a video.
  kfFx.register("pin-callout-scrub", (el, { options, reduce, scroller }) => {
    const callouts = [...el.querySelectorAll('[data-fx-part="callout"]')];
    if (!callouts.length) return;
    const stage = el.querySelector('[data-fx-part="stage"]') || el;
    const video = el.querySelector('[data-fx-part="video"]');
    const marks = [...el.querySelectorAll('[data-fx-part="mark"]')];
    const reach = options.reach || "8.0555555556vw";
    const pauseAt = +(options.pause ?? 72 / 154);
    const hold = +(options.hold ?? 5);
    const lineOf = (c) => c.querySelector('[data-fx-part="line"]');
    const titleOf = (c) => c.querySelector('[data-fx-part="title"]');
    const rowsOf = (c) => [...c.querySelectorAll('[data-fx-part="row"]')];
    const all = (f) => callouts.map(f).flat().filter(Boolean);
    if (reduce) {
      gsap.set(all(lineOf), { opacity: 1, width: reach });
      gsap.set([...all(titleOf), ...all(rowsOf)], { yPercent: 0, y: 0 });
      gsap.set(marks, { opacity: 1, y: 0 });
      return;
    }
    gsap.set([...all(titleOf), ...all(rowsOf)], { yPercent: 100 });
    if (marks.length) gsap.set(marks, { opacity: 0, yPercent: 50 });
    let tl = null, dead = false;
    const build = (dur) => {
      if (dead) return;
      tl = gsap.timeline({ scrollTrigger: { trigger: el, scroller: scroller || undefined, start: "top top", end: "bottom bottom", pin: stage === el ? false : stage, scrub: true } });
      if (video) tl.to(video, { duration: 4, ease: "none", currentTime: dur * pauseAt });
      callouts.forEach((c) => {
        const line = lineOf(c), title = titleOf(c), rows = rowsOf(c);
        if (line) tl.to(line, { duration: 1, opacity: 1, width: reach });
        if (title) tl.to(title, { duration: 1, yPercent: 0 }, line ? "<" : undefined);
        if (rows.length) tl.to(rows, { delay: 1.2, duration: 1, yPercent: 0, stagger: 0.2 }, "<");
      });
      if (marks.length) tl.to(marks, { opacity: 1, stagger: 0.1, yPercent: 0 });
      callouts.forEach((c, i) => tl.to(c, { delay: i ? 0 : hold, duration: 1, opacity: 0, pointerEvents: "none" }, i ? "<" : undefined));
      if (marks.length) tl.to(marks, { opacity: 0 }, "<");
      if (video) tl.to(video, { duration: 12, ease: "none", currentTime: dur });
    };
    if (video) {
      const go = () => { try { video.currentTime = 0; } catch (e) {} build(video.duration || +(options.duration ?? 6)); };
      if (video.readyState >= 1) go();
      else { video.addEventListener("loadedmetadata", go, { once: true }); video.load(); }
    } else build(0);
    return () => {
      dead = true;
      if (tl) { tl.scrollTrigger && tl.scrollTrigger.kill(true); tl.kill(); }
      gsap.set([...all(lineOf), ...all(titleOf), ...all(rowsOf), ...marks, ...callouts], { clearProps: "all" });
    };
  });
})();
