(() => {
  const { reduce } = YG;
  const $ = (s) => document.querySelector(s);
  const loader = $(".yg-loader");
  const header = $(".yg-header"), shape = $(".yg-kv__shape"), img = $(".yg-kv__img"), copy = $(".yg-kv__copy");
  const late = [header, shape, img, copy].filter(Boolean);

  // Hero — once the loader starts lifting, the head and blob surfaces fade in 1.1s later, photo and copy 1.4s later, with a 2.2s linear fade (original showAnim, fadeshow-slow)
  const fadeIn = (els) => els.forEach((el) => gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 2.2, ease: "none", overwrite: true }));
  const showAnim = () => {
    gsap.delayedCall(1.1, () => fadeIn([header, shape].filter(Boolean)));
    gsap.delayedCall(1.4, () => fadeIn([img, copy].filter(Boolean)));
  };
  const showNow = () => fadeIn(late);

  const skip = sessionStorage.getItem("yg-skip-intro") === "1";
  const play = sessionStorage.getItem("yg-play-show") === "1";
  sessionStorage.removeItem("yg-play-show");
  if (reduce) {
    loader?.remove();
  } else if (skip) {
    // Returning from another page skips the loader — if arrived via the first page link, it appears after .6s, if via back navigation, immediately
    loader?.remove();
    gsap.set(late, { opacity: 0 });
    play ? gsap.delayedCall(0.6, showAnim) : showNow();
  } else {
    gsap.set(late, { opacity: 0 });
    document.documentElement.classList.add("yg-loading");
    loader?.addEventListener("fx:done", () => { document.documentElement.classList.remove("yg-loading"); showAnim(); }, { once: true });
    // If not done within 6.5s, lift the curtain (original watchdog)
    setTimeout(() => { if (loader?.isConnected && loader.dataset.loaderState !== "done") { loader.style.display = "none"; document.documentElement.classList.remove("yg-loading"); showNow(); } }, 6500);
  }

  // Testimonial speech bubbles — one at a time with prev and next buttons
  const list = $(".yg-comment__list");
  const [prev, next] = document.querySelectorAll(".yg-comment__nav .yg-round");
  const step = () => (list.firstElementChild?.getBoundingClientRect().width || 280) + 40;
  prev?.addEventListener("click", () => list.scrollBy({ left: -step(), behavior: reduce ? "auto" : "smooth" }));
  next?.addEventListener("click", () => list.scrollBy({ left: step(), behavior: reduce ? "auto" : "smooth" }));
})();
