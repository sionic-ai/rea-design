(() => {
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Subpage header (original values): the big title line has letters rolling out like a slot machine (part slot-scrub-chars on: view), and the remaining text lines rise from 100% below over 1s expo.out at .05 stagger,
    // The eye pops out from 50% below with .4s back.out(1.7) after 1s, rests 2 seconds, then nods ±20% repeatedly at 2-second intervals
    const headEls = document.querySelectorAll(".ed-head__ja, .ed-head__lead, .ed-head__desc, .ed-head__nav");
    const headEye = document.querySelector(".ed-head__eye");
    gsap.set(headEls, { opacity: 0 });
    if (headEye) gsap.set(headEye, { opacity: 0 });
    window.ED.ready.then(() => {
      gsap.fromTo(headEls, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.05, duration: 1, ease: "expo.out" });
      if (headEye) gsap.fromTo(headEye, { yPercent: 50, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.4, delay: 1, ease: "back.out(1.7)", onComplete: () => {
        gsap.timeline({ repeat: -1, repeatDelay: 2, delay: 2 })
          .fromTo(headEye, { yPercent: -20 }, { yPercent: 20, duration: 0.3, ease: "sine.out" })
          .to(headEye, { yPercent: -20, duration: 0.3, ease: "sine.inOut" })
          .to(headEye, { yPercent: 20, duration: 0.3, ease: "sine.inOut" })
          .to(headEye, { yPercent: -20, duration: 0.3, ease: "sine.inOut" });
      } });
    });
    gsap.utils.toArray(".ed-member, .ed-event, .news__grid .jcard").forEach((el) =>
      gsap.from(el, { y: 80, opacity: 0, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%" } }));
  });

  // News category pill: pressing it leaves only that category
  const pills = document.querySelectorAll(".news__pills button");
  pills.forEach((b) => b.addEventListener("click", () => {
    pills.forEach((x) => x.classList.toggle("is-active", x === b));
    const cat = b.textContent.trim();
    document.querySelectorAll(".news__grid .jcard").forEach((c) =>
      c.classList.toggle("is-hidden", cat !== "ALL" && c.querySelector(".jcard__cat").textContent.trim() !== cat));
    ScrollTrigger.refresh();
  }));
})();

// Hub photo stack: the front card goes to the back and the rest move forward one slot
document.querySelectorAll(".rd-office").forEach((o) => {
  const cards = [...o.querySelectorAll(".rd-office__card")];
  const cur = o.querySelector("[data-cur]");
  let order = cards.map((_, i) => i);
  const lay = (instant) => order.forEach((ci, pos) => gsap.to(cards[ci], {
    x: pos * 26 * window.ED.remPx(), y: pos * 6 * window.ED.remPx(), scale: 1 - pos * 0.06, zIndex: 10 - pos, opacity: pos > 3 ? 0 : 1,
    duration: instant ? 0 : 0.6, ease: "power3.out",
  }));
  lay(true);
  const step = (d) => {
    order = d > 0 ? [...order.slice(1), order[0]] : [order.at(-1), ...order.slice(0, -1)];
    cur.textContent = String(order[0] + 1).padStart(2, "0");
    lay(false);
  };
  o.querySelector("[data-next]").addEventListener("click", () => step(1));
  o.querySelector("[data-prev]").addEventListener("click", () => step(-1));
});

// Job rows: the color of the hovered row changes the card on the right
const jobCard = document.querySelector(".rd-jobs__card");
document.querySelectorAll(".rd-jobs__list a").forEach((a, i, all) => {
  if (i === 0) a.classList.add("is-on");
  a.addEventListener("mouseenter", () => {
    all.forEach((x) => x.classList.toggle("is-on", x === a));
    jobCard.style.background = getComputedStyle(a).getPropertyValue("--c");
  });
});

document.querySelectorAll(".scard__title").forEach((t) => {
  let i = 0;
  [...t.childNodes].forEach((n) => {
    if (n.nodeType !== 3) return;
    const frag = document.createDocumentFragment();
    n.textContent.split(/(\s+)/).forEach((word) => {
      if (!word) return;
      if (/^\s+$/.test(word)) return frag.append(" ");
      const w = document.createElement("span");
      w.className = "w";
      [...word].forEach((ch) => {
        const s = document.createElement("span");
        s.className = "ch";
        s.style.setProperty("--i", i++);
        s.innerHTML = `<i>${ch}</i>`;
        w.append(s);
      });
      frag.append(w);
    });
    n.replaceWith(frag);
  });
});

document.querySelectorAll('.ed-head__nav a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
  e.preventDefault();
  const target = document.querySelector(a.getAttribute("href"));
  window.ED.lenis ? window.ED.lenis.scrollTo(target, { duration: 1.2 }) : target.scrollIntoView();
}));

