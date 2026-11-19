// Member tab — the original jumps straight (anchor move, no in-between values) to a profile board with face links (#pf-*) lined up sideways. Draw the board and connect it to the face row
(() => {
  const roll = document.querySelector(".kk-roll");
  const src = document.getElementById("kk-prof-src");
  if (!roll || !src) return;
  const people = JSON.parse(src.textContent);
  const track = roll.querySelector(".kk-roll__track");
  track.innerHTML = people.map((p, i) => `
    <section class="kk-prof" id="${p.id}" aria-label="${p.name}">
      <div class="kk-tabs" aria-hidden="true">${people.map((_, k) => `<i class="${k === i ? "is-on" : ""}"></i>`).join("")}</div>
      <div class="kk-prof__card">
        <div class="kk-prof__top">
          <span class="kk-prof__face wf-img" data-label="Member face illustration · circle"></span>
          <div>
            <p class="kk-prof__name"><b>${p.name}</b><span>${p.en}</span></p>
            <p class="kk-prof__role">${p.role}</p>
            <dl>${p.rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>
          </div>
        </div>
        <div class="kk-favs">${p.favs.map((f) => `<span class="wf-img" data-label="${f}"></span>`).join("")}</div>
      </div>
    </section>`).join("");
  const go = (id) => {
    const el = document.getElementById(id);
    if (el) roll.scrollLeft = el.offsetLeft - track.offsetLeft;
  };
  document.querySelectorAll(".kk-faces [data-to]").forEach((b) => b.addEventListener("click", () => go(b.dataset.to)));
  addEventListener("resize", () => go(people[Math.round(roll.scrollLeft / roll.clientWidth)]?.id));
})();
