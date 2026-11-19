/* Home — original Swiper 5 settings as they are (how to join: 4s · 1.5→3.25 slides · gap 50 · autoHeight. Photo slide uses the part center-scale-carousel) 
   and weekly schedule paging (previous · today · next, hiding that button on the last week). Schedule cells are drawn with placeholder data. */
(() => {
  if (window.Swiper) {
    new Swiper(".gb-flow", {
      autoHeight: true,
      autoplay: { delay: 4000 },
      slidesPerView: 1.5,
      spaceBetween: 50,
      centeredSlides: true,
      navigation: { nextEl: ".gb-flow .swiper-button-next", prevEl: ".gb-flow .swiper-button-prev" },
      breakpoints: { 768: { slidesPerView: 3.25 } },
    });
  }

  // Weekly schedule — the original covers 8 weeks before and after (-8 to 8). The placeholder draws only 2 weeks either side
  const SPAN = 2;
  const REG = ["hokkaido", "tohoku", "kanto", "hokushinetsu", "chubu", "kansai", "chugoku", "shikoku", "kyushu"];
  const DOW = ["Day", "Month", "Fire", "Number", "Neck", "Gold", "Earth"];
  let seed = 4;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const weeks = document.querySelector(".gb-weeks");
  if (weeks) {
    const start = new Date(2026, 9, 26);
    let html = "";
    for (let w = -SPAN; w <= SPAN; w++) {
      html += `<div class="gb-week" data-week-index="${w}">`;
      for (let d = 0; d < 7; d++) {
        const day = new Date(start.getTime() + ((w + SPAN) * 7 + d) * 864e5);
        const n = d === 6 ? 0 : Math.floor(rnd() * 9);
        let chips = "";
        for (let k = 0; k < n; k++) {
          const reg = REG[Math.floor(rnd() * REG.length)];
          const hh = String(7 + Math.floor(rnd() * 13)).padStart(2, "0");
          const mm = rnd() < 0.5 ? "00" : "30";
          chips += `<div class="gb-chip"><a href="#schedule" style="--c: var(--site-${reg})"><b>Region ${REG.indexOf(reg) + 1}</b><span>${hh}:${mm}</span></a></div>`;
        }
        html += `<div class="gb-day"><div class="gb-day__date"><span class="gb-day__year">${day.getFullYear()}</span><span class="gb-day__num">${day.getMonth() + 1}</span><span class="gb-day__unit">Month</span><span class="gb-day__num">${day.getDate()}</span><span class="gb-day__unit">Day</span><span class="gb-day__dow">(${DOW[day.getDay()]})</span></div>${n ? `<div class="gb-day__list">${chips}</div>` : ""}</div>`;
      }
      html += "</div>";
    }
    weeks.innerHTML = html;

    let current = 0;
    const show = (i) => {
      weeks.querySelectorAll(".gb-week").forEach((el) => el.classList.toggle("is-current", +el.dataset.weekIndex === i));
      document.querySelectorAll('.gb-weeknav__btn[data-week="prev"]').forEach((b) => b.classList.toggle("is-hidden", i === -SPAN));
      document.querySelectorAll('.gb-weeknav__btn[data-week="next"]').forEach((b) => b.classList.toggle("is-hidden", i === SPAN));
    };
    document.querySelectorAll(".gb-weeknav__btn").forEach((b) =>
      b.addEventListener("click", () => {
        const a = b.dataset.week;
        if (a === "prev" && current > -SPAN) current--;
        else if (a === "next" && current < SPAN) current++;
        else if (a === "today") current = 0;
        show(current);
      }),
    );
    show(current);
  }
})();
