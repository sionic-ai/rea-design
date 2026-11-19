/* Condition detail — original pageReady case-problem entrance, table of contents current position (.drop-page-nav updateNav), section move .7s, flying squirrel voice button */
(() => {
  const { E } = MK;
  let offs = [];

  const problem = (c) => {
    const sec = c.querySelector(".case-problem");
    if (!sec) return;
    let fired = false;
    const go = () => {
      if (fired) return;
      const top = sec.getBoundingClientRect().top + scrollY;
      if (scrollY < top - innerHeight + (MK.isPc() ? 300 : 200)) return;
      fired = true;
      const h = sec.querySelector("h2 span"), mom = sec.querySelector(".pic-momonga"), lis = sec.querySelectorAll("ul li");
      if (MK.reduce) { gsap.set([h, mom, ...lis], { opacity: 1 }); return; }
      gsap.fromTo(h, { opacity: 0, marginLeft: -40 }, { opacity: 1, marginLeft: 0, duration: 0.6, ease: E.outQuart });
      gsap.fromTo(mom, { opacity: 0, x: -500, y: -400 }, { opacity: 1, x: 0, y: 0, duration: 1, delay: 0.15, ease: E.outQuart });
      gsap.fromTo(mom.querySelector("span"), { y: 300, rotation: 60 }, { y: 0, rotation: 0, duration: 1.15, delay: 0.15, ease: E.outQuart });
      lis.forEach((li, i) => gsap.fromTo(li, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.3 + i * 0.1, ease: E.outQuart }));
    };
    addEventListener("scroll", go, { passive: true });
    go();
    offs.push(() => removeEventListener("scroll", go));
  };

  const pageNav = (c) => {
    const lis = [...c.querySelectorAll(".drop-page-nav li")];
    if (!lis.length) return;
    const secs = lis.map((li) => c.querySelector(li.querySelector("a").getAttribute("href")));
    const upd = () => {
      const rects = secs.map((s) => s?.getBoundingClientRect() || { top: 1e9, bottom: 1e9 });
      let cur = -1;
      rects.forEach((r, i) => { if (r.top <= 160) cur = i; });
      if (rects.at(-1).bottom <= 0) cur = lis.length;
      lis.forEach((li, i) => {
        li.classList.toggle("up", cur !== -1 && i < cur);
        li.classList.toggle("current", i === cur);
        li.classList.toggle("down", cur !== -1 && i > cur);
      });
    };
    addEventListener("scroll", upd, { passive: true });
    addEventListener("resize", upd);
    upd();
    offs.push(() => { removeEventListener("scroll", upd); removeEventListener("resize", upd); });
    const jump = (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const t = c.querySelector(a.getAttribute("href"));
      if (!t) return;
      e.preventDefault();
      MK.scrollTo(t.getBoundingClientRect().top + scrollY, MK.reduce ? 0 : 0.7, E.inOutQuart);
      if (a.closest(".drop-page-nav")) toggleNav(c, false);
    };
    c.addEventListener("click", jump);
  };

  /* Phone contents drawer — a round button opens and closes the drawer (.drop-page-nav), which appears sliding down 10px over .4s easeOutCubic */
  const toggleNav = (c, on) => {
    const btn = c.querySelector(".btn-page-nav"), nav = c.querySelector(".drop-page-nav");
    if (!btn || !nav) return;
    const open = on ?? !btn.classList.contains("active");
    btn.classList.toggle("active", open);
    nav.classList.toggle("active", open);
  };
  const navButton = (c) => {
    const btn = c.querySelector(".btn-page-nav");
    if (!btn) return;
    const click = () => toggleNav(c);
    btn.addEventListener("click", click);
    offs.push(() => btn.removeEventListener("click", click));
  };

  /* Phone — only after passing the bark header does the contents button appear and the menu button turn dark, on reaching the card list of the same branch the voice button moves down and the booking button appears (original window scroll #wrap.sp .case-head branch) */
  const spScroll = (c) => {
    const title = c.querySelector(".case-main .title"), list = c.querySelector(".case-list-wrap");
    const pageBtn = c.querySelector(".btn-page-nav"), audioBtn = c.querySelector(".btn-audio"), fix = c.querySelector(".btn-fix-appointment");
    const on = () => {
      const bn = document.querySelector(".btn-nav");
      if (MK.isPc() || !bn || !title) { bn?.classList.remove("white"); return; }
      const y = scrollY, pb = parseInt(getComputedStyle(bn).paddingBottom) || 0;
      if (y >= title.offsetHeight - bn.offsetHeight + pb) {
        bn.classList.remove("white");
        pageBtn?.classList.remove("hidden");
        if (list) {
          const near = y >= list.getBoundingClientRect().top + y - innerHeight;
          audioBtn?.classList.toggle("hidden", near);
          if (near && audioBtn?.classList.contains("is-playing")) audioBtn.click();
          fix?.classList.toggle("hidden", !near);
        }
      } else {
        bn.classList.add("white");
        pageBtn?.classList.add("hidden");
        audioBtn?.classList.add("hidden");
      }
    };
    addEventListener("scroll", on, { passive: true });
    addEventListener("resize", on);
    on();
    offs.push(() => { removeEventListener("scroll", on); removeEventListener("resize", on); document.querySelector(".btn-nav")?.classList.remove("white"); });
  };

  /* Voice button — the text strip flows at 40px/s. On hover the flying squirrel springs up pressed to 1.03x, and on press it darts into its burrow and a pause button appears */
  const audio = (c) => {
    const btn = c.querySelector(".btn-audio");
    if (!btn) return;
    const mom = btn.querySelector(".momonga"), doc = btn.querySelector(".doctor"), pause = btn.querySelector(".btn-pause");
    const wrap = btn.querySelector(".txt > span > span"), text = btn.querySelector(".txt > span > span > span");
    let tick = null;
    if (wrap && text && !MK.reduce) {
      const run = () => {
        const ww = wrap.offsetWidth, tw = text.offsetWidth;
        tick = gsap.fromTo(text, { x: ww }, { x: -tw, duration: ((ww + tw) / 120) * 3, ease: "none", onComplete: run });
      };
      run();
    }
    const face1 = btn.querySelector(".face:not(.face2)");
    const smoke = [...btn.querySelectorAll(".smoke i")], puffs = smoke.map((i) => i.querySelector("b"));
    const notes = [...btn.querySelectorAll(".music i")], noteImg = notes.map((i) => i.querySelector("b"));
    // Start of the original btnAudioDoctorLoop — after 2s cut1 is pressed to .97 (.1s) then swaps to cut2, reaching 1.01 (.15s)→1 (.4s spring), after .3s it dips to .985 (.2s) and returns to cut1, settling at 1 (.4s)
    const d1 = btn.querySelector(".doctor .d1"), d2 = btn.querySelector(".doctor .d2");
    let docTl = null;
    const doctorLoop = () => {
      docTl?.kill();
      gsap.set(d1, { opacity: 1, scaleY: 1 }); gsap.set(d2, { opacity: 0, scaleY: 1 });
      docTl = gsap.timeline({ repeat: -1, repeatDelay: 16 - 3.4 })
        .to(d1, { scaleY: 0.97, duration: 0.1, delay: 2, ease: E.outCubic })
        .call(() => musicRun("m3f"))
        .set(d1, { opacity: 0 }, "+=0.02").set(d2, { opacity: 1 })
        .to(d2, { scaleY: 1.01, duration: 0.15, ease: "none" })
        .to(d2, { scaleY: 1, duration: 0.4, ease: E.spring })
        .to(d2, { scaleY: 0.985, duration: 0.2, delay: 0.3, ease: E.outCubic })
        .call(() => musicRun("m2"))
        .set(d2, { opacity: 0 }, "+=0.02").set(d1, { opacity: 1, scaleY: 0.985 })
        .to(d1, { scaleY: 1, duration: 0.4, ease: E.outQuad });
    };
    const smokeRun = () => {
      gsap.killTweensOf([...smoke, ...puffs]);
      gsap.set(smoke, { scale: 0.1 }); gsap.set(puffs, { opacity: 0 });
      smoke.forEach((s, i) => {
        gsap.to(s, { scale: 1, duration: 0.3, delay: 0.15 + i * 0.04, ease: E.inQuad });
        gsap.to(puffs[i], { opacity: 1, duration: 0.1, delay: 0.15 + i * 0.04, ease: "none" });
        gsap.to(s, { scale: 1.5, duration: 0.65, delay: 0.45 + i * 0.04, ease: E.outSine });
        gsap.to(puffs[i], { opacity: 0, duration: 0.65, delay: 0.15 + 0.2 + i * 0.05 + 0.3, ease: E.inOutSine });
      });
    };
    // Original btnAudioMusic1 — a music note rises from 25px bottom-left at ±15° over 1.8s easeOutCubic, appears at .4s and fades out over the last .4s
    // Start position, length (fast is half) and delay of the second note differ per bundle — original btnAudioMusic1·2·3_fast
    const MUSIC = {
      m1: { from: [{ x: -10, y: 25, rotation: 15 }, { x: -15, y: 25, rotation: -15 }], dur: 1.8, img: 0.4, gap: 0.15 },
      m2: { from: [{ x: -15, y: 25, rotation: 15 }], dur: 1.8, img: 0.4, gap: 0 },
      m3f: { from: [{ x: -15, y: 35, rotation: -35 }, { x: -20, y: 35, rotation: 35 }], dur: 0.9, img: 0.2, gap: 0.1 },
    };
    const musicRun = (key = "m1") => {
      const m = MUSIC[key];
      m.from.forEach((f, i) => {
        const n = notes[i], img = noteImg[i], d = i * m.gap;
        if (!n) return;
        gsap.killTweensOf([n, img]);
        gsap.fromTo(n, f, { x: 0, y: 0, rotation: 0, duration: m.dur, delay: d, ease: E.outCubic });
        gsap.fromTo(img, { opacity: 0 }, { opacity: 1, duration: m.img, delay: d, ease: E.outSine });
        gsap.to(img, { opacity: 0, duration: m.img, delay: d + m.dur - m.img, ease: "none" });
      });
    };
    const enter = () => { if (btn.classList.contains("is-playing") || !MK.isPc()) return; gsap.set(face1, { opacity: 0 }); gsap.timeline().to(mom, { scaleY: 1.03, duration: 0.1, ease: E.outQuad }).to(mom, { scaleY: 1, duration: 0.4, ease: E.spring }); };
    const leave = () => { if (btn.classList.contains("is-playing") || !MK.isPc()) return; gsap.set(face1, { opacity: 1 }); gsap.timeline().to(mom, { scaleY: 0.97, duration: 0.08, ease: E.outQuad }).to(mom, { scaleY: 1, duration: 0.08, ease: E.inQuad }); };
    const click = () => {
      const on = !btn.classList.contains("is-playing");
      btn.classList.toggle("is-playing", on);
      gsap.killTweensOf([mom, doc, pause]);
      if (on) {
        gsap.timeline().to(mom, { scaleY: 1.15, duration: 0.15, ease: E.outQuart }).to(mom, { scaleY: 0.1, opacity: 0, duration: 0.15, ease: E.inQuart });
        gsap.set(face1, { opacity: 0 });
        smokeRun();
        gsap.fromTo(doc, { opacity: 0, scaleY: 0.9 }, { opacity: 1, scaleY: 1.02, duration: 0.3, delay: 0.2, ease: E.inQuart, onComplete: () => { gsap.to(doc, { scaleY: 1, duration: 0.7, ease: E.spring }); doctorLoop(); musicRun("m1"); } });
        gsap.to(pause, { opacity: 1, scale: 1, duration: 0.2, delay: 0.32, ease: E.outQuart });
      } else {
        docTl?.kill();
        gsap.set(face1, { opacity: 1 });
        smokeRun();
        gsap.set(mom, { scaleY: 0.9, opacity: 0 });
        gsap.to(mom, { scaleY: 1, opacity: 1, duration: 0.15, delay: 0.15, ease: E.outQuart });
        gsap.to(doc, { opacity: 0, scaleY: 0.9, duration: 0.3, ease: E.outQuart });
        gsap.to(pause, { opacity: 0, scale: 0.5, duration: 0.2, ease: E.outQuart });
      }
    };
    btn.addEventListener("mouseenter", enter); btn.addEventListener("mouseleave", leave); btn.addEventListener("click", click);
    offs.push(() => { tick?.kill(); docTl?.kill(); btn.removeEventListener("mouseenter", enter); btn.removeEventListener("mouseleave", leave); btn.removeEventListener("click", click); });
  };

  MK.view("service", {
    enter(c) { offs = []; problem(c); pageNav(c); navButton(c); audio(c); spScroll(c); },
    leave() { offs.forEach((f) => f()); offs = []; },
  });
})();
