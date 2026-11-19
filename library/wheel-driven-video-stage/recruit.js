// Careers first page — same jQuery and colorbox as the original top.js and number script:
// Pressing a video thumbnail opens the video in a colorbox window (wide screens 91.25% · phones 80%, height 16:9 of the width, curtain .7).
// When the number slot enters the screen it appears in .3s and counts up by 1 every 50ms (original start · end values like 55→110).
(() => {
  const $ = window.jQuery;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  $(() => {
    const sp = matchMedia("(max-width: 739px)").matches;
    const w = sp ? 0.8 : 0.9125;
    $(".k-rc-movie__link").colorbox({
      inline: true, href: "#rcMovie", width: w * 100 + "%", height: (innerWidth * w / 16 * 9) | 0, opacity: 0.7, speed: reduce ? 0 : 300,
      onComplete: () => $("#rcMovie video")[0]?.play().catch(() => {}),
      onCleanup: () => $("#rcMovie video")[0]?.pause(),
    });

    const $counters = $(".k-counter");
    const values = $counters.map((i, el) => +el.dataset.from).get();
    const run = () => {
      $counters.each(function (i) {
        const $c = $(this);
        if ($c.data("started") || $c.offset().top - $(window).height() >= $(window).scrollTop()) return;
        $c.data("started", true);
        const to = +this.dataset.to;
        if (reduce) { $c.text(to.toLocaleString()).css("opacity", 1); return; }
        $c.animate({ opacity: 1 }, 300);
        const id = setInterval(() => {
          if (values[i] < to) { values[i]++; $c.text(values[i].toLocaleString()); } else clearInterval(id);
        }, 50);
      });
    };
    $(window).on("scroll", run);
    run();
  });
})();
