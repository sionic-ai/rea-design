// Outer shell of a one-page site: work color band fill, about panel open/close, bottom-right clock, mouse tag label.
// The first scene order (loader → box rolls in → list and buttons after 1s) is invoked by index.js via bjSite.ready().
(() => {
  const root = document.querySelector(".bj");
  if (!root) return;
  const N = document.querySelectorAll(".bj-list__item").length || 9;
  const mod = (a, n) => ((a % n) + n) % n;
  let reduce = false;
  gsap.matchMedia().add({ reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => { reduce = ctx.conditions.reduce; });

  // Color strip: of 50 slides the middle one (no. 25) is the first work — at step s, slide 25+s comes on screen
  const strip = root.querySelector(".bj-strip");
  if (strip) {
    strip.innerHTML = Array.from({ length: 50 }, (_, n) => `<div class="bj-strip__s"><i style="--c: var(--site-c${mod(n - 25, N)})"></i></div>`).join("");
    gsap.set(strip, { y: -25 * innerHeight });
  }
  const moveStrip = (step, dur = 0.9, delay = 0) => {
    if (strip) gsap.to(strip, { y: -(25 + step) * innerHeight, duration: reduce ? 0 : dur, delay: reduce ? 0 : delay, ease: "power2.inOut", overwrite: true });
  };

  // About panel — toggled by the name button, closes when pressing outside the panel or button
  const info = document.querySelector(".bj-info");
  const me = document.querySelector(".bj-top__me");
  const setInfo = (open) => { info?.classList.toggle("is-open", open); me?.setAttribute("aria-expanded", String(open)); };
  me?.addEventListener("click", () => setInfo(!info.classList.contains("is-open")));
  const outside = (e) => { if (info?.classList.contains("is-open") && !info.contains(e.target) && !me.contains(e.target)) setInfo(false); };
  document.addEventListener("mousedown", outside);
  document.addEventListener("touchstart", outside, { passive: true });

  // Clock — that city’s time, updated every 30 seconds
  const clock = document.querySelector(".bj-clock__time");
  const tick = () => { if (clock) clock.textContent = `CET ${new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Europe/Berlin" })}`; };
  tick();
  setInterval(tick, 3e4);

  // Tag: follows the cursor exactly (no delay), its text and on-state are set via setCursor
  const cur = document.querySelector(".bj-cursor");
  const curTxt = cur?.querySelector(".bj-cursor__txt");
  root.addEventListener("mousemove", (e) => { if (cur) cur.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`; });
  const setCursor = (text, on, blink = false) => {
    if (!cur) return;
    if (text != null) curTxt.textContent = text;
    cur.classList.toggle("is-on", !!on);
    cur.classList.toggle("is-blink", !!blink);
  };

  // First scene — once the loader finishes counting (hold), wait for the box to be ready, lift the curtain and roll the box in, then the list and buttons come in 1s later (on phones, right away)
  const loader = document.querySelector(".bj-loader");
  const ui = { list: root.querySelector(".bj-list"), top: document.querySelector(".bj-top"), clock: document.querySelector(".bj-clock") };
  const narrow = () => innerWidth <= 768;
  if (!narrow() && !reduce) {
    if (ui.list) gsap.set(ui.list, { yPercent: -200 });
    gsap.set([ui.top, ui.clock].filter(Boolean), { opacity: 0 });
  }
  const ios = /iP(hone|ad|od)/.test(navigator.userAgent) && /^((?!chrome|crios|android).)*safari/i.test(navigator.userAgent);
  let counted = false, cubeReady = false, started = false;
  const start = (onEnter) => {
    if (started || !counted || !cubeReady) return;
    started = true;
    loader?.dispatchEvent(new CustomEvent("fx:go"));
    onEnter();
    const wait = narrow() || reduce ? 0 : 1000;
    setTimeout(() => {
      if (narrow()) return;
      const o = { duration: reduce ? 0 : 1.125, ease: "power2.inOut", overwrite: true };
      if (ui.list) gsap.to(ui.list, { yPercent: 0, ...o });
      gsap.to([ui.top, ui.clock].filter(Boolean), { opacity: 1, ...o });
    }, wait);
  };
  let enterFn = () => {};
  loader?.addEventListener("fx:counted", () => {
    // Phone Safari can’t play several videos without a gesture, so show Tap anywhere and wake the videos on tap
    if (ios && narrow()) {
      const num = loader.querySelector('[data-fx-part="num"]');
      num.textContent = "Tap anywhere";
      gsap.to(num, { opacity: 1, duration: 0.4, ease: "power2.out" });
      loader.classList.add("is-tap");
      loader.addEventListener("click", () => {
        loader.classList.remove("is-tap");
        document.querySelectorAll(".bj-cube video").forEach((v) => v.play().then(() => v.pause()).catch(() => {}));
        counted = true;
        start(enterFn);
      }, { once: true });
      return;
    }
    counted = true;
    start(enterFn);
  });
  if (!loader) counted = true;

  window.bjSite = {
    N, mod, moveStrip, setInfo, setCursor,
    get reduce() { return reduce; },
    ready(onEnter) { cubeReady = true; enterFn = onEnter; start(onEnter); },
  };
})();
