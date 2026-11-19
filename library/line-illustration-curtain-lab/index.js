// Hero sequence (original setTimeout as is, ms from load): loading image 1500 vanishes → 1600 Hero → 2000·2300 apricot overlay clears
// → 2300·2600 vertical text → 2500 working illustration → 2900 heart bounces out → 3700 copy → 4500 hearts jump twice each.
(() => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const key = $(".m-key");
  const off = $(".m-key__off"), on = $(".m-key__on");
  const heart = $(".m-key__copy .img svg");
  const kvs = $$(".m-key__off .kv");

  const steps = [
    [1500, () => $(".m-loading .img").classList.add("hide")],
    [1600, () => key.classList.add("show")],
    [2000, () => off.querySelector(".c").classList.add("hide")],
    [2300, () => off.querySelector(".text").classList.add("show")],
    [2300, () => on.querySelector(".c").classList.add("hide")],
    [2500, () => on.querySelector(".kv").classList.add("show")],
    [2600, () => on.querySelector(".text").classList.add("show")],
    [2900, () => heart.classList.add("show")],
    [3700, () => $$(".m-key__copy .main, .m-key__copy .sub").forEach((el) => el.classList.add("show"))],
    [4500, () => heart.classList.add("move")],
  ];

  // Three resting images: every 6s raise the next one up (pre), show it 1s later over 0.8s, and erase the lower one 4s after
  let slide = -1;
  const next = () => {
    const prev = kvs[slide];
    slide = (slide + 1) % kvs.length;
    const cur = kvs[slide];
    cur.classList.add("pre");
    prev?.classList.remove("pre");
    setTimeout(() => cur.classList.add("show"), 1000);
    if (prev) setTimeout(() => prev.classList.remove("show"), 4000);
  };

  addEventListener("load", () => {
    if (reduced) {
      steps.forEach(([, fn]) => fn());
      heart.classList.remove("move");
      kvs[0].classList.add("pre", "show");
      return;
    }
    steps.forEach(([ms, fn]) => setTimeout(fn, ms));
    setTimeout(() => { next(); setInterval(next, 6000); }, 500);
  });

  // Theme picture: when the picture top rises 300px (phone 100px) from the screen bottom the curtain lifts, and covers again when it goes back down
  const covers = $$(".m-theme .img .c");
  const sync = () => {
    const show = innerWidth <= 768 ? 100 : 300;
    covers.forEach((c) => c.classList.toggle("hide", reduced || c.getBoundingClientRect().top < innerHeight - show));
  };
  addEventListener("scroll", sync, { passive: true });
  addEventListener("resize", sync);
  sync();
})();
