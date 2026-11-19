// First page — today’s date and open-for-visits board, timetable, blog Swiper, treatment item rows
(() => {
  document.querySelectorAll("[data-hours]").forEach((el) => { el.outerHTML = window.shHours("is-news"); });

  // The original has the server insert today’s date and clinic and closed days — on a closed weekday (Wed, Sun) the cell turns coral
  const now = new Date(), dow = now.getDay();
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set("sh-y", now.getFullYear());
  set("sh-m", now.getMonth() + 1);
  set("sh-dd", now.getDate());
  set("sh-dow", "Sun Mon Tue Wed Thu Fri Sat"[dow] + "Day of week");
  const closed = dow === 0 || dow === 3;
  set("sh-st", closed ? "Clinic closed day" : "Appointment day");
  document.getElementById("sh-status")?.classList.toggle("is-close", closed);

  const blog = document.querySelector("[data-blog]");
  if (blog) {
    const shots = ["Marathon finish line · staff group · outdoors daytime", "Mascot at event booth · Outdoors", "Commemorative photo · Indoor reception desk", "Staff dinner · warm lighting", "Day new equipment arrived · Treatment room", "Seasonal decor · Waiting room", "Health class · Lecture room", "Local festival participation · Outdoor", "Volunteer work · park", "Opening celebration · In front of building"];
    blog.innerHTML = shots.map((s, i) => `<article class="sh-bl swiper-slide"><a href="article.html">
      <figure class="sh-bl__tn wf-img" data-label="${s} · Square"></figure>
      <div class="sh-bl__o"><p class="sh-bl__date">0000.00.${String(10 + i).slice(-2)}</p><p class="sh-cat">Category</p></div>
      <h3 class="sh-bl__ttl">Your post title $ here{i + 1}</h3></a></article>`).join("");
    new Swiper(".sh-blog__swiper", {
      slidesPerView: "auto",
      spaceBetween: 26,
      navigation: { nextEl: ".sh-blog__next", prevEl: ".sh-blog__prev" },
      breakpoints: { 768: { spaceBetween: 22 } },
    });
    document.querySelectorAll(".sh-blog__nav a").forEach((a) => a.addEventListener("click", (e) => e.preventDefault()));
  }

  const ct = document.querySelector("[data-ct]");
  if (ct) {
    ct.innerHTML = Array.from({ length: 9 }, (_, i) => `<li><a href="#"><div class="sh-ct__row">
      <div class="sh-ct__ic"><svg><use href="#sh-i-m${i + 1}"/></svg></div>
      <div class="sh-ct__txt"><p class="sh-ct__num">0${i + 1}. ITEM NAME</p><p class="sh-ct__ttl">Treatment item ${i + 1}<span>Secondary description</span>${window.shDot()}</p></div>
    </div></a></li>`).join("");
  }
})();
