// The original pins the hero to the window height at first open (when over 320px) — the hero doesn’t grow back when the address bar shrinks
(() => {
  const first = document.querySelector(".i-first");
  if (first && innerHeight > 320 && innerWidth >= 750) first.style.height = `${innerHeight}px`;
})();
