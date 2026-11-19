// Frame — sound entry door, music bar (menu·play·sound·lyrics timetable), blurred dialog, Lenis (duration 1.3).
// The original plays a song with a video player and scrolls lyrics to the song time — we flow only the lyrics silently on the same timetable, with play and pause on the same button
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  // Smooth scroll — the original new Lenis({ duration: 1.3, smoothTouch: false, touchMultiplier: 2 }), stops until a door is chosen
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ duration: 1.3, smoothTouch: false, touchMultiplier: 2 });
    window.hxLenis = lenis;
    if (window.ScrollTrigger) lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Lottie — layers are colored by class so render as svg. Loader loops
  const lot = (el, name, opts = {}) => (el && window.lottie && window.hxLottie ? lottie.loadAnimation({ container: el, renderer: "svg", loop: false, autoplay: false, animationData: hxLottie[name], ...opts }) : null);
  window.hxLot = lot;

  // Lyrics — letters are split per line in advance, and at the song timetable (data-at seconds) each line flows right→left over 13s while letters turn on from .4 → 1 (after 1s, with spacing per line)
  const lines = $$(".hx-lyric__line");
  lines.forEach((l) => { l.innerHTML = [...l.textContent].map((c) => `<span>${c}</span>`).join(""); });
  const song = gsap.timeline({ paused: true });
  lines.forEach((l) => song.add(() => {
    l.classList.remove("is-on"); void l.offsetWidth; l.classList.add("is-on");
    gsap.fromTo(l.children, { autoAlpha: 0.4 }, { autoAlpha: 1, stagger: +(l.dataset.each || 0.3), delay: 1 });
  }, +l.dataset.at));

  const play = $(".hx-play"), vol = $(".hx-vol");
  play?.addEventListener("click", () => {
    const on = song.paused();
    on ? song.resume() : song.pause();
    play.classList.toggle("is-playing", on);
    lines.forEach((l) => l.classList.toggle("is-stop", !on));
  });
  vol?.addEventListener("click", () => vol.classList.toggle("is-off"));

  // Menu — pressing the three lines on the bar shows the menu over a blurred film, pressing a menu link closes it
  const setMenu = (open) => { root.classList.toggle("is-menu", open); open ? lenis?.stop() : lenis?.start(); };
  $(".hx-burger")?.addEventListener("click", () => setMenu(!root.classList.contains("is-menu")));
  $$(".hx-menu a").forEach((a) => a.addEventListener("click", (e) => {
    setMenu(false);
    const id = a.getAttribute("href");
    if (id?.startsWith("#") && id.length > 1 && lenis) { e.preventDefault(); lenis.scrollTo(id); }
  }));

  // Dialog — [data-open="Name"] opens it, and the window’s × closes it
  $$("[data-open]").forEach((b) => b.addEventListener("click", () => $(`#${b.dataset.open}`)?.classList.toggle("is-open")));
  $$(".hx-modal__close").forEach((b) => b.addEventListener("click", () => b.closest(".hx-modal").classList.remove("is-open")));
  addEventListener("keydown", (e) => { if (e.key !== "Escape") return; setMenu(false); $$(".hx-modal.is-open").forEach((m) => m.classList.remove("is-open")); });

  // Sound entry door — lifts over .3s after 1.5s of loading, and .3s later the door text and button turn on over .3s. On choosing, it fires hx:enter.
  const gate = $(".hx-gate");
  if (!gate) return;
  root.classList.add("is-gate");
  lenis?.stop();
  const spin = lot($(".hx-gate__lottie"), "loading", { loop: true, autoplay: !reduce });
  const loading = $(".hx-gate__loading"), choose = $(".hx-gate__choose");
  // Original order — after the page load, once the player is ready (embedded player onReady) it counts 1.5s. Our player is a first video (video), so once that video can render
  const reveal = () => setTimeout(() => {
    loading.classList.add("is-hidden");
    setTimeout(() => { loading.style.display = "none"; choose.classList.add("is-block"); setTimeout(() => choose.classList.add("is-show"), 300); }, 300);
  }, reduce ? 0 : 1500);
  const ready = () => {
    const v = document.querySelector("#player video");
    if (!v || v.readyState >= 2) return reveal();
    let done = false;
    const go = () => { if (!done) { done = true; reveal(); } };
    v.addEventListener("loadeddata", go, { once: true });
    setTimeout(go, 1500);
  };
  document.readyState === "complete" ? ready() : addEventListener("load", ready, { once: true });
  $$(".hx-gate__btn").forEach((b) => b.addEventListener("click", () => {
    if (b.dataset.sound === "off") vol?.classList.add("is-off");
    root.classList.remove("is-gate");
    song.play(0);
    play?.classList.add("is-playing");
    lenis?.start();
    spin?.destroy();
    document.dispatchEvent(new CustomEvent("hx:enter"));
  }, { once: true }));
})();
