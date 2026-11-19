// About — two photo rows flow endlessly in opposite directions over 60s (original N()), and only on phones (480 and below) staff cards go one at a time with slick.
(() => {
  const { reduce } = window.kfJb;
  const r1 = document.getElementById("jb-gal1"), r2 = document.getElementById("jb-gal2");
  // As in the original, the top row appends one more set for 16 cards, the bottom row two more sets for 18
  [...r1.children].forEach((li) => r1.append(li.cloneNode(true)));
  const base = [...r2.children];
  [...base, ...base].forEach((li) => r2.append(li.cloneNode(true)));

  const sizes = () => {
    const q = (m) => matchMedia(m).matches;
    return q("(max-width: 480px)") ? [1256, 942] : q("(max-width: 880px)") ? [1584, 1188] : [1984, 1488];
  };
  if (!reduce) {
    const [a, b] = sizes();
    gsap.fromTo(r1, { x: 0 }, { duration: 60, ease: "none", x: -a, repeat: -1 });
    gsap.fromTo(r2, { x: -b }, { duration: 60, ease: "none", x: 0, repeat: -1 });
  }

  const $list = jQuery("#jb-stafflist");
  const num = document.querySelector(".jb-staff__num .from");
  let on = false;
  const slide = () => {
    const sp = matchMedia("(max-width: 480px)").matches;
    if (sp && !on) {
      $list.slick({ slidesToShow: 1, speed: reduce ? 0 : 400 });
      $list.on("beforeChange", (e, s, cur, next) => (num.textContent = next + 1));
      on = true;
    } else if (!sp && on) {
      $list.off("beforeChange").slick("unslick");
      on = false;
    }
  };
  slide();
  addEventListener("resize", slide);
})();
