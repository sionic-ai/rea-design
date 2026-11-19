// Shared by all pages: draws the header row, mega menu, burger drawer and footer in one place, and hooks up AOS, number counting and the footer letter drop.
// The original uses a marketing embed + jQuery + AOS 2.3.1 (mirror, off on phones) + slick. The same bundle is loaded from _vendor. Page transitions and the loader do not exist in the original.
(() => {
  const page = document.body.dataset.page || "home";
  const SE = (window.SE = {});
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  SE.reduce = reduce;

  const chev = '<svg viewBox="0 0 8 12" aria-hidden="true"><path d="M4 8.6 0.6 4.4l.9-.8L4 6.8l2.5-3.2.9.8z"/></svg>';
  const arrow = '<svg viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M1 6h9.5M6.8 2.3 10.5 6 6.8 9.7" stroke="currentColor" stroke-width="1.6"/></svg>';
  const heart = '<svg viewBox="0 0 20 18" aria-hidden="true"><path fill="currentColor" d="M10 17.5 8.6 16.2C3.4 11.6 0 8.6 0 5 0 2.2 2.2 0 5 0c1.9 0 3.7.9 5 2.3C11.3.9 13.1 0 15 0c2.8 0 5 2.2 5 5 0 3.6-3.4 6.6-8.6 11.2z"/></svg>';
  // Placeholder letters in the same two-line staggered type instead of the original wordmark
  const mark = (fill = "currentColor") => `<svg viewBox="0 0 162 60" aria-hidden="true"><text x="0" y="24" fill="${fill}" style="font: 700 28px var(--kf-font-display); letter-spacing: -1px">brand</text><text x="38" y="54" fill="${fill}" style="font: 700 28px var(--kf-font-display); letter-spacing: -1px">name</text></svg>`;
  SE.icons = { chev, arrow, heart, mark };
  SE.roll = (t) => `<span class="se-roll"><span>${t}</span><span aria-hidden="true">${t}</span></span>`;

  const drop = (id, items) => `
    <div class="se-drop" id="${id}">
      ${items.map(([t, s, href], i) => `<a class="se-drop__link" href="${href}" data-i="${i}"><span class="se-drop__t">${t}</span><span class="se-drop__s">${s}</span></a>`).join("")}
      ${items.map((x, i) => `<span class="se-drop__img se-ph se-cut-${(i % 5) + 1}${i ? "" : " is-on"}"><span class="wf-img" data-label="${x[3]}"></span></span>`).join("")}
    </div>`;
  const solution = [
    ["Sport & Move", "Your one-line description here, about two lines.", "service.html", "Photo of two colleagues running · daytime sunlight · portrait 3:4"],
    ["Team Spirit", "Your one-line description here, about two lines.", "service.html", "Office group photo · bright interior · portrait 3:4"],
    ["Impact goals for teams", "Your one-line description here, about two lines.", "service.html", "Hands planting a tree · overcast day outdoors · portrait 3:4"],
  ];
  const challenges = [
    ["Challenge One", "Your one-line description goes here.", "service.html", "Pink ribbon event photo · outdoors · portrait 3:4"],
    ["Challenge Two", "Your one-line description goes here.", "service.html", "Bike commute photo · morning light · portrait 3:4"],
    ["Challenge Three", "Your one-line description goes here.", "service.html", "Desk stretching photo · indoors · portrait 3:4"],
    ["All Challenges", "Your one-line description goes here.", "service.html", "Hand holding app screen · indoors · portrait 3:4"],
  ];
  const resources = [
    ["About Us", "Your one-line description goes here.", "index.html#about", "Smiling team photo · indoor · portrait 3:4"],
    ["Journal", "Your one-line description goes here.", "news.html", "Person at a laptop · window light · portrait 3:4"],
    ["Impact Guide", "Your one-line description goes here.", "service.html", "Group walking in a park · daytime · portrait 3:4"],
    ["Latest Story", "Your one-line description goes here.", "article.html", "High five in a meeting room · indoor · portrait 3:4"],
  ];

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("se-head");
    head.innerHTML = `
      <a class="se-logo" href="index.html" aria-label="Home" data-label="Brand wordmark staggered over two lines">${mark()}</a>
      <nav class="se-nav" aria-label="Main menu" data-label="Your menu English name here">
        <div class="se-nav__item"><button class="se-nav__btn" type="button" aria-controls="se-d1">Solution ${chev}</button>${drop("se-d1", solution)}</div>
        <div class="se-nav__item"><a class="se-nav__btn" href="works.html">Client stories</a></div>
        <div class="se-nav__item"><button class="se-nav__btn" type="button" aria-controls="se-d2">Challenges ${chev}</button>${drop("se-d2", challenges)}</div>
        <div class="se-nav__item"><button class="se-nav__btn" type="button" aria-controls="se-d3">Resources ${chev}</button>${drop("se-d3", resources)}</div>
      </nav>
      <div class="se-head__right">
        <span class="se-lang">KO ${chev}</span>
        <button class="se-burger" type="button" aria-label="Open Menu"><svg viewBox="0 0 100 100" aria-hidden="true"><path class="line line1" d="M20 29h60s14.5-.2 14.5 37.7c0 11.3-3.5 15-9.2 15-5.7 0-10.3-6.7-10.3-6.7L25 25"/><path class="line line2" d="M20 50h60"/><path class="line line3" d="M20 71h60s14.5.2 14.5-37.7c0-11.3-3.5-15-9.2-15-5.7 0-10.3 6.7-10.3 6.7L25 75"/></svg></button>
        <a class="se-cta-head" href="#demo" data-label="Your English button text here"><span class="is-long">Book a free demo</span><span class="is-short">Demo</span>${arrow}</a>
      </div>`;

    // The menu plate image switches to that of the row being hovered (original header-nav__wrapper-links__N)
    head.querySelectorAll(".se-drop").forEach((d) => {
      d.querySelectorAll(".se-drop__link").forEach((a) => a.addEventListener("mouseenter", () => {
        if (innerWidth < 992) return;
        d.querySelectorAll(".se-drop__img").forEach((im, i) => im.classList.toggle("is-on", i === +a.dataset.i));
      }));
    });
    head.querySelector(".se-burger").addEventListener("click", () => document.documentElement.classList.toggle("se-open"));
    // Phone drawer collapse — original openNavigation: height 0 ↔ measured height (.35s ease-in-out)
    // The original also adds active to the panel on press and measures its height even on wide screens (wide-screen panels only have an opacity transition, so the height changes immediately)
    head.querySelectorAll("button.se-nav__btn").forEach((b) => b.addEventListener("click", () => fold(b, document.getElementById(b.getAttribute("aria-controls")))));
  }

  // Original openNavigation·openLinks: opening sets active plus the measured height, closing sets height 0 and then removes active on transitionend
  function fold(btn, panel) {
    const open = !btn.classList.contains("is-active");
    btn.classList.toggle("is-active", open);
    if (!open) {
      panel.style.height = "0px";
      panel.addEventListener("transitionend", () => panel.classList.remove("is-active"), { once: true });
      if (getComputedStyle(panel).transitionDuration === "0s") panel.classList.remove("is-active");
      return;
    }
    panel.classList.add("is-active");
    panel.style.height = "auto";
    const h = panel.clientHeight + "px";
    panel.style.height = "0px";
    setTimeout(() => (panel.style.height = h), 0);
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    const col = (t, links) => `<div><button class="se-foot__btn" type="button">${t}<svg viewBox="0 0 10 12" fill="none" aria-hidden="true"><path d="m2 1 5 5-5 5" stroke="currentColor" stroke-width="1.6"/></svg></button><div class="se-foot__links">${links.map((l) => `<a href="${l[1]}">${l[0]}</a>`).join("")}</div></div>`;
    const spell = (t) => [...t].map((c) => (c === " " ? " " : `<i>${c}</i>`)).join("");
    foot.classList.add("se-foot");
    foot.innerHTML = `
      <div class="se-foot__sheet">
        <div class="se-foot__inner">
          <a class="se-foot__mark" href="index.html" aria-label="Home" data-label="Large brand wordmark (white)">${mark()}</a>
          <div class="se-foot__cols" data-label="Your footer menu name in English here">
            ${col("Solution", [["Sport & Move", "service.html"], ["Team Spirit", "service.html"], ["Impact Goals", "service.html"]])}
            ${col("Challenges", [["Challenge One", "service.html"], ["Challenge Two", "service.html"], ["Challenge Three", "service.html"], ["Challenge Four", "service.html"], ["Challenge Five", "service.html"], ["Challenge Six", "service.html"], ["All Challenges", "service.html"]])}
            ${col("Client stories", [["Client Name 01", "works.html"], ["Client Name 02", "works.html"], ["Client Name 03", "works.html"], ["Client Name 04", "works.html"], ["All Stories", "works.html"]])}
            ${col("Resources", [["About Us", "index.html#about"], ["Journal", "news.html"], ["Impact Guide", "service.html"], ["Latest Story", "article.html"]])}
            <span class="se-lang se-foot__lang">KO ${chev}</span>
          </div>
          <div class="se-foot__row">
            <div><span class="se-foot__label is-wait" data-label="Get the app label">${spell("Get the app")}</span>
              <div class="se-foot__stores"><span class="se-store"><i></i>Store 1</span><span class="se-store"><i></i>Store 2</span></div></div>
            <div><span class="se-foot__label is-wait" data-label="Address Label">${spell("Address")}</span>
              <p class="se-foot__addr">Your company name here<br>Your address first line 00 here<br>00000 City Name</p></div>
            <div class="se-foot__side"><div class="se-foot__social"><i></i><i></i><i></i></div>
              <p>Your linked service badge<br>© 0000 Company name. All rights reserved.</p>
              <p class="se-foot__legal"><a href="#">Terms of service</a><a href="#">Personal information</a><a href="#">Cookie Settings</a></p></div>
          </div>
        </div>
      </div>`;
    // Original openLinks also runs on wide screens — there is no height transition on wide screens, so it jumps from 0 to the measured height
    foot.querySelectorAll(".se-foot__btn").forEach((b) => b.addEventListener("click", () => fold(b, b.nextElementSibling)));

    // Original template_footer: when footer top + 25% of its height passes the screen bottom, label letters drop at .01s intervals, and hide again when it leaves
    const labels = foot.querySelectorAll(".se-foot__label");
    labels.forEach((l) => l.querySelectorAll("i").forEach((s, i) => (s.style.animationDelay = `${i * 0.01}s`)));
    const check = () => {
      const r = foot.getBoundingClientRect(), off = r.height * 0.25, bp = r.top - innerHeight;
      if (reduce) { labels.forEach((l) => l.classList.remove("is-wait")); return; }
      if (bp + off > 0) labels.forEach((l) => { l.classList.add("is-wait"); l.classList.remove("is-drop"); });
      else if (r.top + r.height > 0) labels.forEach((l) => { if (l.classList.contains("is-wait")) { l.classList.remove("is-wait"); l.classList.add("is-drop"); } });
    };
    addEventListener("scroll", check, { passive: true });
    check();
  }

  // Original template_async counter(): adds end value/200 every 200ms. While the section overlaps the screen it is called anew on every scroll so the calls stack and speed up, and it resets to 0 when the section leaves
  SE.count = (el) => {
    const step = () => {
      const v = +el.dataset.value, d = +el.textContent, t = v / 200;
      if (d < v) { el.textContent = Math.ceil(d + t); setTimeout(step, 200); } else el.textContent = v;
    };
    step();
  };
  SE.watchCount = (box, onIn, onOut) => {
    const run = () => {
      const r = box.getBoundingClientRect(), bp = r.top - innerHeight, off = r.height * 0.25;
      if (bp + off > 0) onOut();
      if (bp + off < 0 && bp + off < r.height && r.top + r.height > 0) onIn();
      if (bp + off < 0 && r.top + r.height < 0) onOut();
    };
    addEventListener("scroll", run, { passive: true });
  };
  document.querySelectorAll("[data-count-box]").forEach((box) => {
    const nums = box.querySelectorAll(".se-count");
    if (reduce) return;
    nums.forEach((n) => (n.textContent = "0"));
    SE.watchCount(box, () => nums.forEach(SE.count), () => nums.forEach((n) => (n.textContent = "0")));
  });

  // Post-it numbers (template_text-postit): once fully inside the screen, counts up once with jQuery animate 1.5s swing and writes the decimals at the end
  const postNums = [...document.querySelectorAll(".se-postit__key[data-count]")];
  const postCheck = () => postNums.forEach((n) => {
    if (n.dataset.started) return;
    const r = n.getBoundingClientRect();
    if (r.top >= 0 && r.left >= 0 && r.bottom <= innerHeight && r.right <= innerWidth) {
      n.dataset.started = "1";
      const to = n.dataset.count;
      if (reduce || !window.jQuery) { n.textContent = to; return; }
      jQuery({ c: +n.textContent }).animate({ c: to }, { duration: 1500, easing: "swing", step() { n.textContent = Math.floor(this.c); }, complete() { n.textContent = this.c; } });
    }
  });
  if (postNums.length) { addEventListener("scroll", postCheck, { passive: true }); postCheck(); }

  // AOS 2.3.1 — original template_async: mirror, off on phones (UA), refresh every time from the tenth scroll
  if (window.AOS) {
    AOS.init({ mirror: true, disable: reduce ? true : "mobile" });
    let ref = 0;
    addEventListener("scroll", () => { ref <= 10 ? ref++ : AOS.refresh(); }, { passive: true });
  }

  // slick arrows — original slickPrevCustom/NextCustom: round bordered buttons
  SE.prev = '<button class="se-arrow se-arrow--prev" type="button" aria-label="Previous"><svg viewBox="0 0 12 12" fill="none"><path d="M7.5 2.5 4 6l3.5 3.5" stroke="currentColor" stroke-width="1.4"/></svg></button>';
  SE.next = '<button class="se-arrow se-arrow--next" type="button" aria-label="Next"><svg viewBox="0 0 12 12" fill="none"><path d="M4.5 2.5 8 6 4.5 9.5" stroke="currentColor" stroke-width="1.4"/></svg></button>';

  // Original vanilla-lazyload (threshold 300px) — when a photo slot comes within 300px of the screen, add is-loaded
  const loaded = (ph) => ph.querySelector(".wf-img")?.classList.add("is-loaded");
  const lazy = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { loaded(e.target); lazy.unobserve(e.target); } }), { rootMargin: "300px" });
  document.querySelectorAll(".se-ph").forEach((el) => (reduce || el.classList.contains("is-loaded") ? loaded(el) : lazy.observe(el)));

  document.querySelectorAll("[data-arrow]").forEach((el) => el.insertAdjacentHTML("beforeend", arrow));
  document.querySelectorAll("[data-heart]").forEach((el) => (el.innerHTML = heart));
})();
