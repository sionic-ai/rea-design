(() => {
  // Original (a studio site WorkItem): on mouseenter or when on screen (rootMargin −150px, resets when leaving), shuffle-letters runs in the title spot
  // Shuffles the brand name 4 times at 60fps, then restores the original title when done. On leaving it goes straight back to the original title. Look is in fx.css .is-peek · .is-view
  kfFx.register("peek-faces-card", (el, { options, reduce, hover }) => {
    const title = el.querySelector('[data-fx-part="title"]');
    let text = null, dummy = null, original = "";
    if (title && !title.querySelector(".fx-peek-text")) {
      original = title.textContent.trim();
      text = document.createElement("span");
      text.className = "fx-peek-text";
      text.textContent = original;
      dummy = document.createElement("span");
      dummy.className = "fx-peek-dummy";
      dummy.setAttribute("aria-hidden", "true");
      dummy.textContent = original;
      title.replaceChildren(text, dummy);
    }
    const word = options.text || "";
    const iterations = +options.iterations || 4, fps = +options.fps || 60;
    let stopShuffle = null;
    const shuffle = () => {
      if (!dummy || reduce || typeof window.shuffleLetters !== "function") return;
      stopShuffle?.();
      stopShuffle = window.shuffleLetters(dummy, { text: word || original, iterations, fps, onComplete: () => { dummy.textContent = original; } });
    };
    const reset = () => { stopShuffle?.(); stopShuffle = null; if (dummy) dummy.textContent = original; };
    const on = () => { el.classList.add("is-peek"); shuffle(); };
    const off = () => { el.classList.remove("is-peek"); reset(); };
    if (hover) { el.addEventListener("mouseenter", on); el.addEventListener("mouseleave", off); }
    el.addEventListener("focusin", on); el.addEventListener("focusout", off);
    const margin = options.margin || "-150px";
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { el.classList.add("is-view"); shuffle(); }
      else { el.classList.remove("is-view"); reset(); }
    }), { rootMargin: margin });
    io.observe(el);
    return () => {
      io.disconnect(); reset();
      el.removeEventListener("mouseenter", on); el.removeEventListener("mouseleave", off);
      el.removeEventListener("focusin", on); el.removeEventListener("focusout", off);
      el.classList.remove("is-peek", "is-view");
      if (title && text && title.contains(text)) title.textContent = original;
    };
  });
})();
