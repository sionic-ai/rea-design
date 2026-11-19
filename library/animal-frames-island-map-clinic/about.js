/* About — the top photo strip is infiniteslide v2 like the original (speed 40, left, doesn’t stop on hover) */
(() => {
  MK.view("about", {
    enter(c) {
      const $s = $(c).find(".slide-about-main");
      if (!$s.length || !$.fn.infiniteslide || MK.reduce) return;
      // infiniteslide measures width only after window load — entering via barba is already past it, so loaded is set in advance
      window.loaded = true;
      $s.infiniteslide({ speed: 40, responsive: true, pauseonhover: false, direction: "left" });
    },
  });
})();
