// News category filter: visible cards slide 14px down and vanish over .42s, then only the chosen cards rise with the same values.
(() => {
  const FADE_MS = 420;
  const tags = [...document.querySelectorAll(".nl-tag")];
  const cards = [...document.querySelectorAll(".nl .yk-card")];
  const empty = document.querySelector(".nl__empty");
  let busy = false;
  let active = "all";
  const apply = (tag) => {
    // Like the original, pressing a category again while filtering or already chosen does nothing
    if (busy || tag === active) return;
    active = tag;
    busy = true;
    tags.forEach((t) => t.classList.toggle("is-active", t.dataset.tag === tag));
    const want = (c) => tag === "all" || c.dataset.cat === tag;
    const visible = cards.filter((c) => !c.classList.contains("is-off"));
    visible.forEach((c) => c.classList.add("is-leave"));
    setTimeout(() => {
      cards.forEach((c) => {
        c.classList.remove("is-leave");
        c.classList.toggle("is-off", !want(c));
        if (want(c)) c.classList.add("is-prep");
      });
      empty.hidden = cards.some(want);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        cards.forEach((c) => c.classList.remove("is-prep"));
        ScrollTrigger.refresh();
        setTimeout(() => (busy = false), FADE_MS);
      }));
    }, YK.reduced ? 0 : FADE_MS);
  };
  tags.forEach((t) => t.addEventListener("click", () => apply(t.dataset.tag)));
})();
