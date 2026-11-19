// Common to all pages: draws in the header, phone pill, opening-hours footer and loading curtain, and hooks up header hiding, pill pushing, letter-roll hover, calendar flip and phone menu.
// Original values: curve cubic-bezier(.19,1,.22,1) 1s · hover state released after 600ms · header hides up to 120px (85 on phone) · calendar cell 44rem (phone 35.5rem).
(() => {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  const page = document.body.dataset.page || "home";
  // Pages like Careers that need no clinic info keep only the map and copyright, with no phone pill or hours block, as in the original
  const brief = document.body.hasAttribute("data-brief");
  const isSP = () => innerWidth < 768;
  const rpx = (v) => (v * innerWidth) / (isSP() ? 375 : 1440);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = "ontouchstart" in document;
  const HD = (window.HD = { rpx, isSP, reduced, lenis: null });
  document.documentElement.classList.add("is-vw");

  // Placeholder symbol redrawn in the same two colors instead of the original logo
  const mark = '<svg class="hd-mark" viewBox="0 0 100 100" aria-hidden="true"><circle cx="40" cy="40" r="27" fill="var(--kf-accent)"/><circle cx="60" cy="60" r="27" fill="var(--site-sky)" style="mix-blend-mode:multiply"/><circle cx="77" cy="22" r="9" fill="var(--site-sky)"/><circle cx="23" cy="78" r="9" fill="var(--kf-accent)"/></svg>';
  const clock = '<svg viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="7.5"/><path d="M11 6.5V11l3 2"/></svg>';
  const car = '<svg viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 15V10l2-4.5h10L18 10v5z"/><path d="M4 10h14M5.5 15v2M16.5 15v2"/><circle cx="7.5" cy="12.5" r=".6" fill="currentColor"/><circle cx="14.5" cy="12.5" r=".6" fill="currentColor"/></svg>';
  const roll = (t) => `<span class="hd-roll__t"><span>${t}</span></span>`;
  const ar = (dir = "") => `<i class="hd-ar${dir ? " hd-ar--" + dir : ""}"></i>`;
  const tel = (cls = "") => `<div class="hd-tel ${cls}"><div class="hd-tel__lb">Contact phone</div><a class="hd-tel__no" href="#">000-000-<ruby data-ruby="Here">00<rt>Here</rt></ruby><ruby data-ruby="Reading">00<rt>Reading</rt></ruby></a></div>`;
  HD.icons = { mark, roll, ar };

  const nav = [
    ["home", "index.html", "First", true],
    ["about", "about.html", "Clinic About"],
    ["flow", "index.html#flow", "Treatment Flow"],
    ["services", "index.html#services", "Treatment Details"],
    ["news", "news.html", "News"],
    ["diabetes", "index.html#diabetes", "Illness Stories"],
    ["faq", "#", "Frequently asked questions"],
  ];
  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("hd-head");
    const logo = (cls) => `<a class="hd-logo ${cls}" href="index.html" aria-label="Back to start">${mark}<span><span class="hd-logo__name">Your clinic name here</span><span class="hd-logo__en">Clinic Name Here</span></span></a>`;
    head.innerHTML = `
      ${logo("")}
      <div class="hd-head__wrap" data-lenis-prevent>
        <div class="hd-head__in">
          ${logo("hd-splogo")}
          <nav class="hd-nav" aria-label="Main menu">
            ${nav.map(([k, href, t, top]) => `<div class="hd-nav__item${top ? " hd-nav__item--top" : ""}${k === page ? " is-current" : ""}"><a class="hd-nav__link hd-roll" href="${href}">${roll(t)}</a></div>`).join("")}
          </nav>
          <nav class="hd-links"><a class="hd-links__btn hd-roll" href="recruit.html">${roll("Hiring Info")}</a><a class="hd-links__btn hd-roll" href="#">${roll("Recruitment guide")}</a></nav>
          <p class="hd-cert">Your specialist qualification line here<br>Your specialist qualification line here</p>
        </div>
      </div>
      <button class="hd-toggle" type="button" aria-label="Menu"><span>MENU</span></button>`;
    if (!brief) head.insertAdjacentHTML(
      "afterend",
      `<div class="hd-float" data-slot="floater">
        <div class="hd-float__nav">
          <a class="hd-float__btn hd-roll" href="#hours"><span class="hd-float__ic">${clock}</span><span class="hd-float__lb">${roll("Consultation Hours")}</span></a>
          <a class="hd-float__btn hd-roll" href="#access"><span class="hd-float__ic">${car}</span><span class="hd-float__lb">${roll("Directions")}</span></a>
        </div>
        <div class="hd-float__tel">${tel()}</div>
      </div>`
    );
  }

  const DAYS = ["Day", "Month", "Fire", "Number", "Neck", "Gold", "Earth"];
  // Schedule slot: x=Closed days, otherwise lines of contact names (2–5 lines as in the original, with superscript marks)
  const AM = ["x", "Name 1<br>Name 2", "Name 1<br>Name 3<br>Name 4", "Name 1<br>Name 3<br>Name 5<sup>(※1)</sup><br>Name 6<sup>(※2)</sup><br>Name 7<sup>(※3)</sup>", "x", "Name 1<br>Name 8<br>Name 9<sup>(※A)</sup>", "Name 1<br>Name 10<br>Name 2<sup>(※5)</sup>"];
  const PM = ["x", "Name 1<br>Name 2", "Name 1<br>Name 3<br>Name 4", "Name 1<br>Name 3<br>Name 5(-16:30)<sup>(※1)</sup><br>Name 6<sup>(※2)</sup><br>Name 7<sup>(※3)</sup>", "x", "Name 1<br>Name 8<br>Name 9<sup>(※2)</sup>", "x"];
  const cell = (v) => (v === "x" ? '<i class="hd-x">Clinic closed</i>' : v);

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("hd-foot");
    foot.innerHTML = `
      ${brief ? "" : `<div class="hd-oper" id="hours" data-slot="hours">
        <div class="hd-sechead"><h2 class="hd-sechead__t">Consultation Hours</h2><div class="hd-sechead__l">Hours of Operation</div></div>
        <div class="hd-hours">
          <div class="hd-hours__main">
            <div class="hd-hours__table">
              <div class="hd-hours__week">${DAYS.map((d) => `<span>${d}</span>`).join("")}</div>
              <div class="hd-hours__row"><div class="hd-hours__hour">9:00-12:30<small>Saturday: 9:00~13:00</small></div>${AM.map((v) => `<div class="hd-hours__cell">${cell(v)}</div>`).join("")}</div>
              <div class="hd-hours__row"><div class="hd-hours__hour">14:00-18:00</div>${PM.map((v) => `<div class="hd-hours__cell">${cell(v)}</div>`).join("")}</div>
            </div>
            <div class="hd-hours__sp">
              <div class="hd-hours__sph"><div>9:00-12:30<small>Saturday: 9:00~13:00</small></div><div>14:00-18:00</div></div>
              ${DAYS.map((d, i) => `<div class="hd-hours__spr"><b>${d}</b><div>${cell(AM[i])}</div><div>${cell(PM[i])}</div></div>`).join("")}
            </div>
          </div>
          <div class="hd-hours__legend"><i class="hd-x"></i>: Closed (one line for closed days here)</div>
          <div class="hd-hours__note">(※1) First week<br>(※2) Second · fourth week<br>(※3) Third and fifth weeks<br>(※4) First · third week<br>(※5) Second week, irregular<br>(※A) Seen by another department</div>
        </div>
        <ul class="hd-hours__desc hd-dots">
          <li>Your booking note here in one line. First-time visitors, please call to inquire.</li>
          <li>Your notice for walk-ins goes here, two lines. Patients with appointments are seen first, so you may have to wait,<br class="pc">Depending on the situation, a different doctor may see you.</li>
          <li>Your one-line note on morning and afternoon entry times here.</li>
          <li>Here goes the notice of the last reception time (weekdays 00:00, Saturdays 00:00). After this time, it is hard to accept that day’s examination.</li>
          <li>Your one line here noting that counseling and tests are by appointment only.</li>
        </ul>
        <div class="hd-cal" data-pos="0" data-slot="calendar">
          <h3 class="hd-cal__t">Appointment Calendar</h3>
          <div class="hd-cal__legend">
            <div><i class="hd-st hd-st--open"></i>: Regular checkups</div>
            <div><i class="hd-st hd-st--am"></i>: Morning appointments only</div>
            <div><i class="hd-st hd-st--pm"></i>: Afternoon appointments only</div>
            <div><i class="hd-st hd-st--close"></i>: Closed</div>
          </div>
          <div class="hd-cal__main">
            <button class="hd-cal__btn hd-sq is-prev" type="button" aria-label="Previous month">${ar("l")}</button>
            <button class="hd-cal__btn hd-sq is-next" type="button" aria-label="Next month">${ar()}</button>
            <div class="hd-cal__vp"><div class="hd-cal__track"></div></div>
          </div>
        </div>
      </div>`}
      <div class="hd-map" id="access" data-slot="map">
        <div class="hd-map__in">
          <svg viewBox="0 0 700 520" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <rect width="700" height="520" style="fill: var(--site-gray-pale)"/>
            <g style="stroke: var(--kf-surface)" stroke-width="14" fill="none"><path d="M0 120h700M0 300h700M0 440h700M140 0v520M330 0v520M520 0v520M0 40 700 230"/></g>
            <g style="stroke: var(--kf-surface)" stroke-width="5" fill="none"><path d="M0 200h700M0 370h700M60 0v520M240 0v520M420 0v520M620 0v520"/></g>
            <path d="M0 330 C180 320 300 360 700 350" style="stroke: var(--site-gray)" stroke-width="10" fill="none"/>
            <path d="M0 330 C180 320 300 360 700 350" style="stroke: var(--kf-surface)" stroke-width="3" stroke-dasharray="14 10" fill="none"/>
            <rect x="250" y="320" width="150" height="70" rx="4" style="fill: var(--site-gray-soft)"/>
            <path d="M345 268c-11 0-19 8-19 19 0 14 19 33 19 33s19-19 19-33c0-11-8-19-19-19z" style="fill: var(--kf-ink)"/><circle cx="345" cy="287" r="6" style="fill: var(--kf-surface)"/>
          </svg>
          <div class="hd-map__card"><b>Your clinic name here</b>Your one-line address here<br><i>Open in map</i></div>
        </div>
      </div>
      <div class="hd-colo" data-slot="colophon">
        <div class="hd-colo__main">
          <div class="hd-colo__logo">${mark}<div class="hd-colo__name">Here<br>Clinic<br>Name</div><div class="hd-colo__en">Clinic Name Here</div></div>
          <div class="hd-colo__pdf"><a class="hd-box hd-roll" href="#">${roll("Clinic guide (PDF)")}${ar("d")}</a><p>Your one line here saying guide materials are provided as a PDF.<br>Your use-case one-liner here.</p></div>
          ${tel("hd-colo__tel")}
        </div>
        <p class="hd-colo__cert">Your specialist qualification line here<br>Your specialist qualification line here</p>
        <div class="hd-colo__access">
          <p>Postal code 000-0000<br>Your address in two lines here<br>Add it here (0 min walk from the station)</p>
          <p><em>By Train</em><br>Your directions from the station go here, about five lines. Say which exit to take, which bridge to cross, and which floor of which building to head to.</p>
          <p><em>Arriving by Bus</em><br>Your directions from the stop go here in about three lines. Say which way to walk after getting off and which road to turn onto.</p>
        </div>
        <small class="hd-colo__copy">©<span data-year>0000</span> Clinic Name Here. All rights reserved.</small>
        <a class="hd-colo__top hd-sq" href="#" aria-label="Back to top">${ar("u")}</a>
      </div>`;
    foot.querySelector("[data-year]").textContent = new Date().getFullYear();
  }

  // Four-month calendar — closed Sun·Thu, Sat mornings only, some days carry a note (small text under the date, like the original)
  const track = document.querySelector(".hd-cal__track");
  if (track) {
    const now = new Date();
    for (let k = 0; k < 4; k++) {
      const first = new Date(now.getFullYear(), now.getMonth() + k, 1);
      const y = first.getFullYear(), m = first.getMonth();
      const last = new Date(y, m + 1, 0).getDate();
      let days = "";
      for (let d = 1; d <= last; d++) {
        const w = new Date(y, m, d).getDay();
        let st = w === 0 || w === 4 ? "close" : w === 6 ? "am" : "open";
        let note = "";
        if (d === 10 + k) { st = "am"; note = "Your Note Here"; }
        if (d === 23 - k && w !== 0) { st = "pm"; note = "Your Note Here"; }
        days += `<div class="hd-cal__date"${d === 1 ? ` style="margin-left:${(first.getDay() * 100) / 7}%"` : ""}><b>${d}</b><i class="hd-st hd-st--${st}"></i>${note ? `<em>${note}</em>` : ""}</div>`;
      }
      track.insertAdjacentHTML("beforeend", `<div class="hd-cal__month"><h4 class="hd-cal__mt">${y}Year ${m + 1}Month</h4><div class="hd-cal__week">${DAYS.map((d) => `<span>${d}</span>`).join("")}</div><div class="hd-cal__days">${days}</div></div>`);
    }
    const cal = track.closest(".hd-cal");
    let pos = 0;
    const max = () => (isSP() ? 3 : 2);
    const set = (p) => {
      pos = Math.max(0, Math.min(max(), p));
      cal.dataset.pos = pos;
      cal.classList.toggle("is-end", pos === max());
      track.style.transform = `translateX(${-pos * (isSP() ? 35.5 : 44)}rem)`;
    };
    cal.querySelector(".is-prev").addEventListener("click", () => set(pos - 1));
    cal.querySelector(".is-next").addEventListener("click", () => set(pos + 1));
    addEventListener("resize", () => set(0));
    let sx = null;
    cal.addEventListener("touchstart", (e) => (sx = e.changedTouches[0].pageX), { passive: true });
    cal.addEventListener("touchend", (e) => {
      if (sx === null) return;
      const dx = sx - e.changedTouches[0].pageX;
      if (Math.abs(dx) > 30) set(pos + (dx > 0 ? 1 : -1));
      sx = null;
    });
    set(0);
  }

  // Hover: on enter, a copy of the text is attached and rolled for 1s, and the state is released at 600ms (original hoverRoll + one-time hover).
  // It is released before the roll finishes, so letters snap back into place, and the copy is detached only when the roll went all the way — as in the original
  const HOVER = ".hd-roll, .hd-box, .hd-tline, .hd-sq, .hd-pagehead__link, [data-hover]";
  HD.bindHover = (root = document) => {
    if (isTouch) return;
    root.querySelectorAll(HOVER).forEach((el) => {
      if (el.dataset.hoverBound) return;
      el.dataset.hoverBound = "1";
      const rolls = el.classList.contains("hd-roll") ? [...el.querySelectorAll(".hd-roll__t")].map((t) => ({ t, copy: t.firstElementChild.cloneNode(true) })) : [];
      rolls.forEach(({ t }) => t.firstElementChild.addEventListener("animationend", (e) => {
        if (e.animationName === "hdRoll") rolls.forEach((r) => r.copy.remove());
      }));
      let timer = null;
      el.addEventListener("mouseenter", () => {
        if (!el.classList.contains("is-hover")) rolls.forEach((r) => r.t.appendChild(r.copy));
        if (el.classList.contains("is-hover") || el.classList.contains("is-quiet")) return;
        clearTimeout(timer);
        requestAnimationFrame(() => requestAnimationFrame(() => {
          timer = setTimeout(() => { el.classList.remove("is-hover"); timer = null; }, 600);
          el.classList.add("is-hover");
        }));
      });
    });
  };
  HD.bindHover();

  // Same Lenis 1.3.25 and settings as the original (own rAF · lerp 1 · duration 1.5) — only # links are sent to Lenis
  const lenis = (HD.lenis = new Lenis({ autoRaf: true, smoothTouch: true, lerp: 1, duration: 1.5 }));
  lenis.on("scroll", ScrollTrigger.update);
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    e.preventDefault();
    const href = a.getAttribute("href");
    if (head) head.classList.remove("is-open");
    lenis.scrollTo(href.length === 1 ? 0 : href, { offset: 1 });
  });

  // The header hides upward by as much as you scroll down (max 120px, phone 85) and returns by the same amount when scrolling up. The pill is pushed down by that amount once the footer touches the bottom
  const toggle = head && head.querySelector(".hd-toggle");
  const floater = document.querySelector(".hd-float");
  let lastY = 0, hide = 0;
  const onScroll = () => {
    const a = isSP() ? 85 : 120;
    const y = lenis.actualScroll ?? scrollY;
    hide = Math.min(rpx(a), Math.max(0, hide + (y - lastY)));
    lastY = y;
    HD.hide = hide;
    if (head) head.style.transform = `translateY(${-hide}px)`;
    if (foot && floater) {
      const ft = foot.getBoundingClientRect().top;
      const push = Math.min(rpx(a), Math.max(0, a - (ft - innerHeight)));
      floater.style.transform = `translateY(${push}px)`;
      if (toggle) toggle.style.transform = `translateY(${push}px)`;
    }
  };
  lenis.on("scroll", onScroll);
  addEventListener("scroll", onScroll, { passive: true });
  if (toggle) toggle.addEventListener("click", () => head.classList.toggle("is-open"));

  // Loading screen: lifts once fonts and images are all in and at least 250ms have passed (waits for fonts for up to 3s only)
  const fonts = Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 3000))]);
  const loaded = new Promise((r) => (document.readyState === "complete" ? r() : addEventListener("load", r, { once: true })));
  Promise.all([fonts, loaded, new Promise((r) => setTimeout(r, 250))]).then(() => {
    document.body.classList.add("is-ready");
    ScrollTrigger.refresh();
    onScroll();
    dispatchEvent(new Event("hd:ready"));
  });
  addEventListener("pageshow", (e) => {
    if (!e.persisted) return;
    if (head) head.classList.remove("is-open");
    ScrollTrigger.refresh();
  });
})();
