// First page scene — the Hero title, side text and header menu typing are handled by shared.js. Here only the sound-on button.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  window.esrSite.scene((at) => {
    // Sound on: like the original, the video layer with sound turns on from .14 → 1 (.8s expo.out, index.css), and turning it off returns to .14 at once, button text gets shorter
    const mute = $(".e-hero__mute");
    const sound = $(".e-hero__sound");
    mute?.addEventListener("click", () => {
      const on = mute.getAttribute("aria-pressed") !== "true";
      mute.setAttribute("aria-pressed", String(on));
      mute.textContent = on ? "Mute" : "Unmute";
      if (sound) {
        const v = $("video", sound);
        if (on) v?.play().catch(() => {}); else v?.pause();
        sound.classList.toggle("is-on", on);
      }
    });
  });
})();
