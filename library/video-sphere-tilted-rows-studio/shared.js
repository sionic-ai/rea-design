// Shared by all pages: header band, spinning header character, news drawer, contact copy bubble, work tiles, footer, body blur transition.
// Original values: header character makes two turns in 3.04s (25fps, 76 frames) · tile blur 42.5px · .5 (.2s ease-in-out, delayed .22s) · drawer · transition opacity .5s · closes 5s after copy.
(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";
  const LT = (window.LT = { reduced });

  const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.innerHTML = `
      <a class="lt-mark" href="index.html" aria-label="Home" data-label="Spinning head character symbol — original is a 3-sec animated clip"><canvas width="124" height="124"></canvas></a>
      <header class="lt-head" data-label="Your menu English name here">
        <div class="lt-head__bar">
          <a href="index.html" data-nav>Work</a>
          <button type="button" data-news-open aria-expanded="false">News</button>
          <a href="#info" data-label="Studio About page placeholder — not built because it was not recorded">Info</a>
          <a href="#contact" data-tip-open>Contact</a>
        </div>
      </header>
      <nav class="lt-news" aria-label="News" data-slot="news-drawer">
        <header class="lt-news__head"><h2 data-label="Your drawer English name here">News</h2><button type="button" data-news-close aria-label="Close">Close</button></header>
        <ul class="lt-news__list">
          ${[
            ["Lecture poster · white text on black background · square", "1 / 1"],
            ["Award logo · white text on black background · square", "1 / 1"],
            ["Studio group photo · natural light · landscape 4:3", "4 / 3"],
            ["Magazine spread · seen from above on a desk · landscape 4:3", "4 / 3"],
            ["Event stage · lighting · landscape 16:9", "16 / 9"],
          ]
            .map(
              ([label, ratio], i) => `<li><a class="lt-news__link" href="#">
              <figure class="lt-news__fig"><div class="wf-img" style="aspect-ratio:${ratio}" data-label="${label}"></div></figure>
              <h3 data-label="News English Title">News Title 0${i + 1}</h3>
              <p>Your news content goes here in about three lines. Briefly write who did what, when and where, and link out to the external post.</p>
            </a></li>`,
            )
            .join("")}
        </ul>
      </nav>
      <div class="lt-tip" role="tooltip" data-slot="contact-tip"><div class="lt-tip__inner" tabindex="0"><p><span data-tip-state>Copy</span> <b>hello@studio-name.com</b></p></div></div>`;
  }

  // ── Header character: a small shader painted by longitude·latitude on a sphere — hair covers the back and the face turns sideways and out ──
  const markCanvas = head && head.querySelector(".lt-mark canvas");
  if (markCanvas) {
    const ctx = markCanvas.getContext("2d");
    const N = markCanvas.width;
    const img = ctx.createImageData(N, N);
    const rgb = (v) => {
      const c = document.createElement("canvas").getContext("2d");
      c.fillStyle = v;
      c.fillRect(0, 0, 1, 1);
      return c.getImageData(0, 0, 1, 1).data;
    };
    let pal;
    const readPal = () => {
      pal = { skin: rgb(css("--site-skin")), hair: rgb(css("--kf-ink")), cheek: rgb(css("--kf-accent")), shade: rgb(css("--kf-raised")) };
    };
    readPal();
    const D = Math.PI / 180;
    const R = N * 0.41, RX = R * 0.93, CX = N / 2, CY = N * 0.47;
    // Fixed marks on the face side — (longitude, latitude, radius) in degrees
    const spot = (lon, lat, lo, la, rl, rb) => ((lon - lo) / rl) ** 2 + ((lat - la) / rb) ** 2 < 1;
    const paint = (theta, smile) => {
      const d = img.data;
      for (let py = 0; py < N; py++) {
        for (let px = 0; px < N; px++) {
          const i = (py * N + px) * 4;
          const x = (px + 0.5 - CX) / RX, y = (CY - py - 0.5) / R;
          const r2 = x * x + y * y;
          // Floor shadow: flat ellipse under the head
          const sx = (px + 0.5 - CX) / (R * 0.98), sy = (py + 0.5 - (CY + R * 0.86)) / (R * 0.2);
          if (r2 > 1) {
            if (sx * sx + sy * sy < 1) { d[i] = pal.shade[0]; d[i + 1] = pal.shade[1]; d[i + 2] = pal.shade[2]; d[i + 3] = 110; }
            else d[i + 3] = 0;
            continue;
          }
          const z = Math.sqrt(1 - r2);
          const lat = Math.asin(y) / D;
          let lon = Math.atan2(x, z) / D - theta;
          lon = ((lon + 540) % 360) - 180;
          const al = Math.abs(lon);
          let c = pal.skin;
          // Bob cut: crown, back of head, side hair, bangs as three waves
          const fringe = 26 + 7 * Math.cos(lon * 3 * D) * (al < 60 ? 1 : 0);
          if (lat > fringe || al > 118 || (al > 84 && lat > -30)) c = pal.hair;
          else if (spot(al, lat, 38, -16, 13, 12)) c = pal.cheek;
          else if (spot(al, lat, 19, 6, 4.5, 6.5)) c = pal.hair;
          else if (smile ? lat < -20 && lat > -33 && al < 13 && ((lon / 13) ** 2 + ((lat + 20) / 13) ** 2) < 1 : spot(lon, lat, 0, -26, 6.5, 8.5)) c = pal.hair;
          const edge = Math.min(1, (1 - Math.sqrt(r2)) * R * 1.4);
          d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255 * edge;
        }
      }
      ctx.putImageData(img, 0, 0);
    };
    const TURN = 1.52; // Original GIF, 76 frames at 25fps = Two turns in 3.04s
    if (reduced) paint(0, false);
    else {
      let t0 = null;
      const loop = (now) => {
        if (t0 === null) t0 = now;
        const t = ((now - t0) / 1000) % (TURN * 2);
        paint((t / TURN) * 360, t >= TURN);
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    }
    LT.repaintMark = readPal;
  }

  // ── News drawer ──
  const news = head && head.querySelector(".lt-news");
  const openBtn = head && head.querySelector("[data-news-open]");
  const setNews = (on) => {
    news.classList.toggle("is-open", on);
    openBtn.setAttribute("aria-expanded", String(on));
  };
  if (news) {
    openBtn.addEventListener("click", () => setNews(!news.classList.contains("is-open")));
    head.querySelector("[data-news-close]").addEventListener("click", () => setNews(false));
    addEventListener("keydown", (e) => e.key === "Escape" && setNews(false));
  }

  // ── Contact: opens a speech bubble, pressing copies the email and shows ”Copied”, closing after 5 seconds. Pressing outside closes it ──
  const tip = head && head.querySelector(".lt-tip");
  if (tip) {
    const state = tip.querySelector("[data-tip-state]");
    let timer;
    head.querySelector("[data-tip-open]").addEventListener("click", (e) => {
      e.preventDefault();
      tip.classList.toggle("is-open");
    });
    tip.addEventListener("click", (e) => {
      if (!e.target.closest(".lt-tip__inner")) return tip.classList.remove("is-open");
      const mail = tip.querySelector("b").textContent;
      (navigator.clipboard ? navigator.clipboard.writeText(mail) : Promise.resolve()).catch(() => {}).finally(() => {
        state.textContent = "Copied";
        clearTimeout(timer);
        timer = setTimeout(() => {
          tip.classList.remove("is-open");
          state.textContent = "Copy";
        }, 5000);
      });
    });
  }

  // ── Work tile — shared by the first-page list and the ”More” under the detail ──
  const TAGS = ["Brand Identity", "Campaign", "Packaging", "Illustration", "Animation", "Digital Design", "Art Direction", "Strategy"];
  const TILES = [
    ["Event poster · frog character illustration · gray background", [0, 1, 3]],
    ["Person on stage · Pink lighting · Front view", [1, 4]],
    ["Box-shaped character · blue background · front view", [0, 3, 4]],
    ["Orange text wordmark · white background", [0, 5]],
    ["Person half-length · window natural light · portrait composition", [1, 6]],
    ["Logo video · White text on black background", [0, 4]],
    ["Board game board · seen from above · colorful illustration", [2, 3]],
    ["Home appliance · gray studio · front", [0, 5, 7]],
    ["Poster · bold text on yellow background", [1, 3]],
    ["Wordmark · Black text box on gray background", [0, 4, 5]],
    ["Cosmetic props · pastel background · at an angle", [2, 6]],
    ["Magazine cover · flowing rainbow graphic", [3, 6]],
    ["Video capture · dark interior · yellow text", [1, 4]],
    ["Feet in sneakers · Close to the ground · Strong sunlight", [1, 6]],
    ["Puzzle box pile · shelf · front view", [2, 7]],
  ];
  const worksEl = document.querySelector('[data-slot="all-works"], [data-slot="more-works"]');
  if (worksEl) {
    const grid = worksEl.querySelector(".lt-works__tiles");
    // The original has 30 tiles (five columns, six rows at 1440) — the fifteen placeholders are cycled twice
    grid.innerHTML = TILES.concat(TILES).map(
      ([label, tags], i) => `<section class="lt-tile" data-tags="${tags.join(" ")}"><a class="lt-tile__link" href="detail.html">
        <div class="lt-tile__media wf-img${i % 3 === 1 ? " wf-video" : ""}" data-label="${label}"></div>
        <h3 class="lt-tile__title" data-label="One-line work intro · only the client name in bold">${["Branding and campaign for", "Identity and motion for the next season of", "A playful new name for", "Launching a fresh product line with", "Brand ID, motion and web for"][i % 5]} <b>Client ${String(i + 1).padStart(2, "0")}</b></h3>
      </a></section>`,
    ).join("");
    const tiles = [...grid.children];
    // Original: except for the tile that entered, invert the blur of the rest — on when entering, off when leaving
    const flip = (e) => tiles.forEach((t) => t !== e.currentTarget && t.classList.toggle("is-blur"));
    if (matchMedia("(hover: hover)").matches) tiles.forEach((t) => { t.addEventListener("mouseenter", flip); t.addEventListener("mouseleave", flip); });
    const list = worksEl.querySelector(".lt-works__list");
    if (list) {
      list.innerHTML =
        `<li class="lt-works__item"><input type="radio" id="lt-f-all" name="lt-filter" value="all" checked><label for="lt-f-all">All</label></li>` +
        TAGS.map((t, i) => `<li class="lt-works__item"><input type="radio" id="lt-f-${i}" name="lt-filter" value="${i}"><label for="lt-f-${i}">${t}</label></li>`).join("");
      let current = "all";
      list.addEventListener("click", (e) => {
        const input = e.target.closest("input");
        if (!input) return;
        // Original: pressing the selected item once more returns to All
        if (input.value === current && current !== "all") {
          current = "all";
          list.querySelector("#lt-f-all").checked = true;
        } else current = input.value;
        tiles.forEach((t) => (t.hidden = current !== "all" && !t.dataset.tags.split(" ").includes(current)));
      });
    }
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("lt-foot");
    foot.id = "contact";
    foot.innerHTML = `
      <section class="lt-foot__contact">
        <aside class="lt-foot__aside lt-foot__aside--1"><p data-label="Cell name in English">Contact</p><a class="lt-uline" href="#">hello@studio-name.com</a></aside>
        <figure class="lt-foot__fig"><div class="lt-wordmark" data-label="Studio English wordmark — one thin serif word above one bold sans-serif uppercase word"><span class="lt-wordmark__a">Studio</span><span class="lt-wordmark__b">NAME</span></div></figure>
        <aside class="lt-foot__aside lt-foot__aside--2"><p data-label="Cell name in English">Follow</p><a class="lt-uline" href="#">@studioname</a></aside>
      </section>
      <section class="lt-foot__about" data-label="One-line studio intro in two lines of English">A short line about craft and ideas.
Est. 0000, Neighborhood, City Name.</section>
      <section class="lt-foot__part"><p>Names of the two people who run the studio together go here on one line.</p></section>
      <section class="lt-foot__copy"><p>Website developed by <a class="lt-uline" href="#">Partner Name</a>. © Copyright 0000</p></section>`;
  }

  // Transition: the original css has .page-enter-active (.5s) but the page transition is turned off — measured, the old screen switches instantly in 83ms. So we keep plain navigation.
  LT.page = page;
})();
