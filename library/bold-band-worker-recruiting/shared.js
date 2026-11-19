// Shared recruiting-site setup: draws the header, drawer, entry strip and footer, then wires up the worker illustrations, tabs, slider, video modal and scroll reveals (original js-fadeRise · js-squeeze · js-maskHorizontal · title shadow push)
// Original values: title x -50 y 50 + shadow 100px -100px → 0, .6s power2.inOut · squeeze 1.4→1 elastic.out(1.5,3) .8s · horizontal mask .8s power3.inOut ·
// fadeRise y 10rem scrub 1.5 · tab 1.04→1 .15s · slider 700ms · drawer .3s ease-in-out.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const DK = (window.DK = {});
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";
  const home = page === "home" ? "" : "index.html";

  // Not skin: a photo-sharing service logo’s own gradient — a brand mark, so it stays as is even when the skin changes.
  const insta = `<svg viewBox="0 0 30 30" aria-hidden="true"><defs><linearGradient id="dk-ig" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#ffc83a"/><stop offset=".5" stop-color="#f0346f"/><stop offset="1" stop-color="#7a3cf0"/></linearGradient></defs><rect x="2" y="2" width="26" height="26" rx="8" fill="none" stroke="url(#dk-ig)" stroke-width="2.6"/><circle cx="15" cy="15" r="5.6" fill="none" stroke="url(#dk-ig)" stroke-width="2.6"/><circle cx="22" cy="8" r="1.7" fill="#f0346f"/></svg>`; // Not skin: same logo color as above
  const ext = `<svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M9 2h5v5M14 2 7 9M12 9.5V14H2V4h4.5"/></svg>`;
  const arrowW = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" style="stroke:var(--kf-on-accent)" stroke-width="2" stroke-linecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;
  DK.icons = { insta, ext, arrowW };

  // Picture color is received by name and resolved into a skin variable — data-worker="green,uniform,point"
  const TONE = { green: "var(--site-green)", yellow: "var(--site-yellow)", blue: "var(--kf-accent)", cream: "var(--site-cream)", uniform: "var(--site-uniform)", white: "var(--kf-surface)", skin: "var(--site-skin)" };
  const tone = (c) => TONE[c] || TONE.green;
  // Worker illustration: a newly drawn person in a hard hat, with the same size and pose as the original illustration (white outline + black line).
  DK.worker = ({ helmet = "green", vest = "green", pose = "stand", skin = "skin" } = {}) => {
    [helmet, vest, skin] = [tone(helmet), tone(vest), tone(skin)];
    const arms = pose === "point"
      ? `<path d="M80 92 L112 66" stroke-width="12" stroke-linecap="round"/><path d="M40 92 L30 128" stroke-width="12" stroke-linecap="round"/>`
      : pose === "light"
        ? `<path d="M40 92 L22 116 L10 104" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/><path d="M80 92 L90 130" stroke-width="12" stroke-linecap="round"/>`
        : `<path d="M40 92 L32 132" stroke-width="12" stroke-linecap="round"/><path d="M80 92 L88 132" stroke-width="12" stroke-linecap="round"/>`;
    const figure = (outline) => `
      <g ${outline ? 'style="stroke:var(--kf-surface);fill:var(--kf-surface)" stroke-width="10" stroke-linejoin="round"' : 'style="stroke:var(--kf-ink)" stroke-width="1.6" stroke-linejoin="round"'}>
        <g ${outline ? "" : 'style="stroke:var(--site-uniform)"'}>${arms}</g>
        <rect x="44" y="132" width="14" height="52" rx="5" ${outline ? "" : 'style="fill:var(--site-uniform)"'}/>
        <rect x="62" y="132" width="14" height="52" rx="5" ${outline ? "" : 'style="fill:var(--site-uniform)"'}/>
        <ellipse cx="50" cy="188" rx="11" ry="6" ${outline ? "" : 'style="fill:var(--site-shoe)"'}/>
        <ellipse cx="70" cy="188" rx="11" ry="6" ${outline ? "" : 'style="fill:var(--site-shoe)"'}/>
        <rect x="38" y="80" width="44" height="58" rx="12" ${outline ? "" : 'style="fill:var(--site-uniform)"'}/>
        ${outline ? "" : `<path d="M42 84 L54 84 L60 110 L66 84 L78 84 L80 132 L40 132 Z" style="fill:${vest}"/><path d="M41 118 H79" style="stroke:var(--site-stripe)" stroke-width="4"/>`}
        <circle cx="60" cy="60" r="18" ${outline ? "" : `style="fill:${skin}"`}/>
        <path d="M40 56 Q42 34 60 34 Q78 34 80 56 Z" ${outline ? "" : `style="fill:${helmet}"`}/>
        <path d="M36 56 H84" ${outline ? "" : 'stroke-width="3"'}/>
        ${outline ? "" : '<circle cx="54" cy="64" r="1.6" style="fill:var(--kf-ink);stroke:none"/><circle cx="66" cy="64" r="1.6" style="fill:var(--kf-ink);stroke:none"/><path d="M55 71 Q60 74 65 71" fill="none"/>'}
      </g>`;
    return `<svg class="dk-illust" viewBox="0 0 120 200" aria-hidden="true">${figure(true)}${figure(false)}</svg>`;
  };
  DK.face = ({ helmet = "green", bg = "yellow", hair = false } = {}) => `<svg class="dk-illust" viewBox="0 0 80 80" aria-hidden="true">
      <circle cx="40" cy="40" r="39" style="fill:${tone(bg)};stroke:var(--kf-ink)" stroke-width="1.2"/>
      <path d="M22 80 Q24 58 40 58 Q56 58 58 80" style="fill:var(--site-uniform);stroke:var(--kf-ink)" stroke-width="1.2"/>
      <circle cx="40" cy="40" r="14" style="fill:var(--site-skin);stroke:var(--kf-ink)" stroke-width="1.2"/>
      ${hair ? '<path d="M26 38 Q28 24 40 24 Q52 24 54 38 Q46 30 40 32 Q32 30 26 38Z" style="fill:var(--kf-ink)"/>' : `<path d="M25 37 Q27 22 40 22 Q53 22 55 37 Z" style="fill:${tone(helmet)};stroke:var(--kf-ink)" stroke-width="1.2"/>`}
      <circle cx="35" cy="42" r="1.4" style="fill:var(--kf-ink)"/><circle cx="45" cy="42" r="1.4" style="fill:var(--kf-ink)"/></svg>`;
  document.querySelectorAll("[data-worker]").forEach((el) => {
    const [helmet, vest, pose] = el.dataset.worker.split(",");
    el.innerHTML = DK.worker({ helmet, vest, pose });
  });
  document.querySelectorAll("[data-face]").forEach((el) => {
    const [helmet, bg, hair] = el.dataset.face.split(",");
    el.innerHTML = DK.face({ helmet, bg, hair: hair === "hair" });
  });

  const menu = [
    [`${home}#work`, "Menu 1 · Learn the work", [["index.html#work", "Role 1"], ["index.html#work", "Role 2"], ["index.html#work", "Role 3"]]],
    [`${home}#interview`, "Menu 2 Staff interviews", [["interview.html", "0000 Hire, Role 1"], ["interview.html", "0000 Hire, Role 2"], ["interview.html", "0000 Hire, Role 3"], ["interview.html", "0000 Hire, Role 1"]]],
    [`${home}#special`, "Menu 3 Special", [["index.html#special", "Roundtable"], ["index.html#special", "Project story"]]],
    [`${home}#education`, "Menu 4 Education · Growth", []],
    [`${home}#welfare`, "Menu 5 welfare and sustainability", []],
    [`${home}#message`, "Menu 6 Message", []],
  ];

  const header = document.querySelector('[data-slot="header"]');
  if (header) {
    header.classList.add("dk-header");
    header.innerHTML = `
      <div class="dk-header-inner">
        <a class="dk-logo" href="index.html">COMPANY Recruit</a>
        <nav class="dk-nav" aria-label="Main menu" data-slot="menu-drawer">
          <ul>${menu.map(([h, t]) => `<li class="dk-nav-item"><a href="${h}">${t}</a></li>`).join("")}</ul>
          <a class="dk-btn is-max is-white is-insta" href="#">SNS updating</a>
          <a class="dk-btn is-max" href="recruit.html">Recruitment guidelines · Entry</a>
          <a class="dk-nav-corp" href="topics.html">Corporate site ${ext}</a>
        </nav>
        <div class="dk-actions">
          <a class="dk-hlink is-insta" href="#">SNS updating${insta}</a>
          <a class="dk-hlink is-entry" href="recruit.html">Entry</a>
          <a class="dk-insta-sp" href="#" aria-label="SNS">${insta}</a>
          <button class="dk-menu-btn" type="button" aria-label="Open Menu" aria-expanded="false"><span class="dk-menu-bar"></span><span class="dk-menu-bar"></span></button>
        </div>
      </div>`;
    const btn = header.querySelector(".dk-menu-btn");
    const set = (on) => {
      document.body.classList.toggle("is-gnav", on);
      btn.setAttribute("aria-expanded", String(on));
      btn.setAttribute("aria-label", on ? "Close Menu" : "Open Menu");
    };
    btn.addEventListener("click", () => set(!document.body.classList.contains("is-gnav")));
    header.querySelectorAll(".dk-nav a").forEach((a) => a.addEventListener("click", () => set(false)));
  }

  const entry = document.querySelector('[data-slot="entry"]');
  if (entry) {
    entry.classList.add("dk-entry");
    entry.id = "entry";
    entry.innerHTML = `
      <div class="dk-wrap">
        <p class="dk-entry-label">Application guide · How to apply</p>
        <h2 class="dk-entry-title dk-stroke dk-shadow-in">ENTRY</h2>
        <div class="dk-entry-cols">
          <div class="dk-entry-col"><a class="dk-btn" href="recruit.html">Internship</a></div>
          <div class="dk-entry-col"><a class="dk-btn" href="recruit.html">New Grad Hiring</a></div>
          <div class="dk-entry-col"><a class="dk-btn" href="recruit.html">Experienced hiring</a></div>
        </div>
      </div>`;
  }

  const footer = document.querySelector('[data-slot="footer"]');
  if (footer) {
    footer.classList.add("dk-footer");
    footer.innerHTML = `
      <div class="dk-wrap dk-footer-inner">
        <div><p class="dk-footer-logo">COMPANY<br>NAME<br>Recruit</p><span class="dk-footer-name">Your company name here</span></div>
        <div class="dk-footer-nav">
          ${[[menu[0], menu[3], menu[4], menu[5]], [menu[1]], [menu[2]]].map((col) => `<ul>${col.map(([h, t, kids]) =>
            `<li><a class="dk-footer-ttl" href="${h}">${t.replace(/^Menu \d /, "")}</a>${kids.map(([kh, kt]) => `<a class="dk-footer-sub" href="${kh}">${kt}</a>`).join("")}</li>`).join("")}</ul>`).join("")}
        </div>
        <div class="dk-footer-side">
          <a class="dk-btn" href="recruit.html">Recruitment guidelines · Entry</a>
          <a class="dk-footer-corp" href="topics.html">Corporate site ${ext}</a>
        </div>
      </div>`;
  }

  // Tabs: the changed panel goes 1.04→1, .15s
  document.querySelectorAll("[data-tabs]").forEach((box) => {
    const triggers = [...box.querySelectorAll("[data-tab]")], panels = [...box.querySelectorAll("[data-panel]")];
    triggers.forEach((t, i) => t.addEventListener("click", () => {
      if (t.classList.contains("is-current")) return;
      triggers.forEach((x) => x.classList.toggle("is-current", x === t));
      panels.forEach((p, k) => p.classList.toggle("is-open", k === i));
      // The original raises opacity up to 10 — fully on in the first 1/10 of .15s, only the size shrinks over the full .15s
      if (!reduced) gsap.fromTo(panels[i], { opacity: 0, scale: 1.04 }, { opacity: 10, scale: 1, duration: 0.15 });
    }));
  });

  // Slider: same Swiper 12.2.0 as the original, same settings (loop, 700ms, drag to flip, slide count and gap change at width 768)
  const SW = {
    special: { slidesPerView: 1, spaceBetween: 50 },
    welfare: { slidesPerView: 1.2, spaceBetween: 20, centeredSlides: true, breakpoints: { 768: { centeredSlides: false, slidesPerView: 3, spaceBetween: 60 } } },
    future: { slidesPerView: 1.3, spaceBetween: 30, centeredSlides: true, breakpoints: { 768: { centeredSlides: false, slidesPerView: 3.5, spaceBetween: 60 } } },
  };
  document.querySelectorAll("[data-slider]").forEach((box) => {
    const track = box.querySelector(".dk-slider-track");
    const view = track.parentElement;
    const conf = SW[box.dataset.slider] || SW.special;
    box.querySelectorAll("[data-prev], [data-next]").forEach((b) => b.innerHTML || (b.innerHTML = arrowW));
    view.classList.add("swiper");
    track.classList.add("swiper-wrapper");
    // loop needs about twice the number of cells visible on one screen to avoid breaking — the original has plenty of text, placeholders add one more set of the same cells
    const most = Math.ceil(Math.max(conf.slidesPerView, ...Object.values(conf.breakpoints || {}).map((b) => b.slidesPerView || 0)));
    if (track.children.length < most * 2 + 1) [...track.children].forEach((s) => track.append(s.cloneNode(true)));
    [...track.children].forEach((s) => s.classList.add("swiper-slide"));
    const frac = box.querySelector("[data-frac]");
    if (!window.Swiper) return;
    new Swiper(view, {
      loop: true, speed: 700, allowTouchMove: true, ...conf,
      navigation: box.querySelector("[data-next]") ? { nextEl: box.querySelector("[data-next]"), prevEl: box.querySelector("[data-prev]") } : false,
      pagination: frac ? { el: frac, type: "fraction", renderFraction: (c, t) => `<span class="${c}"></span> / <span class="${t}"></span>` } : false,
    });
  });

  // Video thumbnails open with modal-video like the original (original youtube rel 0 · autoplay 0 · controls 0, mp4 as custom) — blank placeholder URL instead of the original video
  document.querySelectorAll("[data-video]").forEach((v) => { v.setAttribute("data-channel", "custom"); v.setAttribute("data-video-url", "about:blank"); });
  if (window.ModalVideo && document.querySelector("[data-video]")) new ModalVideo("[data-video]", { channel: "custom", animationSpeed: 300 });
  addEventListener("keydown", (e) => e.key === "Escape" && document.body.classList.remove("is-gnav"));

  // Flowing photo rows (education section): even rows go left, odd rows go right, length = width/48 sec (min 8 sec)
  document.querySelectorAll("[data-marquee-line]").forEach((line, idx) => {
    const content = line.firstElementChild;
    line.append(content.cloneNode(true), content.cloneNode(true));
    if (reduced) return;
    const w = content.offsetWidth + parseFloat(getComputedStyle(line).columnGap || 0);
    const dir = idx % 2 === 0 ? -1 : 1;
    gsap.fromTo(line, { x: dir < 0 ? 0 : -w }, { x: dir < 0 ? -w : 0, duration: Math.max(8, w / 48), ease: "none", repeat: -1 });
  });

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Big title: enters from the bottom left dragging a black shadow, then settles in place
    gsap.utils.toArray(".dk-shadow-in").forEach((el) => {
      gsap.set(el, { opacity: 0, x: -50, y: 50, textShadow: "100px -100px 0 rgba(0,0,0,1)" });
      ScrollTrigger.create({
        trigger: el, start: "0% 80%",
        onEnter: () => gsap.fromTo(el, { opacity: 0, x: -50, y: 50, textShadow: "100px -100px 0 rgba(0,0,0,1)" },
          { opacity: 1, x: 0, y: 0, textShadow: "0px 0px 0px rgba(0,0,0,1)", duration: 0.6, ease: "power2.inOut" }),
      });
    });
    gsap.utils.toArray(".js-fadeRise").forEach((el) => {
      gsap.fromTo(el, { opacity: 0, y: "10rem" }, { opacity: 1, y: 0, scrollTrigger: { trigger: el, start: "0% 100%", end: "0% 80%", scrub: 1.5 } });
    });
    gsap.utils.toArray(".js-squeeze").forEach((el) => {
      gsap.set(el, { opacity: 0, scale: 1.2 });
      ScrollTrigger.create({
        trigger: el, start: "0% 80%",
        onEnter: () => gsap.fromTo(el, { opacity: 0, scale: 1.4 }, { opacity: 1, scale: 1, duration: 0.8, ease: "elastic.out(1.5, 3)" }),
      });
    });
    gsap.utils.toArray(".js-maskHorizontal").forEach((el) => {
      gsap.set(el, { clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)" });
      ScrollTrigger.create({
        trigger: el, start: "0% 100%",
        onEnter: () => gsap.fromTo(el, { clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)" }, { clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)", duration: 0.8, ease: "power3.inOut" }),
        onLeaveBack: () => gsap.to(el, { clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)", duration: 0.8, ease: "power3.inOut" }),
      });
    });
  });
})();
