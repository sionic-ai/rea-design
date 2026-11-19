// Collaboration page: three gears (partner → project → us), corner gears, belt-driven steps, a pair of center gears
(() => {
  const { gearPath, makeChain, driveChain, place, clock } = LG;
  document.getElementById('footSlot').outerHTML = LG.footer('Partnership Name');
  gsap.registerPlugin(ScrollTrigger);
  LG.themeHeader();
  LG.reveals();

  // Hero: the partner’s gear turns the project gear, which turns our gear
  const HM = 10;
  const yours = { z: 22, c: 'var(--kf-accent)', x: 0, y: 0, t: 'Partner Name', s: 'What you bring in' };
  // Background-colored holes cover same-colored labels so there are no holes, as in the original
  const project = { z: 26, c: 'var(--kf-ink)', t: 'Project Name', s: 'One plan', lc: 'var(--kf-bg)', hole: 0 };
  Object.assign(project, place(HM, yours, project, 35));
  const ours = { z: 16, c: 'var(--site-yellow)', from: 1, t: 'Our Name', s: 'Things we build' };
  Object.assign(ours, place(HM, project, ours, 145));
  const trio = document.getElementById('trio');
  const hero = makeChain(document.getElementById('trioSvg'), [yours, project, ours], HM, 10);
  hero.gears.forEach((g) => {
    const d = document.createElement('div'); d.className = 'lbl';
    d.innerHTML = `<b>${g.t}</b><small>${g.s}</small>`; d.style.color = g.lc || 'var(--kf-ink)';
    d.style.left = ((g.x - hero.vb.x) / hero.vb.w * 100) + '%'; d.style.top = ((g.y - hero.vb.y) / hero.vb.h * 100) + '%';
    trio.append(d);
  });
  const smalls = [...document.querySelectorAll('.corner')].map((svg, i) => {
    const z = +svg.dataset.z, m = 180 / (z + 2);
    svg.innerHTML = `<path d="${gearPath(z, m, m * z * 0.18)}" fill-rule="evenodd"/>`;
    return { el: svg.firstChild, z, dir: i % 2 ? -1 : 1 };
  });
  const pa = { z: 14, c: 'var(--kf-accent)', x: 0, y: 0 }, pb = { z: 14, c: 'var(--site-yellow)' };
  Object.assign(pb, place(10, pa, pb, innerWidth <= 820 ? 0 : 90));
  const pair = makeChain(document.getElementById('pairSvg'), [pa, pb], 10, 4);
  LG.ctaMesh(document.getElementById('mesh'), ['var(--kf-contrast-bg)', 'var(--site-yellow)']);

  gsap.ticker.add(() => {
    const ph = clock.phase * 0.88;
    driveChain(hero, ph);
    driveChain(pair, ph * 1.3);
    smalls.forEach((s) => s.el.setAttribute('transform', `rotate(${(s.dir * ph * 60 * 12 / s.z).toFixed(1)})`));
  });

  // Belt: five pulleys on one belt. Scroll pushes the belt by (distance between pulleys × 3.2) and the pulleys turn by the distance rolled
  const STAGES = [['Step 1', 'Your one-line step description here. Read the requirements together and say honestly whether they fit.'], ['Step 2', 'Your one-line step description here.'],
    ['Step 3', 'Your one-line step description here. A plan you can keep even after several weeks.'], ['Step 4', 'Your one-line step description here.'], ['Step 5', 'Your one-line step description here. Keeps looping.']];
  const svg = document.getElementById('beltSvg'), stage = svg.parentElement, cap = document.getElementById('beltCap');
  const W = 1600, H = 330, R = 58, cy = 120, x1 = 140, xN = W - 140, n = STAGES.length;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  const xs = STAGES.map((_, i) => x1 + i * (xN - x1) / (n - 1));
  const path = `M${x1} ${cy - R}L${xN} ${cy - R}A${R} ${R} 0 0 1 ${xN} ${cy + R}L${x1} ${cy + R}A${R} ${R} 0 0 1 ${x1} ${cy - R}Z`;
  const spokes = Array.from({ length: 5 }, (_, k) => { const a = k * 2 * Math.PI / 5; return `<line x1="0" y1="0" x2="${(R * 0.72 * Math.cos(a)).toFixed(1)}" y2="${(R * 0.72 * Math.sin(a)).toFixed(1)}"/>`; }).join('');
  svg.innerHTML = `<path d="${path}" fill="none" stroke="var(--kf-bg)" stroke-width="7"/><path class="teeth" d="${path}" fill="none" stroke="var(--kf-bg)" stroke-width="18" stroke-dasharray="7 9"/>` +
    xs.map((x, i) => `<g class="pul" transform="translate(${x} ${cy})"><circle r="${R - 9}" fill="var(--kf-accent)"/><g stroke="var(--kf-contrast-bg)" stroke-width="7" stroke-linecap="round">${spokes}</g><circle r="${R * 0.2}" fill="var(--kf-contrast-bg)"/></g>` +
      `<text class="num" x="${x}" y="${cy + R + 56}" text-anchor="middle">0${i + 1}</text><text class="ttl" x="${x}" y="${cy + R + 96}" text-anchor="middle">${STAGES[i][0]}</text>`).join('');
  const teeth = svg.querySelector('.teeth'), puls = [...svg.querySelectorAll('.pul')], nums = svg.querySelectorAll('.num'), ttls = svg.querySelectorAll('.ttl');
  const travel = 3.2 * (xN - x1), st = { p: 0 };
  let last = -1, panX = 0;
  function drawBelt() {
    const s = st.p * travel, ang = s / R * 180 / Math.PI, on = Math.min(n - 1, Math.floor(st.p * n * 0.999));
    teeth.setAttribute('stroke-dashoffset', (-s).toFixed(1));
    puls.forEach((g, i) => { g.setAttribute('transform', `translate(${xs[i]} ${cy}) rotate(${ang.toFixed(1)})`); g.firstChild.setAttribute('fill', i === on ? 'var(--site-yellow)' : 'var(--kf-accent)'); });
    if (on !== last) {
      last = on;
      nums.forEach((e, i) => e.classList.toggle('on', i === on)); ttls.forEach((e, i) => e.classList.toggle('on', i === on));
      cap.textContent = STAGES[on][1];
      // Phone: the belt is wider than the screen, so it shifts toward the pulley over .5s now
      const Wv = stage.clientWidth, Ws = svg.getBoundingClientRect().width;
      const tx = Ws > Wv + 1 ? Math.min(0, Math.max(Wv - Ws, Wv / 2 - xs[on] * Ws / W)) : 0;
      if (tx !== panX) { panX = tx; gsap.to(svg, { x: tx, duration: 0.5, overwrite: true }); }
    }
  }
  drawBelt();
  gsap.to(st, { p: 1, ease: 'none', onUpdate: drawBelt, scrollTrigger: { trigger: '#belt', start: 'top top', end: '+=200%', pin: true, scrub: 0.4 } });

  gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
    gsap.from('#hero > div:first-child > *', { y: 30, autoAlpha: 0, stagger: 0.08, duration: 0.9, ease: 'power3.out', delay: 0.15 });
    gsap.from('#trio', { scale: 0.85, rotate: -8, autoAlpha: 0, duration: 1.2, ease: 'power3.out', delay: 0.3 });
  });
})();
