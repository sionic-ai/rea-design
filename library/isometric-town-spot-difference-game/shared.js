// Shared by several pages: loading → circle opens, modal open/close, corner menu, press, barba transition (circle closes), eye blink.
// The original sequenced with jQuery + TweenMax empty tweens — the same intervals were moved to gsap.delayedCall.
(() => {
  const root = document.documentElement;
  const loading = document.getElementById("t-loading");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const later = (s, fn) => (reduce ? fn() : gsap.delayedCall(s, fn));

  const TKB = (window.TKB = { later, reduce, onModal: [] });

  // Corner menu — when on, help and the bottom button come in, otherwise they drop out
  TKB.menu = (on) => {
    document.querySelectorAll("#t-help, #t-dock").forEach((el) => el.classList.toggle("is-on", on));
  };

  // If the panel is longer than the screen, place it from the top and scroll — swaps j-c / j-s of the original resizes()
  const fit = (modal) => {
    const card = modal.querySelector(".t-card");
    if (!card || modal.classList.contains("t-howto")) return;
    modal.classList.toggle("is-tall", card.offsetHeight + 88 > innerHeight);
  };

  TKB.open = (id) => {
    const modal = document.getElementById(id);
    if (!modal) return;
    fit(modal);
    modal.scrollTop = 0;
    modal.classList.add("is-on");
    document.body.classList.add("is-modal");
    TKB.menu(false);
    TKB.onModal.forEach((fn) => fn("open", id));
  };
  TKB.close = (modal) => {
    modal.classList.remove("is-on");
    document.body.classList.remove("is-modal");
    TKB.menu(true);
    TKB.onModal.forEach((fn) => fn("close", modal.id));
  };

  document.addEventListener("click", (e) => {
    const opener = e.target.closest("[data-modal-open]");
    if (opener) {
      e.preventDefault();
      if (opener.dataset.active === "false") return;
      TKB.open(opener.dataset.modalOpen);
      return;
    }
    const closer = e.target.closest("[data-modal-close]");
    if (closer) {
      e.preventDefault();
      TKB.close(closer.closest(".t-modal"));
      return;
    }
    // Locked stage link — barba skips it via prevent, and here normal navigation is blocked too
    const locked = e.target.closest("[data-leave]");
    if (locked && (locked.dataset.active === "false" || locked.classList.contains("is-locked"))) e.preventDefault();
  });
  addEventListener("resize", () => document.querySelectorAll(".t-modal.is-on").forEach(fit));

  // Press: .97x while pressed, releases .1s after letting go. A click presses for .3s then releases
  const press = (el, hold) => {
    el.classList.add("is-clicking");
    if (hold) return;
    later(0.3, () => later(0.1, () => el.classList.remove("is-clicking")));
  };
  const release = (el) => later(0.1, () => el.classList.remove("is-clicking"));
  document.addEventListener("pointerdown", (e) => { const el = e.target.closest(".t-press"); if (el) press(el, true); });
  document.addEventListener("pointerup", (e) => { const el = e.target.closest(".t-press"); if (el) release(el); });
  document.addEventListener("pointerout", (e) => { const el = e.target.closest(".t-press.is-clicking"); if (el && !el.contains(e.relatedTarget)) release(el); });
  document.addEventListener("click", (e) => { const el = e.target.closest(".t-press"); if (el) press(el, false); });

  // Page transition — original barba.init as is (leave: clear the menu·modal and 900ms after the stage circle closes, enter: new container from opacity 0).
  // Page scripts hang their first draw on TKB.pages[namespace], and it is called with the new container on first open (once) and after arriving (after).
  // Skip locked stages and links without data-leave (modal toggles, # links)
  TKB.pages = {};
  const run = ({ next }) => TKB.pages[next.namespace]?.(next.container);
  TKB.start = () => barba.init({
    timeout: 5000,
    prevent: ({ el }) => !el.hasAttribute("data-leave") || el.dataset.active === "false" || el.classList.contains("is-locked"),
    transitions: [{
      name: "default-transition",
      once: run,
      leave: ({ current }) => {
        TKB.menu(false);
        document.querySelectorAll(".t-modal.is-on").forEach((m) => m.classList.remove("is-on"));
        current.container.classList.remove("is-on");
        return new Promise((resolve) => setTimeout(resolve, reduce ? 0 : 900));
      },
      enter: ({ next }) => gsap.from(next.container, { opacity: 0 }),
      after: run,
    }],
  });

  // When the page finishes building its art, the circle of that stage (barba container) opens and the loading is removed 1s later
  TKB.reveal = (stage) => {
    stage.classList.add("is-on");
    later(1, () => loading.classList.remove("is-on"));
  };

  // Eye blink — once every 3–12 seconds. The original blinks() makes only the logo eyes blink on the first page (namespace top) (index.js) — other eyes only on the stage screen
  const blink = () => {
    const top = document.querySelector("[data-barba=container]")?.dataset.barbaNamespace === "top";
    const eyes = top ? [] : document.querySelectorAll(".t-eye");
    const eye = eyes[Math.floor(Math.random() * eyes.length)];
    if (eye) {
      eye.classList.remove("is-blink");
      void eye.getBoundingClientRect();
      eye.classList.add("is-blink");
    }
    gsap.delayedCall(Math.random() * 9 + 3, blink);
  };
  if (!reduce) gsap.delayedCall(2, blink);

  root.classList.add("t-js");
})();
