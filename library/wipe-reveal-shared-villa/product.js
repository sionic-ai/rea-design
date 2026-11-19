// Item list — regional photos (wipe fade · arrows · dots · 4s interval, pause button), tag filtering
(() => {
  const { wipe, reduce } = window.snSite;
  document.querySelectorAll(".sn-cat").forEach((cat) => {
    const el = cat.querySelector(".sn-cat__splide");
    const s = wipe(el, { pagination: true, arrows: true, interval: 4000 });
    if (!s) return;
    // During the 2.4s of switching, arrows and dots are blocked (original slide__waitting)
    s.on("move", () => { el.classList.add("is-waiting"); setTimeout(() => el.classList.remove("is-waiting"), 2400); });
    const ps = cat.querySelector(".sn-playstop");
    const label = ps.querySelector(".sn-playstop__text");
    if (reduce) { ps.classList.add("is-paused"); label.textContent = "PLAY"; }
    ps.addEventListener("click", () => {
      const paused = !ps.classList.contains("is-paused");
      ps.classList.toggle("is-paused", paused);
      label.textContent = paused ? "PLAY" : "STOP";
      const auto = s.Components.Autoplay;
      if (paused) auto.pause(); else auto.play();
    });
  });

  // Tag filter — keep only items with the chosen tags, hide regional sections that have none
  const btns = document.querySelectorAll(".sn-filter__btn");
  btns.forEach((b) => b.addEventListener("click", () => {
    btns.forEach((x) => x.classList.toggle("is-active", x === b));
    const tag = b.dataset.tag;
    document.querySelectorAll(".sn-cat").forEach((cat) => {
      let shown = 0;
      cat.querySelectorAll(".sn-hitem").forEach((it) => { const ok = !tag || it.dataset.tags.split("|").includes(tag); it.classList.toggle("is-hidden", !ok); shown += ok; });
      cat.classList.toggle("is-empty", !shown);
    });
    ScrollTrigger.refresh();
  }));
})();
