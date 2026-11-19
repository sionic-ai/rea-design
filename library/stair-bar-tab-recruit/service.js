// Company main site service page: dropdown (.12s expand · .25s later collapse), floats up when entering 80% of the screen, redraws the charts (semicircle·puzzle·octagon·bubble·comparison table).
(() => {
  const { burst, art } = window.CREA;
  document.querySelectorAll(".s-burst").forEach((el) => (el.innerHTML = burst()));

  /* Dropdown: original jQuery slideDown(120)·slideUp(120), waits 250ms on leaving */
  let leaveTimer;
  const slide = (el, open) => {
    el.style.display = "block";
    const h = el.scrollHeight;
    el.animate(open ? [{ height: "0px" }, { height: h + "px" }] : [{ height: h + "px" }, { height: "0px" }], { duration: 120 })
      .onfinish = () => { if (!open) el.style.display = "none"; };
  };
  const items = [...document.querySelectorAll(".s-nav__list > li.has-sub")];
  items.forEach((li) => {
    const sub = li.querySelector(".s-sub");
    li.addEventListener("mouseenter", () => {
      clearTimeout(leaveTimer);
      items.forEach((o) => { if (o !== li && o.classList.contains("is-open")) { o.classList.remove("is-open"); o.querySelector(".s-sub").style.display = "none"; } });
      if (!li.classList.contains("is-open")) { li.classList.add("is-open"); slide(sub, true); }
    });
    li.addEventListener("mouseleave", () => {
      leaveTimer = setTimeout(() => { li.classList.remove("is-open"); slide(sub, false); }, 250);
    });
  });

  /* Product semicircle: 8 fan-shaped cells from the center figure spot, with brown speech-bubble labels around the edge */
  const arch = document.querySelector(".s-arch");
  const cx = 320, cy = 330, r = 240;
  let svg = "";
  for (let i = 0; i < 8; i++) {
    const a0 = Math.PI + (i / 8) * Math.PI, a1 = Math.PI + ((i + 1) / 8) * Math.PI;
    const p = (a, rr) => `${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr).toFixed(1)}`;
    svg += `<path d="M${p(a0, 90)} L${p(a0, r)} A${r} ${r} 0 0 1 ${p(a1, r)} L${p(a1, 90)} A90 90 0 0 0 ${p(a0, 90)}Z" fill="${i % 2 ? "var(--site-cream)" : "var(--site-cream-deep)"}" stroke="var(--site-brown)" stroke-width="1"/>`;
    const am = (a0 + a1) / 2;
    svg += `<rect x="${(cx + Math.cos(am) * 165 - 14).toFixed(1)}" y="${(cy + Math.sin(am) * 165 - 12).toFixed(1)}" width="28" height="24" rx="3" fill="none" stroke="var(--site-gray-53)"/>`;
    if (i % 2 === 0) {
      const lx = cx + Math.cos(am) * (r + 50), ly = cy + Math.sin(am) * (r + 30);
      svg += `<rect x="${(lx - 46).toFixed(1)}" y="${(ly - 16).toFixed(1)}" width="92" height="32" fill="var(--site-brown)"/><text x="${lx.toFixed(1)}" y="${(ly + 4).toFixed(1)}" font-size="10" fill="var(--kf-surface)" text-anchor="middle">Product field ${i / 2 + 1}</text>`;
    }
  }
  svg += `<path d="M${cx - 90} ${cy} A90 90 0 0 1 ${cx + 90} ${cy}Z" fill="var(--site-lemon-tint)" stroke="var(--site-brown)"/><circle cx="${cx}" cy="${cy - 40}" r="14" fill="var(--site-gray-80)"/><path d="M${cx - 22} ${cy} q22 -40 44 0z" fill="var(--site-gray-80)"/>`;
  arch.innerHTML = `<svg viewBox="0 0 640 360">${svg}</svg>`;

  /* Nine-cell puzzle · octagonal radar chart */
  document.querySelector(".s-puzzle").innerHTML = Array.from({ length: 9 }, (_, i) => `<span>Contrast ${i + 1}</span>`).join("");
  const octa = document.querySelector(".s-octa");
  const pts = Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2 - Math.PI / 2 + Math.PI / 8; return [100 + Math.cos(a) * 90, 100 + Math.sin(a) * 90]; });
  octa.innerHTML = `<polygon points="${pts.map((p) => p.join(",")).join(" ")}" fill="var(--kf-surface)" stroke="var(--kf-accent-text)" stroke-width="2"/>` +
    pts.map(([x, y], i) => `<line x1="100" y1="100" x2="${x}" y2="${y}" stroke="var(--kf-accent-text)"/><text x="${100 + (x - 100) * 0.62}" y="${100 + (y - 100) * 0.62 + 3}" font-size="8" text-anchor="middle" fill="var(--site-gray-67)">Method ${i + 1}</text>`).join("") +
    `<g stroke="var(--site-lemon-deep)" stroke-width="1.4">${Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * Math.PI * 2; return `<line x1="${100 + Math.cos(a) * 6}" y1="${100 + Math.sin(a) * 6}" x2="${100 + Math.cos(a) * 14}" y2="${100 + Math.sin(a) * 14}"/>`; }).join("")}</g>`;

  /* Big number bubbles: overlapping pale lemon circles + line icon */
  const bub = document.querySelector(".s-bubbles__art");
  const B = [[8, 30, 150], [20, 8, 120], [30, 40, 200], [45, 10, 160], [52, 45, 230], [62, 5, 140], [70, 35, 190], [82, 12, 130], [85, 50, 170], [12, 60, 110], [38, 70, 120], [66, 68, 140], [92, 28, 90], [2, 5, 80]];
  bub.insertAdjacentHTML("afterbegin", B.map(([x, y, s]) => `<i style="left:${x}%;top:${y}%;width:${s}px;height:${s}px"></i>`).join(""));

  document.querySelectorAll(".s-reasons__art").forEach((el, i) => {
    el.innerHTML = art([2, 10, 7][i]);
    el.querySelector("svg").setAttribute("stroke", "var(--site-gray-67)");
  });

  /* Comparison table: our column (yellow) + 6 competitors, 12 rows */
  const COLS = ["BRAND", "Comparison 1", "Comparison 2", "Comparison 3", "Comparison 4", "Comparison 5", "Comparison 6"];
  const MARK = ["○", "△", "×"];
  let rows = `<tr><th>Consultation fee</th><td>000,000 won<br>(Tax included)</td><td>By Product<br>Separate</td><td colspan="5">Product Proposals Only</td></tr><tr><th>Time Limit</th><td>None</td><td>Present</td><td colspan="5">None</td></tr>`;
  for (let i = 0; i < 12; i++) rows += `<tr><th>Product field ${i + 1}</th>${COLS.map((_, c) => `<td>${c === 0 ? (i === 6 ? "△" : "○") : MARK[(i * 3 + c * 5) % 3]}</td>`).join("")}</tr>`;
  document.querySelector(".s-matrix").innerHTML = `<table><thead><tr><th></th>${COLS.map((c) => `<th>${c}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table>`;

  document.querySelector(".s-four").innerHTML = [3, 7, 6, 11].map((ic, i) => `
    <li><div class="s-four__art"><b class="c-en">0${i + 1}</b>${art(ic)}</div>
      <h4><i>${i + 1}</i>Your feature $ here{i + 1} Title</h4>
      <p>A description of about five lines goes here. Say what is good for customers, what system protects it, and what sets you apart from others.</p></li>`).join("");
  document.querySelectorAll(".s-four__art svg").forEach((s) => s.setAttribute("stroke", "var(--site-gray-67)"));

  /* Comparison table modal: on press the overlay and table pop up in 0.2s, pressing the overlay closes it */
  const lean = document.querySelector(".s-lean");
  document.querySelectorAll("[data-lean]").forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    lean.querySelectorAll(".s-lean__box").forEach((b) => b.classList.toggle("is-active", b.dataset.leanBox === a.dataset.lean));
    lean.style.display = "flex";
    requestAnimationFrame(() => lean.classList.add("is-open"));
  }));
  lean.addEventListener("click", (e) => {
    if (e.target !== lean) return;
    lean.classList.remove("is-open");
    setTimeout(() => (lean.style.display = "none"), 200);
  });

  /* Floats up when it reaches the 80% point of the screen — for users who turned motion off, it starts at the final state */
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hides = document.querySelectorAll(".s-hide");
  if (reduce) {
    document.querySelectorAll(".iv").forEach((el) => el.classList.add("is-on"));
    return;
  }
  hides.forEach((el) => el.classList.add("is-hidden"));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-on");
      e.target.classList.remove("is-hidden");
      io.unobserve(e.target);
    });
  }, { rootMargin: "0px 0px -20% 0px" });
  document.querySelectorAll(".iv, .s-hide").forEach((el) => io.observe(el));
})();
