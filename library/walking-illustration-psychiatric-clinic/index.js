// First page: hero Splide fade (5s interval · 2s), facility photo clip-path scrub (except the first), calendar slot drawing.
(() => {
  // Same Splide 4.1.2 fade as the original — with reduced motion Splide stops itself (reducedMotion default)
  const hero = document.querySelector(".hh-hero__bg.splide");
  if (hero && window.Splide) new Splide(hero, { type: "fade", rewind: true, autoplay: true, arrows: false, interval: 5000, speed: 2000 }).mount();

  // Stand-in for the original external calendar widget (embed): today, previous/next month, month and agenda views, and tapping an event chip opens a small detail window
  const cal = document.querySelector(".hh-cal");
  if (cal) {
    const heads = ["Day", "Month", "Fire", "Number", "Neck", "Gold", "Earth"];
    const now = new Date();
    let y = now.getFullYear(), m = now.getMonth(), view = "month";
    const evs = (d) => (d.getDay() === 0 ? [] : ["Outpatient Care", ...(d.getDay() === 2 || d.getDay() === 4 ? ["Specialist outpatient clinic"] : [])]);
    const chip = (d, e) => `<button class="ev" type="button" data-day="${d.getDate()}" data-ev="${e}">${e}</button>`;
    const render = () => {
      const first = new Date(y, m, 1), days = new Date(y, m + 1, 0).getDate();
      const cells = Math.ceil((first.getDay() + days) / 7) * 7;
      const body = view === "month"
        ? `<div class="grid">${Array.from({ length: cells }, (_, i) => {
            const d = new Date(y, m, 1 - first.getDay() + i), out = d.getMonth() !== m;
            return `<div class="${out ? "is-out" : ""}"><span class="d">${i < 7 ? heads[i] + "<br>" : ""}${d.getDate()}</span>${out ? "" : evs(d).map((e) => chip(d, e)).join("")}</div>`;
          }).join("")}</div>`
        : `<ul class="agenda">${Array.from({ length: days }, (_, i) => new Date(y, m, i + 1)).filter((d) => evs(d).length).map((d) => `<li><span class="day">${d.getMonth() + 1}Month ${d.getDate()}Day (${heads[d.getDay()]})</span><span class="list">${evs(d).map((e) => chip(d, e)).join("")}</span></li>`).join("")}</ul>`;
      cal.innerHTML = `<div class="top"><button class="today" type="button">Today</button><button class="nav" type="button" data-step="-1" aria-label="Previous month">‹</button><button class="nav" type="button" data-step="1" aria-label="Next month">›</button><b>${y}Year ${m + 1}Month</b><span class="views"><button type="button" data-view="month" class="${view === "month" ? "is-on" : ""}">Month</button><button type="button" data-view="agenda" class="${view === "agenda" ? "is-on" : ""}">Schedule</button></span></div>${body}<div class="foot"><span>Calendar name slot · timezone GMT+00</span><span>External calendar widget slot</span></div>`;
    };
    cal.addEventListener("click", (e) => {
      const t = e.target.closest("button");
      cal.querySelector(".pop")?.remove();
      if (!t) return;
      if (t.classList.contains("today")) { y = now.getFullYear(); m = now.getMonth(); render(); }
      else if (t.dataset.step) { m += +t.dataset.step; if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; } render(); }
      else if (t.dataset.view) { view = t.dataset.view; render(); }
      else if (t.dataset.ev) {
        const pop = document.createElement("div");
        pop.className = "pop";
        pop.innerHTML = `<b>${t.dataset.ev}</b><span>${y}Year ${m + 1}Month ${t.dataset.day}Job · 00:00–00:00</span><span>Your one-line schedule description here</span>`;
        const r = t.getBoundingClientRect(), c = cal.getBoundingClientRect();
        pop.style.left = `${Math.min(r.left - c.left, c.width - 230)}px`;
        pop.style.top = `${r.bottom - c.top + 4}px`;
        cal.appendChild(pop);
      }
    });
    render();
  }

  const mm = gsap.matchMedia();
  mm.add("(min-width: 801px) and (prefers-reduced-motion: no-preference)", () => {
    const cards = gsap.utils.toArray(".hh-fac .card");
    const ims = gsap.utils.toArray(".hh-fac .im .wf-img");
    cards.forEach((card, i) => {
      if (i === 0) return;
      gsap.fromTo(ims[i], { clipPath: "inset(100% 0% 0% 0%)" }, {
        clipPath: "inset(0% 0% 0% 0%)",
        ease: "power1.out",
        scrollTrigger: { trigger: card, start: "top bottom-=100px", end: "top center", scrub: 1 },
      });
    });
  });
})();
