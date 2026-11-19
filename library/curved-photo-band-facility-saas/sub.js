// Shared by sub pages — filling work cards and news rows, filter fold (.4s), feature card group
(() => {
  const CASES = [["Facility name (local park)", "Thousands of visitors within a month of opening. Changing membership management made facility operations run smoothly.", "#Public facilities · club activities", "1,001–3,000 people"], ["Personal gym name", "Booking and payment on one screen. One staff member runs multiple stores.", "#Personal Gym", "~100 people"], ["Pilates studio name", "Lesson booking rates are up and empty slots are down.", "#Yoga·Pilates", "101~300 people"], ["Soccer club name", "School member management is brought together in one place, making things easier for guardians.", "#Soccer and basketball classes", "301~500 people"], ["Dance academy name", "Automate monthly fee billing. Admin time dropped sharply.", "#Dance School", "101~300 people"], ["Cheer school name", "Everything from trial sign-up to enrollment is done online.", "#Gymnastics and fitness school", "~100 people"], ["Musical studio name", "See rehearsal schedules and attendance in one place.", "#Other wellness facilities", "~100 people"], ["Nonprofit organization name", "We moved local resident class reservations to digital.", "#Public facilities · club activities", "301~500 people"], ["Table Tennis Club Name", "Manages court reservations and memberships together.", "#Multi-sport club", "101~300 people"]];
  const ccard = ([t, d, tag, size]) => `<li class="hc-ccard"><a href="case.html"><span class="hc-ccard__img hc-ph"><span class="wf-img" data-label="${t} Site photo · landscape 4:3"></span></span><h3>${t}</h3><p>${d}</p><span class="hc-ccard__tag">${tag}</span><dl><div><dt>Member Size:</dt><dd>${size}</dd></div><div><dt>Challenge:</dt><dd>Work efficiency · Sales growth</dd></div></dl></a></li>`;
  document.querySelectorAll("[data-hc-cases-list]").forEach((ul) => { ul.innerHTML = Array.from({ length: +ul.dataset.hcCasesList || 9 }, (_, i) => CASES[i % CASES.length]).map(ccard).join(""); });

  const NEWS = [["2026.11.13", "Press Release", "Service name and company name, launching ‹facility operations × cloud camera video› integrated partnership for wellness·fitness facilities"], ["2026.10.28", "Press Release", "Bringing out character that documents can’t convey with ”AI × video”. Launching a fitness job site"], ["2026.09.15", "Press Release", "Make demanding client-handling records simpler with voice input. Get started with ”AI Voice Memo”"], ["2026.08.20", "Press Release", "Start syncing with a calendar service to manage reservations alongside staff schedules"], ["2026.08.01", "Update info", "Your one-line update news title goes here."], ["2026.07.22", "Press Release", "Launch ‹AI Manager›, an AI assistant that helps with member operations"], ["2026.07.10", "Press Release", "Adopted by a soccer school run by a pro league club, adoption rate up 40%"], ["2026.06.30", "Press Release", "We’re exhibiting at Expo 2026. Using data and AI to build the ‹Next Standard› in club management"], ["2026.06.12", "Update info", "Launching the 「Credit Card Renewal」 feature that automatically updates registered card info"], ["2026.05.28", "Update info", "Launching new feature ”Messenger Sync”"]];
  document.querySelectorAll("[data-hc-news-list]").forEach((ul) => {
    ul.innerHTML = NEWS.slice(0, +ul.dataset.hcNewsList || 10).map(([d, c, t]) => `<li class="hc-news-item"><a class="hc-news-item__link" href="news.html"><div class="hc-news-item__info"><time class="hc-news-item__date">${d}</time><span class="hc-news-item__tag">${c}</span></div><h3 class="hc-news-item__title">${t}</h3></a></li>`).join("");
  });

  // Filter fold — press the head to unfold it in .4s
  document.querySelectorAll("[data-hc-fold]").forEach((box) => {
    const head = box.querySelector("button"), body = box.querySelector(".hc-fold__body");
    head.addEventListener("click", () => {
      const open = !box.classList.contains("is-open");
      box.classList.toggle("is-open", open);
      head.setAttribute("aria-expanded", String(open));
      body.style.height = open ? `${body.scrollHeight}px` : "0px";
    });
  });
})();
