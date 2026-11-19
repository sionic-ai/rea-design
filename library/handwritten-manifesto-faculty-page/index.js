// Fills the art slots (comic panels, interest pills, course art, map) with our line art, and opens the ‹More details› panel.
// Original button: on phone it expands in place and changes the text to ”Close” while moving smoothly over the panel (-70px), above 1100px a panel fixed at 90% of the screen.
(() => {
  const NS = "http://www.w3.org/2000/svg";
  const rng = (seed) => () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);

  // One comic page — divide it into panels and draw a few of these in each panel: characters, robots, speech bubbles, background patterns
  const face = (x, y, r, robot) => robot
    ? `<rect class="nh-cm-robot" x="${x - r}" y="${y - r * 0.9}" width="${r * 2}" height="${r * 1.8}" rx="${r * 0.8}"/><rect class="nh-cm-dark" x="${x - r * 0.75}" y="${y - r * 0.3}" width="${r * 1.5}" height="${r * 0.6}" rx="${r * 0.3}"/>`
    : `<path class="nh-cm-hair" d="M${x - r * 1.1} ${y}c0-${r * 1.4} ${r * 2.2}-${r * 1.4} ${r * 2.2} 0Z"/><circle class="nh-cm-skin" cx="${x}" cy="${y + r * 0.15}" r="${r * 0.82}"/><path class="nh-cm-line" d="M${x - r * 0.3} ${y + r * 0.1}h1M${x + r * 0.3} ${y + r * 0.1}h1"/>`;
  const comic = (seed, w = 540, h = 680) => {
    const R = rng(seed);
    let out = "";
    const panels = [];
    const rows = 3 + Math.floor(R() * 2);
    let y = 6;
    for (let i = 0; i < rows; i++) {
      const ph = (h - 12 - (rows - 1) * 12) * (0.7 + R() * 0.6) / rows;
      const hh = i === rows - 1 ? h - 6 - y : ph;
      const split = R() > 0.35;
      const cut = w * (0.35 + R() * 0.3);
      if (split) { panels.push([6, y, cut - 12, hh]); panels.push([cut + 6, y, w - cut - 12, hh]); }
      else panels.push([6, y, w - 12, hh]);
      y += hh + 12;
    }
    panels.forEach(([x, py, pw, ph], i) => {
      const dark = R() > 0.78;
      out += `<rect class="${dark ? "nh-cm-dark" : "nh-cm-panel"}" x="${x}" y="${py}" width="${pw}" height="${ph}"/>`;
      out += `<clipPath id="nhc-${seed}-${i}"><rect x="${x}" y="${py}" width="${pw}" height="${ph}"/></clipPath><g clip-path="url(#nhc-${seed}-${i})">`;
      if (dark) for (let s = 0; s < 6; s++) out += `<circle class="nh-cm-star" cx="${x + R() * pw}" cy="${py + R() * ph}" r="${1.5 + R() * 3}"/>`;
      else if (R() > 0.5) out += `<rect class="nh-cm-tone" x="${x + 2}" y="${py + ph * 0.6}" width="${pw - 4}" height="${ph * 0.4 - 2}"/>`;
      const r = Math.min(pw, ph) * (0.16 + R() * 0.1);
      const cx = x + pw * (0.3 + R() * 0.4), cy = py + ph * (0.45 + R() * 0.2);
      out += face(cx, cy, r, R() > 0.7);
      out += `<path class="nh-cm-line" d="M${cx - r} ${cy + r * 1.1}c${r * 0.4} ${r * 0.6} ${r * 1.6} ${r * 0.6} ${r * 2} 0v${Math.min(r * 1.4, py + ph - cy - r * 1.2)}"/>`;
      if (R() > 0.35) {
        const bx = x + pw * (R() > 0.5 ? 0.78 : 0.22), by = py + ph * 0.22, bw = Math.min(pw * 0.32, 90), bh = Math.min(ph * 0.3, 80);
        out += `<ellipse class="nh-cm-bubble" cx="${bx}" cy="${by}" rx="${bw / 2}" ry="${bh / 2}"/>`;
        for (let l = 0; l < 3; l++) out += `<path class="nh-cm-line" d="M${bx + bw * 0.2 - l * 9} ${by - bh * 0.25}v${bh * 0.5}"/>`;
      }
      out += `</g>`;
    });
    return `<svg viewBox="0 0 ${w} ${h}" aria-hidden="true">${out}</svg>`;
  };
  document.querySelectorAll("[data-comic]").forEach((el) => { el.innerHTML = comic(+el.dataset.comic); });

  // Interest pills — word-tag spots in the original picture
  const board = document.getElementById("nh-tags");
  if (board) {
    const words = ["Ramen", "Revitalizing the Region", "Game", "Comic", "Historical era", "Music", "Movie", "Travel", "Myth", "Fashion", "Picture book", "Idol", "Cooking", "Architecture", "Animal", "Space"];
    const R = rng(5);
    const looks = ["", "is-y", "is-o", "is-m"];
    board.innerHTML = words.map((t, i) => {
      const col = i % 4, row = Math.floor(i / 4);
      const left = 4 + col * 24 + R() * 8, top = 6 + row * 21 + R() * 8;
      return `<span class="nh-tag ${looks[i % 4]}" style="left:${left.toFixed(1)}%;top:${top.toFixed(1)}%;--r:${(R() * 16 - 8).toFixed(1)}deg">${t}</span>`;
    }).join("") + `<div class="nh-glass__girl" aria-hidden="true"><svg viewBox="260 250 220 330"><use href="#nh-robot-girl"/></svg></div>`;
  }

  // Five courses
  const list = document.getElementById("nh-courses");
  if (list) {
    const courses = [["Course name 1", "Course One"], ["Course name 2", "Course Two"], ["Course name 3", "Course Three"], ["Course name 4", "Course Four"], ["Course name 5", "Course Five"]];
    list.innerHTML = courses.map(([ko, en], i) => `
      <div class="nh-course__item">
        <div class="nh-course__icon" data-label="Course ${i + 1} Comic panel art · characters and speech bubble · landscape">${comic(101 + i * 17, 540, 420)}</div>
        <p class="nh-course__title">${ko}<span> Course</span></p>
        <p class="nh-course__en" data-label="Course English name">${en}</p>
        <button class="nh-btn nh-course__btn" type="button" data-more><span>Learn more</span><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M6 1v10M1 6h10"/></svg></button>
        <div class="nh-modal" data-modal>
          <div class="nh-modal__inner">
            <span class="nh-learn__after" aria-hidden="true"></span>
            <p class="nh-modal__title"><span>$ here{ko}About Title of</span></p>
            <p class="nh-modal__text">Your four lines here on what the course teaches. Note the eras, regions and materials covered and how you learn.</p>
            <div class="wf-img" style="margin-top:40px;aspect-ratio:16/9;border-radius:10px" data-label="${ko} Class scene · Classroom · Landscape 16:9"></div>
            <ul class="nh-modal__list"><li><p class="nh-modal__h">FUTURE</p><div class="nh-modal__card"><p class="nh-modal__sub">Your post-graduation career title here</p><p class="nh-modal__subtext">Your career examples in about three lines go here.</p></div></li></ul>
            <button class="nh-btn nh-modal__close" type="button"><span>Close</span><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 2l8 8M10 2l-8 8"/></svg></button>
          </div>
        </div>
      </div>`).join("");
  }

  // Map — island, waterway, road, house, tree, signpost
  const map = document.getElementById("nh-map");
  if (map) {
    const R = rng(13);
    let s = `<path class="nh-map-land" d="M80 420c-20-120 80-240 240-260 120-80 300-100 420-40 140-50 320-20 400 80 120 60 160 200 80 300-40 120-200 200-380 180-160 60-380 40-500-40-160-20-280-100-260-220Z"/>`;
    s += `<path class="nh-map-water" d="M520 120c-20 120 40 200 10 300s30 200 0 300h60c30-100-20-200 10-300s-30-180-10-300Z"/>`;
    s += `<path class="nh-map-road-edge" d="M160 480c160-60 260 40 420-20s300-140 460-40M300 250c60 100 40 260 140 360M900 220c-40 120 20 240-20 380"/><path class="nh-map-road" d="M160 480c160-60 260 40 420-20s300-140 460-40M300 250c60 100 40 260 140 360M900 220c-40 120 20 240-20 380"/>`;
    for (let i = 0; i < 26; i++) {
      const x = 160 + R() * 960, y = 220 + R() * 360;
      if (Math.abs(x - 550) < 50) continue;
      if (R() > 0.45) s += `<rect class="nh-map-house" x="${x}" y="${y}" width="${22 + R() * 18}" height="${18 + R() * 16}"/><path class="nh-map-roof" d="M${x - 4} ${y}l${15 + R() * 6}-14l${15 + R() * 6} 14Z"/>`;
      else s += `<circle class="nh-map-tree" cx="${x}" cy="${y}" r="${12 + R() * 10}"/>`;
    }
    [["Lesson 1", 260, 360], ["Lesson 2", 760, 300], ["Lesson 3", 980, 520], ["Course", 420, 600]].forEach(([t, x, y]) => {
      s += `<rect class="nh-map-sign" x="${x - 52}" y="${y - 30}" width="104" height="44" rx="22"/><text class="nh-map-label" x="${x}" y="${y}" text-anchor="middle">${t}</text>`;
    });
    map.innerHTML = s;
  }

  // ‹Learn more› · ‹Close›
  const pc = matchMedia("(min-width: 1100px)");
  let back = 0;
  const label = (btn, open) => { const sp = btn.querySelector("span"); if (sp) sp.textContent = open ? "Close" : "Learn more"; };
  document.querySelectorAll(".nh-learn__more, [data-more]").forEach((btn) => {
    const modal = btn.parentElement.querySelector(":scope > [data-modal]");
    if (!modal) return;
    btn.addEventListener("click", () => {
      back = scrollY;
      const open = !modal.classList.contains("is-open");
      modal.classList.toggle("is-open", open);
      // Like the original, apply a slanted clip to the plate and the inner color plate on press (each plate has a different bottom-edge slope)
      const cut = modal.closest(".is-2") ? "polygon(0 0, 100% 0, 100% 97%, 0 100%)" : "polygon(0 0, 100% 0, 100% 100%, 0 96.6%)";
      const inner = modal.querySelector(".nh-modal__inner"), after = inner && inner.querySelector(":scope > .nh-learn__after");
      if (inner) inner.style.clipPath = cut;
      if (after) after.style.clipPath = cut;
      // On desktop the original flips the panel’s active on each press to release the slanted clip
      const detail = btn.closest(".nh-learn__detail");
      if (pc.matches) { if (detail) detail.classList.toggle("is-active"); document.body.style.overflow = open ? "hidden" : ""; return; }
      label(btn, open);
      if (open) scrollTo({ top: modal.getBoundingClientRect().top + pageYOffset - 70, behavior: "smooth" });
    });
    modal.querySelector(".nh-modal__close")?.addEventListener("click", () => {
      modal.classList.remove("is-open");
      document.body.style.overflow = "";
      if (pc.matches) btn.closest(".nh-learn__detail")?.classList.toggle("is-active");
      if (!pc.matches) { scrollTo(0, back); label(btn, false); }
    });
  });
})();
