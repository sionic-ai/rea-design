// News list — as in the original, category tabs swap blocks (.3s float-up), and each block shows only 11 items, then opens 12 more at a time with ”Load more”.
(() => {
  const LABEL = { news: "News", progress: "Memorial project", event: "Event report" };
  const TITLES = ["Your one-line news title here — Donation notice", "Your notice for a one-day-only donation campaign on the event day goes here, running a little long, close to two lines.", "Your title announcing the goal reached and funding closed goes here", "Your title here: a thank-you gift was sent to donors", "Headline saying donations hit a new record here"];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const blocks = [...document.querySelectorAll(".kd-news-block")];
  blocks.forEach((b) => {
    const kinds = b.dataset.kinds.split(","), n = +b.dataset.n;
    let html = '<div class="kd-news-list">';
    for (let i = 0; i < n; i++) {
      const k = kinds[i % kinds.length], m = String(12 - (i % 12)).padStart(2, "0"), d = String(28 - (i * 3) % 27).padStart(2, "0");
      html += `<article class="kd-news-item"><a href="article.html"><time>${2026 - Math.floor(i / 6)}.${m}.${d}</time><span class="label">${LABEL[k]}</span><p class="txt">${TITLES[i % TITLES.length]}</p></a></article>`;
    }
    b.innerHTML = html + '</div><button class="kd-btn-small kd-btn-small--more" type="button">See more<i class="kd-ico kd-ico--plus"></i></button>';
    const items = [...b.querySelectorAll(".kd-news-item")], more = b.querySelector(".kd-btn-small--more");
    const hidden = items.slice(11);
    let shown = 0;
    if (items.length < 13) more.style.display = "none";
    more.addEventListener("click", () => {
      const as = [];
      for (let c = shown; c < shown + 12; c++) if (hidden[c]) { hidden[c].style.display = "block"; as.push(hidden[c].querySelector("a")); }
      gsap.to(as, { duration: reduce ? 0 : .1, opacity: 1 });
      shown += 12;
      if (shown >= hidden.length) more.style.display = "none";
    });
  });

  const btns = [...document.querySelectorAll(".kd-tabs__btn")];
  const show = (i) => {
    btns.forEach((b, j) => b.classList.toggle("is-show", i === j));
    blocks.forEach((b) => { b.style.display = "none"; });
    blocks[i].style.display = "block";
    gsap.fromTo(blocks[i], { opacity: 0 }, { duration: reduce ? 0 : .3, opacity: 1, ease: "none" });
  };
  btns.forEach((b, i) => b.addEventListener("click", () => show(i)));
  show(0);
})();