// Group panel (original values): when a cell’s top edge reaches 50% of the screen, that cell becomes the current number. Photos shift over 1s by data-offset (section − current),
// The drum title turns --rotation from 90° by a further 270° per step (1s expo.out) so that face comes to the front, and the number rolls out upward as a whole word and rolls back in from below (.3s power3.out).
// Items on the stage appear at .2 intervals while the panel top edge passes from 25% of the screen to 0 (.8 expo.inOut scrub)
document.querySelectorAll(".ed-cat").forEach((cat) => {
  const reduce = window.ED.reduce;
  const pics = [...cat.querySelectorAll(".ed-cat__pic")];
  const items = [...cat.querySelectorAll(".ed-cat__item")];
  const dots = [...cat.querySelectorAll(".ed-cat__dots i")];
  const decos = [...cat.querySelectorAll(".ed-cat__deco")];
  const drums = [...cat.querySelectorAll(".ed-drum")];
  const numIn = cat.querySelector(".ed-cat__numIn");
  let cur = 0;
  gsap.set(drums, { "--rotation": "90deg" });
  const go = (n) => {
    if (n === cur) return;
    const dir = n > cur ? 1 : -1;
    cur = n;
    pics.forEach((p, i) => (p.dataset.offset = i - n));
    items.forEach((it, i) => { it.dataset.offset = n - i; it.dataset.active = i === n; });
    dots.forEach((d, i) => (d.dataset.active = i === n));
    decos.forEach((d) => (d.dataset.active = d.dataset.deco.startsWith(`${n + 1}_`)));
    gsap.to(drums, { "--rotation": `${90 + 270 * n}deg`, duration: reduce ? 0 : 1, ease: "expo.out", overwrite: true });
    const label = String(n + 1).padStart(2, "0");
    if (reduce) { numIn.textContent = label; return; }
    gsap.killTweensOf(numIn);
    gsap.to(numIn, { yPercent: -100 * dir, opacity: 0, duration: 0.3, ease: "power3.out", onComplete: () => {
      numIn.textContent = label;
      gsap.fromTo(numIn, { yPercent: 100 * dir, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.3, ease: "power3.out" });
    } });
  };
  cat.querySelectorAll("[data-section]").forEach((sec, i) =>
    ScrollTrigger.create({ trigger: sec, start: "top 50%", end: "bottom 50%", onEnter: () => go(i), onEnterBack: () => go(i) }));
  if (!reduce) gsap.fromTo(cat.querySelectorAll("[data-box]"), { opacity: 0 }, {
    opacity: 1, duration: 0.8, stagger: 0.2, ease: "expo.inOut",
    scrollTrigger: { trigger: cat, start: "top 25%", end: "top top", scrub: true },
  });
});

// Intro text (original values): from the panel top at 25% of the screen until the panel bottom leaves the top of the screen — the photo pile of the lower grouped panel moves from −130vh, .25x, 30% left into place,
// Two small photos go down from −122vh·.2x·+15% to 100vh·.8x and from −100vh·.2x·+5% to 200vh·.7x, then turn off (phone has separate values)
document.querySelectorAll(".ed-lead").forEach((lead) => {
  if (window.ED.reduce) { gsap.set(lead.querySelectorAll(".ed-lead__pic"), { opacity: 0 }); return; }
  const small = matchMedia("(max-width: 960px)").matches;
  const st = () => ({ trigger: lead, start: "top 25%", end: "bottom top", scrub: true });
  const box = lead.nextElementSibling?.matches(".ed-cat") && lead.nextElementSibling.querySelector(".ed-cat__pics");
  if (box) gsap.fromTo(box, { y: small ? "-110vh" : "-130vh", xPercent: -30, scale: small ? 0.5 : 0.25 }, { y: "0vh", xPercent: 0, scale: 1, duration: 1, ease: "none", scrollTrigger: st() });
  const [a, b] = lead.querySelectorAll(".ed-lead__pic");
  gsap.timeline({ scrollTrigger: st() }).fromTo(a, { y: small ? "-40vh" : "-122vh", scale: small ? 0.4 : 0.2, xPercent: small ? 6 : 15 }, { y: "100vh", scale: 0.8, xPercent: 0, opacity: 1 }).set(a, { opacity: 0 });
  gsap.timeline({ scrollTrigger: st() }).fromTo(b, { scale: small ? 0.4 : 0.2, y: small ? "-60vh" : "-100vh", xPercent: small ? 26 : 5 }, { y: "200vh", scale: small ? 0.9 : 0.7, xPercent: 0, opacity: 1 }).set(b, { opacity: 0 });
});

// Services text strip (original values): while the strip passes through the screen it is scrubbed by one set width (−100%) (GSAP default curve), and the 8 inside it tilts by scroll speed × 1.5,
// Scrolling down turns the eyes left, scrolling up turns them right, in .3s expo.out
document.querySelectorAll(".ed-band").forEach((band) => {
  const track = band.querySelector(".ed-band__track");
  const kuns = band.querySelectorAll(".ed-band__item svg");
  if (window.ED.reduce) return;
  gsap.fromTo(track, { xPercent: 0 }, { xPercent: -100, scrollTrigger: { trigger: track, start: "top bottom", end: "bottom top", scrub: true } });
  let dir = 0;
  gsap.ticker.add(() => {
    const v = window.ED.lenis?.velocity || 0;
    gsap.set(kuns, { rotate: -1.5 * v });
    const d = window.ED.lenis?.direction || 0;
    if (d && d !== dir) { dir = d; gsap.to(kuns, { rotateY: d === 1 ? 180 : 0, duration: 0.3, ease: "expo.out" }); }
  });
});
