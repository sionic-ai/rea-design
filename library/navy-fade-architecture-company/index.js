// Home page — the scene changes at each scroll position (same breakpoints as the original):
// After scrolling 15% of the screen the Hero panel disappears, and during About Us the pinned title and two text panels turn on in turn while the right photo lifts the black-and-white panel and changes.
// The fixed background fades over 2 seconds: navy 30% at Vision, 10% at Mission, white at Values. When the fourth Values item passes screen center, it switches to the second photo,
// Value photos scale 1 → 1.2x as they pass through their section. Once the closing section passes screen center, the header logo hides.
(() => {
  const $ = (s) => document.querySelector(s);
  const body = document.body;
  const main = $("#main"), header = $(".mb-hd"), bg = $("#bg"), about = $("#about"), ttl = $("#about_ttl");
  const box1 = $("#about_box01"), box2 = $("#about_box02"), en = ttl.querySelector(".mb-about__en");
  const vision = $("#vision"), mission = $("#mission"), value = $("#value"), point = $("#value_point"), vImg2 = $("#value_i2");
  const btm = $("#home_btm"), bgImg = $(".mb-bg__img");
  const items = [...document.querySelectorAll(".mb-bg__item")];
  const sp = [...document.querySelectorAll(".mb-about__spimg, .mb-about__sp2, .mb-about__sp3")];
  const top = (el) => el.getBoundingClientRect().top + scrollY;

  if (scrollY === 0) body.classList.add("is-top");

  // Phone loading — once all Hero image slots are counted, after .5s lift the curtain in .3s and start the Hero motion
  const loading = $(".mb-loading"), bar = $(".mb-loading__bar span");
  const finish = () => {
    if (bar) bar.style.width = "100%";
    setTimeout(() => {
      if (loading) loading.style.opacity = "0";
      setTimeout(() => { if (loading) loading.style.display = "none"; body.classList.add("is-loaded"); }, 300);
    }, 500);
  };
  if (document.readyState === "complete") finish(); else addEventListener("load", finish);

  const activate = (n) => items.forEach((it, i) => {
    if (i === n) { it.classList.add("is-active"); it.querySelector(".mb-fillwipe__fill").classList.add("is-active"); }
    else it.classList.remove("is-active");
  });
  let showTimer;
  const update = () => {
    const y = scrollY, h = innerHeight;
    const c = 0.15 * h, n = top(about) - 0.01 * h, p = top(box1) - h, u = top(box2) - h, w = top(vision) - h;
    const x = top(ttl) - 0.8 * h, vy = top(vision) - h, H = top(mission) - 0.8 * h, T = top(value) - 0.8 * h;
    main.classList.toggle("is-hide", y > c);
    if (y >= n) en.classList.add("is-active");
    if (y >= x) en.classList.add("is-activesp");
    clearTimeout(showTimer);
    if (y < n) ttl.classList.add("is-hide");
    else if (y < p) {
      showTimer = setTimeout(() => ttl.classList.remove("is-hide"), 300);
      box1.classList.remove("is-hide"); box2.classList.remove("is-hide"); activate(0);
    } else if (y < u) {
      ttl.classList.add("is-hide"); box1.classList.remove("is-hide"); box2.classList.remove("is-hide"); activate(1);
    } else if (y < w) {
      ttl.classList.add("is-hide"); box1.classList.add("is-hide"); box2.classList.remove("is-hide"); activate(2);
    } else {
      ttl.classList.add("is-hide"); box1.classList.add("is-hide"); box2.classList.add("is-hide");
    }
    ttl.classList.toggle("is-vhide", y >= vy);
    bgImg.classList.toggle("is-active", y > top(about) - 0.6 * h);
    if (y > top(sp[0]) - 0.6 * h) { sp[0].classList.add("is-active"); en.classList.add("is-activesp"); }
    if (y > top(sp[1]) - 0.8 * h) sp[1].classList.add("is-active");
    if (y > top(sp[2]) - 0.8 * h) sp[2].classList.add("is-active");
    const stage = y < vy ? 1 : y < H ? 2 : y < T ? 3 : 4;
    bg.classList.remove("is-bg1", "is-bg2", "is-bg3", "is-bg4");
    bg.classList.add(`is-bg${stage}`);
    vImg2.classList.toggle("is-active", y + 0.5 * h > top(point));
    const vt = top(value), from = vt - h, to = vt + value.offsetHeight;
    const k = Math.max(0, Math.min(1, (y - from) / (to - from)));
    document.querySelectorAll(".js-vimg").forEach((img) => (img.style.transform = `scale(${1 + 0.2 * k})`));
    header.classList.toggle("is-foot", y + 0.5 * h > top(btm));
  };
  addEventListener("scroll", update, { passive: true });
  addEventListener("load", update);
  update();
})();
