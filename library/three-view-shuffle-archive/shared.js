// Motion shared by all views: loading screen (typing one character at a time after 1s → lifts in .2s linear at 3.5s), four corner labels retyping on a 7s beat,
// ●▶■·left/right switch the dot view (back to top .7s easeInOutQuart · ?type= Left in place). If the view changes, emit a3:view — motion inside the view lives in index.js
(() => {
  gsap.registerPlugin(ScrollToPlugin);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const narrow = () => innerWidth <= 768;
  const VIEWS = ["word", "list", "visual"];
  const body = document.body;

  // Original setTyping — empties the text and after delay seconds adds one character every step seconds (the next timer starts after the previous character is added, so it drifts slightly)
  const typing = new Map();
  const type = (el, delay, step) => {
    const text = el.dataset.text ?? (el.dataset.text = el.textContent);
    clearTimeout(typing.get(el));
    if (reduce) { el.textContent = text; return; }
    el.textContent = "";
    const next = (i) => {
      el.textContent = text.slice(0, i);
      if (i < text.length) typing.set(el, setTimeout(() => next(i + 1), step * 1000));
    };
    typing.set(el, setTimeout(() => next(1), delay * 1000));
  };

  // Each group picks one of 0~.8s (in 0.1 steps) and the group’s labels are re-stamped together. The shared line below is .03, the rest .02
  const groups = [...document.querySelectorAll(".a3-corner[data-group]")];
  let loopTimer;
  const loopTyping = () => {
    groups.forEach((g) => {
      const delay = Math.floor(Math.random() * 9) / 10;
      g.querySelectorAll('[data-type="loop"]').forEach((el) => {
        if (el.closest(".a3-pc") && narrow()) return;
        if (el.closest(".a3-sp") && !narrow()) return;
        type(el, delay, +(el.dataset.step || 0.02));
      });
    });
    if (!reduce) loopTimer = setTimeout(loopTyping, 7000);
  };

  let view = VIEWS.includes(new URLSearchParams(location.search).get("type")) ? new URLSearchParams(location.search).get("type") : "word";
  const neighbours = (v) => {
    const i = VIEWS.indexOf(v);
    return { prev: VIEWS[(i + 2) % 3], next: VIEWS[(i + 1) % 3] };
  };
  const apply = () => {
    body.dataset.view = view;
    document.querySelectorAll("[data-view-tab]").forEach((li) => li.classList.toggle("is-current", li.dataset.viewTab === view));
    const { prev, next } = neighbours(view);
    document.querySelector('[data-view-link="prev"]').setAttribute("href", `#${prev}`);
    document.querySelector('[data-view-link="next"]').setAttribute("href", `#${next}`);
  };
  // Signal to start the in-view motion (shuffle, turn on) — the first time after the loading screen lifts, afterwards on every press
  const announce = () => document.dispatchEvent(new CustomEvent("a3:view", { detail: { view } }));
  apply();

  document.querySelectorAll("[data-view-link]").forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    const to = a.getAttribute("href").slice(1);
    if (!VIEWS.includes(to)) return;
    if (reduce) scrollTo(0, 0);
    else gsap.to(window, { duration: 0.7, scrollTo: { y: 0, autoKill: false }, ease: "power3.inOut" });
    document.dispatchEvent(new CustomEvent("a3:leave", { detail: { view } }));
    view = to;
    history.replaceState(null, "", `?type=${view}`);
    apply();
    announce();
  }));

  const corners = document.querySelectorAll(".a3-corner--titles, .a3-corner--links, .a3-corner--desc");
  const splash = document.querySelector(".a3-splash");
  const start = () => {
    scrollTo(0, 0);
    if (reduce) { splash.remove(); loopTyping(); announce(); return; }
    if (!narrow()) body.classList.add("is-splash");
    corners.forEach((c) => c.classList.add("is-hidden"));
    splash.querySelectorAll('[data-type="splash"]').forEach((el) => type(el, 1, 0.03));
    splash.querySelectorAll('[data-type="splash-rights"]').forEach((el) => type(el, 1, 0.02));
    gsap.delayedCall(3.5, () => body.classList.remove("is-splash"));
    gsap.to(splash, {
      delay: 3.5, opacity: 0, duration: 0.2, ease: "none",
      onComplete: () => {
        splash.remove();
        corners.forEach((c) => c.classList.remove("is-hidden"));
        loopTyping();
        announce();
      },
    });
  };
  // The original starts 30ms after images finish loading (3s max) — ours has no images, so it starts right after the text finishes unfolding
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => setTimeout(start, 30), { once: true });
  else setTimeout(start, 30);
  addEventListener("pagehide", () => clearTimeout(loopTimer));
})();
