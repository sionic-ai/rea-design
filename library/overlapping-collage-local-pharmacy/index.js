// Home — store slick (centerMode, 3 cards) and vertical store names above, recruit strip flowing over 60s. Original values as is.
(() => {
  const { isPC, reduce } = window.kfJb;
  const $list = jQuery("#jb-shoplist");
  const items = $list.children(".jb-shop__item");
  const count = items.length;
  const names = items.map((i, el) => el.querySelector("dt").textContent).get();
  const before = document.querySelector(".jb-shop__names .is-before");
  const after = document.querySelector(".jb-shop__names .is-after");
  const li = (n, i) => `<li data-num="${i}"><p>${n}</p></li>`;
  before.innerHTML = names.map(li).join("");
  after.innerHTML = names.map(li).join("");
  document.querySelector(".jb-shop__num .to").textContent = count;

  // Top vertical text: left is the previous store, right is the next store
  const mark = (cur) => {
    before.querySelectorAll("li").forEach((el, i) => el.classList.toggle("is-active", i === (cur - 1 + count) % count));
    after.querySelectorAll("li").forEach((el, i) => el.classList.toggle("is-active", i === (cur + 1) % count));
    document.querySelector(".jb-shop__num .from").textContent = cur + 1;
  };
  $list.on("init", () => mark(0));
  $list.slick({ centerMode: true, centerPadding: "0px", slidesToShow: 3, speed: reduce ? 0 : 500, responsive: [{ breakpoint: 1120, settings: { slidesToShow: 1 } }] });
  $list.on("beforeChange", (e, s, cur, next) => mark(next));

  // The arrow is at the photo center, the white veil is one slide wide — original A()
  const place = () => {
    const ph = document.querySelector(".jb-shop .slick-current .jb-shop__ph");
    const w = document.querySelector(".jb-shop .slick-current")?.offsetWidth;
    if (!ph) return;
    document.querySelectorAll(".jb-shop__mask").forEach((m) => (m.style.width = w + "px"));
    document.querySelectorAll(".jb-shop .slick-arrow").forEach((a) => (a.style.top = ph.offsetHeight / 2 - a.offsetHeight / 2 + "px"));
  };
  place();
  addEventListener("load", place);
  addEventListener("resize", place);

  if (reduce) return;
  // Hiring strip — background moves sideways one tile (1747px, .512x on phone) per 60s, endlessly
  const strip = document.getElementById("jb-recruitphoto");
  const w = isPC() ? 1747 : matchMedia("(max-width: 480px)").matches ? 1747 * 0.512 : 1747 * 0.8;
  gsap.fromTo(strip, { backgroundPosition: "0px 0px" }, { duration: 60, ease: "none", backgroundPosition: `-${w}px 0px`, repeat: -1 });
})();
