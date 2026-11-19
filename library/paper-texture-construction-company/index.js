// First page — draws a six-cell X-mark loader (30fps 4s, no loop) with lottie-web, and the curtain lifts after 3s over 1s.
// The big hero photo (25s pull-back) and photo column (75s flow) start moving as soon as they open behind the curtain, like the original.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const loader = document.querySelector(".ud-loader");
  const hero = document.querySelector(".ud-hero");
  const start = () => requestAnimationFrame(() => requestAnimationFrame(() => hero?.classList.add("is-on")));

  let shown = false;
  try { shown = sessionStorage.getItem("ud-intro") === "1"; } catch {}
  // The original is a single app (SPA), so the loader doesn’t reappear when reaching the first page through an inner link — skipped if arriving from the same site
  try {
    const from = document.referrer ? new URL(document.referrer) : null;
    if (from && from.host === location.host && from.pathname !== location.pathname && /\/(works|about|recruit|news)\.html$/.test(from.pathname)) shown = true;
  } catch {}
  if (!loader || reduce || shown || !window.lottie) {
    loader?.classList.add("is-skip");
    if (!reduce) start();
    else hero?.classList.add("is-on");
    return;
  }
  if (window.UD_LOADER) lottie.loadAnimation({ container: loader.querySelector(".ud-loader-art"), renderer: "svg", loop: false, autoplay: true, animationData: window.UD_LOADER });
  start();
  // Measuring the original: the curtain stays as is for 3 seconds, then lifts from 3.0→4.15s with no curve (meanwhile the screen only changes the Lottie line a little)
  requestAnimationFrame(() => requestAnimationFrame(() => loader.classList.add("is-done")));
  setTimeout(() => loader.classList.add("is-skip"), 4200);
  try { sessionStorage.setItem("ud-intro", "1"); } catch {}
})();
