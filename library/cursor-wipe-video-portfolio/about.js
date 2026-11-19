// About — large text on open, other text lines as they enter the screen (top edge from screen bottom → 70%), words rise in from 160% below at .85 outQuint. Dividers draw from the left.
window.gbSite.boot(() => {
  const site = window.gbSite, $$ = (s, r = document) => [...r.querySelectorAll(s)];
  gsap.registerPlugin(ScrollTrigger);
  // Person slot — draw a dark silhouette on the canvas (if it’s a real photo <img> Ro)
  const pc = document.querySelector(".js-portrait");
  if (pc) {
    const x = pc.getContext("2d"), g = x.createLinearGradient(0, 0, pc.width, 0);
    g.addColorStop(0, "#1d1d1d"); g.addColorStop(1, "#3a3633"); /* Not skin: light on the placeholder portrait photo */
    x.fillStyle = g; x.fillRect(0, 0, pc.width, pc.height);
    x.fillStyle = "#7a6a5e"; /* Not skin: placeholder person silhouette */
    x.beginPath(); x.ellipse(pc.width * 0.5, pc.height * 0.36, pc.width * 0.16, pc.height * 0.15, 0, 0, 7); x.fill();
    x.beginPath(); x.ellipse(pc.width * 0.5, pc.height * 0.92, pc.width * 0.38, pc.height * 0.32, 0, 0, 7); x.fill();
  }
  const title = document.querySelector(".js-about-title"), texts = $$(".js-about-text, .gb-about__name");
  const spT = site.split(title);
  const tw = spT ? spT.words : [title];
  gsap.set(tw, site.hide());
  site.ready.then(() => gsap.to(tw, { ...site.D, ...site.show(), stagger: spT ? site.stagger(spT.lines, spT.words) : 0 }));
  texts.forEach((el) => {
    const sp = site.split(el), w = sp ? sp.words : [el];
    gsap.set(w, site.hide());
    site.ready.then(() => ScrollTrigger.create({ trigger: el, start: "top bottom", end: "top 70%", once: true, onEnter: () => gsap.to(w, { ...site.D, ...site.show(), stagger: sp ? site.stagger(sp.lines, sp.words) : 0 }) }));
  });
  $$(".gb-about__sep").forEach((s) => {
    gsap.set(s, { scaleX: 0 });
    site.ready.then(() => ScrollTrigger.create({ trigger: s, start: "top bottom", once: true, onEnter: () => gsap.to(s, { scaleX: 1, duration: 0.85, ease: "inOutQuint" }) }));
  });
});
