// Where the section changes — dark ink background switch (html.g-dark), background dot cloud shape, and the current section marker in the index.
// Pinned sections (pin-horizontal and film-grow-blur-pin parts) must attach first on DOMContentLoaded so the sections below get start positions pushed down by the pin distance
const gStart = () => {
  if (!window.gsap || !window.ScrollTrigger) return;
  const root = document.documentElement;
  const bg = document.getElementById("g-bg");
  const SHAPE = { hero: "sphere", about: "grid", service: "torus", approach: "tube", plan: "rings", why: "cube", team: "heart" };
  const shape = (name) => bg && bg.dispatchEvent(new CustomEvent("fx:shape", { detail: { shape: SHAPE[name] } }));
  const dark = (on) => root.classList.toggle("g-dark", on);

  // Hero·About pick a shape when the section straddles the screen center line (coming from either above or below)
  for (const [sel, name] of [[".g-hero", "hero"], [".g-intro", "about"]]) {
    ScrollTrigger.create({ trigger: sel, start: "top center", end: "bottom center", onToggle: (self) => self.isActive && shape(name) });
  }
  ScrollTrigger.create({ trigger: ".g-svc", start: "top 68%", onEnter: () => { dark(true); shape("service"); }, onLeaveBack: () => { dark(false); shape("about"); } });
  const apr = document.querySelector(".g-apr");
  ScrollTrigger.create({ trigger: apr, start: "top 60%", onEnter: () => { dark(true); shape("approach"); }, onEnterBack: () => { dark(true); shape("approach"); }, onLeaveBack: () => shape("service") });
  ScrollTrigger.create({ trigger: ".g-plan", start: "top 68%", onEnter: () => { dark(false); shape("plan"); }, onLeaveBack: () => { dark(true); shape("approach"); } });
  ScrollTrigger.create({ trigger: ".g-why", start: "top 68%", onEnter: () => { dark(true); shape("why"); }, onLeaveBack: () => { dark(false); shape("plan"); } });
  ScrollTrigger.create({ trigger: ".g-team", start: "top 68%", onEnter: () => { dark(true); shape("team"); }, onLeaveBack: () => { dark(true); shape("why"); } });
  ScrollTrigger.create({ trigger: ".g-ct", start: "top 70%", onEnter: () => { dark(false); shape("hero"); }, onLeaveBack: () => { dark(true); shape("team"); } });

  const links = document.querySelectorAll(".g-nav a");
  const setActive = (id) => links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === id));
  ["#intro", "#service", "#approach", "#plan", "#why", "#field", "#contact"].forEach((id, i) => {
    const el = document.querySelector(id);
    if (!el) return;
    ScrollTrigger.create({
      trigger: el, start: "top center", end: "bottom center",
      onToggle: (self) => self.isActive && setActive(id),
      onLeaveBack: i === 0 ? () => setActive("") : undefined,
    });
  });

  ScrollTrigger.sort();
  const refresh = () => ScrollTrigger.refresh();
  addEventListener("load", refresh);
  document.fonts && document.fonts.ready.then(refresh);
  setTimeout(refresh, 900);
};
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => queueMicrotask(gStart), { once: true });
else setTimeout(gStart);
