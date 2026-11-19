// News tabs: All · Event · Notice filtering, the original Load More is 8 items at a time (appearing at 80ms intervals)
(() => {
  const { $, $$, decorate } = window.MAUW;
  const tabs = $$(".tab");
  tabs.forEach((t, i) => t.addEventListener("click", () => {
    tabs.forEach((x) => x.setAttribute("aria-selected", String(x === t)));
    const want = ["", "Event", "Notice"][i];
    $$(".tp__wrap").forEach((w) => (w.hidden = !!want && w.querySelector(".lbl").textContent !== want));
  }));
  $(".loadmore").addEventListener("click", () => {
    const list = $(".tp");
    const add = $$(".tp__wrap", list).slice(0, 4).map((w) => w.cloneNode(true));
    add.forEach((w, k) => {
      list.append(w);
      gsap.fromTo(w, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, delay: k * 0.08, ease: "power2.out" });
    });
    decorate(list);
  });
})();
