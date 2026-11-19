// The four division rows share one type so they are drawn from one frame — it must run before shared.js so that when the schedule row (.iv) shows, it gets caught by the toggle
(() => {
  const UNITS = [
    ["UNIT ONE", "Division name 1", "An employee sitting across from a client, talking"],
    ["UNIT TWO", "Division name 2", "Employees sharing plans in front of a whiteboard"],
    ["UNIT THREE", "Division name 3", "Staff looking over design drafts together"],
    ["UNIT FOUR", "Division name 4", "Employee pointing at on-screen data"],
  ];
  const SCHEDULE = [
    ["09:00", "Commute", "One line on what happens in this session here", false],
    ["11:00", "External Meeting", "About two lines here on what happens in this time slot. A place to separate what to check from what to proceed with.", true],
    ["12:00", "Lunch", "Your one line about lunchtime here.", false],
    ["14:00", "Department meeting", "Your two lines here on what happens in this session. A time to share each other’s work.", true],
    ["16:00", "Create materials", "One line on what happens in this session here", false],
    ["18:00", "Leaving work", "Your one-line story to end the day", false],
  ];
  const list = document.querySelector("[data-units]");
  if (!list) return;
  list.innerHTML = UNITS.map(([en, ja, scene], u) => {
    const n = u + 1;
    return `
    <li class="sr-wlist__item" id="unit${n}">
      <div class="sr-wlist__head">
        <div class="sr-wlist__title"><span class="en" lang="en" data-label="Division English name — only the first letter in section color">${en}</span><span class="ja">${ja}</span></div>
        <div class="sr-wlist__mv"><div class="wf-img sr-ph" data-label="${scene} Scene · office · landscape 5:3"></div></div>
        <span class="sr-wlist__arrow"></span>
      </div>
      <div class="sr-wlist__content">
        <nav class="sr-wlist__side">
          <a href="#about_${n}" class="sr-wlist__point is-active">${ja} About</a>
          <a href="#works_${n}" class="sr-wlist__point">What we do</a>
          <a href="#schedule_${n}" class="sr-wlist__point">Daily schedule</a>
        </nav>
        <div class="sr-wlist__section">
          <div class="sr-wlist__lead" id="about_${n}">
            <p class="title">${ja}</p>
            <p class="text">Put text here introducing what this division handles. In about three lines, describe noticing the client’s problems and carrying through from proposal to execution. Add one more line on how it connects with the other divisions it works with.</p>
            <div class="sr-wlist__lead-image"><div class="wf-img sr-ph" data-label="${scene} Wide scene · window daylight · full-width 2:1"></div></div>
          </div>
          <div class="sr-wlist__detail" id="works_${n}">
            <div class="sr-title02"><span class="en" lang="en" aria-hidden="true">WORKS</span><h2 class="ja-circle">What we do</h2></div>
            <ul class="sr-detail">
              <li class="sr-detail__item">
                <div class="sr-detail__desc"><p class="title">Your task name 1 here</p><p class="text">Your text of about three lines here on what this job is. The role gathers people, leads meetings and makes sure work flows smoothly. Schedule and budget are watched together.</p></div>
                <div class="sr-detail__image"><div class="wf-img sr-ph" data-label="Employee leading a meeting · office · nearly square"></div></div>
              </li>
              <li class="sr-detail__item">
                <div class="sr-detail__desc"><p class="title">Your task name 2 here</p><p class="text">Your three lines here on what this job is. It means meeting people inside and outside, checking the situation, and sharing what you learn.</p></div>
                <div class="sr-detail__image"><div class="wf-img sr-ph" data-label="Meeting around a table · angled from above · nearly square"></div></div>
              </li>
            </ul>
          </div>
          <div class="sr-sched" id="schedule_${n}">
            <h2 class="sr-sched__title">Daily schedule</h2>
            <ul class="sr-sched__list iv">
              ${SCHEDULE.map(([time, title, text, img]) => `
              <li class="sr-sched__item iv">
                <span class="time" lang="en">${time}</span>
                <div class="sr-sched__desc"><p class="title">${title}</p><p class="text">${text}</p></div>
                ${img ? '<div class="sr-sched__image"><div class="wf-img sr-ph" data-label="Work scene at that hour · landscape 3:2"></div></div>' : ""}
              </li>`).join("")}
            </ul>
          </div>
        </div>
      </div>
    </li>`;
  }).join("");

  const refresh = () => window.ScrollTrigger && gsap.delayedCall(0, () => ScrollTrigger.refresh());

  // Pressing a row header expands and collapses it (original: header is-active · next cell is-open)
  list.querySelectorAll(".sr-wlist__head").forEach((head) => {
    const content = head.nextElementSibling;
    head.addEventListener("click", () => {
      head.classList.toggle("is-active");
      content.classList.toggle("is-open");
      refresh();
    });
  });

  // Side contents — light the dot of the cell that enters the 20% band at screen center
  const points = list.querySelectorAll(".sr-wlist__point");
  const targets = [...points].map((p) => document.querySelector(p.getAttribute("href"))).filter(Boolean);
  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (!en.isIntersecting) return;
    const id = `#${en.target.id}`;
    points.forEach((p) => p.classList.toggle("is-active", p.getAttribute("href") === id));
  }), { rootMargin: "-40% 0px -40% 0px", threshold: 0 });
  targets.forEach((t) => io.observe(t));

  // If the URL has a spot like #unit2 or #works_3, that row is left expanded
  const openHash = () => {
    const t = location.hash && document.querySelector(location.hash);
    const item = t && t.closest(".sr-wlist__item");
    if (!item) return;
    const head = item.querySelector(".sr-wlist__head");
    if (!head.classList.contains("is-active")) { head.classList.add("is-active"); head.nextElementSibling.classList.add("is-open"); }
    refresh();
  };
  openHash();
  addEventListener("hashchange", openHash);
})();
