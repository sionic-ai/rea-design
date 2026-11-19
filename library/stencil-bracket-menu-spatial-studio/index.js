// Home page — opening (once in the first hour), marquee (rush for 3 seconds → constant speed, briefly faster by the scroll strength),
// Client logos (shift one slot to the right every 2 seconds in .64s), work row View text shuffle.
(() => {
  const { lenis, rem, reduce, isMaxMd } = window.fgShared;
  const html = document.documentElement;
  const KEY = "fg-opening-visited-at";
  const visited = () => { const t = localStorage.getItem(KEY); return !!t && Date.now() - Number(t) < 36e5; };
  const started = [];
  let finished = false;
  const onFinished = (fn) => { finished ? fn() : started.push(fn); };
  const finish = () => { if (finished) return; finished = true; started.splice(0).forEach((fn) => fn()); };

  // ── Opening ──
  const root = document.querySelector(".fg-opening");
  const place = (src, el, rotateOnMd) => {
    if (!src || !el) return;
    const r = src.getBoundingClientRect();
    const rot = rotateOnMd && isMaxMd();
    const h = parseFloat(getComputedStyle(el).height) || 0;
    if (rotateOnMd) gsap.set(el, { width: isMaxMd() ? "auto" : r.width, height: isMaxMd() ? "3rem" : "auto" });
    gsap.set(el, { x: r.left / rem() + "rem", y: ((rot ? r.top - h : r.top) / rem()) + "rem", rotation: rot ? 90 : 0, transformOrigin: "bottom left" });
  };
  if (root && (visited() || reduce)) {
    root.style.display = "none";
    if (!reduce && !visited()) localStorage.setItem(KEY, String(Date.now()));
    finish();
  } else if (root) {
    const logo = root.querySelector(".fg-opening__logo");
    const copy1 = root.querySelector(".fg-opening__copy1");
    const copy2 = root.querySelector(".fg-opening__copy2");
    const black = root.querySelector(".fg-opening__black");
    const videoWrap = root.querySelector(".fg-opening__video");
    const video = videoWrap.querySelector("video");
    const pos = () => {
      place(document.querySelector('[data-opening="logo"]'), logo, true);
      place(document.querySelector('[data-opening="copy1"]'), copy1);
      place(document.querySelector('[data-opening="copy2"]'), copy2);
    };
    const lock = (on) => {
      document.body.style.position = on ? "fixed" : "";
      document.body.style.width = on ? "100%" : "";
      document.body.style.pointerEvents = on ? "none" : "";
      html.style.cursor = on ? "wait" : "";
      if (lenis) on ? lenis.stop() : lenis.start();
    };
    lock(true);
    pos();
    addEventListener("resize", pos);
    const spans = [...copy1.querySelectorAll("p > span:not(.fg-caret)"), copy2.querySelector("p > span:not(.fg-caret)")];
    const texts = spans.map((s) => s.textContent);
    spans.forEach((s) => { s.textContent = ""; });
    gsap.set([copy1, copy2], { opacity: 1 });
    const tl = gsap.timeline();
    tl.fromTo(logo.querySelectorAll("path"), { opacity: 0, filter: () => `blur(${0.625 * rem()}px)` },
      { opacity: 1, filter: "blur(0px)", stagger: { each: 0.1, from: "random" }, ease: "power1.out", duration: 2 });
    // Text is written by shuffling through its own letters (1.5s, .2s apart) — starts 1s after the path animation begins
    spans.forEach((s, i) => {
      tl.to(s, { duration: 1.5, scrambleText: { text: texts[i], chars: texts[i] } }, 1 + i * 0.2);
    });
    tl.call(() => { const p = video.play(); p && p.catch(() => {}); }, [], "+=0.5")
      .fromTo(videoWrap, { opacity: 0 }, { opacity: 1, duration: 3, ease: "power4.out" }, "<")
      .call(() => {
        root.style.pointerEvents = "none";
        lock(false);
        gsap.set(black, { opacity: 0 });
        gsap.to([copy1, copy2, logo], { opacity: 0, duration: 2, ease: "power4.out" });
        gsap.to(videoWrap, { opacity: 0, duration: 1.3, ease: "power4.inOut" });
        gsap.to(videoWrap, { scale: 0.5, duration: 2.8, ease: "power4.inOut", onComplete: () => { root.style.display = "none"; removeEventListener("resize", pos); } });
        localStorage.setItem(KEY, String(Date.now()));
        finish();
        ScrollTrigger.refresh();
      }, [], "<5.5");
  } else finish();

  // ── Marquee ── original values: default .1rem/frame, 3s surge (first 30% rises to 3.75rem/frame with a fourth power, the rest decelerates with a cube),
  // Letters come in from 101% on the right with .4s ease-out (after .3s at 15ms intervals), scroll speed ×.2 is added up to .3rem on PC · .0625rem on phone and multiplied by .8 each frame
  const track = document.querySelector("[data-marquee]");
  if (track) {
    const S = { base: 0.1, decay: 0.8, spMax: 0.0625, pcMax: 0.3, rate: 0.2, rush: 3, delay: 300, stagger: 15, reveal: 400 };
    track.querySelectorAll("[data-marquee-line]").forEach((line) => {
      const t = line.textContent;
      line.textContent = "";
      [...t].forEach((c) => {
        const o = document.createElement("span");
        o.className = "fg-marquee__ch";
        const i = document.createElement("span");
        i.textContent = c === " " ? " " : c;
        o.append(i);
        line.append(o);
      });
    });
    const chars = [...track.querySelectorAll(".fg-marquee__ch > span")];
    if (reduce) chars.forEach((c) => { c.style.transform = "none"; });
    else onFinished(() => {
      let mode = "rush", x = 0, boost = 0, t0 = 0, resetT;
      chars.forEach((c, i) => c.animate(
        [{ transform: "translate3d(101%, 0, 0)" }, { transform: "translate3d(0, 0, 0)" }],
        { duration: S.reveal, delay: S.delay + i * S.stagger, fill: "forwards", easing: "ease-out" },
      ));
      const speed = (p) => {
        const a = S.base * rem(), b = 3.75 * rem();
        if (p < 0.3) { const r = p / 0.3; return a + r * r * r * r * (b - a); }
        const r = (p - 0.3) / 0.7;
        return a + (b - a) * (1 - r) * (1 - r) * (1 - r);
      };
      const tick = () => {
        const half = track.scrollWidth / 2;
        let v;
        if (mode === "rush") {
          const p = Math.min((performance.now() - t0) / 1000 / S.rush, 1);
          v = speed(p);
          if (p >= 1) mode = "loop";
        } else {
          v = S.base * rem() + boost;
          if (boost > 0) boost *= S.decay;
        }
        x -= v;
        if (half > 0 && x <= -half) x += half;
        track.style.transform = `translateX(${x}px)`;
      };
      setTimeout(() => { t0 = performance.now(); gsap.ticker.add(tick); }, S.delay);
      if (lenis) lenis.on("scroll", ({ velocity }) => {
        if (mode !== "loop") return;
        boost = Math.min(Math.abs(velocity) * S.rate, isMaxMd() ? S.spMax : S.pcMax) * rem();
        clearTimeout(resetT);
        resetT = setTimeout(() => { boost = 0; }, 0);
      });
    });
  }

  // ── client logos ── original: list drawn in reverse, duplicated enough to fill the screen, one step at 3s first, then every 2s (.64s cubic-bezier(.77,0,.32,.95))
  const logoTrack = document.querySelector("[data-logo-track]");
  if (logoTrack) {
    // The order written in html is the original DOM order (the original draws the list in reverse) — used as is
    const base = [...logoTrack.children];
    const n = base.length;
    const gapRem = () => (parseFloat(getComputedStyle(logoTrack).gap) || 0) / rem();
    const widthRem = (el) => parseFloat(el.style.getPropertyValue("--w")) || 0;
    const build = () => {
      const total = base.reduce((s, el) => s + widthRem(el) + gapRem(), 0);
      const copies = Math.max(2, Math.ceil(innerWidth / rem() / total) + 1);
      logoTrack.replaceChildren();
      for (let c = 0; c < copies * 2; c++) base.forEach((el) => {
        const k = c === 0 ? el : el.cloneNode(true);
        if (c > 0) k.setAttribute("aria-hidden", "true");
        logoTrack.append(k);
      });
      return copies;
    };
    let copies = build();
    let index = n * copies;
    const items = () => [...logoTrack.children];
    const offset = (k) => -items().slice(0, k).reduce((s, el) => s + widthRem(el) + gapRem(), 0);
    const jump = (k) => {
      logoTrack.style.transition = "none";
      logoTrack.style.transform = `translate3d(${offset(k)}rem, 0, 0)`;
      logoTrack.getBoundingClientRect();
    };
    jump(index);
    logoTrack.style.visibility = "visible";
    let timer;
    const step = () => {
      index -= 1;
      const done = (e) => {
        if (e && (e.target !== logoTrack || e.propertyName !== "transform")) return;
        logoTrack.removeEventListener("transitionend", done);
        if (index < n) { index += n * copies; jump(index); }
        timer = setTimeout(step, 2000);
      };
      logoTrack.addEventListener("transitionend", done);
      requestAnimationFrame(() => {
        logoTrack.style.transition = "transform 640ms cubic-bezier(0.77, 0, 0.32, 0.95)";
        logoTrack.style.transform = `translate3d(${offset(index)}rem, 0, 0)`;
      });
    };
    if (!reduce) onFinished(() => { timer = setTimeout(step, 3000); });
    let rw = innerWidth;
    addEventListener("resize", () => {
      if (innerWidth === rw) return;
      rw = innerWidth;
      clearTimeout(timer);
      copies = build();
      index = n * copies;
      jump(index);
      if (!reduce && finished) timer = setTimeout(step, 2000);
    });
  }

  // ── Work row: on entering the row, View is erased and rewritten with a shuffle effect (.6s power2.inOut) ──
  document.querySelectorAll("[data-view-group]").forEach((row) => {
    const el = row.querySelector("[data-view-text]");
    if (!el || reduce) return;
    const text = el.textContent;
    row.addEventListener("mouseenter", () => {
      gsap.set(el, { display: "inline-block", width: el.getBoundingClientRect().width });
      el.textContent = "";
      gsap.to(el, { duration: 0.6, ease: "power2.inOut", overwrite: true, scrambleText: { text, chars: "abcdefghijklmnopqrstuvwxyz", speed: 1 },
        onComplete: () => gsap.set(el, { clearProps: "all" }) });
    });
  });
})();
