// Shared by all pages: a factory that redraws characters, logo, star badge and brush-stroke art as SVG, plus nav, online shop badge and footer rendering,
// Original three triggers data-trigger-once / data-trigger-loop / data-trigger-parallax, and a character walking along the footer floor.
// Original value: once = top bottom → top 75% (is-once-show after passing) · loop = Only while visible, is-loop-show + --loop-amount(progress*.5)
// Footer walk speeds cs104·qubo224·k2 146·jed82·rcb132·dabby95 px/s, slowed to at most .6x below 1248px, jump .55s.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";
  const BB = (window.BB = { reduced, page });

  // ---------- Character: SVG of the same proportion instead of the original sprite (492×414, front · back · right · left) ----------
  const S = "var(--site-black)";
  const SKIN = "var(--site-c-skin)";
  const wear = {
    cs: { shirt: "var(--site-blue-61)", pants: "var(--site-blue-38b)" },
    qubo: { shirt: "var(--site-gray-66)", pants: "var(--kf-raised)" },
    k2: { shirt: "var(--kf-ink-soft)", pants: "var(--site-violet-65)" },
    rcb: { shirt: "var(--site-green-53)", pants: "var(--site-green-37)" },
    jed: { shirt: "var(--site-red-50)", pants: "var(--kf-surface)" },
    dabby: { shirt: "var(--site-orange-63)", pants: "var(--site-orange-38)" },
  };
  const hats = {
    cs: `<path d="M130 150c4-80 60-118 116-118s112 38 116 118z" fill="var(--site-blue-61)" stroke="${S}" stroke-width="8"/>
         <path d="M118 150h256c8 0 8 22-2 22H120c-10 0-10-22-2-22z" fill="var(--site-blue-38b)" stroke="${S}" stroke-width="8"/>
         <rect x="176" y="70" width="60" height="34" rx="14" fill="var(--site-gray-7)" stroke="${S}" stroke-width="6"/><rect x="256" y="70" width="60" height="34" rx="14" fill="var(--site-gray-7)" stroke="${S}" stroke-width="6"/><path d="M236 86h20" stroke="${S}" stroke-width="6"/>`,
    qubo: `<path d="M124 196c-6-86 32-146 122-146s128 60 122 146c-36-22-76-32-122-32s-86 10-122 32z" fill="var(--site-gray-66)" stroke="${S}" stroke-width="8" stroke-linejoin="round"/>
           <path d="M140 110 120 30l70 50zM352 110l20-80-70 50z" fill="var(--site-gray-66)" stroke="${S}" stroke-width="8" stroke-linejoin="round"/>`,
    k2: `<path d="M196 92c-16-40-6-70 14-80 4 30 10 54 22 78zM246 84c-6-44 6-70 22-80 6 28 4 56-6 82zM296 92c16-40 6-70-14-80-4 30-10 54-22 78z" fill="var(--site-rose-75)" stroke="${S}" stroke-width="7" stroke-linejoin="round"/>
         <path d="M176 104h140l-10 28H186z" fill="var(--kf-accent)" stroke="${S}" stroke-width="7" stroke-linejoin="round"/>`,
    rcb: `<path d="M132 150c4-78 58-116 114-116s110 38 114 116z" fill="var(--site-c-red)" stroke="${S}" stroke-width="8"/>
          <path d="M196 150c0-44 22-80 50-92 28 12 50 48 50 92z" fill="var(--kf-ink)" stroke="${S}" stroke-width="6"/>
          <path d="M240 150h168c8 0 6 20-4 20H236z" fill="var(--site-red-48)" stroke="${S}" stroke-width="8"/>`,
    jed: `<path d="M128 156c0-80 52-124 118-124s118 44 118 124z" fill="var(--kf-surface)" stroke="${S}" stroke-width="8"/>
          <rect x="120" y="140" width="252" height="36" rx="16" fill="var(--site-gray-20)" stroke="${S}" stroke-width="8"/>`,
    dabby: `<path d="M118 250c-14-120 30-200 128-200s142 80 128 200l-34-10c6-60-10-100-30-120-30 30-90 40-150 30-10 30-12 60-8 100z" fill="var(--site-gray-7)" stroke="${S}" stroke-width="8" stroke-linejoin="round"/>`,
  };
  const extras = {
    qubo: `<g class="c-chara__eyes-cover"><rect x="168" y="186" width="70" height="40" rx="16" fill="var(--site-gray-7)" stroke="${S}" stroke-width="6"/><rect x="254" y="186" width="70" height="40" rx="16" fill="var(--site-gray-7)" stroke="${S}" stroke-width="6"/><path d="M238 204h16" stroke="${S}" stroke-width="6"/></g>`,
    dabby: `<g class="c-chara__eyes-cover" fill="none" stroke="${S}" stroke-width="6"><circle cx="206" cy="210" r="30"/><circle cx="288" cy="210" r="30"/><path d="M236 210h22"/></g>`,
  };
  const board = `<g><rect x="150" y="392" width="192" height="14" rx="7" fill="var(--site-yellow-78)" stroke="${S}" stroke-width="6"/><circle cx="182" cy="410" r="6" fill="var(--site-gray-7)"/><circle cx="310" cy="410" r="6" fill="var(--site-gray-7)"/></g>`;
  const charaSVG = (id) => {
    const w = wear[id] || wear.cs;
    const stripes = id === "jed" ? `<path d="M196 330h100M192 352h108M192 374h108" stroke="var(--site-gray-7)" stroke-width="8"/>` : "";
    return `<svg class="c-chara__svg" viewBox="0 0 492 414" aria-hidden="true">
      <g class="c-chara__body">
        <ellipse cx="214" cy="398" rx="26" ry="12" fill="var(--site-gray-7)"/><ellipse cx="278" cy="398" rx="26" ry="12" fill="var(--site-gray-7)"/>
        <path d="M192 372h108v20H192z" fill="${w.pants}" stroke="${S}" stroke-width="7"/>
        <rect x="184" y="296" width="124" height="86" rx="34" fill="${w.shirt}" stroke="${S}" stroke-width="8"/>${stripes}
        <path d="M184 320c-24 8-36 30-34 52M308 320c24 8 36 30 34 52" fill="none" stroke="${S}" stroke-width="8" stroke-linecap="round"/>
        <ellipse cx="246" cy="196" rx="124" ry="118" fill="${SKIN}" stroke="${S}" stroke-width="8"/>
        <ellipse class="c-chara__ear" cx="122" cy="214" rx="18" ry="26" fill="${SKIN}" stroke="${S}" stroke-width="7"/>
        <ellipse class="c-chara__ear" cx="370" cy="214" rx="18" ry="26" fill="${SKIN}" stroke="${S}" stroke-width="7"/>
      </g>
      <g class="c-chara__face">
        <g class="c-chara__eyes">
          <ellipse cx="206" cy="210" rx="28" ry="20" fill="var(--kf-ink)" stroke="${S}" stroke-width="6"/><circle cx="210" cy="216" r="11" fill="var(--site-gray-7)"/>
          <ellipse cx="288" cy="210" rx="28" ry="20" fill="var(--kf-ink)" stroke="${S}" stroke-width="6"/><circle cx="292" cy="216" r="11" fill="var(--site-gray-7)"/>
          <path d="M176 202h60M258 202h60" stroke="${S}" stroke-width="8" stroke-linecap="round"/>
        </g>
        ${extras[id] || ""}
        <path class="c-chara__mouth" d="M226 262c12 10 28 10 40 0" fill="none" stroke="${S}" stroke-width="7" stroke-linecap="round"/>
        <ellipse cx="176" cy="250" rx="16" ry="9" fill="var(--site-rose-78)" opacity=".6"/><ellipse cx="316" cy="250" rx="16" ry="9" fill="var(--site-rose-78)" opacity=".6"/>
      </g>
      <g class="c-chara__hat">${hats[id] || ""}</g>
      ${id === "qubo" ? board : ""}
    </svg>`;
  };
  BB.chara = (id, dir = "front") =>
    `<span class="c-chara" data-character-id="${id}" data-direction="${dir}" role="img" aria-label="Character ${id} Slot · Round-headed kid illustration">${charaSVG(id)}</span>`;
  BB.ids = ["cs", "qubo", "k2", "rcb", "jed", "dabby"];

  // Instead of the original logo graphic, a speech-bubble text placeholder with the same ratio (868×603)
  const lc = ["var(--site-c-cyan)", "var(--kf-accent)", "var(--site-c-pink)", "var(--site-c-green)", "var(--site-c-red)", "var(--site-c-blue)", "var(--site-c-purple)"];
  const word = (txt, y, size, rot, off = 0) =>
    [...txt].map((ch, i) => `<text x="${110 + off + i * size * 0.78}" y="${y}" transform="rotate(${((i % 3) - 1) * 6 + rot} ${110 + off + i * size * 0.78} ${y})" fill="${lc[(i + off) % lc.length]}">${ch}</text>`).join("");
  BB.logo = () => `<svg class="bb-logo" viewBox="0 0 868 603" role="img" aria-label="Wordmark slot">
    <g font-family="Luckiest Guy, cursive" stroke="var(--site-black)" stroke-width="16" paint-order="stroke" stroke-linejoin="round">
      <g font-size="190">${word("WORD", 220, 190, -8, 60)}</g>
      <g font-size="150">${word("MARK", 380, 150, 4, 170)}</g>
      <g font-size="170">${word("LOGO", 560, 170, -4, 40)}</g>
    </g></svg>`;

  // Brush stain — seeded so the same shape comes out every time
  const rnd = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  BB.splash = (seed, fill, w = 500, h = 200) => {
    const r = rnd(seed);
    const n = 18;
    const pts = Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      const k = 0.78 + r() * 0.3;
      return [w / 2 + Math.cos(a) * (w / 2) * k, h / 2 + Math.sin(a) * (h / 2) * k];
    });
    const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("") + "Z";
    const drips = Array.from({ length: 4 }, () => {
      const x = w * (0.2 + r() * 0.6);
      const len = h * (0.15 + r() * 0.3);
      return `<path d="M${x} ${h * 0.8}v${len}" stroke="${fill}" stroke-width="${6 + r() * 6}" stroke-linecap="round"/>`;
    }).join("");
    return `<svg viewBox="0 0 ${w} ${h * 1.3}" preserveAspectRatio="none" aria-hidden="true"><path d="${d}" fill="${fill}" stroke="var(--site-black)" stroke-width="5" stroke-linejoin="round"/>${drips}</svg>`;
  };

  const burst = (fill) => {
    const pts = Array.from({ length: 32 }, (_, i) => {
      const a = (i / 32) * Math.PI * 2;
      const rr = i % 2 ? 84 : 100;
      return `${(102 + Math.cos(a) * rr).toFixed(1)},${(102 + Math.sin(a) * rr).toFixed(1)}`;
    }).join(" ");
    return `<svg viewBox="0 0 204 204" aria-hidden="true"><polygon points="${pts}" fill="${fill}" stroke="var(--site-black)" stroke-width="5" stroke-linejoin="round"/></svg>`;
  };
  BB.burst = burst;
  BB.arrow = '<svg viewBox="0 0 60 60" aria-hidden="true"><path d="M14 46 44 16M22 14h22v22" fill="none" stroke="var(--kf-ink)" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" paint-order="stroke"/><path d="M14 46 44 16M22 14h22v22" fill="none" stroke="var(--site-black)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="0"/></svg>';

  document.querySelectorAll("[data-chara-slot]").forEach((el) => (el.outerHTML = BB.chara(el.dataset.charaSlot, el.dataset.dir || "front")));
  document.querySelectorAll("[data-logo-slot]").forEach((el) => (el.outerHTML = BB.logo()));

  // ---------- Nav + online shop badge ----------
  const navBg = (c, seed) => `<span class="l-navi-item-bg">${BB.splash(seed, c, 220, 50)}</span>`;
  const nav = document.querySelector('[data-slot="header"]');
  if (nav) {
    nav.classList.add("l-navi");
    nav.innerHTML = `
      <ul class="l-navi-list">
        <li class="l-navi-item"><a href="index.html#about" class="l-navi-item-link">${navBg("var(--kf-accent)", 7)}<span class="l-navi-item-txt">ABOUT</span></a></li>
        <li class="l-navi-item"><a href="index.html#characters" class="l-navi-item-link">${navBg("var(--kf-accent-soft)", 11)}<span class="l-navi-item-txt">MENU 2</span></a></li>
        <li class="l-navi-item"><a href="news.html" class="l-navi-item-link">${navBg("var(--site-c-teal)", 19)}<span class="l-navi-item-txt">NEWS</span></a></li>
      </ul>
      <p class="l-navi-online" data-slot="shop-badge">
        <a href="#" class="l-navi-online-link" aria-label="Online Shop (new tab)">
          <span class="l-navi-online-bg">${burst("var(--site-c-red)")}</span>
          <span class="l-navi-online-inline"><i class="l-navi-online-icon">${BB.arrow}</i><span class="l-navi-online-txt">ONLINE<br>SHOP</span></span>
        </a>
      </p>`;
  }

  // Sub pages only: fixed logo at top left (original .l-header-logo, hidden on phone)
  if (page !== "home") {
    document.body.insertAdjacentHTML("afterbegin", `<header class="l-header" data-slot="sub-header"><p class="l-header-logo"><a href="index.html" aria-label="Home">${BB.logo()}</a></p></header>`);
  }

  // ---------- Footer ----------
  const sns = {
    x: '<svg viewBox="0 0 24 24"><path d="M4 4l16 16M20 4 4 20" stroke="var(--site-black)" stroke-width="2.6" stroke-linecap="round"/></svg>',
    ig: '<svg viewBox="0 0 24 24" fill="none" stroke="var(--site-black)" stroke-width="2.4"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/></svg>',
    yt: '<svg viewBox="0 0 24 24"><rect x="2.5" y="5.5" width="19" height="13" rx="4" fill="var(--site-c-red)"/><path d="M10 9l5 3-5 3z" fill="var(--kf-ink)"/></svg>',
  };
  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("l-footer");
    foot.innerHTML = `
      <p class="l-footer-logo"><a href="index.html">${BB.logo()}</a></p>
      <div class="l-footer-inner">
        <div class="l-footer-sns">
          <p class="l-footer-sns-ttl">Follow us!</p>
          <div class="l-footer-sns-icon">${BB.splash(5, "var(--kf-accent)", 44, 44)}</div>
          <ul class="l-footer-sns-list">
            ${["x", "ig", "yt"].map((k) => `<li><a href="#" class="l-footer-sns-link" aria-label="SNS ${k}"><span class="l-footer-sns-btn">${sns[k]}</span></a></li>`).join("")}
          </ul>
        </div>
        <div class="l-footer-info">
          <a href="#" class="l-footer-links-link"><span>Privacy Policy</span><i class="l-footer-links-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.6 18.3 15 6.9H8.2V4.2h11.4v11.4h-2.7V8.8L5.5 20.2z" fill="currentColor"/></svg></i></a>
          <p class="l-footer-copy" data-label="Your company English name here">© Name, Inc.</p>
        </div>
      </div>
      ${BB.ids.map((id) => `<figure class="l-footer-chara" data-chara="${id}" aria-hidden="true">${BB.chara(id, id === "qubo" ? "front" : "right")}</figure>`).join("")}`;
  }

  // Placeholder links (#) must not jump to the top
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href="#"]');
    if (a) e.preventDefault();
  });

  // ---------- Three triggers ----------
  const mm = gsap.matchMedia();
  BB.mm = mm;
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll("[data-trigger-once]").forEach((el) => {
      const start = el.dataset.triggerOnceStart || "bottom";
      const end = el.dataset.triggerOnceEnd || "75%";
      ScrollTrigger.create({ trigger: el, start: `top ${start}`, end: `top ${end}`, onLeave: () => el.classList.add("is-once-show") });
    });
    document.querySelectorAll("[data-trigger-loop]").forEach((el) => {
      const set = gsap.quickSetter(el, "--loop-amount");
      set(0);
      ScrollTrigger.create({
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        onToggle: (st) => el.classList.toggle("is-loop-show", st.isActive),
        onUpdate: (st) => set(Math.round(st.progress * 0.5 * 1e4) / 1e4),
      });
    });
  });
  if (reduced) document.querySelectorAll("[data-trigger-once]").forEach((el) => el.classList.add("is-once-show"));

  // ---------- Character walking along the footer floor ----------
  const walkers = [...document.querySelectorAll(".l-footer-chara")];
  if (foot && walkers.length && !reduced) {
    const cfg = { cs: [104, 10, 4.2, 4], qubo: [224, 1, 2.2, 1.5], k2: [146, 9, 4.8, 5], jed: [82, 11, 3.9, 4], rcb: [132, 8, 4.4, 3.5], dabby: [95, 12, 3.8, 4.5] };
    const rand = (a, b) => a + Math.random() * (b - a);
    let list = [];
    const setup = () => {
      const W = foot.clientWidth;
      let acc = 0;
      list = walkers.sort(() => Math.random() - 0.5).map((el) => {
        const w = el.offsetWidth;
        acc += rand(W * 0.005, W * 0.01) + w;
        const it = { el, w, x: -acc, phase: rand(0, Math.PI * 2), c: cfg[el.dataset.chara] || cfg.cs };
        const ch = el.querySelector(".c-chara");
        el.onclick = () => {
          if (ch.classList.contains("is-jumping")) return;
          setTimeout(() => { ch.classList.add("is-jumping"); setTimeout(() => ch.classList.remove("is-jumping"), 700); }, 10);
        };
        return it;
      });
    };
    let raf = null;
    let last = 0;
    const tick = (t) => {
      if (!last) last = t;
      const dt = (t - last) / 1000;
      last = t;
      const W = foot.clientWidth;
      list.forEach((it) => {
        const sp = it.c[0] * Math.min(Math.max(W / 1248, 0.6), 1);
        it.x += sp * dt;
        it.phase += it.c[2] * dt;
        if (it.x > W + it.w) it.x = -it.w - rand(0, 96);
        const y = it.c[1] <= 1 ? Math.sin(it.phase) * it.c[1] : -Math.abs(Math.sin(it.phase)) * it.c[1];
        const r = Math.sin(it.phase) * it.c[3];
        it.el.style.setProperty("--footer-chara-x", `${it.x}px`);
        it.el.style.setProperty("--footer-chara-y", `${y}px`);
        it.el.style.setProperty("--footer-chara-rotate", `${r}deg`);
      });
      raf = requestAnimationFrame(tick);
    };
    setup();
    addEventListener("resize", setup);
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !raf) { last = 0; raf = requestAnimationFrame(tick); }
      else if (!e.isIntersecting && raf) { cancelAnimationFrame(raf); raf = null; }
    }, { threshold: 0.05 }).observe(foot);
  }
})();
