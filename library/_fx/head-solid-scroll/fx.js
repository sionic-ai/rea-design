(() => {
  // The header line that floated transparently over the hero photo turns into a background-color panel and gets shorter after scrolling just a little — prevents white text over the photo from becoming unreadable on the body
  kfFx.register("head-solid-scroll", (el, { options, scroller }) => {
    const box = scroller || window;
    const top = () => (scroller ? scroller.scrollTop : window.scrollY);
    const view = () => (scroller ? scroller.clientHeight : window.innerHeight);
    // at is px, or a screen height ratio like ”100vh” (Brand first page — it must scroll down by the first screen height to become a board)
    const raw = String(options.at ?? 50);
    const at = () => (raw.endsWith("vh") ? (parseFloat(raw) / 100) * view() : +raw);
    // hide — hide the header when the top edge of the tail (hide-from, default footer) rises more than this many px from the bottom of the screen (Brand 500)
    const hide = options.hide != null ? +options.hide : null;
    const tail = hide != null ? document.querySelector(options["hide-from"] || "footer") : null;
    const check = () => {
      el.toggleAttribute("data-solid", top() > at());
      if (tail) el.toggleAttribute("data-hidden", tail.getBoundingClientRect().top + hide < view());
    };
    check();
    box.addEventListener("scroll", check, { passive: true });
    addEventListener("resize", check);
    return () => { box.removeEventListener("scroll", check); removeEventListener("resize", check); el.removeAttribute("data-solid"); el.removeAttribute("data-hidden"); };
  });
})();
