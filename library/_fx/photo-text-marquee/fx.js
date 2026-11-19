// A strip where the photo shows through only in the shape of big text lines — the text line flows endlessly left while the photo stays fixed to the screen (only the letter holes pass by).
// The original uses the SVG clipPath’s <text> Moves this to CSS. Here it moves the text lines of background-clip: text while shifting the background position by the same amount in reverse, keeping the photo upright.
// One set width (--fx-shift) is measured as the first set’s width after the text is appended once more — re-measured with ResizeObserver if the font arrives late.
(() => {
  kfFx.register("photo-text-marquee", (el, { options, reduce }) => {
    const text = el.querySelector('[data-fx-part="text"]');
    if (!text || !text.textContent.trim()) return;
    const first = document.createElement("span");
    first.className = "fx-ptm-copy";
    first.append(...text.childNodes);
    const second = first.cloneNode(true);
    second.setAttribute("aria-hidden", "true");
    text.append(first, second);
    const measure = () => el.style.setProperty("--fx-shift", `${first.getBoundingClientRect().width}px`);
    const ro = new ResizeObserver(measure);
    ro.observe(first);
    measure();
    if (options.dur) el.style.setProperty("--fx-dur", `${+options.dur}s`);
    if (reduce) el.classList.add("fx-ptm-still");
    return () => {
      ro.disconnect();
      text.replaceChildren(...first.childNodes);
      el.style.removeProperty("--fx-shift");
      el.style.removeProperty("--fx-dur");
      el.classList.remove("fx-ptm-still");
    };
  });
})();
