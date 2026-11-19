// Header-line hiding, mega menu and logo strip are handled by the motion part (_fx). Here only the header-line background, phone drawer, language list and cookie bar.
(() => {
  const header = document.querySelector(".g-header");
  if (header) {
    const paint = () => header.classList.toggle("is-solid", scrollY >= 620);
    paint();
    addEventListener("scroll", paint, { passive: true });
  }

  const burger = document.querySelector(".g-burger");
  const drawer = document.getElementById("g-drawer");
  if (burger && drawer) {
    const set = (open) => {
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
      drawer.classList.toggle("is-open", open);
      drawer.setAttribute("aria-hidden", String(!open));
      drawer.toggleAttribute("inert", !open);
    };
    set(false);
    burger.addEventListener("click", () => set(burger.getAttribute("aria-expanded") !== "true"));
    drawer.addEventListener("click", (e) => { if (e.target.closest("a")) set(false); });
  }

  // The original closes only on pressing the button again or choosing a language — an outside click does not close it
  for (const lang of document.querySelectorAll(".g-lang")) {
    const btn = lang.querySelector(".g-lang__btn");
    const toggle = (on) => {
      lang.classList.toggle("is-active", on);
      btn.setAttribute("aria-expanded", String(on));
    };
    btn.addEventListener("click", () => toggle(!lang.classList.contains("is-active")));
    lang.querySelectorAll(".g-lang__list button").forEach((b) => b.addEventListener("click", () => toggle(false)));
  }

  const cookie = document.querySelector(".g-cookie");
  if (cookie) {
    const KEY = "g-cookie-answered";
    // The original consent bar appears with no transition about 1.8s after the screen shows (after the app attaches) — a value measured with motion-probe
    if (sessionStorage.getItem(KEY) !== "1") setTimeout(() => { cookie.hidden = false; }, 1800);
    cookie.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => {
      cookie.hidden = true;
      sessionStorage.setItem(KEY, "1");
    }));
  }
})();
