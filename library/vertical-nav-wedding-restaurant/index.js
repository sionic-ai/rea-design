// Instagram strip: flows at the default .06rem/frame, speeding up to .75·e³ or reversing depending on the mouse’s horizontal position.
(() => {
  const track = document.querySelector(".ix-insta__track");
  if (!track) return;
  const n = track.children.length;
  const pc = () => document.body.clientWidth >= 767;
  window.nlDrift(track, { base: 0.06, gain: 0.75, loopRem: () => (pc() ? 25.5 : 13) * n });
})();

// Hero video: like the original, plays once at first then stops two frames later to lay down the first scene, and loops 2.2 seconds after the loader opens (2.1 seconds on a phone’s first visit).
(() => {
  const video = document.querySelector(".ix-hero__video video");
  if (!video) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const play = () => { const p = video.play(); if (p) p.catch(() => {}); };
  play();
  requestAnimationFrame(() => requestAnimationFrame(() => video.pause()));
  if (reduce) return;
  addEventListener("nl:open", (e) => {
    const firstVisit = e.detail && e.detail.firstVisit;
    const pc = document.body.clientWidth >= 767;
    setTimeout(() => { play(); video.setAttribute("autoplay", ""); }, firstVisit && !pc ? 2100 : 2200);
  }, { once: true });
})();
