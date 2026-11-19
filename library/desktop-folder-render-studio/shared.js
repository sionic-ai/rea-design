(() => {
  // View mode — toggled by changing the class of the curtain element itself (the original also changes the curtain’s class from opacity-0 to opacity-100).
  // While open, lock body scroll (original body position: fixed) — so the curtain doesn’t shift even on a phone in landscape where the panel exceeds the screen
  addEventListener("fx:viewer", (e) => {
    const veil = e.target.querySelector?.(".at-veil");
    if (veil) veil.classList.toggle("is-on", e.detail.open);
    document.body.style.overflow = e.detail.open ? "hidden" : "";
  });
})();
