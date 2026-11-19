// Common to all pages: draws symbols · vertical icon nav (tilted drawer on phone) · bottom fixed button strip · tag cloud · about section · footer, and
// Fills the sticker and doodle image slots (data-sticker, data-deco). Original images (GIF, SVG, APNG) were not carried over, they are redrawn fresh at the same spot and size.
// Original values: phone drawer .3s · subpage text 1.5s ease-out (IntersectionObserver .1) · the symbol tilts like a seesaw via a GIF.
(() => {
  const page = document.body.dataset.page || "home";
  const SS = (window.SS = {});
  const svg = (vb, body, cls = "ss-svg") => `<svg viewBox="${vb}" class="${cls}" aria-hidden="true">${body}</svg>`;

  // Seesaw symbol — ∞ and ○ joined diagonally (in place of the original symbol, redrawn at the same ratio)
  // The original symbol is a GIF so it bobs on its own — big hero symbol (data-mark="tilt") applies the same tempo only through the SVG’s own animation.
  // Header·footer symbols are links, so rotation mixes into the interaction response measurement — keep them as still images
  const tilt = matchMedia("(prefers-reduced-motion: reduce)").matches ? "" : '<animateTransform attributeName="transform" type="rotate" values="0 128 100;-6 128 100;4 128 100;0 128 100" keyTimes="0;0.4;0.7;1" calcMode="discrete" dur="3.2s" repeatCount="indefinite"/>';
  SS.mark = (anim = false) => svg("0 0 256 200", `<g class="eq" fill="none" stroke="currentColor" stroke-width="13" stroke-linecap="round">${anim ? tilt : ""}<path d="M40 66c0-14 10-22 22-22s20 8 26 22c6 14 14 22 26 22s22-8 22-22-10-22-22-22-20 8-26 22c-6 14-14 22-26 22S40 80 40 66z"/><path d="M28 196 218 72"/><circle cx="168" cy="172" r="20"/></g>`, "ss-svg ss-mark");
  const ICON = {
    search: '<circle cx="26" cy="26" r="16" fill="none" stroke="currentColor" stroke-width="5"/><path d="m38 38 14 14" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>',
    camera: '<rect x="8" y="18" width="44" height="32" rx="7" fill="none" stroke="currentColor" stroke-width="4.5"/><path d="M22 18l4-7h8l4 7" fill="none" stroke="currentColor" stroke-width="4.5" stroke-linejoin="round"/><circle cx="30" cy="34" r="8" fill="none" stroke="currentColor" stroke-width="4.5"/>',
    book: '<path d="M6 14c8-3 16-3 24 2v34c-8-5-16-5-24-2zM54 14c-8-3-16-3-24 2v34c8-5 16-5 24-2z" fill="currentColor"/><path d="M36 24h12M36 31h12M36 38h12" stroke="var(--kf-surface)" stroke-width="2.4"/>',
    down: '<path d="M14 6h22l12 12v36H14z" fill="none" stroke="currentColor" stroke-width="4.5" stroke-linejoin="round"/><path d="M31 22v20M23 34l8 8 8-8" fill="none" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>',
  };
  const ico = (k) => `<span class="ic">${svg("0 0 60 60", ICON[k])}</span>`;
  SS.ico = ico;

  // Handwritten sticker — big letters cut out with a thick white border + sparkles and doodle lines around. Text goes in data-sticker, lines separated by ”/”
  SS.sticker = (text, tone = 1) => {
    const lines = text.split("/");
    const fs = lines.length > 3 ? 62 : 72;
    const y0 = 150 - ((lines.length - 1) * fs * 0.92) / 2;
    const t = lines.map((l, i) => `<text x="150" y="${y0 + i * fs * 0.92}" text-anchor="middle" dominant-baseline="middle" font-size="${fs}" stroke-width="22" fill="var(--site-sticker-${tone})" transform="rotate(${i % 2 ? 3 : -4} 150 ${y0 + i * fs * 0.92})">${l}</text>`).join("");
    return svg("0 0 300 300", `<path d="M60 70c40-40 140-46 190 0M40 230c60 40 170 40 220-10" fill="none" stroke="var(--site-sticker-${(tone % 3) + 1})" stroke-width="4" stroke-dasharray="2 10" stroke-linecap="round"/><g fill="none" stroke="var(--site-sticker-${((tone + 1) % 3) + 1})" stroke-width="3"><path d="M50 40c-30 30 10 60 30 30s-30-40-50-10"/><path d="M250 250l14 14M264 250l-14 14"/></g>${t}`);
  };
  const DECO = {
    marker: svg("0 0 442 123", '<path d="M6 80c40-30 70 30 110 0s60-60 110-30 70 50 110 20 60-40 100-30" fill="none" stroke="var(--kf-accent)" stroke-width="16" stroke-dasharray="26 18" stroke-linecap="round"/>'),
    statue: svg("0 0 247 279", '<path d="M90 40c0-24 20-36 40-36s40 14 38 40c-2 20-10 30-12 40 20 10 40 30 44 60l-8 6c-10-16-24-26-34-28 6 22 14 50 10 80l20 30-20 40H70l-14-34 22-34c-6-30 0-58 8-82-20 6-34 20-40 30l-8-6c8-30 30-52 52-60-2-10-8-20-10-40z" fill="color-mix(in oklab, var(--kf-dim) 45%, var(--kf-surface))" stroke="var(--kf-dim)" stroke-width="3"/>'),
    graffiti1: svg("0 0 206 211", '<path d="M30 160c-20-40 10-100 60-100s80 60 40 90-90-10-60-50 110-30 110 30-60 70-100 50" fill="none" stroke="var(--kf-surface)" stroke-width="5" stroke-linecap="round"/>'),
    graffiti2: svg("0 0 292 371", '<path d="M40 330c30-60 10-120 60-160s100 10 80 60-90 20-70-40 90-100 140-80" fill="none" stroke="var(--kf-accent)" stroke-width="6" stroke-linecap="round"/>'),
    food: svg("0 0 247 174", '<ellipse cx="124" cy="120" rx="110" ry="40" fill="var(--kf-surface)" stroke="var(--kf-dim)" stroke-width="3"/><path d="M60 110c20-40 110-50 130 0z" fill="var(--site-sticker-3)"/><circle cx="100" cy="96" r="10" fill="var(--site-sticker-2)"/><circle cx="140" cy="92" r="9" fill="var(--site-sticker-1)"/>'),
    bus: svg("0 0 285 216", '<rect x="20" y="60" width="240" height="110" rx="18" fill="var(--site-sticker-2)"/><rect x="40" y="76" width="200" height="40" rx="6" fill="var(--kf-surface)"/><path d="M110 76v40M170 76v40" stroke="var(--site-sticker-2)" stroke-width="5"/><circle cx="80" cy="172" r="18" fill="var(--kf-ink)"/><circle cx="210" cy="172" r="18" fill="var(--kf-ink)"/>'),
    drink: svg("0 0 285 216", '<path d="M110 40h70l-12 160h-46z" fill="var(--site-sticker-3)" stroke="var(--kf-surface)" stroke-width="6" stroke-linejoin="round"/><path d="M150 40l20-36" stroke="var(--kf-ink)" stroke-width="5" stroke-linecap="round"/><circle cx="145" cy="110" r="10" fill="var(--kf-surface)"/>'),
    hand: svg("0 0 299 249", '<text x="150" y="130" text-anchor="middle" font-size="64" fill="var(--kf-accent)" font-family="var(--kf-font-hand, sans-serif)" font-weight="700" transform="rotate(-8 150 130)">I WANT TO…</text><path d="M30 190c60 20 180 20 240-10" fill="none" stroke="var(--kf-accent)" stroke-width="4" stroke-linecap="round"/>'),
    tallhand: svg("0 0 212 730", '<path d="M110 10c-60 80 60 140 0 220s60 140 0 220 60 140 0 270" fill="none" stroke="var(--kf-accent)" stroke-width="6" stroke-linecap="round" stroke-dasharray="1 14"/>'),
    newbadge: svg("0 0 121 132", '<path d="M20 30 60 6l42 26 8 46-30 44-46 4L8 80z" fill="var(--kf-accent)"/><text x="60" y="78" text-anchor="middle" font-size="34" fill="var(--kf-surface)" font-family="var(--kf-font-hand, sans-serif)" font-weight="700" transform="rotate(-14 60 78)">New</text>'),
    swirl: svg("0 0 200 200", '<path d="M40 120c0-50 90-70 110-20s-60 70-80 30 40-60 70-40" fill="none" stroke="var(--kf-surface)" stroke-width="5" stroke-linecap="round"/>'),
  };
  SS.deco = DECO;
  const fill = (root = document) => {
    root.querySelectorAll("[data-sticker]").forEach((el) => { if (!el.firstElementChild) el.innerHTML = SS.sticker(el.dataset.sticker, +(el.dataset.tone || 1)); });
    root.querySelectorAll("[data-deco]").forEach((el) => { if (!el.firstElementChild) el.innerHTML = DECO[el.dataset.deco] || ""; });
    root.querySelectorAll("[data-mark]").forEach((el) => { if (!el.firstElementChild) el.innerHTML = SS.mark(el.dataset.mark === "tilt"); });
  };
  SS.fill = fill;

  const NAV = [
    ["search", "list.html", "Article<br>Find"],
    ["camera", "lookbook.html", "What I saw<br>Scenery"],
    ["book", "list.html#tag", "School<br>Glossary"],
    ["down", "#", "Booklet<br>View"],
  ];
  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("ss-head", page === "home" ? "is-top" : "is-lower");
    head.innerHTML = `<a class="ss-head__logo" href="index.html" aria-label="Home" data-mark></a>
      <button class="ss-burger" type="button" aria-expanded="false" aria-controls="ss-nav"><i></i><i></i><i></i><b class="ss-latin">MENU</b></button>
      <nav class="ss-nav" id="ss-nav" aria-label="Main menu"><ul>${NAV.map(([k, h, t]) => `<li><a href="${h}">${ico(k)}<span>${t}</span></a></li>`).join("")}</ul></nav>`;
  }
  const tag = document.querySelector('[data-slot="tag-cloud"]');
  if (tag) {
    tag.classList.add("ss-tag");
    tag.id = "tag";
    const words = ["Clubs · student activities", "Fashion", "Career stories", "Video", "Social", "Volunteering", "Sports", "Music", "Major studies", "Campus", "School Events", "Travel", "Cafe", "Cooking", "Friend", "Certificate", "Part-time job", "Book", "Movie", "Photo", "Art", "Psychology", "Education", "Nursing", "Nutrition", "Design", "International", "Language", "Broadcast", "Social Media", "Lunch box", "Dormitory", "School commute", "Festival", "Employment", "Intern", "Graduation", "Senior", "Junior", "Lab", "Library", "Class", "Exam", "Assignment", "Announcement", "Debate", "Practice", "Summer break", "Winter break", "New semester"];
    tag.innerHTML = `<div class="ss-tag__in"><h2 class="ss-tag__ttl" aria-label="Tag">${svg("0 0 175 99", '<text x="88" y="70" text-anchor="middle" font-size="76" fill="currentColor" font-family="var(--kf-font-hand, sans-serif)" font-weight="700" transform="rotate(-6 88 60)">TAG!</text>')}</h2><ul data-label="About 50 tag words">${words.map((w) => `<li><a href="list.html">#${w}</a></li>`).join("")}</ul></div>`;
  }
  const about = document.querySelector('[data-slot="about"]');
  if (about) {
    about.classList.add("ss-about");
    about.innerHTML = `<div class="ss-about__wrap">
      <hgroup><h2 class="ss-about__ttl" aria-label="Handwritten About title">${svg("0 0 300 120", '<text x="10" y="60" font-size="56" fill="currentColor" font-family="var(--kf-font-hand, sans-serif)" font-weight="700">ABOUT</text><text x="40" y="112" font-size="44" fill="currentColor" font-family="var(--kf-font-hand, sans-serif)" font-weight="700">this mag?</text>')}</h2><p>What is [Magazine name here]?</p></hgroup>
      <div class="ss-about__imgs">
        <figure class="ss-ph"><span class="wf-img" data-label="Two students laughing on a bench · soap bubbles · outdoor daylight · 77:52"></span><span class="ss-about__line" data-deco="swirl"></span></figure>
        <figure class="ss-ph"><span class="wf-img" data-label="Student sitting by the window · sky · 44:30"></span></figure>
        <figure class="ss-ph"><span class="wf-img" data-label="Student leaning on a white chair · bright interior · 40:30"></span></figure>
      </div>
      <div class="ss-about__text"><h3>Your about first sentence in one line here.</h3><p>Add about five lines introducing the magazine. Who it is for and what it covers.</p><p>About three lines on the meaning behind the name here.</p><p>Your closing line here.</p></div>
      <figure class="ss-about__logo" data-mark aria-label="Seesaw Symbol"></figure>
    </div>`;
  }
  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("ss-foot");
    foot.innerHTML = '<p class="ss-foot__by ss-latin">Produced by</p><a class="ss-foot__logo" href="#"><span class="wf-logo">LOGO</span>Your school name here</a><p class="ss-latin">© School Name. All Rights Reserved.</p>';
  }
  fill();

  // Phone drawer — applied only at 768px and below, like the original
  const burger = document.querySelector(".ss-burger");
  if (burger && matchMedia("(max-width: 768px)").matches) {
    const set = (on) => { document.body.classList.toggle("is-drawer-open", on); burger.setAttribute("aria-expanded", String(on)); };
    burger.addEventListener("click", () => set(!document.body.classList.contains("is-drawer-open")));
    document.querySelectorAll(".ss-nav a").forEach((a) => a.addEventListener("click", () => set(false)));
  }

  // The first page nav sits below 44rem and sticks once it reaches the top of the screen
  if (head && page === "home") {
    const probe = document.createElement("i");
    probe.style.cssText = "position:absolute;top:44rem;left:0;width:1px;height:1px";
    document.body.prepend(probe);
    const io = new IntersectionObserver(([e]) => head.classList.toggle("is-sticky", e.boundingClientRect.top < 0));
    io.observe(probe);
  }
  // Subpage on phone: hide the symbol unless at the top
  const logo = head?.querySelector(".ss-head__logo");
  if (logo && page !== "home" && matchMedia("(max-width: 768px)").matches) {
    addEventListener("scroll", () => logo.classList.toggle("is-disabled", scrollY !== 0), { passive: true });
  }

  // Text fade (.ss-text-fade) — original .fadeIn: 1.5s ease-out at 10% visible
  const fio = new IntersectionObserver((es, o) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("visible"); o.unobserve(e.target); } }), { threshold: 0.1 });
  document.querySelectorAll(".ss-text-fade").forEach((el) => fio.observe(el));
  gsap.registerPlugin(ScrollTrigger);
})();
