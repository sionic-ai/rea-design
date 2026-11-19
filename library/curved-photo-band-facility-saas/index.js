// Home page — fills the Hero strip cells (flow and bend live in the cylinder-tilt-strip part) and fades the center device screen Swiper (.8s, every two cells the strip advances),
// Industry panel (swaps with a .4s fade via up/down buttons and the list, two photo rows flow at the marquee part’s 30px per second), logo grid, result cards, case Swiper (1s transition every 2 seconds)
(() => {
  const reduce = HC.reduce;
  document.querySelectorAll("[data-hc-mark]").forEach((n) => n.insertAdjacentHTML("afterbegin", HC.ICO.mark));

  // ---------- Hero band ----------
  const MV = ["Youth soccer match · grass · daytime sunlight", "Person on Pilates equipment · bright studio", "Laptop admin screen · white desk", "Kids on basketball court · indoor", "People on yoga mats · natural light", "Pool lanes · From above", "Gym treadmill row · window light", "Dance studio in front of the mirror · indoor"];
  const mv = document.querySelector("[data-hc-mv]");
  if (mv) mv.innerHTML = MV.map((l) => `<div class="swiper-slide"><figure class="hc-mv__img" data-fx-part="item" data-label="${l} · Landscape 16:9"><span class="wf-img" data-label="${l} · Landscape 16:9"></span></figure></div>`).join("");
  const devices = new Swiper("[data-hc-devices]", { effect: "fade", fadeEffect: { crossFade: true }, slidesPerView: 1, loop: true, speed: reduce ? 0 : 800, allowTouchMove: false, autoplay: false });
  let steps = 0;
  document.querySelector(".hc-mv__strip")?.addEventListener("fx:step", () => { if (++steps % 2 === 0) devices.slideNext(); });

  // ---------- Industry panel ----------
  const TABS = ["Multi-Sport Club", "24-hour luggage", "Personal gym", "Yoga · Pilates", "Indoor Golf", "Gymnastics · Fitness School", "Dance School", "Soccer & basketball classes", "Language and study classes", "Public facilities", "Club activities", "Guesthouse (vacant house reuse)", "Other wellness facilities"];
  const ROW1 = ["Gymnastics · Fitness School", "Dance School", "Soccer & basketball classes", "Indoor Golf", "Yoga · Pilates"];
  const ROW2 = ["Other wellness facilities", "24-hour luggage", "Personal gym", "Public facilities", "Multi-Sport Club"];
  const tile = (t) => `<div class="hc-use__tile"><span class="hc-use__photo hc-ph"><span class="wf-img" data-label="${t} On-site photo · indoor · landscape 3:2"></span></span><p>${t}</p></div>`;
  const content = document.querySelector("[data-hc-use-content]");
  const tabs = document.querySelector("[data-hc-use-tabs]");
  if (content && tabs) {
    content.innerHTML = `<div class="hc-use__pane is-on"><div class="hc-use__rows">
        <div class="hc-use__row" data-fx="marquee" data-fx-marquee="rate: 30; gap: 30; pause: none">${ROW1.map(tile).join("")}</div>
        <div class="hc-use__row" data-fx="marquee" data-fx-marquee="rate: 30; gap: 30; pause: none; dir: right">${ROW2.map(tile).join("")}</div>
      </div></div>` +
      TABS.map((t) => `<div class="hc-use__pane"><div class="hc-use__card">
        <div class="hc-use__card-head"><span class="hc-use__card-img hc-ph"><span class="wf-img" data-label="${t} Lead photo · interior · landscape 3:2"></span></span><h3>${t}</h3><p>Your text goes here, two lines, on how this industry operates. From booking and member management to payment, everything in one place keeps operations light.</p><a class="hc-btn" href="cases.html">View details</a></div>
        <ul class="hc-use__logos">${Array.from({ length: 6 }, (_, i) => `<li data-label="Client company logo ${i + 1}">LOGO</li>`).join("")}</ul>
      </div></div>`).join("");
    tabs.innerHTML = TABS.map((t, i) => `<li><button type="button" class="hc-use__tab" data-i="${i + 1}">${t}${i === 12 ? "<small>Sauna · Beauty salon · Coworking, etc.</small>" : ""}</button></li>`).join("");
    const panes = [...content.querySelectorAll(".hc-use__pane")];
    const btns = [...tabs.querySelectorAll(".hc-use__tab")];
    const up = document.querySelector(".hc-use__step.is-up"), down = document.querySelector(".hc-use__step.is-down");
    let cur = 0;
    const paint = () => {
      btns.forEach((b) => b.classList.toggle("is-current", +b.dataset.i === cur));
      up.classList.toggle("is-off", cur <= 0);
      down.classList.toggle("is-off", cur >= panes.length - 1);
    };
    // Original — fades the current board to transparent in .4s and hides it, and only then changes the order, list display and button state, then the next board goes 0 → 1 in .4s
    const go = (next) => {
      if (next === cur || next < 0 || next >= panes.length) return;
      const from = panes[cur];
      gsap.to(from, { duration: reduce ? 0 : 0.4, opacity: 0, onComplete: () => {
        from.classList.remove("is-on");
        cur = next;
        const to = panes[cur];
        to.classList.add("is-on");
        gsap.fromTo(to, { opacity: 0 }, { duration: reduce ? 0 : 0.4, opacity: 1 });
        paint();
      } });
    };
    btns.forEach((b) => b.addEventListener("click", () => go(+b.dataset.i)));
    up.addEventListener("click", () => go(cur - 1));
    down.addEventListener("click", () => go(cur + 1));
    // Phone — a separate row of square photos on top (2.37 cells · 30px per second) flows, and the panel starts from the first industry card (original spSlider · tab 1)
    if (matchMedia("(max-width: 767px)").matches) {
      document.querySelector(".hc-use__body").insertAdjacentHTML("beforebegin", `<div class="hc-use__sprow" data-fx="marquee" data-fx-marquee="rate: 30; gap: 10; pause: none">${[...ROW1, ...ROW2].map((t) => `<span class="hc-use__sq hc-ph"><span class="wf-img" data-label="${t} Site photo · square"></span></span>`).join("")}</div>`);
      panes[0].classList.remove("is-on");
      panes[1].classList.add("is-on");
      cur = 1;
    }
    paint();
  }

  // ---------- Logo grid ----------
  const CATS = ["Multi-Sport Club", "24-hour luggage", "Personal gym", "Yoga · Pilates", "Golf · Indoor Golf", "Exercise school", "Public Facilities · Club Activities", "Other wellness facilities"];
  const logos = document.querySelector("[data-hc-logos]");
  if (logos) logos.innerHTML = CATS.map((c) => `<div class="hc-logos__col"><p>${c}</p><ul>${Array.from({ length: 4 }, (_, i) => `<li data-label="${c} Client company logo ${i + 1}">LOGO</li>`).join("")}</ul></div>`).join("");
  const more = document.querySelector(".hc-logos__more");
  more?.addEventListener("click", () => { document.querySelector(".hc-logos").classList.toggle("is-open"); });

  // ---------- Result cards ----------
  const ICON = {
    people: '<path d="M14 26a6 6 0 1 1 0-.1zM6 46c0-8 4-12 8-12s8 4 8 12M34 22a6 6 0 1 1 0-.1zM26 46c0-8 4-12 8-12s8 4 8 12M54 26a6 6 0 1 1 0-.1zM46 46c0-8 4-12 8-12s8 4 8 12"/>',
    door: '<path d="M16 6h32v52H16zM16 6l18 6v50l-18-4M28 34h2"/>',
    leaf: '<path d="M18 10l14 8v34l-14-8zM46 10l-14 8v34l14-8z"/>',
    clock: '<circle cx="32" cy="32" r="22"/><path d="M32 18v14l10 6"/>',
    money: '<rect x="8" y="18" width="48" height="28" rx="3"/><circle cx="32" cy="32" r="7"/><path d="M12 50h44"/>',
    list: '<rect x="14" y="10" width="36" height="46" rx="3"/><path d="M22 22h20M22 32h20M22 42h12M44 48l4 4 8-8"/>',
  };
  const RES = [
    ["Member count", "+", "200", "Name", "people", "Guest self-service procedures cut workload by 40%. Flexible plans brought a 200-member increase."],
    ["Lesson participants", "", "7.5", "Ship", "door", "Praised for an easy-to-use interface and design. Daily online lesson participation rose about 7.5 times."],
    ["Experience Sign-up", "", "10", "Ship", "leaf", "Digitizing reservations grew monthly users tenfold. Studio and personal usage rates also rose sharply."],
    ["Membership Process", "40 min →", "2", "Minute", "clock", "Moving the enrollment process online cut a 40-minute procedure to 2 minutes. Pre-opening customer recruitment succeeded too."],
    ["Employee Salary", "", "20", "%up", "money", "Introducing a My Page removed front-desk work, and the remaining labor cost went to staff pay, which also raised satisfaction."],
    ["Office work hours", "", "40", "Hours/month", "list", "Membership sign-up time cut to a third or less. Fewer inquiries to handle also let us prevent monthly cancellations."],
  ];
  const res = document.querySelector("[data-hc-results]");
  if (res) res.innerHTML = RES.map(([t, pre, n, u, ic, d]) => `<li class="hc-res__card"><h3>${t}</h3><div class="hc-res__row"><p class="hc-res__num">${pre ? `<span class="hc-res__pre">${pre}</span>` : ""}<b class="hc-num">${n}</b><span>${u}</span></p><svg viewBox="0 0 64 64" aria-hidden="true">${ICON[ic]}</svg></div><p class="hc-res__desc">${d}</p></li>`).join("");

  // ---------- Case Swiper ----------
  const CASES = [["Soccer club name", "Brought club school membership management together in one place to make life easier for guardians.", "#Soccer and basketball classes"], ["Coworking office name", "Introduced as a shared office operating system for investment targets.", "#Sauna · Spa · Coworking"], ["Basketball club name", "Moved payment operations to the web and fully automated billing. Membership grew too.", "#Soccer and basketball classes"], ["Personal gym name", "Booking and payment on one screen. One staff member runs multiple stores.", "#Personal Gym"], ["Sports Club Name", "Moving the sign-up process online removed the wait at the counter.", "#Multi-sport club"], ["Pilates studio name", "Lesson booking rates are up and empty slots are down.", "#Yoga·Pilates"]];
  const cases = document.querySelector("[data-hc-cases]");
  if (cases) cases.innerHTML = CASES.map(([t, d, tag], i) => `<div class="swiper-slide hc-case__card"><a class="hc-case__link" href="case.html"><span class="hc-case__img hc-ph"><span class="wf-img" data-label="${t} Site photo · landscape 4:3"></span></span><h3>${t}</h3><p>${d}</p><span class="hc-case__tag">${tag}</span><dl><div><dt>Member Size:</dt><dd>${["301~500 people", "1,001–3,000 people", "301~500 people", "~100 people", "3,001+ people", "101~300 people"][i]}</dd></div><div><dt>Challenge:</dt><dd>Work efficiency · Sales growth</dd></div></dl></a></div>`).join("");
  // Original — on PC no loop and left-aligned, on phone center-aligned with loop. Both advance 1s every 2 seconds
  const pc = matchMedia("(min-width: 768px)").matches;
  const dots = document.querySelector(".hc-case__dots");
  new Swiper(".hc-case__slider", {
    centeredSlides: !pc,
    loop: !pc,
    loopAdditionalSlides: pc ? 0 : 1,
    slidesPerView: "auto",
    spaceBetween: 20,
    speed: reduce ? 0 : 1000,
    simulateTouch: !pc,
    autoplay: reduce ? false : { delay: 2000, disableOnInteraction: false },
    pagination: { el: dots, clickable: true },
    navigation: { nextEl: ".hc-case__next", prevEl: ".hc-case__prev" },
  });
})();
