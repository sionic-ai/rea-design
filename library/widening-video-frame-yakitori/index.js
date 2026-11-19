// First page: threshold class of the pinned video frame, second smoke joining, duplicating the shop guide photo row.
// Original values: thresholds 10·100·150·600px · curtain .7 when the ”second paragraph” reaches the screen bottom · curtain lifts when the footer reaches the screen bottom · smoke after 8.5s
(() => {
  const frame = document.querySelector(".hb-mvframe");
  const fill = document.querySelector("[data-fill]");
  const foot = document.querySelector("#footer");

  const update = () => {
    const s = scrollY;
    const h = innerHeight;
    const top = (el) => el.getBoundingClientRect().top + s;
    frame.classList.toggle("is-foot", s > top(foot) - h);
    frame.classList.toggle("s6", s > top(fill) - h);
    frame.classList.toggle("s5", s > 600);
    frame.classList.toggle("s3", s > 150);
    frame.classList.toggle("s2", s > 100);
    frame.classList.toggle("s1", s > 10);
  };
  addEventListener("scroll", update, { passive: true });
  update();

  if (!HB.reduced) setTimeout(() => document.querySelector(".hb-smoke__item--02").classList.add("is-move"), 8500);

  // The same 6 cards are appended once more so a translateY(-50%) cycle loops seamlessly
  const list = document.querySelector(".hb-info__list");
  [...list.children].forEach((li) => {
    const c = li.cloneNode(true);
    c.setAttribute("aria-hidden", "true");
    list.append(c);
  });
})();
