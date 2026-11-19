// Subpage devices: news category tabs (bar slides), product photo slider·expanding cells, article header logo·related news slider.
(() => {
  const S = window.S;
  if (!S) return;
  const dur = S.reduce ? 0 : 0.4;

  // Category tabs: the bar slides under the chosen tab in .4s, leaving only the chosen category
  const tabs = document.querySelector(".l-tabs");
  if (tabs) {
    const bar = tabs.querySelector(".l-tabs__bar"), buttons = [...tabs.querySelectorAll(".l-tab")], cards = [...document.querySelectorAll(".l-list .n-card")];
    const slide = (b, now) => {
      const r = b.getBoundingClientRect(), o = tabs.getBoundingClientRect();
      gsap.to(bar, { left: r.left - o.left, width: r.width, opacity: 1, duration: now ? 0 : dur, overwrite: true });
    };
    buttons.forEach((b) => b.addEventListener("click", () => {
      buttons.forEach((x) => x.classList.toggle("is-on", x === b));
      slide(b);
      const cat = b.dataset.cat;
      cards.forEach((c) => c.classList.toggle("is-out", !!cat && c.dataset.cat !== cat));
      ScrollTrigger.refresh();
      // After picking, the remaining card photos open again from the center (.6x · 1.1 → 1 · .9s)
      // In the original the list redraws (after .09s) and photo plates switch on right away, staggered .047s per card, then from .085s open from the center staggered .033s (.6× · 1.1 → 1 · .9s)
      if (!S.reduce) cards.filter((c) => !c.classList.contains("is-out")).forEach((c, i) => {
        const m = c.querySelector(".n-card__media"), inner = m?.firstElementChild, k = Math.min(i, 6);
        if (!m || !inner) return;
        gsap.set(inner, { opacity: 0 });
        gsap.set(inner, { opacity: 1, delay: 0.02 + k * 0.047 });
        gsap.fromTo(m, { clipPath: "inset(20% 20% 20% 20%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: S.BASE.media, delay: 0.02 + k * 0.033, overwrite: true });
        gsap.fromTo(inner, { scale: 1.1 }, { scale: 1, duration: S.BASE.media, delay: 0.02 + k * 0.033 });
      });
    }));
    S.onReady(() => slide(buttons.find((b) => b.classList.contains("is-on")) || buttons[0], true));
    addEventListener("resize", () => slide(buttons.find((b) => b.classList.contains("is-on")) || buttons[0], true));
  }

  // Product photo: tapping a small photo cross-fades to the large photo in .6s
  const thumbs = [...document.querySelectorAll(".p-thumb")], shots = [...document.querySelectorAll(".p-shot")];
  thumbs.forEach((t, i) => t.addEventListener("click", () => {
    thumbs.forEach((x, j) => x.classList.toggle("is-on", j === i));
    shots.forEach((x, j) => x.classList.toggle("is-on", j === i));
  }));
  // Expand cell: height 0 → full height, .4s
  document.querySelectorAll(".p-acc__head").forEach((head) => {
    const body = head.nextElementSibling;
    head.addEventListener("click", () => {
      const open = head.getAttribute("aria-expanded") !== "true";
      head.setAttribute("aria-expanded", String(open));
      gsap.to(body, { height: open ? "auto" : 0, duration: dur, onComplete: () => ScrollTrigger.refresh() });
    });
  });
  // Back to shop close Lottie: draws when attached, and the X spins when hovered
  const back = document.querySelector(".p-back [data-lottie]");
  if (back) {
    S.onReady(() => S.seg(back, 0, 111));
    const a = back.closest("a");
    a.addEventListener("pointerenter", () => S.seg(back, 121, 151));
    a.addEventListener("pointerleave", () => S.seg(back, 177, 213));
  }

  // Article header logo: drawn once the loader clears
  const mark = document.querySelector(".a-mark [data-lottie]");
  if (mark) S.onReady(() => S.seg(mark, 0, 81));

  // Related news: arrows move one at a time, boards can also be dragged to flip
  const track = document.querySelector(".a-rel__track");
  if (track) {
    document.querySelectorAll(".a-rel__nav [data-step]").forEach((b) => b.addEventListener("click", () => {
      const card = track.querySelector(".n-card"), step = (card?.offsetWidth || 300) + 24;
      gsap.to(track, { scrollLeft: track.scrollLeft + step * +b.dataset.step, duration: S.reduce ? 0 : 0.6 });
    }));
    let down = null;
    track.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") return; down = { x: e.clientX, s: track.scrollLeft, moved: false }; });
    addEventListener("pointermove", (e) => { if (!down) return; const dx = e.clientX - down.x; if (Math.abs(dx) > 4) down.moved = true; track.scrollLeft = down.s - dx; });
    addEventListener("pointerup", () => { if (down?.moved) track.addEventListener("click", (ev) => ev.preventDefault(), { once: true, capture: true }); down = null; });
  }
})();
