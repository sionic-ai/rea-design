(() => {
  // Clicking a Work card link — the picture frame inside the card (data-fx-part="frame") moves the image to a screen-fixed panel and from there
  // Sent flying to the next page’s image position (--fx-to-top·--fx-to-left·--fx-to-width) in .5s cubic-bezier(.83,0,.17,1) (height keeps the frame ratio).
  // On press, fire fx:navigate on the element { href } fires it — the consumer blocks it (preventDefault) and hands over to swup or barba, so the panel stays floating over the transition and then
  // When fx:land arrives at the document it is cleared after hold ms. If nobody blocks it, it goes to that address after the flight ends
  const live = new Set();
  document.addEventListener("fx:land", () => live.forEach((c) => { setTimeout(() => c.remove(), c._hold); live.delete(c); }));
  kfFx.register("frame-fly-page", (el, { options, reduce }) => {
    const frame = el.querySelector('[data-fx-part="frame"]');
    if (!frame) return;
    const dur = reduce ? 0 : +(options.dur ?? 0.5), hold = +(options.hold ?? 200);
    const ease = options.ease ? (String(options.ease).includes(",") ? `cubic-bezier(${options.ease})` : options.ease) : "";
    const go = (e) => {
      if (e.defaultPrevented || e.button > 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      const r = frame.getBoundingClientRect();
      const clone = document.createElement("div");
      clone.className = "fx-ffp-clone";
      clone.setAttribute("aria-hidden", "true");
      // Variables like the frame background tone live in the link style — carried over as is
      const own = el.getAttribute("style");
      if (own) clone.setAttribute("style", own);
      Object.assign(clone.style, { top: `${r.top}px`, left: `${r.left}px`, width: `${r.width}px`, aspectRatio: `${r.width} / ${r.height}` });
      clone.style.setProperty("--fx-dur", `${dur}s`);
      if (ease) clone.style.setProperty("--fx-ease", ease);
      const art = frame.firstElementChild?.cloneNode(true);
      if (art) clone.append(art);
      clone._hold = hold;
      document.body.append(clone);
      live.add(clone);
      frame.style.opacity = "0";
      requestAnimationFrame(() => clone.classList.add("is-flying"));
      const href = el.getAttribute("href");
      const nav = new CustomEvent("fx:navigate", { bubbles: true, cancelable: true, detail: { href, clone } });
      if (el.dispatchEvent(nav) && href) setTimeout(() => (location.href = href), dur * 1000);
    };
    // When this page is revived from cache via Back, restore the emptied Frame
    const back = () => (frame.style.opacity = "");
    el.addEventListener("click", go);
    addEventListener("pageshow", back);
    return () => { el.removeEventListener("click", go); removeEventListener("pageshow", back); back(); };
  });
})();
