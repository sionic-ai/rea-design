// First page: opening (first visit only, cookie 3 days) · photo fade · town drawing·regional map drawing · phone horizontal sweep · keyword hearts · job-type speech bubble strip
(() => {
  const { ease, reduced } = window.NH;
  const pc = () => matchMedia("(min-width: 768px)").matches;
  const $ = (s) => document.querySelector(s);

  // ---------- 5-photo fade — same splide 4.1.4 as the original (fade · rewind · interval 5000 · speed 1400). Autoplay is turned on when the opening starts.
  //  Like the original, the yellow cover also sits inside the splide root, so hovering over it pauses autoplay (pauseOnHover) ----------
  const splide = new Splide("#fv-slider", { type: "fade", rewind: true, pagination: false, arrows: false, autoplay: false, interval: 5000, speed: 1400 });
  splide.mount();
  const { Autoplay } = splide.Components;
  Autoplay.pause();
  const play = () => Autoplay.play();

  // ---------- Opening: values exactly as in the original home.min.js ----------
  const slider = $("#fv-slider"), heart = $("#fv-heart"), cover = $("#fv-cover");
  const chars = document.querySelectorAll(".fv__ch");
  const fixed = $(".nh-fixed"), logo = $(".nh-head .nh-logo"), nav = $(".nh-nav"), burger = $(".nh-burger");
  const visited = document.cookie.split("; ").some((c) => c === "nh_top_visited=yes");
  if (reduced) {
    gsap.set(cover, { opacity: 0 });
  } else if (visited && !new URLSearchParams(location.search).has("opening")) {
    gsap.set(cover, { opacity: 0 });
    gsap.timeline().add(play).fromTo(chars, { yPercent: 130 }, { yPercent: 0, duration: 1.2, stagger: 0.04, ease: ease.sineOutBackInOut });
  } else {
    const body = document.body;
    scrollTo(0, 0);
    Object.assign(body.style, { position: "fixed", overflow: "hidden scroll", top: "0", width: "100%" });
    gsap.set(slider, { xPercent: -100, yPercent: pc() ? 10 : 0, rotate: pc() ? 11 : -8, opacity: pc() ? 0 : 1 });
    gsap.set(heart, { xPercent: 100, yPercent: pc() ? -10 : 0, rotate: pc() ? -5 : 10, opacity: pc() ? 0 : 1 });
    gsap.set(chars, { yPercent: 130 });
    gsap.set(fixed, { opacity: 0, yPercent: pc() ? 20 : 40 });
    gsap.set([logo, nav, burger, ".fv__scroll"], { opacity: 0 });
    const tl = gsap.timeline();
    tl.add(play);
    tl.to(slider, { xPercent: -20, yPercent: pc() ? 10 : 0, opacity: 1, duration: pc() ? 1.2 : 1.4, ease: ease.doubleSineOut });
    tl.to(heart, { xPercent: 20, yPercent: pc() ? -10 : 0, opacity: 1, duration: pc() ? 1.2 : 1.4, ease: ease.doubleSineOut }, "<");
    tl.to(slider, { xPercent: 0, yPercent: 0, rotate: 0, duration: 1, ease: "back.out(0.8)" }, "+=0.04");
    tl.to(heart, { xPercent: 0, yPercent: 0, rotate: 0, duration: 1, ease: "back.out(0.8)", onComplete: () => ["position", "top", "overflow", "width"].forEach((p) => body.style.removeProperty(p)) }, "<0.1");
    tl.to(cover, { opacity: 0, duration: 1 }, ">-0.1");
    tl.to(chars, { yPercent: 0, duration: 1.2, stagger: 0.04, ease: ease.sineOutBackInOut }, "<-0.24");
    tl.to(fixed, { opacity: 1, yPercent: 0, duration: 0.8, ease: ease.sineOutBackInOut }, "<0.8");
    tl.to([logo, nav, burger, ".fv__scroll"], { opacity: 1, duration: 0.6 }, "<0.3");
    document.cookie = "nh_top_visited=yes; max-age=259200";
  }
  if (reduced) play();

  // ---------- Village art: procedurally redraws the same composition as the original illustration (sky, clouds, hills, building cluster, trees, people, balloons) ----------
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const town = $("#vision-town");
  if (town) {
    const g = [];
    g.push(`<rect width="1440" height="1200" style="fill:var(--site-sky-top)"/>`);
    g.push(`<path d="M0 0H1440V120C1180 160 900 90 640 130 380 170 160 120 0 150Z" style="fill:var(--site-sky-haze)"/>`);
    for (let i = 0; i < 9; i++) {
      const x = rnd() * 1440, y = 90 + rnd() * 220, w = 90 + rnd() * 120;
      g.push(`<g class="cloud"><ellipse cx="${x}" cy="${y}" rx="${w}" ry="${w * 0.24}" style="fill:var(--site-paper)"/><ellipse cx="${x - w * 0.3}" cy="${y - w * 0.12}" rx="${w * 0.45}" ry="${w * 0.22}" style="fill:var(--site-paper)"/></g>`);
    }
    g.push(`<path d="M0 470C120 400 260 380 420 420 560 455 640 380 800 360 980 340 1080 420 1240 400 1340 388 1400 360 1440 350V1200H0Z" style="fill:var(--site-green-hill)"/>`);
    g.push(`<path d="M0 560C200 500 360 520 520 560 700 600 860 500 1060 480 1240 462 1360 520 1440 500V1200H0Z" style="fill:var(--site-green-mid)"/>`);
    g.push(`<path d="M-20 720C180 640 420 650 620 700 840 756 1040 640 1260 650 1360 655 1420 680 1460 700V1200H-20Z" style="fill:var(--site-green-light)"/>`);
    g.push(`<path d="M1080 960C1200 900 1360 920 1460 960V1100H1080Z" style="fill:var(--site-sky-water)"/><path d="M-10 860C60 830 140 850 160 900 170 950 90 980 -10 970Z" style="fill:var(--site-sky-water)"/>`);
    g.push(`<path d="M120 1200C300 1000 620 920 900 900 1100 886 1300 820 1460 780" fill="none" style="stroke:var(--site-road)" stroke-width="34" stroke-linecap="round"/>`);
    g.push(`<path d="M520 640C560 760 700 840 760 1200" fill="none" style="stroke:var(--site-road)" stroke-width="22"/>`);
    g.push(`<ellipse cx="640" cy="905" rx="150" ry="70" style="fill:var(--site-paper)"/><ellipse cx="300" cy="720" rx="110" ry="46" style="fill:var(--site-cream)"/>`);
    const roofs = ["var(--site-blue-roof)", "var(--site-pink-roof)", "var(--site-yellow)", "var(--site-blue-mid)", "var(--site-paper)"];
    const block = (x, y, w, h, d) => {
      const roof = pick(roofs);
      let win = "";
      for (let r = 0; r < Math.max(1, Math.floor(h / 18)); r++) win += `<rect x="${x + 6}" y="${y + 8 + r * 18}" width="${w - 12}" height="5" style="fill:var(--site-window)" opacity=".6"/>`;
      return `<g><path d="M${x + w} ${y}l${d} ${-d * 0.5}v${h}l${-d} ${d * 0.5}z" style="fill:var(--site-wall-shade)"/><rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:var(--site-paper)"/>${win}<path d="M${x} ${y}l${d} ${-d * 0.5}h${w}l${-d} ${d * 0.5}z" style="fill:${roof}"/></g>`;
    };
    [[780, 600, 9], [980, 640, 8], [1180, 600, 7], [300, 860, 4], [140, 1000, 4], [1040, 860, 5]].forEach(([cx, cy, n]) => {
      for (let i = 0; i < n; i++) g.push(block(cx + (rnd() - 0.5) * 260, cy + (rnd() - 0.5) * 120, 50 + rnd() * 70, 30 + rnd() * 50, 18 + rnd() * 20));
    });
    for (let i = 0; i < 70; i++) {
      const x = rnd() * 1440, y = 470 + rnd() * 700, r = 9 + rnd() * 16;
      g.push(`<circle cx="${x}" cy="${y}" r="${r}" style="fill:${pick(["var(--site-green)", "var(--site-green-dark)", "var(--site-green-leaf)", "var(--site-pink)", "var(--site-pink)"])}"/><rect x="${x - 1.5}" y="${y + r - 2}" width="3" height="8" style="fill:var(--site-wood)"/>`);
    }
    const shirts = ["var(--site-red)", "var(--site-blue-ink)", "var(--site-yellow)", "var(--site-green)", "var(--kf-ink)", "var(--site-pink-shirt)", "var(--site-blue-mid)"];
    for (let i = 0; i < 90; i++) {
      const x = 40 + rnd() * 1360, y = 600 + rnd() * 560;
      g.push(`<g class="${i % 9 === 0 ? "walker" : ""}"><circle cx="${x}" cy="${y}" r="3.6" style="fill:var(--site-hair)"/><rect x="${x - 3.6}" y="${y + 4}" width="7.2" height="10" rx="2" style="fill:${pick(shirts)}"/><path d="M${x - 2} ${y + 14}v6M${x + 2} ${y + 14}v6" style="stroke:var(--kf-ink)" stroke-width="1.6"/></g>`);
    }
    g.push(`<g class="balloon"><circle cx="460" cy="240" r="46" style="fill:var(--site-blue-mid)"/><path d="M430 220c14-10 26-4 30 8-10 4-22 6-30-8zM470 250c12-4 20 2 18 14-10 0-16-4-18-14z" style="fill:var(--site-green)"/><path d="M440 282l6 24h28l6-24" fill="none" style="stroke:var(--site-wood)" stroke-width="2"/><rect x="444" y="304" width="32" height="18" rx="3" style="fill:var(--site-basket)"/></g>`);
    g.push(`<g class="balloon" style="animation-delay:-1s"><circle cx="290" cy="330" r="34" style="fill:var(--site-blue-mid)"/><path d="M270 316c10-8 20-2 22 6-8 4-16 4-22-6z" style="fill:var(--site-green)"/><path d="M284 364l-2 26" style="stroke:var(--site-wood)" stroke-width="2"/></g>`);
    g.push(`<path d="M520 214l38-10-6 8 18 2-14 6 6 8-42-14z" style="fill:var(--site-paper)"/>`);
    [[1130, 110], [1160, 80], [1100, 140]].forEach(([x, y], i) => g.push(`<path style="animation-delay:${i * 0.3}s;stroke:var(--site-blue-roof)" class="bird" d="M${x} ${y}q8-10 16 0q8-10 16 0" fill="none" stroke-width="5" stroke-linecap="round"/>`));
    g.push(`<path d="M0 1120C220 1180 460 1150 720 1170 980 1190 1240 1140 1440 1160V1200H0Z" style="fill:var(--kf-bg)"/>`);
    town.innerHTML = g.join("");
  }

  // ---------- Region map: cells are split by the nearest seed point (borders wobbled with noise) and painted like a district map ----------
  const mapBox = $("#area-map");
  if (mapBox) {
    const W = 632, H = 720, cv = document.createElement("canvas");
    cv.width = W; cv.height = H;
    cv.setAttribute("role", "img");
    cv.setAttribute("aria-label", mapBox.getAttribute("aria-label"));
    mapBox.replaceWith(cv);
    const ctx = cv.getContext("2d");
    const seeds = [
      [80, 80, "map"], [250, 120, "mid"], [420, 70, "sky"], [560, 180, "map"], [470, 300, "sky"],
      [110, 280, "dark"], [300, 300, "green"], [80, 500, "sky"], [250, 470, "leaf"], [420, 470, "dark"],
      [580, 420, "mid"], [180, 650, "map"], [400, 650, "green"], [590, 650, "sky"], [330, 200, "leaf"],
    ];
    const tone = { map: "--site-green-map", mid: "--site-green-mid", sky: "--site-sky", dark: "--site-green-dark", green: "--site-green", leaf: "--site-green-leaf" };
    const img = ctx.createImageData(W, H);
    const cols = seeds.map((s) => window.NH.rgb(tone[s[2]]));
    const own = new Int16Array(W * H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const nx = x + 14 * Math.sin(y * 0.045) + 9 * Math.sin(y * 0.13 + x * 0.05);
      const ny = y + 14 * Math.cos(x * 0.04) + 9 * Math.sin(x * 0.11);
      let best = 0, bd = 1e9;
      for (let k = 0; k < seeds.length; k++) { const dx = nx - seeds[k][0], dy = ny - seeds[k][1], d = dx * dx + dy * dy; if (d < bd) { bd = d; best = k; } }
      own[y * W + x] = best;
    }
    for (let i = 0; i < W * H; i++) {
      const x = i % W, k = own[i];
      const edge = (x > 0 && own[i - 1] !== k) || (i >= W && own[i - W] !== k);
      const c = cols[k], o = i * 4;
      const e = edge && seeds[k][2] !== "sky" ? 0.82 : 1;
      img.data[o] = c[0] * e; img.data[o + 1] = c[1] * e; img.data[o + 2] = c[2] * e; img.data[o + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    ctx.fillStyle = window.NH.css("--site-yellow");
    for (let i = 0; i < 14; i++) { ctx.beginPath(); ctx.arc(330 + (rnd() - 0.5) * 70, 330 + (rnd() - 0.5) * 120, 5, 0, 7); ctx.fill(); }
    ctx.strokeStyle = window.NH.css("--site-orange"); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(350, 340, 11, 0, 7); ctx.stroke();
    ctx.fillStyle = window.NH.css("--site-on-color");
    ctx.font = `500 12px ${getComputedStyle(document.documentElement).getPropertyValue("--kf-font-en")}`;
    [["Area 1", 220, 110], ["Area 2", 520, 190], ["Area 3", 90, 240], ["Area 4", 250, 420], ["Area 5", 380, 520], ["Area 6", 520, 400], ["Area 7", 160, 620]].forEach(([t, x, y]) => ctx.fillText(t, x, y));
  }

  // ---------- Keyword hearts: on PC they open on hover, on phone they toggle on press ----------
  const kw = $("#kw");
  document.querySelectorAll(".kw__item").forEach((item) => {
    const head = item.querySelector(".kw__head");
    const x = Number(item.dataset.x), y = Number(item.dataset.y);
    window.NH.wobble(item, head, { x: pc() ? x : x * 0.6, y, steps: 2, duration: 0.8, baseDeg: -0.5, scrollTrigger: { trigger: item, start: "top 80%", once: true } });
    if (!reduced) ScrollTrigger.create({ trigger: item, start: "top 80%", once: true, onEnter: () => item.classList.add("is-active") });
    const on = () => { item.classList.add("is-show"); kw.setAttribute("show", "true"); };
    const off = () => { item.classList.remove("is-show"); kw.setAttribute("show", "false"); };
    head.addEventListener("mouseenter", () => pc() && on());
    head.addEventListener("mouseleave", () => pc() && off());
    head.addEventListener("click", () => { if (!pc()) item.classList.contains("is-show") ? off() : on(); });
  });

  // ---------- Job-role speech bubble strip. Original: only bubbles inside the strip unfold with a spring (1s spring-2, name .2s later), and fold when they leave ----------
  const jobs = ["Job type name 1", "Job type 2", "Job type name 3", "Job type 4", "Job type name 5", "Job type 6", "Job type name 7", "Job type 8"];
  const chanSvg = '<svg aria-hidden="true"><use href="#nh-chan"/></svg>';
  [".job__row.r1", ".job__row.r2"].forEach((sel, r) => {
    const row = $(sel);
    const set = jobs.map((t, i) => `<span class="job__pill js-job-item${(i + r) % 2 ? " is-y" : ""}"><i class="job__bg"></i><span class="job__name">${t}</span>${(i + r) % 2 ? "" : chanSvg}</span>`).join("");
    row.innerHTML = set + set;
  });
  const rail = $(".job__rail");
  const pills = document.querySelectorAll(".job__pill");
  if (reduced) pills.forEach((p) => p.classList.add("is-show"));
  else {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle("is-show", e.isIntersecting)), { root: rail, rootMargin: pc() ? "0px 0px 0px -176px" : "0px -32px 0px -32px" });
    pills.forEach((p) => io.observe(p));
    // Original: every 5 seconds lowers the front heart mascot, and 2 seconds later raises it onto the first unfolded white speech bubble that is not the previous one
    let prev = null;
    setInterval(() => {
      const last = prev;
      last && last.classList.remove("is-chan");
      setTimeout(() => {
        prev = [...document.querySelectorAll(".job__pill:not(.is-y).is-show")].find((p) => p !== last) || null;
        prev && prev.classList.add("is-chan");
      }, 2000);
    }, 5000);
  }

  // ---------- Phone: horizontal pan across the village illustration — original values (xPercent -(r-w)/r*100, top -20% → bottom 80%, scrub 1.6) ----------
  gsap.matchMedia().add("(max-width: 767px) and (prefers-reduced-motion: no-preference)", () => {
    const pin = $("#vision-pin"), target = $("#vision-scroll");
    const r = target.offsetWidth, w = innerWidth;
    pin.style.height = `${(r / w) * 100}vh`;
    const tw = gsap.to(target, { xPercent: ((r - w) / r) * -100, ease: "none", scrollTrigger: { trigger: pin, start: "top -20%", end: "bottom 80%", scrub: 1.6 } });
    ScrollTrigger.refresh();
    return () => { pin.style.height = ""; tw.scrollTrigger.kill(); tw.kill(); gsap.set(target, { clearProps: "transform" }); };
  });
})();
