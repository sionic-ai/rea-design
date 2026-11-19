// Brand first page — Hero scroll-down indicator, parallax on photos in the verb line (simpleParallax 4.2.1 · delay 1.5 · scale 1.2 · down), photo grid full-screen window (modaal 0.4.4)
(() => {
  const $ = window.jQuery, root = document.documentElement;
  const kv = document.querySelector(".hc-kv");
  const onScroll = () => root.classList.toggle("is-scroll", !!kv && scrollY > kv.offsetHeight);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (window.simpleParallax && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    new simpleParallax(document.getElementsByClassName("hc-par"), { delay: 1.5, scale: 1.2, orientation: "down" });
  }

  if ($ && $.fn.modaal) {
    $(".hc-gal__link").modaal({
      fullscreen: true,
      before_open: () => $("html").css("overflow-y", "hidden"),
      after_close: () => $("html").css("overflow-y", "scroll"),
    });
  }
})();
