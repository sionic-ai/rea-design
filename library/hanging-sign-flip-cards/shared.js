// Drawn in here so every page uses the same header line, phone menu panel, bottom consult button, consult box and footer.
// Image props (logo mark, bird, horse, squirrel, person, fruit branch, feather, icon) also live here as one set — pages <i data-ill="Name"> Just leave it.
(() => {
  const page = document.body.dataset.page || "home";
  const ILL = {
    mark: '<svg viewBox="0 0 114 60" aria-hidden="true"><path class="ac-ill-green" d="M0 9 114 0v30H11C8 22 4 15 0 9z"/><path class="ac-ill-sub" d="M11 30h103v30L1 53c4-8 7-15 10-23z"/></svg>',
    mail: '<svg viewBox="0 0 24 17" aria-hidden="true"><rect class="ac-ill-line" x="1" y="1" width="22" height="15" rx="1"/><path class="ac-ill-line" d="m1.5 1.5 10.5 8 10.5-8M1.5 15.5 9 8.5m13.5 7L15 8.5"/></svg>',
    form: '<svg viewBox="0 0 20 24" aria-hidden="true"><rect class="ac-ill-line" x="1" y="3" width="18" height="20" rx="1.5"/><path class="ac-ill-line" d="M7 1.5h6v3H7zM5 10h2m3 0h5M5 14h2m3 0h5M5 18h2m3 0h5"/></svg>',
    ext: '<svg class="ac-ext" viewBox="0 0 15 15" aria-hidden="true"><path class="ac-ill-line" d="M8 1h6v6M14 1 7 8M11 9v5H1V4h5"/></svg>',
    ig: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect class="ac-ill-line" x="2" y="2" width="20" height="20" rx="6" style="stroke-width:2"/><circle class="ac-ill-line" cx="12" cy="12" r="4.6" style="stroke-width:2"/><circle class="ac-ill-green" cx="17.6" cy="6.4" r="1.4"/></svg>',
    fb: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle class="ac-ill-green" cx="12" cy="12" r="11"/><path class="ac-ill-white" d="M13.2 23v-8.2h2.7l.4-3.2h-3.1V9.6c0-.9.3-1.5 1.6-1.5h1.6V5.3a22 22 0 0 0-2.4-.1c-2.4 0-4 1.4-4 4.1v2.3H7.3v3.2H10V23z"/></svg>',
    horse: '<svg viewBox="0 0 150 190" aria-hidden="true"><text x="82" y="22" class="ac-ill-green" style="font:500 12px var(--kf-font-label)">Page</text><text x="86" y="38" class="ac-ill-green" style="font:500 12px var(--kf-font-label)">Top</text><path class="ac-ill-dline" d="M60 4l6 22M70 30l3 10M140 6l-10 22M126 34l-6 10" style="stroke:var(--kf-ink);stroke-dasharray:4 4"/><path class="ac-ill-brown" d="M30 66c-6-6-14-4-20 3l-6 9c-2 4 1 7 5 5l9-4c5 1 7 6 9 12 3 14 11 22 26 24 16 2 34 0 48-3 6-1 10 5 10 12l-2 26 6 1 4-24 6 24h6l-3-30c8-6 10-18 6-30-6-14-24-18-44-16-14 1-24-4-30-12z"/><path class="ac-ill-brown" d="M40 106l-4 40 6 1 6-34zM58 112l-2 36h6l4-32z"/><path class="ac-ill-dark" d="M26 62c6-2 12 2 16 10l6 12c-6-2-10-8-14-14zM142 96c6 8 6 20 2 30l-4-2c2-8 2-18 2-28zM34 146h8v4h-8zm22 2h7v4h-7zm60 4h7v4h-7zm14-2h7v4h-7z"/><circle class="ac-ill-dark" cx="18" cy="72" r="1.6"/></svg>',
    squirrel: '<svg viewBox="0 0 123 110" aria-hidden="true"><path class="ac-ill-brown" d="M70 104c-18 2-30-10-30-26 0-14 10-24 22-26-8-10-6-26 6-34 14-10 36-6 44 10 8 16 0 32-14 34 8 6 10 16 6 26-4 10-16 16-34 16z" opacity=".85"/><path class="ac-ill-brown" d="M34 50c-4-10-2-22 6-26l4 8c6-2 12 2 14 8 4 12-2 30-10 40-10 12-28 10-30-2-2-10 6-18 16-28z"/><path class="ac-ill-skin" d="M36 62c-4 8-4 18 2 24 6-4 10-14 8-24z"/><circle class="ac-ill-dark" cx="42" cy="38" r="2"/><path class="ac-ill-dark" d="M40 24l2-12 6 12z"/></svg>',
    crane: '<svg viewBox="0 0 300 150" aria-hidden="true"><path class="ac-ill-white" d="M40 60c10-30 30-50 54-56-6 22-12 40-26 56 18-14 40-20 60-18-16 14-36 24-58 28l-30 4c-12 2-24 0-34-6 12 0 24-4 34-8z"/><path class="ac-ill-dark" d="M120 76l40-4 4 3-44 5zM40 72l-30 26-2-2 28-28z"/><circle class="ac-ill-red" cx="161" cy="72" r="2.5"/><path class="ac-ill-white" d="M210 104c6-20 18-34 32-40-2 16-6 28-14 40 12-8 26-12 40-10-10 10-24 16-38 18l-20 2c-8 0-16-2-22-6 8 0 16-2 22-4z"/><path class="ac-ill-dark" d="M262 114l28-2 2 2-30 4zM212 112l-18 18-2-2 16-18z"/><circle class="ac-ill-red" cx="290" cy="112" r="2"/></svg>',
    branch: '<svg viewBox="0 0 134 110" aria-hidden="true"><path class="ac-ill-brown" d="M134 8C100 14 70 34 46 60l3 3C74 38 102 20 134 15z"/><path class="ac-ill-green" d="M60 46c-14-10-30-8-40 2 14 6 28 6 40-2zm-14 16c-4 14 0 30 10 38 2-14-2-28-10-38zm34-30c-6-14-2-28 8-34 2 14-2 26-8 34zM40 66c-12 8-18 22-16 34 10-8 16-20 16-34z" opacity=".9"/><g class="ac-ill-berry"><circle cx="56" cy="62" r="6"/><circle cx="66" cy="56" r="5.5"/><circle cx="62" cy="70" r="5"/><circle cx="74" cy="64" r="5"/><circle cx="86" cy="42" r="5"/><circle cx="96" cy="36" r="4.5"/></g></svg>',
    feather: '<svg viewBox="0 0 233 180" aria-hidden="true"><defs><path id="ac-fp" d="M10 60c30 20 70 22 100 4"/></defs><text class="ac-ill-white" style="font:700 16px var(--kf-font-sans);letter-spacing:.15em"><textPath href="#ac-fp">Back to Post List</textPath></text><path class="ac-ill-dline" d="M12 68c30 20 70 22 100 4" style="stroke:var(--kf-on-accent);stroke-dasharray:2 4"/><path class="ac-ill-sky" d="M210 4c-30 6-62 40-74 80-8 26-12 50-12 70 16-20 40-36 58-62 20-30 30-60 28-88z"/><path class="ac-ill-dline" d="M206 10 120 178" style="stroke:var(--site-illust-blue)"/></svg>',
    worker: '<svg viewBox="0 0 121 190" aria-hidden="true"><circle class="ac-ill-skin" cx="70" cy="22" r="11"/><path class="ac-ill-orange" d="M58 18c0-10 8-16 16-14 8 2 10 8 10 14z"/><path class="ac-ill-blue" d="M56 36h26l8 50-4 70h-12l-4-56-4 56H54l-2-70z"/><path class="ac-ill-blue" d="M58 40 22 20l-3 5 34 22z"/><path class="ac-ill-skin" d="M20 20 4 14l2-3 16 5z"/><path class="ac-ill-blue" d="M80 40l12 40-6 2-12-38z"/><path class="ac-ill-dark" d="M52 156h14v14H48zm22 0h12l4 14H72z"/></svg>',
    walkers: '<svg viewBox="0 0 400 200" aria-hidden="true"><circle class="ac-ill-skin" cx="60" cy="40" r="11"/><path class="ac-ill-pink" d="M50 54h22l4 50H48z"/><path class="ac-ill-pink" d="M50 104l-14 60 8 2 16-54 6 54h8l-2-62z"/><path class="ac-ill-dark" d="M34 164h12v6H32zm32 0h10v6H66z"/><circle class="ac-ill-skin" cx="150" cy="30" r="11"/><path class="ac-ill-orange" d="M138 22c4-12 20-12 24 0z"/><path class="ac-ill-sky" d="M140 44h22l6 60h-30z"/><path class="ac-ill-sky" d="M138 104l-10 64h9l12-52 4 52h9l-4-64z"/><path class="ac-ill-brown" d="M156 52h30v34h-30z"/><circle class="ac-ill-green" cx="170" cy="50" r="6"/><circle class="ac-ill-red" cx="180" cy="48" r="5"/><circle class="ac-ill-skin" cx="236" cy="36" r="11"/><path class="ac-ill-blue" d="M224 50h26l6 56-4 70h-11l-4-56-4 56h-11l-2-70z"/><path class="ac-ill-dark" d="M220 172h16v8h-18zm22 0h14l2 8h-16z"/></svg>',
    walkers2: '<svg viewBox="0 0 560 220" aria-hidden="true"><path class="ac-ill-brown" d="M30 70c-6-8-2-18 8-20l20 4c10 10 14 24 16 34 40 6 90 4 120 2 20 0 30 14 26 30l-6 30 2 46h-8l-6-40-6 40h-8l2-48c-30 8-80 8-110 2l-8 46h-8l-2-46-8 46h-8l4-58c-12-20-18-40-20-68z"/><path class="ac-ill-dark" d="M44 52c8 4 14 14 16 26l-8-4c-2-8-4-14-8-22zM26 66l-8 4 2 4 10-4z"/><circle class="ac-ill-skin" cx="320" cy="44" r="11"/><path class="ac-ill-skin" d="M306 58h28l6 60h-40z"/><path class="ac-ill-skin" d="M304 118l-6 70h10l12-50 6 50h10l-4-70z" opacity=".75"/><circle class="ac-ill-skin" cx="410" cy="110" r="9"/><path class="ac-ill-sky" d="M400 122h20l2 40h-24z"/><path class="ac-ill-blue" d="M398 162l-4 30h8l6-24 4 24h8l-2-30z"/><circle class="ac-ill-skin" cx="490" cy="40" r="11"/><path class="ac-ill-white" d="M476 54h30l6 50h-42z"/><path class="ac-ill-blue" d="M478 60h26l4 50h-34z" opacity=".8"/><path class="ac-ill-green" d="M474 110l-12 70h10l16-50 10 50h10l-8-70z"/><path class="ac-ill-dark" d="M458 178h16v8h-18zm40 0h14l2 8h-16z"/></svg>',
    farmer: '<svg viewBox="0 0 164 230" aria-hidden="true"><path class="ac-ill-orange" d="M60 22c10-16 40-16 50 0l12 6H48z" opacity=".8"/><circle class="ac-ill-skin" cx="84" cy="36" r="12"/><path class="ac-ill-white" d="M68 52h32l6 60H64z"/><path class="ac-ill-brown" d="M96 70h40v40H96z"/><circle class="ac-ill-green" cx="108" cy="66" r="7"/><circle class="ac-ill-red" cx="122" cy="64" r="6"/><path class="ac-ill-sky" d="M66 112h40l8 50-10 50h-12l2-44-10 44H72l2-50z"/><path class="ac-ill-dark" d="M70 206h14v12H66zm24 0h12l6 12H92z"/></svg>',
    couple: '<svg viewBox="0 0 230 200" aria-hidden="true"><circle class="ac-ill-skin" cx="70" cy="34" r="11"/><path class="ac-ill-pink" d="M58 48h24l12 60H50z"/><path class="ac-ill-skin" d="M58 108l-14 60h8l16-50 6 50h8l-6-60z"/><circle class="ac-ill-skin" cx="150" cy="30" r="11"/><path class="ac-ill-dark" d="M138 46h26l6 60h-36z"/><path class="ac-ill-blue" d="M140 50h22l4 70h-28z" opacity=".85"/><path class="ac-ill-green" d="M138 120l-16 56h9l20-46 10 46h9l-10-56z"/></svg>',
    mother: '<svg viewBox="0 0 148 200" aria-hidden="true"><circle class="ac-ill-skin" cx="62" cy="26" r="11"/><path class="ac-ill-white" d="M48 40h28l6 50H44z"/><path class="ac-ill-orange" d="M44 90h40l10 90H36z" opacity=".75"/><circle class="ac-ill-skin" cx="118" cy="110" r="8"/><path class="ac-ill-sky" d="M108 120h20l2 34h-24z"/><path class="ac-ill-blue" d="M108 154l-4 28h8l4-20 4 20h8l-2-28z"/></svg>',
    boat: '<svg viewBox="0 0 330 220" aria-hidden="true"><path class="ac-ill-line" d="M20 170c60 20 220 22 300-6l-20 30c-80 18-200 14-262-6zM60 180c80 10 180 8 240-6"/><path class="ac-ill-line" d="M120 168V60l-8-14m8 14 20 2M120 60c-10 2-16 10-14 20l4 30h22l4-30c0-10-6-18-16-20zM112 110l-8 58m24-58 8 58M60 196 160 20"/><circle class="ac-ill-line" cx="122" cy="40" r="10"/><path class="ac-ill-line" d="M220 120c-4-12 4-22 14-22s16 10 12 22l6 46h-40zM234 76a11 11 0 1 1 0 .1M200 140c-30-10-60 20-90 10M240 140c20 4 40 0 60-10"/></svg>',
    helmet: '<svg viewBox="0 0 82 82" aria-hidden="true"><circle class="ac-ill-blue" cx="41" cy="41" r="41"/><path class="ac-ill-white" d="M18 50c0-16 10-26 23-26s23 10 23 26zm-4 2h54v6H14z"/><path class="ac-ill-blue" d="M38 26h6v20h-6z" opacity=".5"/></svg>',
    building: '<svg viewBox="0 0 130 100" aria-hidden="true"><path class="ac-ill-green" d="M10 14h60v84H10z"/><path class="ac-ill-sub" d="M70 36h50v62H70z"/><g class="ac-ill-white"><rect x="18" y="22" width="9" height="9"/><rect x="34" y="22" width="9" height="9"/><rect x="50" y="22" width="9" height="9"/><rect x="18" y="40" width="9" height="9"/><rect x="34" y="40" width="9" height="9"/><rect x="50" y="40" width="9" height="9"/><rect x="18" y="58" width="9" height="9"/><rect x="34" y="58" width="9" height="9"/><rect x="50" y="58" width="9" height="9"/><rect x="78" y="46" width="34" height="5"/><rect x="78" y="58" width="34" height="5"/><rect x="78" y="70" width="34" height="5"/></g><path class="ac-ill-green" d="M2 96h126v4H2z"/></svg>',
    hands: '<svg viewBox="0 0 130 100" aria-hidden="true"><path class="ac-ill-green" d="M6 40 30 22l38 24c6 4 6 12-2 12l-30-8-14 28c-6 2-12-2-12-8l4-10z"/><path class="ac-ill-sub" d="M124 34 98 18 60 40c-8 4-4 12 4 12h20l-24 16c-4 4 0 12 8 10l40-24 22-6z"/></svg>',
    boots: '<svg viewBox="0 0 130 120" aria-hidden="true"><path class="ac-ill-green" d="M30 4h34v88c0 10-6 18-18 18H14c-10 0-12-12-2-16l18-8z"/><path class="ac-ill-sub" d="M64 10h36v92c0 10-6 16-16 16H52c-10 0-12-12-2-16l14-6z"/></svg>',
    coins: '<svg viewBox="0 0 130 100" aria-hidden="true"><g class="ac-ill-sub"><ellipse cx="82" cy="18" rx="34" ry="12"/><rect x="48" y="18" width="68" height="62" rx="4"/></g><g class="ac-ill-white"><rect x="50" y="34" width="64" height="3"/><rect x="50" y="50" width="64" height="3"/><rect x="50" y="66" width="64" height="3"/></g><circle class="ac-ill-green" cx="40" cy="64" r="34"/><circle class="ac-ill-white" cx="40" cy="64" r="26" opacity=".35"/></svg>',
    online: '<svg viewBox="0 0 84 84" aria-hidden="true"><rect class="ac-ill-green" x="8" y="16" width="68" height="44" rx="4"/><rect class="ac-ill-white" x="14" y="22" width="56" height="32"/><path class="ac-ill-sub" d="M2 64h80l-6 8H8z"/></svg>',
    study: '<svg viewBox="0 0 84 84" aria-hidden="true"><path class="ac-ill-green" d="M6 20c14-6 26-4 36 4v50c-10-8-22-10-36-4z"/><path class="ac-ill-sub" d="M78 20c-14-6-26-4-36 4v50c10-8 22-10 36-4z"/></svg>',
  };
  const fill = (root = document) => root.querySelectorAll("i[data-ill]").forEach((i) => {
    const svg = ILL[i.dataset.ill];
    if (!svg) return;
    const span = document.createElement("span");
    span.className = i.className;
    span.setAttribute("data-ill", i.dataset.ill);
    span.innerHTML = svg;
    i.replaceWith(span);
  });

  const NAV = [
    ["index.html", "First", "home"],
    ["about.html", "About the Town and Its Challenges", "about"],
    [null, "Local venture school", "service", [["service.html", "·Program Info"], ["service.html#schedule", "·Selection event info"]]],
    ["service.html#lvs03", "Support Menu", "support"],
    ["news.html", "Reads", "news"],
  ];
  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("ac-head");
    head.setAttribute("data-fx", "head-solid-scroll");
    head.setAttribute("data-fx-head-solid-scroll", `at: ${page === "home" ? "100vh" : "50"}; hide: 500`);
    const items = NAV.map(([href, label, key, sub]) => sub
      ? `<li class="ac-head__drop"><button type="button" aria-expanded="false">${label}</button><ol>${sub.map(([h, l]) => `<li><a href="${h}">${l}</a></li>`).join("")}</ol></li>`
      : `<li><a href="${href}"${key === page ? ' aria-current="page"' : ""}>${label}</a></li>`).join("");
    head.innerHTML = `<div class="ac-head__inner">
      <a class="ac-head__logo" href="index.html" data-label="Logo symbol + newsletter name"><i data-ill="mark"></i><span class="ac-head__logotext ac-e">Town Name<br>Challenge<br>Support Bulletin</span></a>
      <nav class="ac-head__nav" aria-label="Main menu"><ul>${items}<li><a class="ac-pill-cta" href="#contact"><i data-ill="mail"></i>Challenge consultation desk</a></li></ul></nav>
      <button class="ac-head__menu" type="button" aria-label="Open Menu"><i></i><i></i><span>MENU</span></button>
    </div>`;
    const menu = document.createElement("div");
    menu.className = "ac-menu";
    menu.setAttribute("data-slot", "mobile-menu");
    menu.innerHTML = `<div class="ac-menu__logo"><i data-ill="mark"></i><span class="ac-head__logotext ac-e">Town Name<br>Challenge<br>Support Bulletin</span></div>
      <button class="ac-menu__close" type="button" aria-label="Close Menu"></button>
      <ul class="ac-menu__list">
        <li><a href="index.html">First</a></li>
        <li><a href="about.html">About the Town and Its Challenges</a><ol><li><a href="about.html#town">This is the village</a></li><li><a href="about.html#relation">The relationship between town and challenge</a></li></ol></li>
        <li><a href="service.html">Local venture school</a><ol><li><a href="service.html#lvs01">What is the School?</a></li><li><a href="service.html#lvs02">Who takes part?</a></li><li><a href="service.html#lvs03">What Is the Structure?</a></li><li><a href="service.html#faq">Frequently asked questions</a></li><li><a href="service.html#schedule">This Year’s Schedule</a></li><li><a href="service.html#lvs06">School’s milestones</a></li></ol></li>
        <li><a href="service.html#lvs03">Support Menu</a></li>
        <li><a href="news.html">Reads</a></li>
        <li><a href="news.html">Notice</a></li>
      </ul>
      <ul class="ac-menu__btns"><li><a href="#contact"><i data-ill="mail"></i>Challenge consultation desk</a></li><li><a href="#contact"><i data-ill="form"></i>Contact Us</a></li></ul>`;
    head.after(menu);
    const oto = document.createElement("div");
    oto.className = "ac-oto";
    oto.setAttribute("data-slot", "sp-cta");
    oto.innerHTML = '<a class="ac-pill-cta" href="#contact"><i data-ill="mail"></i>Challenge consultation desk</a>';
    menu.after(oto);
    head.querySelector(".ac-head__menu").addEventListener("click", () => menu.classList.add("is-open"));
    menu.querySelector(".ac-menu__close").addEventListener("click", () => menu.classList.remove("is-open"));
    // Original: li.expand gets .open via mouseenter/leave — on phone·keyboard, press to open
    head.querySelectorAll(".ac-head__drop").forEach((li) => {
      const set = (on) => { li.classList.toggle("is-open", on); li.querySelector("button").setAttribute("aria-expanded", on); };
      li.addEventListener("mouseenter", () => set(true));
      li.addEventListener("mouseleave", () => set(false));
      li.querySelector("button").addEventListener("click", () => set(!li.classList.contains("is-open")));
    });
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("ac-foot");
    foot.id = "contact";
    foot.innerHTML = `<div class="ac-sodan" data-slot="consult">
        <div class="ac-sodan__img"><div class="wf-img" data-label="Participant group photo · snowfield · clear day · several people gesturing and smiling in front of trees · landscape 640×345"></div></div>
        <div class="ac-sodan__text"><h2>Feel free to consult with us</h2><p>Any question or consultation is welcome.<br>Concerns from before you start are welcome too.<br>Also for anyone considering joining the program<br>Please get in touch once.</p><a class="ac-btn" href="#contact">Challenge consultation desk<i>&gt;</i></a></div>
      </div>
      <div class="ac-foot__inner">
        <ul class="ac-foot__nav">
          <li class="is-stack"><a href="index.html">First</a><a href="news.html">Reads</a><a href="news.html">Notice</a></li>
          <li><a href="about.html">About the Town and Its Challenges</a><ol><li><a href="about.html#town">This is the village</a></li><li><a href="about.html#relation">The relationship between town and challenge</a></li></ol></li>
          <li><a href="service.html">Local venture school</a><ol><li><a href="service.html#lvs01">What is the School?</a></li><li><a href="service.html#lvs02">Who takes part?</a></li><li><a href="service.html#lvs03">What Is the Structure?</a></li><li><a href="service.html#faq">Frequently asked questions</a></li><li><a href="service.html#schedule">This Year’s Schedule</a></li><li><a href="service.html#lvs06">School’s milestones</a></li></ol><a class="ac-foot__plus" href="service.html#schedule">Local venture school selection meetup</a></li>
          <li><a href="service.html#lvs03">Support Menu</a><ol><li><a href="service.html#lvs03">Regional Partnership Team</a></li><li><a href="service.html#lvs03">Village support program</a></li></ol></li>
        </ul>
        <ul class="ac-foot__links"><li><a href="#contact">Official Town Website<i data-ill="ext"></i></a></li><li><a href="#contact">Life in the town<i data-ill="ext"></i></a></li></ul>
        <ul class="ac-foot__btns"><li><a href="#contact"><i data-ill="mail"></i>Challenge consultation desk</a></li><li><a href="#contact"><i data-ill="form"></i>Contact Us</a></li></ul>
        <div class="ac-foot__sns"><span class="ac-e">FOLLOW US</span><a href="#contact" aria-label="Social Media"><i data-ill="ig"></i></a><a href="#contact" aria-label="Brand"><i data-ill="fb"></i></a><a class="ac-foot__rule" href="#contact">Terms of service</a><a class="ac-foot__rule" href="#contact">Privacy policy</a></div>
        <div class="ac-foot__copy ac-e">Copyright &copy; 2025 Town Name Challenge Support Bulletin All Rights Reserved.</div>
      </div>
      <a class="ac-pagetop" href="#top" aria-label="Back to top"><i data-ill="horse"></i></a>`;
    foot.querySelector(".ac-pagetop").addEventListener("click", (e) => { e.preventDefault(); scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); });
  }
  fill();

  // The phone bottom consult button also hides like the header bar when the footer rises (original #oto transition .3s)
  const oto = document.querySelector(".ac-oto"), footEl = document.querySelector('[data-slot="footer"]');
  if (oto && footEl) {
    const check = () => oto.classList.toggle("is-hidden", footEl.getBoundingClientRect().top + 500 < innerHeight);
    addEventListener("scroll", check, { passive: true });
    check();
  }

  // Original .sa — once it crosses the line 250px from the bottom of the screen, it turns on from a spot pushed 15px away, over 1s ease. Direction via data-sa
  const SA = { up: "y: 15", down: "y: -15", left: "x: 15; y: 0", right: "x: -15; y: 0", sp: "y: 15" };
  document.querySelectorAll("[data-sa]").forEach((el) => {
    el.setAttribute("data-fx", [el.getAttribute("data-fx"), "fade-up"].filter(Boolean).join(" "));
    el.setAttribute("data-fx-fade-up", `${SA[el.dataset.sa] || SA.up}; duration: 1; ease: 0.25,0.1,0.25,1; start: top bottom-=250`);
  });

  // White curtain — like the original body.fadeout::after it must cover from the first paint, so it goes at the very start of html. Lifts 1.5s after window load,
  // The page script catches the moment it peels away and triggers the Hero entrance
  const veil = document.querySelector(".ac-veil");
  const lift = () => setTimeout(() => { veil?.classList.add("is-off"); document.dispatchEvent(new CustomEvent("ac:ready")); }, 1500);
  if (document.readyState === "complete") lift(); else addEventListener("load", lift);

  // Endlessly flowing photo strip — original Swiper 6.3.4: loop · slidesPerView auto · delay 0 · speed 15s · cannot be dragged by hand
  document.querySelectorAll(".ac-strip .swiper-container").forEach((el) => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    new Swiper(el, { loop: true, loopedSlides: 5, slidesPerView: "auto", speed: 15000, autoplay: { delay: 0, disableOnInteraction: false }, allowTouchMove: false });
  });

  window.acFill = fill;
})();
