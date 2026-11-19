// Hero video sound button · experience card video curtain · phone intro video curtain · phone photo swipe start
(() => {
  const narrow = matchMedia("(max-width: 970px)");

  // Original #bgVolume — each press toggles mute on and off and swaps the two icons with no curve
  const vol = document.querySelector(".dj-kv__vol");
  const kv = document.querySelector(".dj-kv__video");
  vol?.addEventListener("click", () => {
    const on = vol.getAttribute("aria-pressed") !== "true";
    vol.setAttribute("aria-pressed", String(on));
    vol.setAttribute("aria-label", on ? "Sound Off" : "Sound On");
    if (kv) kv.muted = !on;
  });

  // When the video cover closes (×, cover, or Esc — dialog-pop removes is-open in each case), the video stops
  const watchClose = (box) => {
    const video = box?.querySelector("video");
    if (!video) return;
    new MutationObserver(() => { if (!box.classList.contains("is-open")) video.pause(); }).observe(box, { attributes: true, attributeFilter: ["class"] });
  };

  const modal = document.getElementById("dj-modal");
  const modalVideo = modal?.querySelector("video");
  watchClose(modal);
  document.querySelectorAll(".dj-card").forEach((card) => {
    const open = () => {
      if (modalVideo) {
        modalVideo.setAttribute("aria-label", `${card.getAttribute("aria-label")} — Experience intro video slot · 16:9`);
        modalVideo.currentTime = 0;
        modalVideo.play().catch(() => {});
      }
      modal?.dispatchEvent(new Event("fx:open"));
    };
    card.addEventListener("click", open);
    card.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      open();
    });
  });

  // On phone, an intro video curtain is up as soon as you enter (original #sp_movie) — opened in advance behind the intro curtain
  const spMovie = document.getElementById("dj-spmovie");
  watchClose(spMovie);

  document.addEventListener("DOMContentLoaded", () => {
    if (!narrow.matches) return;
    const v = spMovie?.querySelector("video");
    if (v) v.preload = "metadata";
    spMovie?.dispatchEvent(new Event("fx:open"));
  });

  // The original intro.js counts at window.onload — 1s sentence, 2s letters, at 4s the curtain starts lifting, turning on the phone’s first photo, starting the slide advance, and scrolling back to the top
  addEventListener("load", () => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.querySelector(".dj-intro")?.setAttribute("data-fx", "logo-blur-loader");
    const stage = document.querySelector(".dj-slider__stage");
    setTimeout(() => {
      stage?.setAttribute("data-fx", "fade-zoom-slides");
      if (!reduce) scrollTo(0, 0);
    }, reduce ? 0 : 4000);
  });
})();
