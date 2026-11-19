/* Work detail — diagonal-opening hero photo, body Read more, video frame play indicator, URL copy, recent work strip (embla 8.6.0 + list card tilt and brackets) */
(() => {
  const TB = window.TB;
  if (!TB) return;

  TB.pages.detail = ({ scope }) => {
    const offs = [];
    const kv = scope.querySelector(".dt-kv__img");
    if (kv && TB.inview) offs.push(TB.inview([kv]));
    const text = scope.querySelector(".dt-text"), more = scope.querySelector(".dt-more");
    more?.addEventListener("click", () => { const o = !text.classList.contains("is-open"); text.classList.toggle("is-open", o); more.setAttribute("aria-expanded", o); more.textContent = o ? "Close −" : "Read more +"; });
    const v = scope.querySelector(".dt-video");
    v?.querySelector(".dt-video__play").addEventListener("click", () => v.classList.toggle("is-played"));
    const copy = scope.querySelector("[data-copy]");
    copy?.addEventListener("click", () => { navigator.clipboard?.writeText(location.href).catch(() => {}); copy.classList.add("is-copied"); setTimeout(() => copy.classList.remove("is-copied"), 1500); });
    const track = scope.querySelector(".dt-recent__track");
    if (track && TB.listCards) {
      offs.push(TB.listCards(track));
      const vp = scope.querySelector(".dt-recent__viewport");
      if (window.EmblaCarousel) { const em = EmblaCarousel(vp, { align: "start", dragFree: true, containScroll: "trimSnaps" }); offs.push(() => em.destroy()); }
    }
    return () => offs.forEach((f) => f && f());
  };
})();
