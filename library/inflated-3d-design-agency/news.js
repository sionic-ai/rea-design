// Blog: after passing the large header a thin fixed bar comes down. The original blog has no separate card rising, they stand there from the start (measured first-screen change .18s).
(() => {
  document.querySelectorAll(".bg-logo__w, .bg-foot__logo").forEach((s) => (s.innerHTML = GP.logo("news.html")));
  const bar = document.querySelector(".bg-bar");
  const head = document.querySelector(".bg-head");
  const on = (y) => bar.classList.toggle("is-on", y > head.offsetHeight);
  GP.lenis ? GP.lenis.on("scroll", (l) => on(l.scroll)) : addEventListener("scroll", () => on(scrollY), { passive: true });
})();
