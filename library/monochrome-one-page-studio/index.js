// First page sections: wave text (from the hovered letter back.out(2) .6s, .023 apart) · statement words light up (screen 85% → 45%) · showreel tag · services 3s slider (clip 1.1s power4.inOut) ·
// Work filtering and the ‹View work› tag (.45s power3) · list preview (y .5s power4, image .6s expo.inOut) · process accordion 5s advance · client logo swap (1.5s rest, .9s expo.inOut) · contact address fitting
(() => {
  const { reduced, fine } = window.JG;
  const wide = matchMedia("(hover: hover) and (pointer: fine) and (min-width: 861px)").matches;

  // ── Wave text: a hidden set sits over the visible set, and from the hovered letter outward both sides push down 100% ──
  const letters = (el) => { const t = el.textContent; el.innerHTML = [...t].map((c) => (c === " " ? "<span> </span>" : `<span class="l">${c}</span>`)).join(""); };
  document.querySelectorAll("[data-wave] .jg-hero__t").forEach((t) => {
    const text = t.textContent;
    t.innerHTML = `<span class="jg-wave-hidden" aria-hidden="true">${text}</span><span class="jg-wave-visible" aria-hidden="true">${text}</span><span class="jg-sr">${text}</span>`;
    if (!wide || reduced) return;
    const hid = t.querySelector(".jg-wave-hidden"), vis = t.querySelector(".jg-wave-visible");
    letters(hid); letters(vis);
    const box = t.closest("[data-wave]");
    box.addEventListener("mouseover", (e) => {
      const vs = vis.querySelectorAll("span"), hs = hid.querySelectorAll("span");
      if (!gsap.isTweening(vs) && box.classList.contains("hovered")) box.classList.remove("hovered");
      if (!e.target.classList.contains("l")) return;
      box.classList.add("hovered");
      const from = [...e.target.parentNode.children].indexOf(e.target);
      const v = { yPercent: 100, ease: "back.out(2)", duration: .6, stagger: { each: .023, from } };
      gsap.to(vs, v);
      gsap.to(hs, { ...v, onComplete: () => gsap.set([...vs, ...hs], { clearProps: "all" }) });
    });
  });

  // ── About big title letter wave: per line, split words into letters, hide a cloned line above, and push both sets from the hovered letter with the same curve as the Hero ──
  if (wide && !reduced) document.querySelectorAll("[data-letter-wave]").forEach((line) => {
    line.querySelectorAll(".jg-w").forEach((w) => (w.innerHTML = [...w.textContent].map((c) => `<span class="jg-lw">${c}</span>`).join("")));
    const twinLine = line.cloneNode(true);
    twinLine.removeAttribute("data-letter-wave");
    twinLine.className = "jg-lw-clone";
    twinLine.setAttribute("aria-hidden", "true");
    line.prepend(twinLine);
    line.classList.add("has-lw");
    const own = [...line.querySelectorAll(":scope > .jg-wm .jg-lw")], twin = [...twinLine.querySelectorAll(".jg-lw")];
    line.addEventListener("mouseover", (e) => {
      if (!gsap.isTweening(own) && line.classList.contains("hovered")) line.classList.remove("hovered");
      const from = own.indexOf(e.target);
      if (from < 0) return;
      line.classList.add("hovered");
      const v = { yPercent: 100, ease: "back.out(2)", duration: .6, stagger: { each: .023, from } };
      gsap.to(own, v);
      gsap.to(twin, { ...v, onComplete: () => gsap.set([...own, ...twin], { clearProps: "all" }) });
    });
  });

  // ── Manifesto: words light up while passing between 85% and 45% of the screen ──
  const stmt = document.querySelector(".jg-stmt__text"), words = stmt ? [...stmt.querySelectorAll(".jg-stmt__w")] : [];
  const light = () => {
    const vh = innerHeight, r = stmt.getBoundingClientRect(), a = vh * .85, b = vh * .45;
    const p = Math.min(1, Math.max(0, (a - r.top) / (a - b + r.height)));
    const n = Math.round(p * words.length);
    words.forEach((w, i) => w.classList.toggle("is-lit", i < n));
  };
  if (words.length) { if (reduced) words.forEach((w) => w.classList.add("is-lit")); else { addEventListener("scroll", () => requestAnimationFrame(light), { passive: true }); light(); } }

  // ── Showreel: a ”(play)” tag follows the cursor, and pressing it plays or pauses ──
  const reel = document.querySelector(".jg-reel__frame"), play = reel?.querySelector(".jg-reel__play");
  if (reel && play) {
    if (fine) {
      reel.addEventListener("mousemove", (e) => { const b = reel.getBoundingClientRect(); play.style.transform = `translate(calc(-50% + ${e.clientX - b.left - b.width / 2}px), calc(-50% + ${e.clientY - b.top - b.height / 2}px))`; });
      reel.addEventListener("mouseleave", () => (play.style.transform = ""));
    }
    reel.addEventListener("click", () => { const on = reel.classList.toggle("is-playing"); play.textContent = on ? "(Paused)" : "(Play)"; });
  }

  // ── Services: the next row follows a 3s progress line, the photo is covered from below by a clip, scaling 1.15 and yPercent −4 → 1 (1.32s power3.out), and the outgoing photo is at 1.05 scale ──
  const rows = [...document.querySelectorAll(".jg-svc__row")], pics = [...document.querySelectorAll(".jg-svc__pic")];
  const progs = rows.map((r) => r.querySelector(".jg-svc__prog"));
  let svAt = 0, svTween = null, svHover = false, svSeen = false;
  pics.forEach((p, i) => gsap.set(p, { autoAlpha: i === 0 ? 1 : 0, zIndex: i === 0 ? 1 : 0 }));
  const svShow = (n) => {
    if (n === svAt) return;
    rows.forEach((r, i) => { r.classList.toggle("is-active", i === n); r.setAttribute("aria-pressed", String(i === n)); });
    const inn = pics[n], out = pics[svAt];
    svAt = n;
    pics.forEach((p) => { p.classList.toggle("is-active", p === inn); if (p !== inn) gsap.set(p, { zIndex: p === out ? 1 : 0 }); });
    const img = inn.querySelector(".jg-svc__img"), d = reduced ? 0 : 1.1;
    gsap.killTweensOf([inn, img]);
    gsap.set(inn, { zIndex: 2, autoAlpha: 1 });
    gsap.fromTo(inn, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: d, ease: "power4.inOut", onComplete: () => inn === pics[svAt] && pics.forEach((p) => p !== inn && gsap.set(p, { autoAlpha: 0 })) });
    gsap.fromTo(img, { scale: 1.15, yPercent: -4 }, { scale: 1, yPercent: 0, duration: d * 1.2, ease: "power3.out" });
    if (out && out !== inn) gsap.to(out.querySelector(".jg-svc__img"), { scale: 1.05, duration: d, ease: "power2.inOut" });
  };
  const svRun = (n) => {
    svTween?.kill(); svTween = null;
    if (reduced || svHover || !svSeen || !progs[n]) return;
    gsap.set(progs, { scaleX: 0 });
    svTween = gsap.fromTo(progs[n], { scaleX: 0 }, { scaleX: 1, duration: 3, ease: "none", onComplete: () => { const nx = (n + 1) % rows.length; svShow(nx); svRun(nx); } });
  };
  const svPick = (n) => { svTween?.kill(); svShow(n); gsap.set(progs, { scaleX: 0 }); progs[n] && gsap.set(progs[n], { scaleX: 1 }); };
  rows.forEach((r, i) => {
    r.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") { svHover = true; svPick(i); } });
    r.addEventListener("click", () => { svShow(i); if (!svHover) svRun(i); });
  });
  const svList = document.querySelector(".jg-svc__list");
  svList?.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") { svHover = false; svRun(svAt); } });
  if (svList) new IntersectionObserver(([e]) => { svSeen = e.isIntersecting; svSeen ? svRun(svAt) : (svTween?.kill(), (svTween = null)); }, { threshold: .35 }).observe(svList.closest("section"));

  // ── Work: filtering, View all (rises 40px from below, .8s power3.out, .08 stagger), and the ”View work” tag ──
  const cards = [...document.querySelectorAll(".jg-card")];
  const more = document.querySelector(".jg-more .jg-btn"), initial = +(more?.dataset.initial || Infinity);
  let filter = "all", all = false;
  const apply = () => {
    let shown = 0, count = 0;
    cards.forEach((c) => {
      const ok = filter === "all" || c.dataset.category === filter;
      if (ok) count++;
      const vis = ok && (all || shown < initial);
      c.classList.toggle("is-hidden", !vis);
      c.classList.toggle("is-offset", vis && shown % 2 === 1);
      if (vis) shown++;
    });
    document.querySelector(".jg-more")?.classList.toggle("is-hidden", all || count <= initial);
    if (more) more.firstChild.textContent = `View all (${count}) `;
    ScrollTrigger.refresh();
  };
  document.querySelectorAll(".jg-filter").forEach((b, _, list) => b.addEventListener("click", () => { filter = b.dataset.filter; list.forEach((x) => x.classList.toggle("is-active", x === b)); apply(); }));
  more?.addEventListener("click", () => {
    const before = cards.filter((c) => !c.classList.contains("is-hidden"));
    all = true; apply();
    const added = cards.filter((c) => !c.classList.contains("is-hidden") && !before.includes(c));
    if (!reduced) gsap.from(added, { autoAlpha: 0, y: 40, duration: .8, ease: "power3.out", stagger: .08 });
  });
  if (fine) document.querySelectorAll(".jg-card__img").forEach((im) => {
    const tag = im.querySelector(".jg-card__cursor");
    gsap.set(tag, { xPercent: -50, yPercent: -50 });
    const qx = gsap.quickTo(tag, "x", { duration: .45, ease: "power3" }), qy = gsap.quickTo(tag, "y", { duration: .45, ease: "power3" });
    const at = (e, snap) => { const b = im.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top; snap ? gsap.set(tag, { x, y }) : (qx(x), qy(y)); };
    im.addEventListener("pointerenter", (e) => at(e, true));
    im.addEventListener("pointermove", (e) => at(e, false));
  });

  // ── Full list: the preview panel follows the pointer height in .5s power4, and on each row a new image rises from 90% below in .6s expo.inOut ──
  const idx = document.querySelector(".jg-idx"), list = idx?.querySelector(".jg-idx__list"), media = idx?.querySelector(".jg-idx__media");
  if (idx && list && media && wide) {
    let my = 0;
    const local = () => my - idx.getBoundingClientRect().top;
    gsap.set(media, { yPercent: -50 });
    const qy = gsap.quickTo(media, "y", { duration: .5, ease: "power4" });
    const proto = media.querySelector(".jg-idx__frame");
    proto.remove();
    list.addEventListener("mouseenter", (e) => { my = e.clientY; gsap.set(media, { y: local() }); media.classList.add("on"); });
    list.addEventListener("mouseleave", () => { media.classList.remove("on"); media.replaceChildren(); });
    list.addEventListener("mousemove", (e) => { my = e.clientY; qy(local()); });
    addEventListener("scroll", () => media.classList.contains("on") && qy(local()), { passive: true });
    list.querySelectorAll(".jg-idx__row").forEach((row) => row.addEventListener("mouseenter", () => {
      const f = proto.cloneNode(true);
      media.appendChild(f);
      gsap.to([f, f.firstElementChild], { y: 0, yPercent: 0, duration: .6, ease: "expo.inOut" });
      if (media.children.length > 20) media.children[0].remove();
    }));
  }
  const loadBtn = idx?.querySelector(".jg-idx__foot .jg-btn"), extras = [...(idx?.querySelectorAll(".jg-idx__row.is-extra") || [])];
  let opened = false;
  loadBtn?.addEventListener("click", () => {
    opened = !opened;
    extras.forEach((r) => r.classList.toggle("is-extra", !opened));
    loadBtn.firstChild.textContent = opened ? "Fold " : `View more (${extras.length}) `;
    idx.querySelector(".jg-idx__count").textContent = `Out of 00 ${opened ? 16 : 10}Watching the dog`;
    if (opened && !reduced) gsap.from(extras, { autoAlpha: 0, y: 24, duration: .6, ease: "power3.out", stagger: .02 });
    ScrollTrigger.refresh();
  });

  // ── Process accordion: the next step follows the 5s progress line, hover pauses, press jumps to that step ──
  const proc = document.querySelector(".jg-proc__list"), items = proc ? [...proc.querySelectorAll(".jg-proc__item")] : [];
  const pbars = items.map((i) => i.querySelector(".jg-proc__prog"));
  let pTween = null, pHover = false, pSeen = false;
  const activeIdx = () => items.findIndex((i) => i.dataset.accordionStatus === "active");
  const setActive = (n) => items.forEach((it, i) => it.setAttribute("data-accordion-status", i === n ? "active" : "not-active"));
  const pRun = (n) => {
    pTween?.kill(); pTween = null; gsap.set(pbars, { scaleX: 0 });
    if (reduced || pHover || !pSeen || n < 0) return;
    pTween = gsap.fromTo(pbars[n], { scaleX: 0 }, { scaleX: 1, duration: 5, ease: "none", onComplete: () => { const nx = (n + 1) % items.length; setActive(nx); pRun(nx); } });
  };
  const pHold = () => { pTween?.kill(); pTween = null; gsap.set(pbars, { scaleX: 0 }); const a = activeIdx(); a >= 0 && gsap.set(pbars[a], { scaleX: 1 }); };
  if (proc) {
    proc.addEventListener("click", (e) => {
      const tg = e.target.closest("[data-accordion-toggle]");
      if (!tg) return;
      const it = tg.closest("[data-accordion-status]"), on = it.dataset.accordionStatus === "active";
      setActive(on ? -1 : items.indexOf(it));
      pHover ? pHold() : pRun(activeIdx());
    });
    proc.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") { pHover = true; pHold(); } });
    proc.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") { pHover = false; if (activeIdx() < 0) setActive(0); pRun(activeIdx()); } });
    new IntersectionObserver(([e]) => { pSeen = e.isIntersecting; pSeen ? pRun(activeIdx()) : (pTween?.kill(), (pTween = null)); }, { threshold: .3 }).observe(proc);
  }

  // ── Client logos: after resting 1.5s, the logo in one shuffled cell exits upward −50% and a new logo rises from 50% below .1s later (.9s expo.inOut) ──
  const cells = [...document.querySelectorAll(".jg-client")];
  if (cells.length && !reduced) {
    const pool = cells.map((c, i) => { const n = c.firstElementChild.cloneNode(true); n.dataset.label = `Client logo ${i + 9}`; return n; });
    let order = gsap.utils.shuffle(cells.map((_, i) => i)), k = 0;
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.5, paused: true });
    tl.call(() => {
      const cell = cells[order[k++ % cells.length]];
      const old = cell.firstElementChild, nu = pool.shift();
      gsap.set(nu, { yPercent: 50, autoAlpha: 0, position: "absolute" });
      cell.appendChild(nu);
      gsap.to(old, { yPercent: -50, autoAlpha: 0, duration: .9, ease: "expo.inOut", onComplete: () => { old.remove(); gsap.set(old, { clearProps: "all" }); pool.push(old); } });
      gsap.to(nu, { yPercent: 0, autoAlpha: 1, duration: .9, delay: .1, ease: "expo.inOut", onComplete: () => gsap.set(nu, { clearProps: "position" }) });
    });
    ScrollTrigger.create({ trigger: ".jg-clients", start: "top bottom", end: "bottom top", onToggle: (s) => (s.isActive ? tl.play() : tl.pause()) });
  }

  // ── Contact: address sized to fit exactly on one line (max 134px), click to copy ──
  const email = document.querySelector(".jg-contact__email"), hint = document.querySelector(".jg-contact__hint");
  const fit = () => { if (!email) return; const w = email.parentElement.clientWidth; email.style.fontSize = "100px"; email.style.fontSize = `${Math.min(134, (100 * w) / email.scrollWidth)}px`; };
  fit();
  document.fonts?.ready.then(fit);
  addEventListener("resize", fit);
  email?.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(email.dataset.copy); hint.textContent = "Copied."; } catch { return; }
    setTimeout(() => (hint.textContent = "Click the address to copy it."), 2200);
  });
})();
