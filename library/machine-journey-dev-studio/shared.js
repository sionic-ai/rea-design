// Shared by all pages: draws the header, gear menu and contact window, and exposes the gear-shape drawing tool as window.LG.
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Canvas and three can’t read var() — paint a single point with the Skin variable in the color the browser resolved and return it as rgb() (relative color oklch(from …) is resolved too)
  let probe, px;
  function css(name) {
    if (!probe) {
      probe = Object.assign(document.createElement('i'), { hidden: true }); document.documentElement.append(probe);
      px = Object.assign(document.createElement('canvas'), { width: 1, height: 1 }).getContext('2d', { willReadFrequently: true });
    }
    probe.style.color = `var(${name})`;
    px.clearRect(0, 0, 1, 1); px.fillStyle = getComputedStyle(probe).color; px.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = px.getImageData(0, 0, 1, 1).data;
    return a === 255 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`;
  }

  // Gear outline: z teeth, module m (pitch radius m·z/2), a center hole if hole
  function gearPath(z, m, hole = 0) {
    const rp = m * z / 2, ro = rp + m, rr = rp - 1.25 * m, pitch = 2 * Math.PI / z;
    const P = (r, a) => `${(r * Math.cos(a)).toFixed(2)} ${(r * Math.sin(a)).toFixed(2)}`;
    let d = '';
    for (let i = 0; i < z; i++) {
      const a = i * pitch;
      d += (i ? 'L' : 'M') + P(rr, a - 0.29 * pitch) + 'L' + P(ro, a - 0.17 * pitch) + 'L' + P(ro, a + 0.17 * pitch) + 'L' + P(rr, a + 0.29 * pitch);
      d += `A${rr.toFixed(2)} ${rr.toFixed(2)} 0 0 1 ${P(rr, a + 0.71 * pitch)}`;
    }
    d += 'Z';
    if (hole) d += `M${hole} 0A${hole} ${hole} 0 1 0 ${-hole} 0A${hole} ${hole} 0 1 0 ${hole} 0Z`;
    return d;
  }
  // Position meshing with the neighboring gear: from a in direction angDeg (0.08m of clearance between)
  const place = (m, a, b, angDeg) => {
    const d = m * (a.z + b.z) / 2 + 0.08 * m, t = angDeg * Math.PI / 180;
    return { x: a.x + Math.cos(t) * d, y: a.y + Math.sin(t) * d };
  };
  // Meshing gear chain: each gear meshes with the previous gear (or gears[g.from])
  function makeChain(svg, gears, m, pad = 6) {
    svg.innerHTML = '';
    gears.forEach((g, i) => {
      g.ro = m * (g.z / 2 + 1);
      if (i > 0) { const p = gears[g.from ?? i - 1]; g.th = Math.atan2(g.y - p.y, g.x - p.x); g.prev = p; }
      const el = document.createElementNS(NS, 'path');
      el.setAttribute('fill', g.c); el.setAttribute('fill-rule', 'evenodd');
      el.setAttribute('d', gearPath(g.z, m, g.hole ?? m * g.z * 0.14));
      if (g.cls) el.setAttribute('class', g.cls);
      svg.append(el); g.el = el;
    });
    const minX = Math.min(...gears.map((g) => g.x - g.ro)) - pad, maxX = Math.max(...gears.map((g) => g.x + g.ro)) + pad;
    const minY = Math.min(...gears.map((g) => g.y - g.ro)) - pad, maxY = Math.max(...gears.map((g) => g.y + g.ro)) + pad;
    svg.setAttribute('viewBox', `${minX} ${minY} ${maxX - minX} ${maxY - minY}`);
    return { gears, vb: { x: minX, y: minY, w: maxX - minX, h: maxY - minY } };
  }
  // Rotate so the teeth keep meshing: φB = θ + π + π/zB + (zA/zB)(θ − φA)
  function driveChain({ gears }, phi0) {
    gears.forEach((g, i) => {
      g.phi = i === 0 ? phi0 : g.th + Math.PI + Math.PI / g.z + (g.prev.z / g.z) * (g.th - g.prev.phi);
      g.el.setAttribute('transform', `translate(${g.x.toFixed(2)} ${g.y.toFixed(2)}) rotate(${(g.phi * 180 / Math.PI).toFixed(2)})`);
    });
  }
  const cogSvg = (cls = 'cog-ic') => `<svg class="${cls}" viewBox="-12 -12 24 24" aria-hidden="true"><path fill-rule="evenodd" d="${gearPath(8, 2.3, 3.2)}"/></svg>`;
  const ARROW = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4"/></svg>';
  // Logo slot: a lightbulb with a gear head (newly drawn symbol) + wordmark slot
  const MARK = `<svg viewBox="-20 -22 40 48" aria-hidden="true" fill="currentColor"><path fill-rule="evenodd" d="${gearPath(10, 3.1, 8)}"/>
    <rect x="-7" y="14" width="14" height="3" rx="1.5"/><rect x="-6" y="19" width="12" height="3" rx="1.5"/><rect x="-3.5" y="23.5" width="7" height="2.5" rx="1.2"/></svg>`;
  const brand = (href) => `<a class="lg-brand" href="${href}" aria-label="Back to start">${MARK}<span data-label="Your company’s English name and one-line tagline here"><b>Studio Name</b><small>Your tagline in one short line</small></span></a>`;

  const here = location.pathname.split('/').pop() || 'index.html';
  const SERVICES = [['Service Name 01', 'service.html'], ['Service Name 02', 'service-app.html'], ['Service Name 03', null], ['Service Name 04', null], ['Service Name 05', 'partner.html'], ['Service Name 06', null]];
  const SOCIALS = [
    ['Link 1', '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M8 10.5v6M8 7.5v.01M11.5 16.5v-3.5a2.5 2.5 0 0 1 5 0v3.5M11.5 10.5v6"/>'],
    ['Link 2', '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.3 6.7v.01"/>'],
    ['Link 3', '<circle cx="12" cy="12" r="9"/><path d="M8 15l3-6 2 4 3-5"/>'],
    ['Mail', '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.5 6.5l8.5 6.5 8.5-6.5"/>'],
  ];

  function markup() {
    const tooth = `<span class="tooth" aria-hidden="true">${cogSvg('')}</span>`;
    const svc = SERVICES.map(([t, href]) => href
      ? `<li><a href="${href}"${href === here ? ' aria-current="page"' : ''}>${tooth}<span>${t}</span></a></li>`
      : `<li><span class="svc-soon" aria-disabled="true"><span>${t}<small>Soon</small></span></span></li>`).join('');
    const soc = SOCIALS.map(([k, svg]) => `<a href="#"${k === 'Mail' ? ' data-go="contact"' : ''} aria-label="${k}"><svg viewBox="0 0 24 24">${svg}</svg></a>`).join('');
    // Big logo: a glass bulb (line art) inside a gear outline + a yellow zigzag filament — the original is a 3D bulb logo
    const big = `<svg viewBox="-120 -120 240 240" aria-hidden="true"><g class="rot"><path fill="var(--kf-surface)" stroke="var(--kf-ink)" stroke-width="1.4" fill-rule="evenodd" d="${gearPath(14, 11.5, 0)}"/></g>
      <g fill="none" stroke="var(--kf-ink)" stroke-width="1.3" stroke-linecap="round"><circle r="62" fill="var(--site-white-soft)"/><path d="M-50 -36 A62 62 0 0 1 -14 -60" stroke-width="3" stroke="var(--site-sand-2)"/>
      <path d="M-26 56 L-22 96 H22 L26 56"/><path d="M-24 104 H24 M-20 112 H20 M-14 120 H14"/><path d="M-12 56 L-16 8 M12 56 L16 8"/></g>
      <path d="M-34 8 l8 -28 8 26 8 -26 8 26 8 -26 8 26 8 -28" fill="none" stroke="var(--site-yellow)" stroke-width="5" stroke-linejoin="miter"/></svg>`;
    return `
<header class="lg-head" data-slot="header">${brand('index.html')}</header>
<button class="lg-sound" type="button" aria-pressed="false" aria-label="Sound On"><svg viewBox="0 0 24 24"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="var(--kf-ink)"/><path class="w" d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/><path class="x" d="M16 9.5l5 5M21 9.5l-5 5"/></svg></button>
<button class="menu-toggle" id="menuToggle" type="button" aria-expanded="false" aria-controls="menu" aria-label="Open Menu">
  <span class="bars" aria-hidden="true"><i></i><i></i></span><span class="gearball" aria-hidden="true">${cogSvg('').replace('<svg', '<svg fill="currentColor"')}</span></button>
<div id="menu" aria-hidden="true" data-slot="menu-drawer"><div class="panel">
  <svg class="bg-gear" viewBox="-60 -60 120 120" aria-hidden="true"><path fill-rule="evenodd" d="${gearPath(18, 5.6, 26)}"/></svg>
  <div class="logo-clip"><div class="logo-stage">${big}</div></div>
  <ul class="svc" data-label="Service English name — 01, 02, 05 sit on each service’s side, the rest are coming soon">${svc}</ul>
  <div class="menu-foot"><a href="#" class="badge" data-go="contact"><b>Contact us</b></a><div class="socials">${soc}</div></div>
</div></div>
<div id="contact" hidden role="dialog" aria-modal="true" aria-label="Inquiry" data-slot="contact-modal"><div class="ct-panel">
  <svg class="ct-gear" viewBox="-60 -60 120 120" aria-hidden="true"><path fill-rule="evenodd" d="${gearPath(16, 6.2, 24)}"/></svg>
  <button class="ct-close" type="button" aria-label="Close"><span></span><span></span></button>
  <div class="ct-head"><h2 data-label="Contact English title — last word in handwriting">Tell us what you <em>need.</em></h2><p class="ct-intro">Your two-line contact note goes here. Tell us what you want to build and we will come back with a plan.</p></div>
  <form class="ct-form" novalidate>
    <div class="ct-row"><label><span>Name</span><input name="name" autocomplete="name"></label><label><span>Email</span><input name="email" type="email" autocomplete="email"></label></div>
    <fieldset class="ct-chips"><legend>What do you make?</legend>
      <label><input type="radio" name="kind" checked><span>Item 1</span></label><label><input type="radio" name="kind"><span>Item 2</span></label>
      <label><input type="radio" name="kind"><span>Item 3</span></label><label><input type="radio" name="kind"><span>Item 4</span></label></fieldset>
    <label><span>Content</span><textarea name="message"></textarea></label>
    <button class="ct-send" type="submit">Send ${ARROW.replace('<svg', '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"')}</button>
  </form>
</div></div>`;
  }

  document.body.insertAdjacentHTML('afterbegin', markup());
  const menuEl = document.getElementById('menu'), toggle = document.getElementById('menuToggle'), toggleCog = toggle.querySelector('.gearball svg');
  const contact = document.getElementById('contact');
  let open = false, tl = null;

  // The pill’s cogs always turn slowly (0.12 turns per second), 0.7 on hover, jump to 3 on open and close, then ease back over 1.2s
  const cog = { speed: 0.12, rot: 0 };
  gsap.ticker.add((time, dt) => {
    if (reduce) return;
    cog.rot += cog.speed * 360 * dt / 1000;
    toggleCog.style.transform = `rotate(${cog.rot.toFixed(1)}deg)`;
  });
  const spin = (to, d = 0.6) => gsap.to(cog, { speed: to, duration: d, ease: 'power2.out', overwrite: true });
  toggle.addEventListener('pointerenter', () => !open && spin(0.7));
  toggle.addEventListener('pointerleave', () => !open && spin(0.12));
  const burst = (dir) => { cog.speed = 3 * dir; spin(open ? -0.12 : 0.12, 1.2); };
  const origin = (el) => {
    const r = el.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    return { x, y, R: Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 20 };
  };
  const PARTS = '#menu .svc li, #menu .badge, #menu .logo-stage, #menu .socials a';

  function openMenu() {
    if (open) return;
    open = true;
    document.body.classList.add('menu-open');
    toggle.setAttribute('aria-expanded', 'true'); toggle.setAttribute('aria-label', 'Close Menu');
    menuEl.setAttribute('aria-hidden', 'false');
    document.documentElement.style.overflow = 'hidden';
    burst(1);
    const { x, y, R } = origin(toggleCog);
    if (tl) tl.kill();
    gsap.set(PARTS, { clearProps: 'all' });
    tl = gsap.timeline()
      .set(menuEl, { visibility: 'visible' })
      .fromTo(menuEl, { clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(${R}px at ${x}px ${y}px)`, duration: 0.8, ease: 'power3.inOut' })
      .from('#menu .svc li', { y: 50, autoAlpha: 0, stagger: 0.06, duration: 0.7, ease: 'power3.out' }, 0.32)
      .from('#menu .logo-stage', { scale: 0.92, autoAlpha: 0, duration: 1.0, ease: 'power3.out' }, 0.3)
      .from('#menu .badge', { y: 16, autoAlpha: 0, duration: 0.6, ease: 'power2.out' }, 0.7)
      .from('#menu .socials a', { y: 16, autoAlpha: 0, stagger: 0.035, duration: 0.5, ease: 'power2.out' }, 0.75);
  }
  function closeMenu(then) {
    if (!open) { then && then(); return; }
    open = false;
    document.body.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'Open Menu');
    menuEl.setAttribute('aria-hidden', 'true');
    burst(-1);
    const { x, y } = origin(toggleCog);
    if (tl) tl.kill();
    tl = gsap.timeline({ onComplete: () => { gsap.set(menuEl, { visibility: 'hidden' }); document.documentElement.style.overflow = ''; then && then(); } })
      .to(PARTS, { autoAlpha: 0, duration: 0.2 }, 0)
      .to(menuEl, { clipPath: `circle(0px at ${x}px ${y}px)`, duration: 0.6, ease: 'power3.inOut' }, 0.05);
  }
  toggle.addEventListener('click', () => (open ? closeMenu() : openMenu()));
  menuEl.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    e.preventDefault();
    if (a.dataset.go === 'contact') closeMenu(() => openContact(toggle));
    else if (a.getAttribute('href') !== '#') { const href = a.getAttribute('href'); closeMenu(() => (location.href = href)); }
  });

  // Contact window: a circle spreads from the pressed button over .7 seconds, and on closing it shrinks to the top-right menu spot over .5 seconds
  let ctl = null;
  function openContact(from) {
    contact.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    const { x, y, R } = origin(from || document.body);
    if (ctl) ctl.kill();
    ctl = gsap.timeline()
      .fromTo(contact, { clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(${R}px at ${x}px ${y}px)`, duration: 0.7, ease: 'power3.inOut' })
      .from(contact.querySelectorAll('.ct-head > *, .ct-form > *'), { y: 18, autoAlpha: 0, stagger: 0.04, duration: 0.5, ease: 'power2.out' }, 0.3);
  }
  function closeContact() {
    if (contact.hidden) return;
    if (ctl) ctl.kill();
    ctl = gsap.to(contact, { clipPath: `circle(0px at ${innerWidth - 60}px 50px)`, duration: 0.5, ease: 'power3.inOut',
      onComplete: () => { contact.hidden = true; document.documentElement.style.overflow = ''; } });
  }
  contact.querySelector('.ct-close').addEventListener('click', closeContact);
  contact.querySelector('form').addEventListener('submit', (e) => { e.preventDefault(); closeContact(); });
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-go="contact"], a[href$="#contact"]');
    if (!a || menuEl.contains(a)) return;
    e.preventDefault();
    openContact(a);
  });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeContact(); closeMenu(); } });

  const sound = document.querySelector('.lg-sound');
  sound.addEventListener('click', () => {
    const on = sound.getAttribute('aria-pressed') !== 'true';
    sound.setAttribute('aria-pressed', String(on)); sound.setAttribute('aria-label', on ? 'Sound Off' : 'Sound On');
  });

  // Subpage: if the area under the header is dark teal or teal, lighten the logo
  function themeHeader() {
    const header = document.querySelector('.lg-head');
    const run = () => {
      const under = document.elementsFromPoint(Math.min(200, innerWidth / 2), 44).find((el) => !header.contains(el) && !el.closest('#menu, .menu-toggle, .lg-sound'));
      header.classList.toggle('light', !!(under && under.closest('.dark, .on-turq')));
    };
    addEventListener('scroll', run, { passive: true });
    run();
  }
  // Shared reveal for sub pages: title .9s y40, list lines .7s y30
  function reveals() {
    gsap.utils.toArray('.reveal').forEach((el) => gsap.from(el, { y: 40, autoAlpha: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%' } }));
    gsap.utils.toArray('.cogs li').forEach((el) => gsap.from(el, { y: 30, autoAlpha: 0, duration: 0.7, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 90%' } }));
    document.querySelectorAll('.cogs li').forEach((li) => li.insertAdjacentHTML('afterbegin', cogSvg()));
  }
  // The gears turn slowly on their own (0.25 per second) and speed up while scrolling (speed × 0.02, up to +3, following by 0.08)
  const clock = { phase: 0, boost: 0, lastY: scrollY };
  gsap.ticker.add((t, dt) => {
    const v = Math.abs(scrollY - clock.lastY); clock.lastY = scrollY;
    clock.boost += (Math.min(v * 0.02, 3) - clock.boost) * 0.08;
    if (!reduce) clock.phase += (0.25 + clock.boost) * dt / 1000;
  });
  // Finale: two big gears (z 22·18, module 12) mesh and turn in opposite directions
  function ctaMesh(svg, colors) {
    const m = 12, a = { x: 0, y: 0, z: 22, c: colors[0], hole: m * 22 * 0.1 }, b = { z: 18, c: colors[1], hole: m * 18 * 0.1 };
    Object.assign(b, place(m, a, b, 0));
    const ch = makeChain(svg, [a, b], m, 4);
    gsap.ticker.add(() => driveChain(ch, -clock.phase * 0.8));
    driveChain(ch, 0);
  }
  function footer(pageName) {
    return `<footer class="lg-foot dark" data-slot="footer"><div class="cols">
      <div>${brand('index.html')}<p style="margin-top:18px;max-width:34ch">Your two-line company intro here. One more line here.</p></div>
      <div><h4 data-label="Your company legal English name here">Studio Name Ltd.</h4><p>Business number 000000-0<br>Your address first line here<br>Your address second line here<br>00000 City here<br>Your nation here</p></div>
      <div><h4>Explore</h4><a href="index.html">Menu 1</a><a href="service.html">Menu 2</a><a href="partner.html">Menu 3</a><a href="#contact">Contact</a></div>
    </div><div class="legal"><span data-label="Copyright line with company English name">© 0000 Studio Name Ltd. · <a href="#">Privacy</a></span><span>${pageName}</span></div></footer>`;
  }

  window.LG = { css, gearPath, place, makeChain, driveChain, cogSvg, ARROW, reduce, openMenu, closeMenu, openContact, themeHeader, reveals, ctaMesh, footer, clock };
})();
