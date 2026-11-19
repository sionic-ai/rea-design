// Shared by all pages: draws the header band, phone menu and footer into the placeholders (data-ec), and runs the pop-in decoration when visible (is-decorate), photo parallax, and window open/close.
// The cutout sticker (ec.sticker) draws people and prop shapes as white-outlined silhouettes — shared by the first page, subpages and the footer strip.
(() => {
  const NAV = [
    ["index.html", "First"],
    ["works.html", "Work · People · Stories"],
    ["recruit.html", "Benefits and career"],
    ["recruit.html#environment", "Careers FAQ"],
  ];
  const ARROW = `<svg viewBox="0 0 16 14" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 7h13M8.5 1.5 14 7l-5.5 5.5"/></svg>`;
  const box = (cls = "") => `<span class="ec-box ${cls}">${ARROW}${ARROW}</span>`;
  const EXT = `<svg class="ec-ext" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 1.5H1.5v7h7V6M6 1.5h2.5V4M8.5 1.5 4.5 5.5"/></svg>`;
  const MARK = `<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" stroke-width="4"/><path fill="currentColor" d="M20 9a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm-8 22 8-10 8 10h-5l-3-4-3 4Z"/></svg>`;
  const logo = () => `<a href="index.html" class="ec-logo" aria-label="Logo">${MARK}<b>Institution name – Credit union</b><small>RECRUIT</small></a>`;

  /* ── Cutout sticker: a silhouette instead of a photo. A white outline (paint-order) gives the original’s cut-and-pasted feel ── */
  const P = { suit: "#38333b", skin: "#d6c5b8", paper: "#f4f2ee", hair: "#2a2426", dino: "#b67a52", wall: "#e9e6df", roof: "#3e4a5a", stone: "#8b8b8b", rim: "#2b2b2b", dish: "#f2efe9", food: "#c9a35a", sauce: "#7d5a2a", pig: "#f3b6c2", snout: "#f09aac", cover: "#c98f4a", leaf: "#8fbf75", sun: "#f3d36a", brick: "#cdb8b2", brick2: "#bba29b", glass: "#5e6e80" }; // Not skin: the subject color in the cut-out photo slot — it’s photo content, so it stays when the skin changes
  const SUIT = P.suit, SKIN = P.skin, SHIRT = P.paper;
  const person = (pose, x = 50, skirt = false) => {
    const arms = {
      stand: `<path d="M${x - 22} 74 ${x - 28} 128M${x + 22} 74 ${x + 28} 128"/>`,
      up: `<path d="M${x - 20} 70 ${x - 34} 24M${x + 20} 70 ${x + 34} 24"/>`,
      point: `<path d="M${x - 22} 74 ${x - 28} 128M${x + 20} 70 ${x + 48} 44"/>`,
      walk: `<path d="M${x - 20} 74 ${x - 34} 122M${x + 20} 74 ${x + 30} 120"/>`,
      cross: `<path d="M${x - 22} 78 ${x + 14} 104M${x + 22} 78 ${x - 14} 106"/>`,
    }[pose];
    const legs = pose === "walk" ? `<path d="M${x - 8} 148 ${x - 22} 214M${x + 8} 148 ${x + 22} 212"/>` : `<path d="M${x - 9} 148 ${x - 10} 216M${x + 9} 148 ${x + 10} 216"/>`;
    return `<g stroke-linecap="round">
      <g stroke="${SUIT}" stroke-width="15" fill="none">${legs}</g>
      <g stroke="${SUIT}" stroke-width="15" fill="none">${arms}</g>
      <path fill="${SUIT}" d="M${x - 24} 66Q${x} 58 ${x + 24} 66L${x + 26} ${skirt ? 168 : 150}H${x - 26}Z"/>
      <path fill="${SHIRT}" d="M${x - 7} 62H${x + 7}L${x} 92Z"/>
      <circle cx="${x}" cy="42" r="16" fill="${SKIN}"/>
      <path fill="${P.hair}" d="M${x - 17} 40Q${x - 14} 22 ${x} 22Q${x + 15} 22 ${x + 17} 40Q${x + 8} 30 ${x} 31Q${x - 9} 31 ${x - 17} 40Z"/>
    </g>`;
  };
  const SHAPES = {
    stand: { vb: "0 0 100 230", body: person("stand") },
    up: { vb: "0 0 100 230", body: person("up") },
    point: { vb: "0 0 110 230", body: person("point", 46, true) },
    walk: { vb: "0 0 100 230", body: person("walk") },
    cross: { vb: "0 0 100 230", body: person("cross") },
    pair: { vb: "0 0 180 230", body: person("stand", 52) + person("stand", 128, true) },
    walkpair: { vb: "0 0 200 230", body: person("walk", 56) + person("walk", 140) },
    dino: { vb: "0 0 240 140", body: `<path fill="${P.dino}" d="M22 112c10-30 40-46 74-44 20 1 34-6 44-22 8-14 22-30 46-30 18 0 30 10 32 22 1 8-6 12-14 10-10-2-14 6-16 14-6 26-22 40-44 46l6 34h-16l-8-28c-10 2-20 2-30 0l-6 28H74l2-30c-18-4-34 2-54 0Z"/><circle cx="196" cy="34" r="3" fill="${P.hair}"/>` },
    castle: { vb: "0 0 200 150", body: `<path fill="${P.wall}" d="M30 92h140v50H30Z"/><path fill="${P.roof}" d="M18 96 100 60l82 36Z"/><path fill="${P.wall}" d="M58 50h84v26H58Z"/><path fill="${P.roof}" d="M46 54 100 20l54 34Z"/><path fill="${P.roof}" d="M80 24 100 6l20 18Z"/><path fill="${P.stone}" d="M10 140h180v8H10Z"/>` },
    plate: { vb: "0 0 160 100", body: `<ellipse cx="80" cy="54" rx="76" ry="42" fill="${P.rim}"/><ellipse cx="80" cy="50" rx="62" ry="32" fill="${P.dish}"/><ellipse cx="80" cy="48" rx="40" ry="20" fill="${P.food}"/><path fill="none" stroke="${P.sauce}" stroke-width="3" d="M50 44q30-14 60 2M56 54q26-10 48 0"/>` },
    sign: { vb: "0 0 70 160", body: `<rect x="6" y="4" width="58" height="152" rx="4" fill="${P.paper}"/><circle cx="35" cy="28" r="12" fill="none" style="stroke:var(--kf-ink)" stroke-width="4"/><path style="fill:var(--kf-accent)" d="M28 54h14v90H28Z"/>` },
    bag: { vb: "0 0 160 120", body: `<path fill="none" stroke="${P.hair}" stroke-width="7" d="M52 36q0-26 28-26t28 26"/><rect x="10" y="34" width="140" height="80" rx="10" fill="${P.hair}"/>` },
    pig: { vb: "0 0 150 110", body: `<ellipse cx="72" cy="60" rx="62" ry="42" fill="${P.pig}"/><circle cx="128" cy="58" r="16" fill="${P.snout}"/><path fill="${P.pig}" d="M40 22 52 4l12 20Z"/><path fill="${P.pig}" d="M36 94h14v14H36Zm56 0h14v14H92Z"/>` },
    book: { vb: "0 0 120 150", body: `<rect x="8" y="6" width="104" height="138" rx="6" fill="${P.cover}" transform="rotate(-8 60 75)"/><rect x="26" y="20" width="76" height="50" fill="${P.paper}" transform="rotate(-8 60 75)"/>` },
    photo: { vb: "0 0 140 110", body: `<rect x="4" y="4" width="132" height="102" fill="${P.paper}"/><rect x="14" y="14" width="112" height="70" fill="${P.leaf}"/><circle cx="50" cy="50" r="12" fill="${P.sun}"/>` },
    building: { vb: "0 0 220 200", body: `<path fill="${P.brick}" d="M20 30h150v170H20Z"/><path fill="${P.brick2}" d="M170 50h40v150h-40Z"/>${Array.from({ length: 5 }, (_, r) => Array.from({ length: 4 }, (_, c) => `<rect x="${36 + c * 34}" y="${48 + r * 28}" width="20" height="16" fill="${P.glass}"/>`).join("")).join("")}<path style="fill:var(--kf-accent)" d="M20 170h150v8H20Z"/>` },
  };
  const sticker = (kind, label, { cls = "", style = "" } = {}) => {
    const s = SHAPES[kind];
    return `<span class="ec-sticker ${cls}" style="${style}"><svg viewBox="${s.vb}" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><g stroke-width="10" stroke-linejoin="round" paint-order="stroke" style="stroke:var(--site-edge)">${s.body}</g><g>${s.body}</g></svg>${label ? `<span class="ec-chip">${label}</span>` : ""}</span>`;
  };
  // Three hatch marks — hand-drawn decoration popping beside the title
  const sparkle = (color = "currentColor") => `<svg viewBox="0 0 40 30" fill="none" stroke-width="3" stroke-linecap="round" style="stroke:${color}"><path d="M6 26 2 14M16 22 18 6M26 24 36 12"/></svg>`;
  const ellipse = (color = "var(--kf-accent)") => `<svg viewBox="0 0 200 60" fill="none" stroke-width="3" stroke-linecap="round" style="stroke:${color}"><path d="M178 14C140 2 40 4 14 24c-20 16 30 30 90 28 60-2 96-18 84-34-6-8-30-12-52-12"/></svg>`;

  window.ec = { ARROW, box, sticker, sparkle, ellipse, EXT };
  // On the page <span data-sticker="pair" data-label="…" class="…" style="…"> If it is written only as …, it is converted to an image here
  document.querySelectorAll("[data-sticker]").forEach((el) => {
    el.outerHTML = sticker(el.dataset.sticker, el.dataset.label || "", { cls: el.className, style: el.getAttribute("style") || "" });
  });
  document.querySelectorAll("[data-doodle]").forEach((el) => {
    el.innerHTML = el.dataset.doodle === "ellipse" ? ellipse(el.dataset.color) : sparkle(el.dataset.color);
  });
  document.querySelectorAll("[data-box]").forEach((el) => { el.outerHTML = box(el.dataset.box); });

  /* ── Drawing into placeholders ── */
  const here = location.pathname.split("/").pop() || "index.html";
  const navLinks = NAV.map(([h, t]) => `<a href="${h}" class="ec-nav__link"><span class="u-line">${t}</span></a>`).join("");
  const footCols = `
    <ul>
      <li><a href="index.html" class="ec-foot__link"><span class="u-line">First</span></a></li>
      <li><a href="works.html" class="ec-foot__link"><span class="u-line">Work · People · Stories</span></a>
        <ul><li><a href="detail.html">Senior interview 01</a></li><li><a href="detail.html">Senior interview 02</a></li><li><a href="detail.html">Senior interview 03</a></li><li><a href="works.html#episode">Work episode</a></li></ul></li>
    </ul>
    <ul>
      <li><a href="recruit.html" class="ec-foot__link"><span class="u-line">Benefits and career</span></a></li>
      <li><a href="recruit.html#environment"><span class="u-line">Careers FAQ</span></a></li>
      <li><a href="#"><span class="u-line">This site</span>${EXT}</a></li>
      <li><a href="#"><span class="u-line">Privacy policy</span>${EXT}</a></li>
    </ul>`;
  const cta = `<a href="#" class="ec-cta ec-hover">
      ${sticker("walkpair", "", { cls: "ec-rot2" })}
      <p class="ec-cta__en">ENTRY</p><p class="ec-cta__ja">Apply here</p>
      <p class="ec-cta__copy">Your support notice here, in one line!</p>${box()}
    </a>`;
  const pills = `<div class="ec-foot__pills"><a href="#" class="ec-pill ec-hover">Recruitment guidelines${box("is-red")}</a><a href="#" class="ec-pill ec-hover">Hiring schedule${box("is-red")}</a></div>`;
  const parts = {
    header: `<header class="ec-head" data-slot="header">
        <div class="ec-head__body">
          ${logo()}
          <nav class="ec-nav">${navLinks}<span class="ec-nav__pills"><a href="#" class="ec-nav__pill">Application guidelines</a><a href="#" class="ec-nav__pill">Hiring Schedule</a></span></nav>
          <div class="ec-head__right"><a href="#" class="ec-entry">ENTRY</a><button type="button" class="ec-burger" aria-label="Menu"><i></i><i></i><small>MENU</small></button></div>
        </div>
        <div class="ec-drawer" data-slot="mobile-menu">
          <ul class="ec-drawer__list">
            ${NAV.slice(0, 3).map(([h, t], i) => `<li><a href="${h}">${t}${box()}</a>${i === 1 ? `<ul><li><a href="detail.html">· Senior interview 01</a></li><li><a href="detail.html">· Senior interview 02</a></li><li><a href="detail.html">· Senior interview 03</a></li></ul>` : ""}</li>`).join("")}
            <li><a href="${NAV[3][0]}">${NAV[3][1]}${box()}</a></li>
          </ul>
          <div class="ec-drawer__pills"><a href="#" class="ec-pill">Recruitment guidelines${box("is-red")}</a><a href="#" class="ec-pill">Hiring schedule${box("is-red")}</a></div>
          ${cta}
        </div>
      </header>`,
    footer: `<footer class="ec-foot" data-slot="footer">
        <a href="#top" class="ec-top ec-hover" data-ec-top aria-label="Back to top">${box()}</a>
        <div class="ec-wrap ec-foot__body">
          <div class="ec-foot__nav"><div class="ec-foot__logo">${logo()}</div><div class="ec-foot__cols">${footCols}</div></div>
          <div class="ec-foot__side">${cta}${pills}</div>
        </div>
        <div class="ec-foot__loop" data-slot="footer-loop" data-ec-loop>
          <div class="ec-foot__loop-text" data-ec-loop-text></div>
        </div>
      </footer>`,
  };
  document.querySelectorAll("[data-ec]").forEach((el) => {
    const html = parts[el.dataset.ec];
    if (html) el.outerHTML = html;
  });
  document.querySelectorAll(".ec-nav a").forEach((a) => a.getAttribute("href") === here && a.setAttribute("aria-current", "page"));

  /* ── Footer big text band — flows at 50px/s like the original, pushing background position 100000px over 2000s, with four cutouts riding along ── */
  const loop = document.querySelector("[data-ec-loop]");
  if (loop) {
    const text = loop.querySelector("[data-ec-loop-text]");
    text.innerHTML = `<div class="ec-loop-track">${"<span>RECRUIT BRAND&nbsp;</span>".repeat(6)}</div>`;
    const track = text.firstElementChild;
    requestAnimationFrame(() => track.style.setProperty("--dur", `${(track.scrollWidth / 2 / 50).toFixed(1)}s`));
    const chars = [["up", "Two Staff Cheering", "pair", 8], ["photo", "Flower photo frame", "photo", 30], ["stand", "Staff with open arms", "point", 58], ["dino", "Dinosaur toy", "dino", 78]];
    loop.insertAdjacentHTML("beforeend", chars.map(([, label, kind, left], i) =>
      ec.sticker(kind, label, { cls: i % 2 ? "ec-rot" : "ec-rot2", style: `left:${left}%;width:${kind === "dino" ? 11 : 7}rem;height:${kind === "dino" ? 7 : 10}rem;` })).join(""));
  }

  /* ── Phone Menu ── */
  document.querySelector(".ec-burger")?.addEventListener("click", () => document.documentElement.classList.toggle("is-open"));
  document.querySelector("[data-ec-top]")?.addEventListener("click", (e) => { e.preventDefault(); scrollTo({ top: 0, behavior: "smooth" }); });

  /* ── Once on view — adds is-decorate when it enters, excluding the bottom 20% of the screen ── */
  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add("is-decorate"); io.unobserve(en.target); }
  }), { rootMargin: "0% 0% -20% 0%", threshold: 0 });
  document.querySelectorAll(".js-decorate").forEach((el) => io.observe(el));

  /* ── Window ── */
  const openModal = (id) => {
    const m = document.querySelector(`.ec-modal[data-modal-id="${id}"]`);
    if (!m) return;
    m.classList.add("is-active");
    document.documentElement.classList.add("is-modal");
    m.querySelector("video")?.play().catch(() => {});
  };
  // As in the original, closing pauses the video and rewinds it to the start
  const closeModal = (m) => {
    m.classList.remove("is-active");
    document.documentElement.classList.remove("is-modal");
    const v = m.querySelector("video");
    if (v) { v.pause(); v.currentTime = 0; }
  };
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-modal-open]");
    if (t) { e.preventDefault(); openModal(t.dataset.modalOpen); return; }
    const m = e.target.closest(".ec-modal");
    if (m && (e.target === m || e.target.closest(".ec-modal__close"))) closeModal(m);
  });

  /* ── Photo parallax (-10%, tied to scroll) ── */
  gsap.registerPlugin(ScrollTrigger);
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll("[data-parallax]").forEach((el) => {
      const inner = el.querySelector("[data-parallax-in]");
      if (!inner) return;
      gsap.to(inner, { yPercent: -10, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
    });
  });
})();
