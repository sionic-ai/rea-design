// Fills the member grid (3 columns, sixteen people) and fourteen award logo slots — so the same pattern isn’t repeated by hand.
(() => {
  const icon = window.LTW.icon;
  const ROLES = ["CEO / Director / Art Director", "Director / Designer", "Director / Designer (Partner)", "Editor / Writer (Partner)", "Designer / Engineer (Partner)", "Composer / Arranger (Partner)", "Producer / Planner"];
  const SHOT = ["Front view · white shirt · light gray background", "Slight side angle · White shirt · Light gray background", "Smiling front view · white shirt · gray background"];
  const SNS = [["ic-fb", "ic-x"], ["ic-x", "ic-ig"], ["ic-fb"], ["ic-fb", "ic-x", "ic-ig"]];
  document.querySelector(".ab-staff .grid").innerHTML = Array.from({ length: 16 }, (_, i) => `
    <li class="co-load"><a href="#">
      <div class="wf-img" data-label="Member bust shot · ${SHOT[i % 3]} · Landscape 4:3"></div>
      <p class="role">${ROLES[i % ROLES.length]}</p>
      <p class="name">Your name $ here{String(i + 1).padStart(2, "0")}</p>
      <p class="roma">Name Here</p>
      <div class="sns">${SNS[i % SNS.length].map((s) => icon(s)).join("")}</div>
    </a></li>`).join("");

  // Award logos: the original is award-name logo art — replaced with gray symbols like a circle · shield · star · lettering plate
  const MARKS = [
    '<circle cx="35" cy="30" r="22" fill="none" stroke="currentColor" stroke-width="5"/><circle cx="35" cy="30" r="8" fill="currentColor"/>',
    '<path d="M35 6 L58 16 V32 Q58 50 35 56 Q12 50 12 32 V16Z" fill="currentColor"/>',
    '<path d="M35 6 L42 24 L62 24 L46 36 L52 56 L35 44 L18 56 L24 36 L8 24 L28 24Z" fill="currentColor"/>',
    '<rect x="8" y="14" width="54" height="32" rx="4" fill="none" stroke="currentColor" stroke-width="4"/><path d="M18 38 V22 L28 34 V22 M36 22 V38 M44 22 H54 M49 22 V38" stroke="currentColor" stroke-width="3" fill="none"/>',
    '<path d="M10 46 Q35 4 60 46" fill="none" stroke="currentColor" stroke-width="5"/><circle cx="35" cy="20" r="6" fill="currentColor"/>',
    '<path d="M8 30 H62 M20 14 L35 46 L50 14" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/>',
    '<rect x="16" y="8" width="38" height="44" fill="currentColor"/><path d="M24 18 H46 M24 28 H46 M24 38 H38" stroke="var(--kf-surface)" stroke-width="3"/>',
  ];
  document.querySelector(".ab-prize .logos").innerHTML = Array.from({ length: 14 }, (_, i) => `<li><svg viewBox="0 0 70 60" aria-label="Your award logo here">${MARKS[(i * 3) % MARKS.length]}</svg></li>`).join("");

  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("move"); io.unobserve(e.target); }
  }), { rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll(".ab-staff .co-load").forEach((el) => io.observe(el));
  if (document.documentElement.classList.contains("rm")) document.querySelectorAll(".ab-staff .co-load").forEach((el) => el.classList.add("move"));
})();
