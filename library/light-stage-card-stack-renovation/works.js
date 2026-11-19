// Project list — attach the filter panel (pc), phone accordion, pressing a filter re-lays the list and turns it on at .5s
(() => {
  const { rpx, isPc } = window.rbSite;
  document.querySelectorAll(".rb-index").forEach((idx) => {
    const sub = idx.querySelector(".rb-index__sub-box"), main = idx.querySelector(".rb-index__main");
    if (!sub || !main) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      ScrollTrigger.create({ trigger: sub, start: () => "top top+=" + rpx(84), endTrigger: main, end: () => "top+=" + (main.offsetHeight - sub.offsetHeight) + " top+=" + rpx(84), pin: true });
    });
    const head = idx.querySelector(".rb-index__sub-head"), body = idx.querySelector(".rb-index__sub-body"), inner = idx.querySelector(".rb-index__sub-inner");
    head.addEventListener("click", () => {
      const open = !sub.classList.contains("is-open");
      sub.classList.toggle("is-open", open);
      body.style.height = (open ? inner.offsetHeight : 0) + "px";
    });
    const replay = () => {
      idx.classList.remove("is-show"); idx.classList.add("is-loading");
      if (rbSite.smoother) rbSite.smoother.scrollTo(idx, true, "top " + rpx(isPc() ? 84 : 55) + "px");
      setTimeout(() => { idx.classList.remove("is-loading"); idx.classList.add("is-show"); ScrollTrigger.refresh(); }, 300);
    };
    idx.querySelectorAll(".rb-filter").forEach((b) => b.addEventListener("click", () => { b.classList.toggle("is-current"); replay(); }));
    idx.querySelector(".rb-index__reset button")?.addEventListener("click", () => { idx.querySelectorAll(".rb-filter.is-current").forEach((b) => b.classList.remove("is-current")); replay(); });
  });
})();
