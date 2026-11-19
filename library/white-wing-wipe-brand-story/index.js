// Brand story: a full-screen section stepper that advances one section per wheel, touch, or key press.
// Original values — section move 1.2s power2.out · the white band on the upper section follows -100% at 6% per frame (phone 20%) after 10% of progress ·
// The band mask of the entering section opens from the left over 2.4s power4.inOut after .4s (edge darkness 1→.22, 1.4s power2.out) ·
// Text lines rise from 100% below in 1.1s power2.out, .5s per step · first section after load: background 1.2s · photo 1.6s power3.out · band 2.8s power4.inOut, at 1.25s the video button −24px→0 .6s ·
// Hope section window, one slot .9s power3.inOut (once the wheel reaches 60) · when the video window opens the sections move up 40px in .8s.
(() => {
  const reduce = window.JAL.reduce;
  const scroll = document.querySelector(".js-scroll");
  if (!scroll) return;
  const sections = [...scroll.querySelectorAll(".j-sec")];
  const bottom = scroll.querySelector(".j-bottom");
  const maxSec = sections.length;
  const maxPage = maxSec + (bottom ? 1 : 0);
  const movieIdx = sections.findIndex((s) => s.classList.contains("j-sec--movie")) + 1;
  const mobile = matchMedia("(max-width: 767px)");
  const pager = document.querySelector(".js-pager");
  const pagerBar = document.querySelector(".js-pager-bar");
  const mtrig = document.querySelector(".js-mtrig");
  const fvtrig = document.querySelector(".js-fvtrig");
  const D = reduce ? 0 : 1;

  // White wing band — the top edge is an S curve rising from bottom left to top right, the bottom edge follows the same grain. Opaque in the middle, .4 at the top and bottom ends
  const band = `<svg viewBox="0 0 1436 1856" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="jb" x1="718" y1="70" x2="720" y2="1190" gradientUnits="userSpaceOnUse"><stop offset="0" stop-opacity=".4"/><stop offset=".1" stop-opacity=".48"/><stop offset=".24" stop-opacity=".8"/><stop offset=".44"/><stop offset=".56"/><stop offset=".76" stop-opacity=".8"/><stop offset=".9" stop-opacity=".48"/><stop offset="1" stop-opacity=".4"/></linearGradient></defs><path fill="url(#jb)" d="M0 228C190 286 380 312 560 312 880 312 1180 222 1436 72V1046C1260 990 1080 962 900 962 570 962 262 1050 0 1198Z"/></svg>`;
  document.querySelectorAll("[data-band], .js-band").forEach((b) => { b.innerHTML = band; });
  // Rounded white panel below the Wish section and the Wish header section
  const arch = '<svg viewBox="0 0 1440 690" preserveAspectRatio="none" aria-hidden="true"><path class="j-f-surface" d="M1440 690H0V150C180 204 370 232 556 232 880 232 1182 148 1440 0Z"/></svg>';
  document.querySelectorAll(".js-hs-mask, .j-hope__mask").forEach((m) => { m.innerHTML = arch; });

  const H = () => scroll.querySelector(".j-sec").offsetHeight;
  const state = { y: 0, shift: 0 };
  const setY = gsap.quickSetter(scroll, "y", "px");
  const render = () => setY(state.y + state.shift);
  let cur = 1, playing = true, tween = null, dirNow = null, tid = 0, lastUp = 0;
  let pending = [];

  const secEl = (i) => sections[i - 1] || null;
  const bottomTop = () => (bottom ? bottom.offsetTop : 0);

  // ── Band mask ──
  const showBand = (el) => { gsap.killTweensOf(el); gsap.set(el, { "--maskEdgeAlpha": 0.22, webkitMaskPosition: "0% 0%", maskPosition: "0% 0%" }); };
  const hideBand = (el) => { gsap.killTweensOf(el); gsap.set(el, { "--maskEdgeAlpha": 1, webkitMaskPosition: "100% 0%", maskPosition: "100% 0%" }); };
  const openBand = (el) => {
    gsap.killTweensOf(el);
    gsap.set(el, { "--maskEdgeAlpha": 1 });
    gsap.to(el, { "--maskEdgeAlpha": 0.22, duration: 1.4 * D, ease: "power2.out" });
    gsap.to(el, { webkitMaskPosition: "0% 0%", maskPosition: "0% 0%", duration: 2.4 * D, ease: "power4.inOut" });
  };

  // ── Text lines ──
  const lines = (s) => (s ? [...s.querySelectorAll(".js-line")] : []);
  const hideTexts = (s) => lines(s).forEach((el) => {
    gsap.killTweensOf(el);
    if (el.closest(".j-t2")) gsap.set(el, { opacity: 0, y: 0 });
    else if (el.closest(".j-line")) gsap.set(el, { autoAlpha: 0, y: "100%" });
    else gsap.set(el, { opacity: 0, y: 18 });
  });
  const showTexts = (s) => lines(s).forEach((el) => { gsap.killTweensOf(el); gsap.set(el, { autoAlpha: 1, y: 0 }); });
  const playTexts = (s) => lines(s).forEach((el) => {
    const delay = 0.5 * (+el.dataset.step || 0) * D;
    gsap.killTweensOf(el);
    if (el.closest(".j-t2")) gsap.fromTo(el, { opacity: 0, y: 0 }, { opacity: 1, duration: 1.1 * D, ease: "power2.out", delay });
    else if (el.closest(".j-line")) gsap.fromTo(el, { autoAlpha: 0, y: "100%" }, { autoAlpha: 1, y: 0, duration: 1.1 * D, ease: "power2.out", delay });
    else gsap.fromTo(el, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 1.1 * D, ease: "power2.out", delay });
  });
  sections.slice(1).forEach(hideTexts);

  // ── Video button · progress bar ──
  const trigShow = (el, delay = 0) => { gsap.killTweensOf(el); gsap.to(el, { autoAlpha: 1, duration: 0.6 * D, delay, ease: "power2.out" }); };
  const trigFade = (el) => { gsap.killTweensOf(el); gsap.to(el, { autoAlpha: 0, duration: 0.35 * D, ease: "power2.out" }); };
  const pagerTo = (i) => {
    if (pagerBar) pagerBar.style.transform = `translateX(${(Math.min(i, 11) - 1) * 100}%)`;
    const on = i >= 2 && i <= maxSec;
    gsap.killTweensOf(pager);
    if (on) gsap.to(pager, { autoAlpha: 1, duration: (i === 2 ? 1.1 : 0.6) * D, delay: i === 2 ? 0.5 * D : 0, ease: "power2.out" });
    else gsap.set(pager, { autoAlpha: 0 });
    document.body.classList.toggle("is-light-pager", i >= movieIdx);
    document.body.classList.toggle("is-bottom", i > maxSec);
  };

  // ── White panel of the hope heading section ──
  const hsSec = scroll.querySelector(".j-sec--hope-start");
  const hsMask = scroll.querySelector(".js-hs-mask");
  // ── Hope section ──
  const hope = scroll.querySelector(".j-sec--hope");
  const track = hope?.querySelector(".js-hope-track");
  const hopeBgs = hope ? [...hope.querySelectorAll(".js-hope-bg > .j-ph")] : [];
  const hopeItems = hope ? [...hope.querySelectorAll(".js-hope-item")] : [];
  let hopeIdx = 0, hopeAcc = 0, hopeCool = 0, hopeTween = null;
  const hopeContent = (i, instant) => {
    hopeItems.forEach((it, k) => {
      const ls = it.querySelectorAll(".js-hope-line");
      gsap.killTweensOf(ls);
      if (k !== i) { gsap.set(it, { visibility: "hidden" }); gsap.set(ls, { y: "100%" }); return; }
      gsap.set(it, { visibility: "visible" });
      if (instant) gsap.set(ls, { y: 0 });
      else gsap.fromTo(ls, { y: "100%" }, { y: 0, duration: 0.6 * D, ease: "power2.out" });
    });
    hopeBgs.forEach((b, k) => b.classList.toggle("is-on", k === i));
  };
  const hopeWindow = (i, instant) => {
    hopeIdx = i;
    hopeTween?.kill();
    if (instant) gsap.set(track, { xPercent: (-100 / 3) * i });
    else hopeTween = gsap.to(track, { xPercent: (-100 / 3) * i, duration: 0.9 * D, ease: "power3.inOut" });
  };
  const hopeStep = (dir) => {
    const n = dir === "down" ? hopeIdx + 1 : hopeIdx - 1;
    if (n < 0 || n >= hopeItems.length) return false;
    hopeWindow(n, false);
    hopeContent(n, false);
    return true;
  };

  // ── Opening the First Section ──
  const fv = sections[0];
  const fvBand = fv.querySelector(".js-band");
  const openFv = () => {
    const bg = fv.querySelector(".js-fv-bg"), img = fv.querySelector(".js-fv-img"), plane = fv.querySelector(".js-fv-plane"), text = fv.querySelector(".js-fv-text");
    const btn = fvtrig?.querySelector(".j-mbtn");
    gsap.set(plane, { xPercent: -50, x: -20, y: 10 });
    gsap.set(text, { xPercent: -50, yPercent: -50, y: 30 });
    if (reduce) {
      gsap.set([bg, plane, text], { autoAlpha: 1, x: 0, y: 0 });
      gsap.set(fvBand, { opacity: 1 });
      showBand(fvBand);
      gsap.set(fvtrig, { autoAlpha: 1 });
      return;
    }
    playing = false;
    gsap.set(img, { xPercent: 1, yPercent: 1 });
    gsap.set(fvBand, { opacity: 0, "--maskEdgeAlpha": 1, webkitMaskPosition: "100% 0%", maskPosition: "100% 0%" });
    gsap.timeline({ onComplete: () => { playing = true; } })
      .to(bg, { autoAlpha: 1, duration: 1.2, ease: "power2.out" }, 0)
      .to(img, { xPercent: 0, yPercent: 0, duration: 1.6, ease: "power3.out" }, 0)
      .to(plane, { autoAlpha: 1, x: 0, y: 0, duration: 1.6, ease: "power3.out" }, 0)
      .to(text, { autoAlpha: 1, y: 0, duration: 1.2, ease: "power3.out" }, 0)
      .to(fvBand, { opacity: 1, duration: 0.2, ease: "power1.out" }, 0)
      .to(fvBand, { "--maskEdgeAlpha": 0.22, duration: 1, ease: "power2.out" }, 0)
      .to(fvBand, { webkitMaskPosition: "0% 0%", maskPosition: "0% 0%", duration: 2.8, ease: "power4.inOut" }, 0)
      .set(fvtrig, { autoAlpha: 1 }, 1.25)
      .fromTo(btn, { x: -24 }, { x: 0, duration: 0.6, ease: "power2.out" }, 1.25);
  };
  gsap.set([mtrig, pager], { autoAlpha: 0 });
  if (document.readyState === "complete") openFv(); else addEventListener("load", openFv, { once: true });

  // ── Section Paging ──
  const go = (index, dir) => {
    const prev = cur;
    if (index < 1 || index > maxPage) return;
    dir = dir || (index < prev ? "up" : "down");
    const prevEl = secEl(prev), enterEl = index <= maxSec ? secEl(index) : null;
    const upper = secEl(Math.min(prev, index));
    const fulls = upper ? [...upper.querySelectorAll(".js-band")].map((el) => ({ el, y: dir === "down" ? 0 : -100 })) : [];
    const enterBands = enterEl ? [...enterEl.querySelectorAll(".js-band")] : [];
    const leavingHs = prevEl === hsSec, enteringHs = enterEl === hsSec;
    cur = index;
    playing = false;
    tween?.kill();
    pending.forEach((t) => t.kill());
    pending = [];
    const id = ++tid;
    dirNow = dir;
    const sh = H();
    const target = index > maxSec ? -bottomTop() : -sh * (index - 1);
    pagerTo(index);

    // Video button: the first section uses the first-section button, from the second section up to just before the video section it is a fixed button
    if (index === 1) gsap.set(fvtrig, { autoAlpha: 1 });
    else trigFade(fvtrig);
    if (index >= 2 && index < movieIdx) trigShow(mtrig, 0);
    else trigFade(mtrig);

    fulls.forEach(({ el }) => showBand(el));
    enterBands.forEach(hideBand);
    if (dir === "up") pending.push(gsap.delayedCall(0.4 * D, () => { if (id === tid) enterBands.forEach(openBand); }));
    if (dir === "down") hideTexts(enterEl);
    if (enterEl === hope) {
      if (dir === "up" && prev > maxSec) { hopeWindow(2, true); hopeContent(2, true); }
      else { hopeWindow(0, true); hopeContent(0, true); }
      hopeAcc = 0;
    }
    if (enteringHs && prevEl !== hope && hsMask) gsap.set(hsMask, { height: mobile.matches ? sh * 0.7 + innerWidth * 0.3 : sh + innerWidth * 0.3 });
    if (bottom && index > maxSec) gsap.fromTo(bottom, { y: sh }, { y: 0, duration: 1.2 * D, ease: "power2.out" });

    const follow = mobile.matches ? 0.2 : 0.06;
    tween = gsap.to(state, {
      y: target,
      duration: 1.2 * D,
      ease: "power2.out",
      onUpdate() {
        render();
        const p = this.progress();
        const t = Math.min(1, Math.max(0, (p - 0.1) / 0.9));
        const goal = dir === "down" ? -100 * t : -100 * (1 - t);
        fulls.forEach((f) => { f.y += (goal - f.y) * follow; gsap.set(f.el, { yPercent: f.y }); });
        if (leavingHs && hsMask) gsap.set(hsMask, { yPercent: -100 * p });
      },
      onComplete() {
        tween = null;
        dirNow = null;
        render();
        fulls.forEach((f) => { f.y = dir === "down" ? -100 : 0; gsap.set(f.el, { yPercent: f.y }); });
        if (bottom && prev > maxSec && index <= maxSec) gsap.set(bottom, { y: sh });
        if (enteringHs && hsMask) {
          gsap.set(hsMask, { yPercent: 0 });
          if (prevEl !== hope) gsap.to(hsMask, { height: mobile.matches ? sh * 0.7 : sh, duration: 0.8 * D, ease: "power2.out" });
        }
        if (!enterEl) { playing = true; return; }
        if (dir === "down") playTexts(enterEl); else showTexts(enterEl);
        if (enterBands.length && dir === "down") {
          pending.push(gsap.delayedCall(0.4 * D, () => {
            if (id !== tid) return;
            enterBands.forEach(openBand);
            gsap.delayedCall(2.4 * D, () => { if (id === tid) playing = true; });
          }));
        } else playing = true;
      },
    });
  };

  const step = (dy) => {
    if (modalOpen) return;
    let dir = dy < 0 ? "up" : "down";
    const here = secEl(cur);
    if (here === hope) {
      if (tween) return;
      const now = Date.now();
      if (now < hopeCool) return;
      hopeAcc += dy;
      if (Math.abs(hopeAcc) < 60) return;
      dir = hopeAcc < 0 ? "up" : "down";
      hopeAcc = 0;
      if (hopeStep(dir)) { hopeCool = now + 900 * D; return; }
    }
    const to = dir === "up" ? cur - 1 : cur + 1;
    const now = Date.now();
    if (to < 1 || to > maxPage) return;
    if (tween && dirNow === dir) return;
    if (dir === "up" && now - lastUp < 500) return;
    if (!playing && dir === "up") lastUp = now;
    go(to, dir);
  };

  // On the bottom section, scrolling over the footer works as normal, and scrolling up from the top goes to the previous section
  const stage = document.querySelector(".js-stage");
  stage.addEventListener("wheel", (e) => {
    if (e.target.closest(".j-foot") && cur > maxSec) { if (e.deltaY < 0) step(-100); return; }
    e.preventDefault();
    step(e.deltaY);
  }, { passive: false });
  let ty = 0, tacc = 0, tOn = false;
  stage.addEventListener("touchstart", (e) => { if (e.touches.length !== 1) return; tOn = true; ty = e.touches[0].clientY; tacc = 0; }, { passive: true });
  stage.addEventListener("touchmove", (e) => {
    if (!tOn || e.touches.length !== 1) return;
    const y = e.touches[0].clientY, dy = ty - y;
    ty = y;
    if (Math.abs(dy) < 2) return;
    e.preventDefault();
    tacc += dy;
    if (Math.abs(tacc) < 60) return;
    step(tacc);
    tacc = 0;
  }, { passive: false });
  stage.addEventListener("touchend", () => { tOn = false; tacc = 0; }, { passive: true });
  addEventListener("keydown", (e) => {
    if (e.target.closest("input, textarea")) return;
    if (["ArrowDown", "PageDown", " "].includes(e.key)) { e.preventDefault(); step(100); }
    if (["ArrowUp", "PageUp"].includes(e.key)) { e.preventDefault(); step(-100); }
  });

  // When the video window opens, the sections behind move up 40px
  let modalOpen = false;
  document.addEventListener("jal:modal", (e) => {
    modalOpen = e.detail;
    gsap.to(state, { shift: e.detail ? -40 : 0, duration: 0.8 * D, ease: e.detail ? "power2.out" : "power2.inOut", overwrite: true, onUpdate: render });
  });

  addEventListener("resize", () => {
    state.y = cur <= maxSec ? -H() * (cur - 1) : -bottomTop();
    render();
  });
  hopeContent(0, true);
  pagerTo(1);
  render();
})();
