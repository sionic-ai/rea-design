// First page — entrance gate (once a day) and sticky position alignment.
// The original measures sticky top and padding to align the line under the section title with the top line of the center text (setStickyPos). The same formula is carried over.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── Entrance Door ──
  const KEY = "ky-visited";
  const DAY = 24 * 60 * 60 * 1000;
  const opening = document.querySelector(".hm-opening");
  const forced = new URLSearchParams(location.search).get("opening") === "true";
  // The original shows the entrance door only on first entry (none → none), and not when moving to home within the site (* → *)
  const visited = !forced && (window.kySite?.came || Date.now() - Number(localStorage.getItem(KEY) || 0) < DAY);
  // The original removes the door from the document after clearing it. Even while the door floats, the page behind isn’t scroll-locked (it is just a fixed cover)
  if (opening) {
    if (visited) opening.remove();
    else {
      // The original picks one of ten videos at random — the placeholder has one landscape and one portrait, so only the list is kept in the same shape
      const list = innerWidth <= 767 ? ["media/splash-sp.mp4"] : ["media/splash.mp4"];
      const video = opening.querySelector("video");
      video.src = list[Math.floor(Math.random() * list.length)];
      video.autoplay = true;
      video.play().catch(() => {});
      opening.addEventListener("click", () => {
        localStorage.setItem(KEY, String(Date.now()));
        gsap.to(opening, { opacity: 0, duration: reduce ? 0 : 0.5, onComplete: () => { video.pause(); opening.remove(); } });
      }, { once: true });
    }
  }

  // ── sticky slot ──
  const $ = (s) => document.querySelector(s);
  const px = (el) => parseFloat(getComputedStyle(el).top) || 0;
  const alignTitleText = (title, foot, texts) => {
    if (!title || !foot || !texts) return;
    title.style.paddingBottom = "";
    texts.style.top = "";
    const a = Math.round(px(title) + title.clientHeight - foot.clientHeight);
    texts.style.top = `calc(${a}px - 0.8rem)`;
    title.style.paddingBottom = `calc(${Math.round(texts.clientHeight - foot.clientHeight)}px - 0.8rem)`;
  };
  const setStickyPos = () => {
    const nodes = [$("[data-yard-ttl]"), $("[data-food-ttl]"), $("[data-stay-rttl]"), $("[data-stay-ttl]"), $("[data-yard-texts]"), $("[data-food-texts]"), $("[data-stay-texts]")];
    if (innerWidth <= 767) { nodes.forEach((n) => n && (n.style.paddingBottom = n.style.top = "")); return; }
    alignTitleText($("[data-yard-ttl]"), $("[data-yard-foot]"), $("[data-yard-texts]"));
    alignTitleText($("[data-food-ttl]"), $("[data-food-foot]"), $("[data-food-texts]"));
    const rTitle = $("[data-stay-rttl]"), sTexts = $("[data-stay-texts]"), sTitle = $("[data-stay-ttl]");
    if (rTitle && sTexts) {
      rTitle.style.paddingBottom = "";
      sTexts.style.top = "";
      const c = sTexts.clientHeight;
      sTexts.style.top = `calc(${Math.round(px(rTitle) + rTitle.clientHeight)}px + 3rem)`;
      rTitle.style.paddingBottom = `calc(${Math.round(c)}px + 3rem)`;
      if (sTitle) sTitle.style.paddingBottom = `calc(${Math.round(c)}px + 4.7vw)`;
    }
  };
  setStickyPos();
  document.fonts?.ready.then(setStickyPos);
  addEventListener("resize", setStickyPos);
})();
