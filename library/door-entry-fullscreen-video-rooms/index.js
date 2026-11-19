/* On first entry to each room the title and subtitle letters form and the hotspots float up from y40 below. 
   The first room counts from when the document opens (original hotspots 6.2, 6.4, 7.4, 9.8s, .6s cubic-bezier(.44,0,.56,1)) — they appear one by one as the entrance door lifts.
   Other rooms start 2s after entering, at .4s intervals, 1s cubic-bezier(.52,0,.48,1).
   Room 5: when the wheel stacks 150 downward or Zoom In is pressed, the video scales 1 → 1.55x (1.2s), and scrolling up or Zoom Out returns it. Locked for .9s after switching */
(() => {
  const R = window.fhRooms;
  if (!R) return;
  const { EASE, charsIn, hideChars, reduce } = R;
  const FIRST = [6.2, 6.4, 7.4, 9.8];

  function showSpots(spots, delays, dur, ease) {
    spots.forEach((s, i) => {
      if (reduce) return gsap.set(s, { autoAlpha: 1 });
      gsap.fromTo(s, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: dur, delay: delays[i] ?? delays[delays.length - 1] + i * 0.4, ease });
    });
  }

  document.querySelectorAll(".fh-room").forEach((r) => {
    hideChars(r.querySelector(".fh-room__title"));
    hideChars(r.querySelector(".fh-room__sub"));
  });

  addEventListener("fh:roomfirst", (e) => {
    const { room, el, first } = e.detail;
    const spots = [...el.querySelectorAll(".fh-spot:not([data-set='deep'])")];
    if (first) {
      charsIn(el.querySelector(".fh-room__title"), 0.1);
      charsIn(el.querySelector(".fh-room__sub"), 0.6);
      showSpots(spots, FIRST, 0.6, EASE.soft);
    } else {
      charsIn(el.querySelector(".fh-room__title"), 0.1);
      charsIn(el.querySelector(".fh-room__sub"), 0.6);
      showSpots(spots, spots.map((_, i) => 2 + i * 0.4), 1, EASE.out);
    }
    if (room === 4) {
      const pill = el.querySelector(".fh-deeper");
      gsap.fromTo(pill, { autoAlpha: 0 }, { autoAlpha: 1, duration: reduce ? 0 : 1, delay: reduce ? 0 : 2, ease: EASE.out });
    }
  });

  /* ── Room 5 going deeper ───────────────── */
  const room5 = document.getElementById("room5");
  if (!room5) return;
  const video = room5.querySelector("video");
  const head = room5.querySelector(".fh-room__head");
  const near = [...room5.querySelectorAll(".fh-spot[data-set='near']")];
  const deep = [...room5.querySelectorAll(".fh-spot[data-set='deep']")];
  const deeper = room5.querySelector(".fh-deeper"), back = room5.querySelector(".fh-back");
  const statement = room5.querySelector(".fh-deep");
  let state = "near", lock = false, acc = 0;
  const d = (s) => (reduce ? 0 : s);

  function zoom(to) {
    if (to === state) return;
    state = to;
    lock = true;
    setTimeout(() => { lock = false; }, 900);
    dispatchEvent(new CustomEvent("fh:zoom", { detail: { state } }));
    room5.querySelectorAll(".fh-spot[aria-expanded='true']").forEach((s) => s.click());
    const inn = to === "deep";
    gsap.to(video, { scale: inn ? 1.55 : 1, duration: d(1.2), ease: EASE.out });
    gsap.to(head, { autoAlpha: inn ? 0 : 1, duration: d(0.6), ease: EASE.out });
    gsap.to(inn ? near : deep, { autoAlpha: 0, duration: d(0.4), ease: EASE.soft, overwrite: true });
    gsap.to(inn ? deeper : back, { autoAlpha: 0, duration: d(0.4), ease: EASE.soft, overwrite: true });
    gsap.fromTo(inn ? back : deeper, { autoAlpha: 0 }, { autoAlpha: 1, duration: d(0.8), delay: d(0.6), ease: EASE.out, overwrite: true });
    showSpots(inn ? deep : near, (inn ? deep : near).map((_, i) => 0.8 + i * 0.2), 1, EASE.out);
    if (inn) {
      gsap.set(statement, { autoAlpha: 1 });
      charsIn(statement.querySelector(".fh-deep__title"), 0.6);
      charsIn(statement.querySelector(".fh-deep__sub"), 1.2);
      charsIn(statement.querySelector(".fh-deep__words"), 1.6, "word");
    } else {
      gsap.to(statement, { autoAlpha: 0, duration: d(0.4), ease: EASE.soft });
    }
  }
  deeper.addEventListener("click", () => zoom("deep"));
  back.addEventListener("click", () => zoom("near"));
  addEventListener("fh:roomleave", (e) => { if (e.detail.room === 4 && state === "deep") zoom("near"); });

  addEventListener("wheel", (e) => {
    if (R.current !== 4 || !room5.contains(e.target) || innerWidth <= 810) return;
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
    const down = e.deltaY > 0, up = e.deltaY < 0;
    const mine = (down && state === "near") || (up && state === "deep");
    const stay = down && state === "deep";
    if (!mine && !stay && !lock) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    if (stay || lock) { acc = 0; return; }
    acc += e.deltaY;
    if (Math.abs(acc) < 150) return;
    acc = 0;
    zoom(down ? "deep" : "near");
  }, { capture: true, passive: false });

  let ty = 0;
  room5.addEventListener("touchstart", (e) => { ty = e.touches[0].clientY; }, { passive: true });
  room5.addEventListener("touchend", (e) => {
    if (innerWidth > 810) return;
    const dy = ty - e.changedTouches[0].clientY;
    if (Math.abs(dy) < 50) return;
    const upSwipe = dy > 0;
    const mine = (upSwipe && state === "near") || (!upSwipe && state === "deep");
    const stay = upSwipe && state === "deep";
    if (!mine && !stay && !lock) return;
    e.stopPropagation();
    if (stay || lock) return;
    zoom(upSwipe ? "deep" : "near");
  });
})();
