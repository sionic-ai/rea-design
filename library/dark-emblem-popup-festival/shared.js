// Spanning several scenes — header clock, + button and menu drawer (back blur, locomotive scroll), news picker inside the menu, sound bars.
// index.js has to close the drawer along with the transition (DIVE), so it exposes open and close via window.bfChrome
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const page = $(".bf-page");
  const phone = matchMedia("(max-width: 959px)");

  const clock = $("[data-clock]");
  const hands = { h: $(".bf-clock__h"), m: $(".bf-clock__m"), s: $(".bf-clock__s") };
  const tick = () => {
    const d = new Date();
    const p = (n) => String(n).padStart(2, "0");
    if (clock) clock.textContent = `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
    hands.h?.setAttribute("transform", `rotate(${(d.getHours() % 12) * 30 + d.getMinutes() / 2} 20 20)`);
    hands.m?.setAttribute("transform", `rotate(${d.getMinutes() * 6} 20 20)`);
    hands.s?.setAttribute("transform", `rotate(${d.getSeconds() * 6} 20 20)`);
  };
  tick();
  setInterval(tick, 1000);

  const nav = $(".bf-nav");
  const toggle = $(".bf-toggle button");
  let navScroll = null;
  const openNav = () => {
    nav.classList.add("is-active");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close Menu");
    document.body.classList.add("is-nav");
    if (!phone.matches && window.LocomotiveScroll) {
      navScroll ??= new LocomotiveScroll({ el: $(".bf-nav__scroll"), smooth: true, lerp: 0.1 });
      navScroll.update();
      navScroll.scrollTo(0, { duration: 0, disableLerp: true });
    } else {
      $(".bf-nav__scroll").scrollTop = 0;
    }
  };
  const closeNav = () => {
    nav.classList.remove("is-active");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open Menu");
    document.body.classList.remove("is-nav");
  };
  toggle.addEventListener("click", () => {
    if (page.classList.contains("is-locked")) return;
    nav.classList.contains("is-active") ? closeNav() : openNav();
  });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && nav.classList.contains("is-active")) closeNav(); });

  $$(".bf-nav__list button").forEach((b) => b.addEventListener("click", () => {
    $$(".bf-nav__list button").forEach((x) => x.removeAttribute("aria-current"));
    b.setAttribute("aria-current", "true");
    $$(".bf-navnews").forEach((a) => { const on = a.id === b.getAttribute("aria-controls"); a.hidden = !on; a.classList.toggle("is-active", on); });
    navScroll?.update();
  }));

  const audio = $(".bf-audio");
  audio.addEventListener("click", () => {
    const off = audio.getAttribute("aria-pressed") !== "true";
    audio.setAttribute("aria-pressed", String(off));
    audio.setAttribute("aria-label", off ? "Sound On" : "Sound Off");
  });

  const init = () => {
    $(".bf-header").classList.add("is-init");
    $(".bf-footer").classList.add("is-init");
    $(".bf-toggle").classList.add("is-init");
  };

  window.bfChrome = { openNav, closeNav, init, isNavOpen: () => nav.classList.contains("is-active") };
})();
