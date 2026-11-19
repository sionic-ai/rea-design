// Shared set: tab width measuring · loader · header color change · phone drawer · anchor scroll · screen saver.
// Once the loader starts to clear "y:intro-done" fires, and the page script builds the hero at that moment (original order: intro → kv).
(() => {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  // So it does not re-measure every time the phone address bar shrinks and grows (same setting as the original)
  ScrollTrigger.config({ autoRefreshEvents: "visibilitychange,DOMContentLoaded,load" });

  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const head = document.getElementById("y-head");

  // For sticky tabs to stick next to each other the sum of the previous tab widths is needed — rounded and passed as a variable so fractional widths don’t pile up into gaps
  function measure() {
    const tabs = [...document.querySelectorAll(".y-tab")];
    const keep = root.style.cssText;
    root.style.cssText = "";
    let h = 0;
    const widths = tabs.map((t) => {
      h = Math.max(h, Math.round(t.offsetHeight));
      return Math.round(t.offsetWidth);
    });
    root.style.cssText = keep;
    root.style.setProperty("--tab-h", `${h}px`);
    root.style.setProperty("--head-real", `${Math.round(head.offsetHeight)}px`);
    widths.forEach((w, i) => root.style.setProperty(`--tabw-${i + 1}`, `${w}px`));
  }
  measure();
  addEventListener("resize", measure);
  document.fonts?.ready.then(() => { measure(); ScrollTrigger.refresh(); });

  let ww = innerWidth;
  let wait;
  addEventListener("resize", () => {
    if (ww === innerWidth && !matchMedia("(pointer: fine)").matches) return;
    ww = innerWidth;
    clearTimeout(wait);
    wait = setTimeout(() => ScrollTrigger.refresh(), 250);
  });

  // Loader ------------------------------------------------------------
  const intro = document.getElementById("y-intro");
  const done = () => document.dispatchEvent(new CustomEvent("y:intro-done"));
  if (reduce.matches || !intro) {
    intro?.remove();
    addEventListener("DOMContentLoaded", done);
  } else {
    const loaded = new Promise((r) => (document.readyState === "complete" ? r() : addEventListener("load", r, { once: true })));
    gsap.timeline()
      .to(".y-intro__logo", { duration: 0.45, autoAlpha: 1, y: 0, ease: "power2.inOut" }, 0.5)
      .to(".y-intro__logo", { duration: 0.45, autoAlpha: 0, y: -10, ease: "power2.inOut" }, "+=0.8")
      .to([".y-intro__fill", ".y-intro__line"], { duration: 0.45, autoAlpha: 1, y: 0 }, "+=.45")
      .to(".y-intro__fill", { duration: 0.8, clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)", ease: "power2.inOut" }, "+=.2")
      .add(() => loaded.then(() => {
        gsap.to(intro, { duration: 1, autoAlpha: 0, ease: "power2.inOut", onComplete: () => intro.remove() });
        done();
      }), "+=.25");
  }

  // Past the Hero the header panel color goes from blue-gray to background gray ---------------
  const kv = document.querySelector(".y-kv");
  if (kv) {
    const swap = () => head.classList.toggle("is-past", scrollY >= kv.offsetHeight - head.offsetHeight);
    addEventListener("scroll", swap, { passive: true });
    swap();
  }

  // Phone·tablet drawer -----------------------------------------------------
  const burger = document.getElementById("y-burger");
  const closeBtn = document.getElementById("y-close");
  const drawer = document.getElementById("y-drawer");
  let lockTimer;
  function setDrawer(open) {
    drawer.classList.toggle("is-shown", open);
    burger.setAttribute("aria-expanded", String(open));
    clearTimeout(lockTimer);
    // Like the original, lock the page scroll behind only after the drawer is fully open (0.3s)
    if (open) lockTimer = setTimeout(() => root.classList.add("is-locked"), 300);
    else root.classList.remove("is-locked");
  }
  burger.addEventListener("click", () => setDrawer(!drawer.classList.contains("is-shown")));
  closeBtn.addEventListener("click", () => setDrawer(false));
  drawer.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setDrawer(false)));
  matchMedia("(min-width: 1081px)").addEventListener("change", (e) => e.matches && setDrawer(false));

  // In-page anchors: scroll stops short by the header height so the tab row stays visible (original jQuery animate 500ms)
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    // Slots for outside links (PDF · map · SNS etc.) that the original opened in a new window — the page stays as it is
    if (a.hasAttribute("data-ext")) { e.preventDefault(); return; }
    const id = a.getAttribute("href");
    const target = id === "#" ? document.body : document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const y = id === "#" ? 0 : target.getBoundingClientRect().top + scrollY - head.offsetHeight;
    gsap.to(window, { duration: reduce.matches ? 0 : 0.5, scrollTo: { y, autoKill: true }, ease: "sine.inOut" });
  });

  // Screensaver: after 30 seconds without interaction a record card pops up at random, and any input clears it ----------
  const saver = document.getElementById("y-saver");
  if (!saver) return;
  const items = [...saver.querySelectorAll(".y-saver__item")];
  const IDLE = 30;
  const EVENTS = ["keydown", "mousemove", "click", "touchmove", "scroll"];
  let idle;
  let shown = false;
  const on = (fn) => EVENTS.forEach((n) => addEventListener(n, fn, { passive: true }));
  const off = (fn) => EVENTS.forEach((n) => removeEventListener(n, fn));
  const resetIdle = () => { clearTimeout(idle); idle = setTimeout(show, IDLE * 1000); };
  const fade = reduce.matches ? 0 : 0.5;

  function show() {
    if (shown) return;
    shown = true;
    clearTimeout(idle);
    off(resetIdle);
    const pick = items[Math.floor(Math.random() * items.length)];
    gsap.to(pick, { duration: fade, autoAlpha: 1, ease: "power2.inOut" });
    gsap.to(saver, { duration: fade, autoAlpha: 1, ease: "power2.inOut" });
    // Attach the close handler one beat later so the input that opened it (a click etc.) doesn’t close it right away
    setTimeout(() => on(hide), innerWidth > 450 ? 1100 : 100);
  }
  function hide() {
    off(hide);
    setTimeout(() => {
      gsap.to(items, { duration: fade, autoAlpha: 0, ease: "power2.inOut" });
      gsap.to(saver, { duration: fade, autoAlpha: 0, ease: "power2.inOut" });
      shown = false;
      on(resetIdle);
      resetIdle();
    }, innerWidth > 800 ? 300 : 0);
  }
  document.querySelectorAll("[data-saver-open]").forEach((el) => el.addEventListener("click", () => setTimeout(show, 50)));
  on(resetIdle);
  resetIdle();
})();
