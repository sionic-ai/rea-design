// Draws cut-out shadow figures (tree · leaf · deer · monkey · rabbit · bear), large ink letters and a folk-toy ox as SVG, common to all pages, and
// Fills the header, paper menu and footer, and hooks up the torn edge, stepped entrance, photo reveal and header logo vanish.
// Original values: entrance steps(2,end) 1.5s · trigger top 90% · photo reveal top center once · menu open 1s/close .75s ·
// Anchor move 1s curve M0,0 C0.44,0.05 0.17,1 1,1 · on pages outside the Hero, the header logo disappears after scrolling down 1/3 of the screen.
(() => {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  const EASE = CustomEase.create("sdTransform", "M0,0 C0.44,0.05 0.17,1 1,1");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";
  document.body.classList.add(`is-${page}`);
  const SD = (window.SD = { reduced, page, EASE });

  // Use a seeded random so the torn edge doesn’t change on every refresh
  const seeded = (s) => () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  SD.seeded = seeded;

  // Fern and palm leaves: a path with small leaves attached alternately along the stem
  const frond = ({ len = 400, n = 26, leaf = 70, width = 17, bend = 40, seed = 3 }) => {
    const r = seeded(seed);
    const pt = (t) => {
      const x = 100 + bend * Math.sin(t * Math.PI * 0.9);
      return [x, len - t * len];
    };
    let d = `M98 ${len} L102 ${len} L${100 + bend * 0.2 + 1.5} 0 L${100 + bend * 0.2 - 1.5} 0Z`;
    for (let i = 1; i < n; i++) {
      const t = i / n;
      const [bx, by] = pt(t);
      const [nx, ny] = pt(Math.min(1, t + 0.01));
      const ang = Math.atan2(ny - by, nx - bx);
      const size = leaf * Math.sin(Math.PI * (0.12 + t * 0.85)) * (0.85 + r() * 0.3);
      for (const side of [-1, 1]) {
        const a = ang + side * (0.95 + r() * 0.25);
        const tx = bx + Math.cos(a) * size, ty = by + Math.sin(a) * size;
        const px = Math.cos(a + Math.PI / 2) * width, py = Math.sin(a + Math.PI / 2) * width;
        const mx = (bx + tx) / 2, my = (by + ty) / 2;
        d += `M${bx.toFixed(1)} ${by.toFixed(1)}Q${(mx + px).toFixed(1)} ${(my + py).toFixed(1)} ${tx.toFixed(1)} ${ty.toFixed(1)}Q${(mx - px * 0.4).toFixed(1)} ${(my - py * 0.4).toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}Z`;
      }
    }
    return d;
  };

  const ink = "var(--site-ink-dark)";
  const defs = `
  <svg class="sd-defs" aria-hidden="true" focusable="false">
    <filter id="sd-rough" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="3" seed="2" result="w"/>
      <feDisplacementMap in="SourceGraphic" in2="w" scale="9" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <filter id="sd-stamp" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency=".03" numOctaves="3" seed="5" result="w"/>
      <feDisplacementMap in="SourceGraphic" in2="w" scale="18" xChannelSelector="R" yChannelSelector="G" result="d"/>
      <feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="2" seed="8" result="s"/>
      <feColorMatrix in="s" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -4 0 0 0 3.1" result="holes"/>
      <feComposite in="d" in2="holes" operator="in"/>
    </filter>
    <symbol id="sd-fern" viewBox="0 0 200 400"><path d="${frond({})}"/></symbol>
    <symbol id="sd-palm" viewBox="0 0 200 400"><path d="${frond({ n: 15, leaf: 150, width: 22, bend: 60, seed: 11 })}"/></symbol>
    <symbol id="sd-tree" viewBox="0 0 200 260"><g filter="url(#sd-rough)">
      <path d="M90 260 94 172Q78 152 56 142l4-6q22 9 36 22l2-40h8v42q14-20 36-28l3 5q-22 14-32 34l4 109z"/>
      <circle cx="100" cy="78" r="58"/><circle cx="52" cy="112" r="40"/><circle cx="150" cy="106" r="44"/>
      <circle cx="66" cy="58" r="34"/><circle cx="138" cy="54" r="36"/><circle cx="100" cy="132" r="32"/></g></symbol>
    <symbol id="sd-tree-bare" viewBox="0 0 200 260"><g fill="none" style="stroke:${ink}" stroke-linecap="round" filter="url(#sd-rough)">
      <path d="M100 260V150" stroke-width="16"/><path d="M100 170 60 110 40 60M100 160 140 96 150 40M60 110 30 104M140 96 176 84M100 150 102 70 92 20M78 140 50 150" stroke-width="7"/>
      <path d="M40 60 26 36M40 60 56 30M150 40 140 14M150 40 170 22M92 20 100 4M30 104 10 92M176 84 194 70" stroke-width="3.5"/></g></symbol>
    <symbol id="sd-deer" viewBox="0 0 160 160"><g filter="url(#sd-rough)">
      <ellipse cx="78" cy="88" rx="44" ry="20"/><path d="M106 84 118 40h14l-4 48z"/><ellipse cx="134" cy="38" rx="15" ry="8" transform="rotate(18 134 38)"/>
      <path d="M40 96h8l-2 58h-6zM56 100h7l2 54h-6zM98 100h7l-2 54h-6zM112 96h7l3 58h-6z"/><path d="M34 84 24 76l4 12z"/>
      <path d="M124 32 116 10 108 2M118 18 128 6M132 30 142 10 150 4M140 16 154 18" fill="none" style="stroke:${ink}" stroke-width="3.5" stroke-linecap="round"/></g></symbol>
    <symbol id="sd-monkey" viewBox="0 0 120 120"><g filter="url(#sd-rough)">
      <ellipse cx="58" cy="78" rx="26" ry="30"/><circle cx="62" cy="38" r="17"/><circle cx="46" cy="36" r="6"/><circle cx="78" cy="36" r="6"/>
      <path d="M40 92 30 116h12l10-18zM70 96l6 20h12l-6-24z"/><path d="M34 86Q8 80 14 54" fill="none" style="stroke:${ink}" stroke-width="5" stroke-linecap="round"/></g></symbol>
    <symbol id="sd-rabbit" viewBox="0 0 160 110"><g filter="url(#sd-rough)">
      <ellipse cx="78" cy="58" rx="40" ry="18" transform="rotate(-12 78 58)"/><ellipse cx="122" cy="40" rx="15" ry="11"/>
      <ellipse cx="126" cy="14" rx="5" ry="18" transform="rotate(18 126 14)"/><ellipse cx="136" cy="16" rx="4.5" ry="16" transform="rotate(32 136 16)"/>
      <path d="M44 66 6 84l4 6 46-14zM104 62l14 30h7l-12-32z"/><circle cx="38" cy="54" r="7"/></g></symbol>
    <symbol id="sd-bear" viewBox="0 0 200 130"><g filter="url(#sd-rough)">
      <ellipse cx="96" cy="72" rx="70" ry="38"/><circle cx="164" cy="58" r="24"/><circle cx="156" cy="34" r="8"/><circle cx="176" cy="36" r="7"/>
      <ellipse cx="186" cy="66" rx="12" ry="9"/><path d="M40 92h20v36H40zM72 98h18v30H72zM118 98h18v30h-18zM144 90h20v38h-20z"/></g></symbol>
    <symbol id="sd-bird" viewBox="0 0 120 60"><path d="M4 40Q30 4 60 30 90 4 116 40 92 24 60 44 28 24 4 40z" filter="url(#sd-rough)"/></symbol>
    <symbol id="sd-train" viewBox="0 0 20 24"><path fill="currentColor" d="M4 0h12q4 0 4 4v12q0 3-3 3l2 5h-3l-2-5H6l-2 5H1l2-5q-3 0-3-3V4q0-4 4-4zm-1 4v6h14V4zm2 9a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/></symbol>
    <symbol id="sd-car" viewBox="0 0 30 20"><path fill="currentColor" d="M6 2h16l4 7h2q2 0 2 2v5h-3a3 3 0 0 1-6 0H9a3 3 0 0 1-6 0H0v-5q0-2 2-2h1zm1 2-2 5h8V4zm8 0v5h8l-3-5z"/></symbol>
  </svg>`;
  document.body.insertAdjacentHTML("afterbegin", defs);

  // Original gate ink glyphs — a large mass of two overlapped characters: the upper one as two blobs left and right, the lower one as one big door leaf
  const GLYPH = `<path d="M60 40h200l10 30-20 20 22 18v120l-30 16H70l-10-30 8-60-30-12 22-22z"/>
        <path d="M330 34h210l8 40-24 10 24 20-10 130H346l-16-20 6-70-14-10 14-14z"/>
        <path d="M20 130h250v34H30zM330 130h250l-12 36H330z"/>
        <path d="M110 300h400l12 30-14 16 4 90-30 22 30 20-6 150-40 34-30-30v-44H170v40l-50 16-14-60 10-120-20-14 20-16-6-110zM150 420v40h330v-40z" fill-rule="evenodd"/>`;
  SD.glyph = (cls = "") => `
    <svg class="sd-glyph ${cls}" viewBox="0 0 600 680" aria-hidden="true"><g filter="url(#sd-stamp)">${GLYPH}</g></svg>`;
  // Mask that cuts the photo into letter shapes (About page) — the same strokes made as a standalone SVG
  SD.glyphMask = () => `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 680"><filter id="r"><feTurbulence type="fractalNoise" baseFrequency=".03" numOctaves="3" seed="5" result="w"/><feDisplacementMap in="SourceGraphic" in2="w" scale="18" xChannelSelector="R" yChannelSelector="G"/></filter><g filter="url(#r)">${GLYPH}</g></svg>`)}")`;

  const logo = (cls = "") => `
    <span class="sd-logo ${cls}" aria-label="Logo slot">
      <span class="sd-logo__w">Logo</span><span class="sd-logo__w">Ruler</span><span class="sd-logo__w">Ri</span>
      <span class="sd-logo__en">LOGO<br>—<br>MARK</span><span class="sd-logo__sub">Your subtitle here</span>
    </span>`;
  SD.logo = logo;
  document.querySelectorAll("[data-glyph]").forEach((el) => (el.innerHTML = SD.glyph()));
  document.querySelectorAll("[data-logo]").forEach((el) => (el.innerHTML = logo()));
  SD.use = (id, cls, style, dir) => `<svg class="sd-obj ${cls || ""}" style="${style || ""}"${dir ? ` data-direction="${dir}"` : ""} aria-hidden="true"><use href="#sd-${id}"/></svg>`;

  const NAV = [
    ["index.html", "Home", "home"],
    ["product.html", "Program", "product"],
    ["index.html#know", "Area Guide"],
    ["about.html", "About the event", "about"],
    ["index.html#guide", "Participation guide"],
    ["news.html", "News", "news"],
    ["index.html#contact", "Inquiry"],
    ["#", "Personal information"],
  ];
  const navItems = () => NAV.map(([href, t, p]) => `<li><a href="${href}"${p && (p === page || (p === "news" && page === "article")) ? ' aria-current="page"' : ""}>${t}</a></li>`).join("");

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("sd-head");
    head.innerHTML = `
      <a class="sd-head__logo" href="index.html" aria-label="Home">${logo()}</a>
      <button type="button" class="sd-burger" aria-expanded="false" aria-controls="sd-menu" aria-label="Open Menu">
        <span class="sd-burger__icon"></span>
        <span class="sd-burger__text" aria-hidden="true"><span>Me</span><span>New</span><span>·</span></span>
      </button>
      <div class="sd-menu" id="sd-menu" aria-hidden="true">
        <div class="sd-menu__sheet sd-paper" data-tear="9"></div>
        <nav class="sd-menu__nav" aria-label="Main menu"><ul class="sd-menu__list">${navItems()}</ul></nav>
      </div>`;
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("sd-foot-wrap");
    foot.innerHTML = `
      <div class="sd-foot-glyph" data-direction="center">${SD.glyph()}</div>
      <footer class="sd-foot" id="footer">
        <svg class="sd-foot__line" viewBox="0 0 1600 90" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 52C120 30 200 18 320 40s180 40 300 22 160-46 300-38 180 52 320 44 200-40 360-30"/>
        </svg>
        <div class="sd-foot__inner">
          <a class="sd-foot__logo" href="index.html" aria-label="Home">${logo()}</a>
          <address class="sd-foot__address">Your host organization name here<br>Your secretariat name here<br>〒000-0000 One line of your address here<br>Your building name 0F here<br>TEL 000-00-0000 (Weekdays 00:00–00:00)</address>
          <nav class="sd-foot-nav" aria-label="Footer Menu"><ul>${navItems()}</ul></nav>
          <small class="sd-foot__copy">© Your event name here 0000.</small>
        </div>
        <div class="sd-foot__bg"><div class="sd-photo wf-img" data-label="Evening view of a riverside town · rooftops and river seen from high up · blue dusk · full-width band"></div></div>
        <div class="sd-foot__leaves" aria-hidden="true">
          ${SD.use("palm", "", "width:30rem;height:60rem;left:-11rem;bottom:-30rem;transform:rotate(38deg)")}
          ${SD.use("fern", "", "width:26rem;height:52rem;right:-9rem;bottom:-28rem;transform:rotate(-40deg)")}
        </div>
      </footer>`;
  }

  // Torn edge: walk all four sides at 14~26px steps, jittering inward by 0~amp
  const tear = (el, i) => {
    const w = el.offsetWidth, h = el.offsetHeight;
    if (!w || !h) return;
    const amp = +el.dataset.tear || 6;
    const r = seeded((+el.dataset.seed || i + 1) * 7919);
    const pts = [];
    const edge = (x0, y0, x1, y1, nx, ny) => {
      const len = Math.hypot(x1 - x0, y1 - y0);
      for (let s = 0; s < len; s += 14 + r() * 12) {
        const t = s / len, j = r() * amp;
        pts.push(`${(x0 + (x1 - x0) * t + nx * j).toFixed(1)}px ${(y0 + (y1 - y0) * t + ny * j).toFixed(1)}px`);
      }
    };
    edge(0, 0, w, 0, 0, 1);
    edge(w, 0, w, h, -1, 0);
    edge(w, h, 0, h, 0, -1);
    edge(0, h, 0, 0, 1, 0);
    el.style.clipPath = `polygon(${pts.join(",")})`;
  };
  const tearAll = () => document.querySelectorAll("[data-tear]").forEach(tear);
  SD.tearAll = tearAll;
  tearAll();
  let rt;
  addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { tearAll(); ScrollTrigger.refresh(); }, 150); });
  document.fonts?.ready.then(tearAll);

  // Staggered entrance — plants random values in the same range as the original as a CSS variable per element, and plays when reaching 90% down the screen
  const R = gsap.utils.random;
  SD.arm = (root = document) => {
    root.querySelectorAll("[data-direction]").forEach((el) => {
      if (el.dataset.armed) return;
      el.dataset.armed = "1";
      el.style.setProperty("--offset-y", `${R(-100, 100)}px`);
      el.style.setProperty("--zig1", `${R(-80, 80)}px`);
      el.style.setProperty("--zig2", `${R(-60, 60)}px`);
      el.style.setProperty("--rotate-start", `${R(-20, 20)}deg`);
      if (el.hasAttribute("data-manual")) return;
      ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, onEnter: () => el.classList.add("is-run") });
    });
  };

  // Menu: opens and closes with the button, closes on an outside click. Scroll is locked while it is open
  const btn = document.querySelector(".sd-burger");
  const menu = document.querySelector(".sd-menu");
  let open = false;
  const setMenu = (v) => {
    open = v;
    document.documentElement.style.overflow = v ? "hidden" : "";
    btn.setAttribute("aria-expanded", String(v));
    btn.setAttribute("aria-label", v ? "Close Menu" : "Open Menu");
    menu.setAttribute("aria-hidden", String(!v));
    menu.classList.toggle("is-open", v);
    menu.classList.toggle("is-closing", !v);
    if (v) tear(menu.querySelector("[data-tear]"), 0);
  };
  if (btn && menu) {
    ["--offset-y", "--zig1", "--zig2", "--rotate-start"].forEach((k, i) => menu.style.setProperty(k, [`${R(-100, 100)}px`, `${R(-80, 80)}px`, `${R(-60, 60)}px`, `${R(-20, 20)}deg`][i]));
    btn.addEventListener("click", () => setMenu(!open));
    document.addEventListener("click", (e) => { if (open && !menu.contains(e.target) && !btn.contains(e.target)) setMenu(false); });
    menu.addEventListener("animationend", () => menu.classList.remove("is-closing"));
  }

  // Brand button (original lottie-web 5.13 · 945×546 · 24fps · 240-frame loop, only the head nods during frames 8~109, restarts from the beginning on hover).
  // The artwork is a Lottie redrawn with our own shapes, only the original numbers (head rotation keyframes·anchor·position of head/body layers) were carried over. Fills come from the layer class, which shared.css overrides with skin variables (c below is a placeholder value)
  const BRAND = {"v":"5.12.2","fr":24,"ip":0,"op":240,"w":945,"h":546,"nm":"beko","ddd":0,"assets":[],"layers":[{"ddd":0,"ind":1,"ty":4,"nm":"head-ink","cl":"beko-ink","parent":3,"sr":1,"ks":{"o":{"a":0,"k":100},"r":{"a":0,"k":0},"p":{"a":0,"k":[0,0,0]},"a":{"a":0,"k":[0,0,0]},"s":{"a":0,"k":[100,100,100]}},"ao":0,"shapes":[{"ty":"gr","it":[{"ty":"el","p":{"a":0,"k":[118,230]},"s":{"a":0,"k":[34,34]},"d":1},{"ty":"el","p":{"a":0,"k":[292,226]},"s":{"a":0,"k":[30,30]},"d":1},{"ty":"fl","c":{"a":0,"k":[0,0,0,1]},"o":{"a":0,"k":100},"r":1},{"ty":"tr","p":{"a":0,"k":[-19.5,-99.5]},"a":{"a":0,"k":[0,0]},"s":{"a":0,"k":[100,100]},"r":{"a":0,"k":0},"o":{"a":0,"k":100},"sk":{"a":0,"k":0},"sa":{"a":0,"k":0}}]},{"ty":"gr","it":[{"ty":"sh","ks":{"a":0,"k":{"c":false,"v":[[96,352],[210,360]],"i":[[0,0],[-60,20]],"o":[[40,40],[0,0]]}}},{"ty":"st","c":{"a":0,"k":[0,0,0,1]},"o":{"a":0,"k":100},"w":{"a":0,"k":14},"lc":2,"lj":2},{"ty":"tr","p":{"a":0,"k":[-19.5,-99.5]},"a":{"a":0,"k":[0,0]},"s":{"a":0,"k":[100,100]},"r":{"a":0,"k":0},"o":{"a":0,"k":100},"sk":{"a":0,"k":0},"sa":{"a":0,"k":0}}]}],"ip":0,"op":240,"st":0,"bm":0},{"ddd":0,"ind":2,"ty":4,"nm":"head-white","cl":"beko-white","parent":3,"sr":1,"ks":{"o":{"a":0,"k":100},"r":{"a":0,"k":0},"p":{"a":0,"k":[0,0,0]},"a":{"a":0,"k":[0,0,0]},"s":{"a":0,"k":[100,100,100]}},"ao":0,"shapes":[{"ty":"gr","it":[{"ty":"sh","ks":{"a":0,"k":{"c":false,"v":[[205,268],[235,250],[190,300],[160,250],[218,200],[280,262],[200,340]],"i":[[0,0],[-18,0],[30,0],[0,30],[-40,0],[0,-50],[60,0]],"o":[[0,-20],[0,36],[-40,0],[0,-46],[50,0],[0,60],[0,0]]}}},{"ty":"st","c":{"a":0,"k":[0,0,0,1]},"o":{"a":0,"k":100},"w":{"a":0,"k":16},"lc":2,"lj":2},{"ty":"tr","p":{"a":0,"k":[-19.5,-99.5]},"a":{"a":0,"k":[0,0]},"s":{"a":0,"k":[100,100]},"r":{"a":0,"k":0},"o":{"a":0,"k":100},"sk":{"a":0,"k":0},"sa":{"a":0,"k":0}}]}],"ip":0,"op":240,"st":0,"bm":0},{"ddd":0,"ind":3,"ty":4,"nm":"head","cl":"beko-red","sr":1,"ks":{"o":{"a":0,"k":100},"r":{"a":1,"k":[{"t":8,"s":[5],"o":{"x":[0.333],"y":[0]},"i":{"x":[0.667],"y":[1]}},{"t":24,"s":[-9.921],"o":{"x":[0.333],"y":[0]},"i":{"x":[0.667],"y":[1]}},{"t":35,"s":[22],"o":{"x":[0.333],"y":[0]},"i":{"x":[0.667],"y":[1]}},{"t":45,"s":[-9.921],"o":{"x":[0.333],"y":[0]},"i":{"x":[0.667],"y":[1]}},{"t":56,"s":[14],"o":{"x":[0.333],"y":[0]},"i":{"x":[0.667],"y":[1]}},{"t":66,"s":[-7.225],"o":{"x":[0.333],"y":[0]},"i":{"x":[0.667],"y":[1]}},{"t":76,"s":[7],"o":{"x":[0.333],"y":[0]},"i":{"x":[0.667],"y":[1]}},{"t":85,"s":[-5.141],"o":{"x":[0.333],"y":[0]},"i":{"x":[0.477],"y":[1.334]}},{"t":101,"s":[5],"o":{"x":[0.422],"y":[-0.715]},"i":{"x":[0.522],"y":[1]}},{"t":109,"s":[5]}]},"p":{"a":0,"k":[389.5,226,0]},"a":{"a":0,"k":[370,126.5,0]},"s":{"a":0,"k":[100,100,100]}},"ao":0,"shapes":[{"ty":"gr","it":[{"ty":"el","p":{"a":0,"k":[205,268]},"s":{"a":0,"k":[330,330]},"d":1},{"ty":"fl","c":{"a":0,"k":[0,0,0,1]},"o":{"a":0,"k":100},"r":1},{"ty":"tr","p":{"a":0,"k":[-19.5,-99.5]},"a":{"a":0,"k":[0,0]},"s":{"a":0,"k":[100,100]},"r":{"a":0,"k":0},"o":{"a":0,"k":100},"sk":{"a":0,"k":0},"sa":{"a":0,"k":0}}]},{"ty":"gr","it":[{"ty":"sh","ks":{"a":0,"k":{"c":true,"v":[[110,140],[62,46],[158,112]],"i":[[0,0],[0,0],[0,0]],"o":[[0,0],[0,0],[0,0]]}}},{"ty":"sh","ks":{"a":0,"k":{"c":true,"v":[[262,112],[330,30],[312,140]],"i":[[0,0],[0,0],[0,0]],"o":[[0,0],[0,0],[0,0]]}}},{"ty":"fl","c":{"a":0,"k":[0,0,0,1]},"o":{"a":0,"k":100},"r":1},{"ty":"tr","p":{"a":0,"k":[-19.5,-99.5]},"a":{"a":0,"k":[0,0]},"s":{"a":0,"k":[100,100]},"r":{"a":0,"k":0},"o":{"a":0,"k":100},"sk":{"a":0,"k":0},"sa":{"a":0,"k":0}}]}],"ip":0,"op":240,"st":0,"bm":0},{"ddd":0,"ind":4,"ty":4,"nm":"body-white","cl":"beko-white","parent":5,"sr":1,"ks":{"o":{"a":0,"k":100},"r":{"a":0,"k":0},"p":{"a":0,"k":[0,0,0]},"a":{"a":0,"k":[0,0,0]},"s":{"a":0,"k":[100,100,100]}},"ao":0,"shapes":[{"ty":"gr","it":[{"ty":"sh","ks":{"a":0,"k":{"c":false,"v":[[500,170],[640,172]],"i":[[0,0],[-50,40]],"o":[[40,70],[0,0]]}}},{"ty":"sh","ks":{"a":0,"k":{"c":false,"v":[[700,250],[840,230]],"i":[[0,0],[-40,40]],"o":[[40,60],[0,0]]}}},{"ty":"sh","ks":{"a":0,"k":{"c":false,"v":[[470,330],[600,330]],"i":[[0,0],[-40,20]],"o":[[30,34],[0,0]]}}},{"ty":"sh","ks":{"a":0,"k":{"c":false,"v":[[640,380],[740,372]],"i":[[0,0],[-30,18]],"o":[[30,20],[0,0]]}}},{"ty":"st","c":{"a":0,"k":[0,0,0,1]},"o":{"a":0,"k":100},"w":{"a":0,"k":16},"lc":2,"lj":2},{"ty":"tr","p":{"a":0,"k":[-328,-13.5]},"a":{"a":0,"k":[0,0]},"s":{"a":0,"k":[100,100]},"r":{"a":0,"k":0},"o":{"a":0,"k":100},"sk":{"a":0,"k":0},"sa":{"a":0,"k":0}}]}],"ip":0,"op":240,"st":0,"bm":0},{"ddd":0,"ind":5,"ty":4,"nm":"body","cl":"beko-red","sr":1,"ks":{"o":{"a":0,"k":100},"r":{"a":0,"k":0},"p":{"a":0,"k":[630.5,260,0]},"a":{"a":0,"k":[302.5,246.5,0]},"s":{"a":0,"k":[100,100,100]}},"ao":0,"shapes":[{"ty":"gr","it":[{"ty":"sh","ks":{"a":0,"k":{"c":true,"v":[[372,214],[560,70],[820,96],[918,250],[770,420],[520,432],[372,214]],"i":[[0,60],[-120,0],[-90,-30],[0,-90],[110,10],[90,12],[-10,110]],"o":[[0,-70],[120,0],[70,24],[0,110],[-110,18],[-80,-8],[0,0]]}}},{"ty":"fl","c":{"a":0,"k":[0,0,0,1]},"o":{"a":0,"k":100},"r":1},{"ty":"tr","p":{"a":0,"k":[-328,-13.5]},"a":{"a":0,"k":[0,0]},"s":{"a":0,"k":[100,100]},"r":{"a":0,"k":0},"o":{"a":0,"k":100},"sk":{"a":0,"k":0},"sa":{"a":0,"k":0}}]},{"ty":"gr","it":[{"ty":"rc","p":{"a":0,"k":[458,452]},"s":{"a":0,"k":[58,120]},"r":{"a":0,"k":12},"d":1},{"ty":"rc","p":{"a":0,"k":[560,458]},"s":{"a":0,"k":[52,100]},"r":{"a":0,"k":12},"d":1},{"ty":"rc","p":{"a":0,"k":[760,456]},"s":{"a":0,"k":[52,104]},"r":{"a":0,"k":12},"d":1},{"ty":"rc","p":{"a":0,"k":[850,452]},"s":{"a":0,"k":[58,120]},"r":{"a":0,"k":12},"d":1},{"ty":"fl","c":{"a":0,"k":[0,0,0,1]},"o":{"a":0,"k":100},"r":1},{"ty":"tr","p":{"a":0,"k":[-328,-13.5]},"a":{"a":0,"k":[0,0]},"s":{"a":0,"k":[100,100]},"r":{"a":0,"k":0},"o":{"a":0,"k":100},"sk":{"a":0,"k":0},"sa":{"a":0,"k":0}}]},{"ty":"gr","it":[{"ty":"sh","ks":{"a":0,"k":{"c":false,"v":[[912,230],[940,150]],"i":[[0,0],[10,30]],"o":[[30,-20],[0,0]]}}},{"ty":"st","c":{"a":0,"k":[0,0,0,1]},"o":{"a":0,"k":100},"w":{"a":0,"k":14},"lc":2,"lj":2},{"ty":"tr","p":{"a":0,"k":[-328,-13.5]},"a":{"a":0,"k":[0,0]},"s":{"a":0,"k":[100,100]},"r":{"a":0,"k":0},"o":{"a":0,"k":100},"sk":{"a":0,"k":0},"sa":{"a":0,"k":0}}]}],"ip":0,"op":240,"st":0,"bm":0}]};
  const icon = document.querySelector(".sd-burger__icon");
  if (btn && icon && window.lottie) {
    const beko = lottie.loadAnimation({ container: icon, renderer: "svg", loop: true, autoplay: !reduced, animationData: BRAND });
    btn.addEventListener("mouseenter", () => { if (!reduced) beko.goToAndPlay(0, true); });
  }

  // In-page anchors move over 1s along the original curve
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href*="#"]');
    if (!a) return;
    const url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname || !url.hash || url.hash === "#") return;
    const t = document.querySelector(url.hash);
    if (!t) return;
    e.preventDefault();
    if (open) setMenu(false);
    const y = { v: scrollY };
    gsap.to(y, { v: t.getBoundingClientRect().top + scrollY, duration: reduced ? 0 : 1, ease: EASE, onUpdate: () => scrollTo(0, y.v) });
  });

  // On pages beyond the hero: after scrolling down 1/3 of the screen the header logo disappears, and returns when scrolling back up
  if (page !== "home") {
    ScrollTrigger.create({
      trigger: document.body,
      start: `${innerHeight / 3} top`,
      end: "bottom top",
      onEnter: () => gsap.to(".sd-head__logo", { opacity: 0 }),
      onLeaveBack: () => gsap.to(".sd-head__logo", { opacity: 1 }),
    });
  }

  // Pins from the page script are created later than the triggers here, so after everything is built, re-measure in position order
  addEventListener("load", () => { tearAll(); ScrollTrigger.sort(); ScrollTrigger.refresh(); });
  SD.arm();
})();
