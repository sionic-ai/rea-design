// Draws the fixed decorations, the section crossing the 65% line of the screen switches background and text color, and the section crossing the 50% line (70% on phones) switches the section name at top right.
// Once the Hero curtain (_fx/wheel-hole-gate) opens the lock is released, and pressing Top locks it again. Original values: Hero enters .5 + .8s later copy 1s · light .8s · decoration .8s · scroll .5s
(() => {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pc = matchMedia("(min-width: 1025px)");
  const body = document.body;
  const SECTIONS = [["top", "Top"], ["issue", "Issue"], ["services", "Services"], ["column", "Column"], ["company", "Company"]];

  const head = document.querySelector('[data-slot="header"]');
  head.innerHTML = `<p><a class="mc-logo" href="#top" data-label="Company name text logo">Your company name here</a></p>
    <button class="mc-menu-btn" type="button" aria-label="Menu"><span class="mc-menu-btn__line"><span></span><span></span><span></span></span><span class="mc-menu-btn__label"><span class="is-open">Menu</span><span class="is-close">Close</span></span></button>`;
  head.insertAdjacentHTML("afterend", `<nav class="mc-nav" data-slot="nav" aria-label="Main menu"><ul class="mc-nav__list">
      ${SECTIONS.map(([id, t]) => `<li class="mc-nav__item"><a href="#${id}">${t}</a></li>`).join("")}
      <li class="mc-nav__contact"><a href="#contact">Contact</a></li>
      <li class="mc-nav__legal"><a href="#company">Your trade notice link here</a></li><li class="mc-nav__legal"><a href="#company">Privacy policy</a></li>
    </ul></nav><div class="mc-scroll" data-slot="scroll-line"><span>Scroll</span><i></i></div>`);
  document.querySelector('[data-slot="footer"]').innerHTML = `<small>© Your company name here</small><a class="mc-foot__link" href="#company">Your trade notice link here</a><a class="mc-foot__link" href="#company">Privacy policy</a>`;
  document.querySelectorAll(".mc-sec[data-label]").forEach((s) => s.insertAdjacentHTML("afterbegin", `<div class="mc-label" aria-hidden="true"><p class="mc-label__text">${s.dataset.label}</p><span class="mc-label__line"></span></div>`));

  const fv = document.querySelector(".mc-fv");
  const nav = document.querySelector(".mc-nav");
  const btn = document.querySelector(".mc-menu-btn");
  const secs = [...document.querySelectorAll(".mc-sec, .mc-contact")];
  const labeled = [...document.querySelectorAll(".mc-sec[data-label]")];
  const scrollLine = document.querySelector(".mc-scroll");
  const contact = document.getElementById("contact");
  let locked = body.classList.contains("is-locked");

  const at = (list, line) => list.reduce((f, el) => (el.getBoundingClientRect().top <= line ? el : f), null);
  const evaluate = () => {
    const vh = innerHeight;
    const cur = at(secs, vh * 0.65);
    const issue = !cur || cur.id === "issue";
    body.classList.toggle("is-white", issue);
    body.classList.toggle("is-blue", !issue);
    document.documentElement.classList.toggle("mc-snap", issue && pc.matches && !locked);
    const line = vh * (pc.matches ? 0.5 : 0.7);
    const act = locked ? null : at(labeled, line);
    labeled.forEach((s) => s.querySelector(".mc-label").classList.toggle("is-show", s === act && s.getBoundingClientRect().bottom > line));
    if (contact) scrollLine.classList.toggle("is-hide", contact.getBoundingClientRect().top < vh);
  };
  let queued = false;
  addEventListener("scroll", () => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; evaluate(); }); } }, { passive: true });
  addEventListener("resize", evaluate);

  fv?.addEventListener("fx:open", () => { locked = false; body.classList.remove("is-locked"); fv.querySelector("video")?.pause(); ScrollTrigger.refresh(); evaluate(); });

  // Hero entrance — original timeline delay .5: copy 1s (.8) · light rays and sparks via _fx/cone-clip-open (delay 1.3) · scroll hint .5s (−.3)
  const intro = (chrome) => {
    if (reduced) return gsap.set("[data-fv-copy], [data-fv-scroll], .mc-head, .mc-nav", { opacity: 1 });
    const tl = gsap.timeline({ delay: 0.5 });
    tl.fromTo("[data-fv-copy]", { opacity: 0 }, { opacity: 1, duration: 1 }, 0.8).fromTo("[data-fv-scroll]", { opacity: 0 }, { opacity: 1, duration: 0.5 }, 1.8 - 0.3);
    if (chrome) tl.fromTo(".mc-head, .mc-nav", { opacity: 0 }, { opacity: 1, duration: 0.8 }, 0.8);
  };
  // Original starts the intro after the first-screen images and first video frame have loaded (max 2.5s) — the copy waits for fonts and the first video frame
  const assetsReady = (ms) => Promise.race([Promise.all([document.fonts?.ready, new Promise((r) => { const v = fv?.querySelector("video"); if (!v || v.readyState >= 2) r(); else { v.addEventListener("loadeddata", r, { once: true }); v.addEventListener("error", r, { once: true }); } })]), new Promise((r) => setTimeout(r, ms))]);
  if (locked && fv) { gsap.set("[data-fv-copy], [data-fv-scroll]", { opacity: 0 }); if (pc.matches) gsap.set(".mc-head, .mc-nav", { opacity: 0 }); assetsReady(2500).then(() => intro(pc.matches)); }

  // Table of contents — Top re-locks the hero and re-enables the entrance. Other sections open the curtain right away if locked and go to that section
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href").slice(1);
    e.preventDefault();
    nav.classList.remove("is-open"); btn.classList.remove("is-open");
    if (id === "top") {
      if (!fv) return;
      locked = true; body.classList.add("is-locked");
      fv.dispatchEvent(new Event("fx:lock"));
      const v = fv.querySelector("video"); if (v) { v.currentTime = 0; v.play().catch(() => {}); }
      intro(false); evaluate();
      return;
    }
    const go = () => gsap.to(window, { scrollTo: { y: `#${id}` }, duration: reduced ? 0 : 0.8, ease: "power2.inOut" });
    if (locked && fv) { fv.addEventListener("fx:open", () => requestAnimationFrame(go), { once: true }); dispatchEvent(new KeyboardEvent("keydown", { key: "End" })); }
    else go();
  });
  btn.addEventListener("click", () => { const o = btn.classList.toggle("is-open"); nav.classList.toggle("is-open", o); });

  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  evaluate();
})();
