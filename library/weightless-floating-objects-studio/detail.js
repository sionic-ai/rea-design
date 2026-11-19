// Work detail: a photo·video slot is treated as loaded when it is 500px before the screen, and the blur clears (original next/image lazyBoundary 500px · blur-xl → clear .5s).
// The sound button in the video slot toggles on and off with each press.
(() => {
  const media = document.querySelectorAll(".tm-media");
  const io = new IntersectionObserver((list) => {
    for (const en of list) {
      if (!en.isIntersecting) continue;
      io.unobserve(en.target);
      setTimeout(() => en.target.classList.add("is-loaded"), 120);
    }
  }, { rootMargin: "500px 0px" });
  media.forEach((m) => io.observe(m));
  document.querySelectorAll(".tm-mute").forEach((b) => b.addEventListener("click", () => {
    const on = b.getAttribute("aria-pressed") !== "true";
    b.setAttribute("aria-pressed", String(on));
    b.setAttribute("aria-label", on ? "Sound Off" : "Sound On");
  }));
})();
