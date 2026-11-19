// Home page — opening veil (35 collage pieces), yellow MENU panel, member photo slider (slick), phone first-screen collage (original sp-mv.js is-play)
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const opening = document.getElementById("opening"), wrap = document.getElementById("openingSvg");
  const top = document.querySelector(".top"), copy = document.querySelector(".mv-copy");
  const showAll = () => { copy && copy.classList.add("is-show"); top && top.classList.add("is-content-show"); };

  // Piece positions of original opening.svg (1920×1080 panel, slice) — the artwork is painted with our own shapes and patterns
  const R = [[209,630,163,217],[1664,847,349,332],[-96,224,452,385],[658,-178,783,667],[1381,-27,568,484],[-5,829,237,134],[18,-213,516,491],[494,740,499,314],[1664,713,212,53],[688,669,753,641],[129,156,431,410],[129,872,118,118],[95,621,698,816],[1564,559,361,63],[959,1044,749,638,-60],[474,-120,516,491],[1478,355,163,226],[18,621,155,88],[1515,8,166,297],[732,0,976,1013],[901,691,163,217],[355,322,713,608],[419,609,605,515,-60],[1132,456,218,208],[959,470,206,197],[164,497,361,63],[871,466,537,458,-60],[373,911,212,53],[580,1080,336,336,-120],[901,113,405,205],[585,-27,405,205],[1889,833,180,321,90],[2,829,129,231,-90],[728,470,516,491]];
  const FILL = ["cg-photo", "cg-yellow", "cg-dots", "cg-ink", "cg-white", "cg-stripes", "cg-cyan", "cg-photo", "cg-pink", "cg-grey"];
  const STEP2 = [2, 4, 10, 17, 23, 24];
  const mobile = matchMedia("(max-width: 767px)").matches;
  let played = false;
  try { played = /(?:^|; )openingPlayed=1/.test(document.cookie); } catch (e) {}
  if (!opening || mobile || played || reduce) {
    if (opening) opening.remove();
    if (top) top.classList.remove("opening-sequence");
    showAll();
  } else {
    document.cookie = "openingPlayed=1; max-age=604800; path=/; SameSite=Lax";
    // Big pieces become round stickers shrunk toward the center — reduced by the empty margin of the original transparent PNG that covered the whole screen
    wrap.innerHTML = `<svg viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><g>${R.map(([x, y, w, h, rot], i) => {
      const k = w * h > 250000 ? 0.62 : 0.86, cx = x + w / 2, cy = y + h / 2;
      return `<rect class="${FILL[i % FILL.length]}" x="${(cx - (w * k) / 2).toFixed(1)}" y="${(cy - (h * k) / 2).toFixed(1)}" width="${(w * k).toFixed(1)}" height="${(h * k).toFixed(1)}" rx="${Math.min(w, h) * 0.08 | 0}"${rot ? ` transform="rotate(${rot} ${x} ${y})"` : ""}/>`;
    }).join("")}</g></svg>`;
    const items = [...wrap.querySelectorAll("rect")];
    items.forEach((el) => { el.style.opacity = "0"; el.style.transition = "none"; });
    const s2 = STEP2.map((i) => items[i]).filter(Boolean), s3 = items.filter((el, i) => !STEP2.includes(i));
    setTimeout(() => s2.forEach((el, i) => setTimeout(() => { el.style.transition = "opacity .28s cubic-bezier(.22,1,.36,1)"; el.style.opacity = "1"; }, i * 55)), 100);
    setTimeout(() => [...s3].sort(() => Math.random() - 0.5).forEach((el, i) => setTimeout(() => { el.style.transition = "opacity .1s ease-out"; el.style.opacity = "1"; }, i * 7)), 650);
    setTimeout(() => {
      opening.classList.add("is-hide");
      setTimeout(() => copy && copy.classList.add("is-show"), 350);
      setTimeout(() => top && top.classList.add("is-content-show"), 750);
    }, 1450);
  }

  // Yellow MENU panel
  const navBtn = document.querySelector(".navToggle-top"), nav = document.querySelector(".top__headGlobal");
  if (navBtn && nav) navBtn.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    navBtn.classList.toggle("active", open);
    navBtn.setAttribute("aria-expanded", open ? "true" : "false");
  });

  // Member photos — slick autoplay (default 3s) · .5s slide · infinite · no arrows or dots
  if (window.jQuery && jQuery.fn.slick) jQuery(".member-slider").slick({ autoplay: !reduce, arrows: false, dots: false, infinite: true, speed: 500, slidesToShow: 1, slidesToScroll: 1 });

  // Phone Hero collage — [entrance, original width, height, left %, top %, width %, delay s, repeat type, repeat start s, fill, tilt]
  const mv = document.querySelector(".spMv");
  if (mv) {
    const P = [
      ["mvPhoto", 565, 487, 0, 9.7, 50.2, 0, "", 0, "photo", -5], ["mvPhoto", 501, 373, 55.5, 10.5, 44.5, 0.12, "", 0, "photo", 5],
      ["mvPop", 94, 102, 13.9, 8.6, 8.4, 1.65, "idle-blink", 2.4, "yellow"], ["mvSpin", 60, 60, 38.9, 12.8, 5.3, 1.6, "idle-tick", 2.5, "star"],
      ["mvPop", 147, 75, 77.3, 26.3, 13.1, 1.4, "", 0, "stripes"], ["mvPhoto", 297, 437, 73.6, 31.5, 26.4, 0.3, "", 0, "photo", 8],
      ["mvPop", 315, 324, 0, 38.2, 28, 0.3, "idle-paint", 2.4, "yellow-blob"], ["mvPop", 299, 322, 5.7, 32.5, 26.6, 0.48, "idle-paint", 2.65, "cyan-blob"],
      ["mvPop", 296, 301, 49.3, 31.7, 26.3, 0.56, "", 0, "dots"], ["mvPop", 524, 356, 33.7, 39.2, 46.6, 0.6, "idle-paint", 3.4, "word"],
      ["mvWipe", 655, 121, 2.3, 32.9, 58.2, 1, "", 0, "tape"], ["mvPop", 208, 200, 81.3, 53.9, 18.5, 0.55, "idle-shift", 2.5, "pink"],
      ["mvPhoto", 303, 232, 73.1, 51.5, 26.9, 0.6, "", 0, "photo", -5], ["mvPhoto", 476, 598, 48, 63, 42.3, 0.9, "", 0, "photo", 4],
      ["mvPop", 123, 124, 30.9, 60.4, 10.9, 1.5, "idle-tick", 3.3, "ring"], ["mvSpin", 26, 26, 43.2, 60.4, 2.3, 1.6, "idle-hop", 2.6, "ink-dot"],
      ["mvPop", 284, 285, 12.4, 71.1, 25.2, 0.85, "idle-beat", 2.7, "yellow-blob"], ["mvPhoto", 312, 278, 9.2, 70.3, 27.7, 0.95, "", 0, "photo", -4],
      ["mvPop", 139, 243, 50.3, 69.8, 12.4, 1.45, "idle-flicker", 3.2, "stripes"], ["mvPhoto", 218, 167, 80.6, 71.5, 19.4, 1.5, "", 0, "photo", 8],
      ["mvPhoto", 574, 363, 40.1, 80.9, 51, 1.15, "", 0, "photo", 5], ["mvPhoto", 346, 286, 0, 86.1, 30.8, 1.1, "", 0, "photo", -6],
      ["mvPop", 231, 222, 0, 89.2, 20.5, 1.2, "idle-shift", 3.3, "cyan-blob"], ["mvPhoto", 387, 333, 65.6, 83.8, 34.4, 1.05, "", 0, "photo", 0],
      ["mvWipe", 196, 48, 76.2, 82.8, 17.4, 1.55, "idle-shift", 2.8, "tape"], ["mvPop", 82, 213, 0, 70.6, 7.3, 1.3, "idle-tick", 2.8, "ink-dot"],
    ];
    const SHAPE = {
      photo: (w, h) => `<rect class="cg-photo" width="${w}" height="${h}"/><rect class="cg-white" x="${w * 0.04}" y="${h * 0.04}" width="${w * 0.92}" height="${h * 0.92}" opacity=".18"/>`,
      yellow: (w, h) => `<rect class="cg-yellow" width="${w}" height="${h}" rx="${w * 0.2}"/>`,
      "yellow-blob": (w, h) => `<ellipse class="cg-yellow" cx="${w / 2}" cy="${h / 2}" rx="${w / 2}" ry="${h / 2.2}"/>`,
      "cyan-blob": (w, h) => `<ellipse class="cg-cyan" cx="${w / 2}" cy="${h / 2}" rx="${w / 2.1}" ry="${h / 2}"/>`,
      pink: (w, h) => `<rect class="cg-pink" width="${w}" height="${h}" rx="${w * 0.3}"/>`,
      dots: (w, h) => `<circle class="cg-dots" cx="${w / 2}" cy="${h / 2}" r="${Math.min(w, h) / 2}"/>`,
      stripes: (w, h) => `<rect class="cg-stripes" width="${w}" height="${h}"/>`,
      star: (w, h) => `<path class="cg-ink" d="M${w / 2} 0l${w * 0.12} ${h * 0.38} ${w * 0.38} ${h * 0.12}-${w * 0.38} ${h * 0.12}-${w * 0.12} ${h * 0.38}-${w * 0.12}-${h * 0.38}-${w * 0.38}-${h * 0.12} ${w * 0.38}-${h * 0.12}z"/>`,
      ring: (w, h) => `<circle class="cg-line" cx="${w / 2}" cy="${h / 2}" r="${w * 0.42}" stroke-width="${w * 0.1}" stroke-dasharray="${w * 0.2} ${w * 0.1}"/>`,
      "ink-dot": (w, h) => `<ellipse class="cg-ink" cx="${w / 2}" cy="${h / 2}" rx="${w / 2}" ry="${h / 2}"/>`,
      tape: (w, h) => `<rect class="cg-yellow" width="${w}" height="${h}"/><rect class="cg-stripes" width="${w}" height="${h}" opacity=".35"/>`,
      word: (w, h) => `<text class="cg-ink d-font" x="${w / 2}" y="${h * 0.62}" text-anchor="middle" font-size="${h * 0.42}">Word!!</text>`,
    };
    mv.innerHTML = P.map(([cls, w, h, l, t, wd, d, idle, i, fill, r]) =>
      `<span class="${cls}${idle ? " " + idle : ""}" style="left:${l}%;top:${t}%;width:${wd}%;--d:${d}s${idle ? `;--i:${i}s` : ""}${r ? `;--r:${r}deg` : ""}"><svg viewBox="0 0 ${w} ${h}" aria-hidden="true">${SHAPE[fill](w, h)}</svg></span>`).join("");
    if (matchMedia("(max-width: 640px)").matches) {
      // The original starts after all piece images are unpacked (4s safety) — our pieces are SVG, so it starts immediately
      requestAnimationFrame(() => mv.classList.add("is-play"));
    }
  }
})();
