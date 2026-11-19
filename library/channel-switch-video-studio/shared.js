// Shared — smooth scroll (original Lenis 1.3.26 · lerp .09 · wheel ×.9), section links glide over 1.4s, and scrolling stops while the menu is open.
// Hovering an account icon in the menu unfolds the name slot into that account’s name one character at a time (32ms, unresolved slots scramble with letters and digits).
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lenis = !reduce && window.Lenis ? new Lenis({ lerp: 0.09, wheelMultiplier: 0.9, autoRaf: true }) : null;
  if (lenis && window.ScrollTrigger) lenis.on("scroll", ScrollTrigger.update);

  document.addEventListener("fx:menu", (e) => {
    if (!lenis) return;
    if (e.detail?.open) lenis.stop();
    else lenis.start();
  });

  document.addEventListener("click", (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target instanceof Element ? e.target.closest("a[href^='#']") : null;
    if (!a || a.getAttribute("href") === "#") return;
    const target = document.getElementById(decodeURIComponent(a.hash.slice(1)));
    if (!target) return;
    e.preventDefault();
    if (lenis) {
      lenis.start();
      lenis.scrollTo(target, { duration: 1.4 });
    } else target.scrollIntoView({ behavior: "auto" });
    if (!target.matches("a[href], button, input, select, textarea, [tabindex]")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  });

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_.";
  const timers = new WeakMap();
  const scramble = (el, text, on) => {
    clearTimeout(timers.get(el));
    el.classList.toggle("is-handle", on);
    if (!on || reduce) {
      el.textContent = text;
      return;
    }
    let done = 0;
    const step = () => {
      const rest = Array.from({ length: text.length - done }, () => letters[Math.floor(Math.random() * letters.length)]).join("");
      el.textContent = text.slice(0, done) + rest;
      if (done >= text.length) return;
      done += 1;
      timers.set(el, setTimeout(step, 32));
    };
    step();
  };
  document.querySelectorAll(".nw-menu .nw-social li").forEach((li) => {
    const name = li.querySelector(".nw-social__name");
    const plain = name?.dataset.name;
    if (!name || !plain) return;
    li.querySelectorAll("a[data-handle]").forEach((a) => {
      const show = () => scramble(name, a.dataset.handle || "", true);
      const hide = () => scramble(name, plain, false);
      a.addEventListener("pointerenter", show);
      a.addEventListener("focus", show);
      a.addEventListener("pointerleave", hide);
      a.addEventListener("blur", hide);
    });
  });
})();
