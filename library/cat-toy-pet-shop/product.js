// Product list — draws the consumables row · category row (runs before so the reveal·stagger of shared.js applies), clicking a head image scrolls smoothly to that section (stops 80px above if there are two or more images, original anchorLink.js)
(() => {
  const b = (t, k, href = "#") => `<a class="mr-btn mr-btn--${k}" href="${href}" data-fx="dot-shrink-hover"><span class="mr-btn__text" data-fx-part="text">${t}</span></a>`;
  const sub = (name, note, label) => `
    <div class="mr-sub" data-fadein data-y="50">
      <a class="mr-sub__media" href="#"><span class="wf-img" data-label="${label}"></span></a>
      <div class="mr-sub__content">
        <div><p class="mr-sub__title">${name} <span>(${note})</span></p><p class="mr-sub__desc">Your one or two lines on the consumable go here. Why it’s more convenient used together.</p></div>
        <div class="mr-sub__btn">${b("BUY", "accent")}</div>
      </div>
    </div>`;
  document.querySelector(".mr-subs").insertAdjacentHTML(
    "beforeend",
    sub("Supplies 1", "Fits all models", "Supplies bag cutout · White background · Landscape 3:2") +
      sub("Supplies 2", "Fits all models", "Four identical bags side by side · white background · landscape 3:2") +
      sub("Supplies 3", "Model A·B match", "Small round part cutout · white background · landscape 3:2"),
  );

  const items = [
    { id: "cat2", name: "Your category 2 name here", label: "Gray cat drinking at a water dispenser · floor level · portrait 4:5", btns: [["VIEW DETAIL", "ink"], ["BUY", "accent"]], sub: ["Supplies 4", "Category 2 match", "White filter part cutout · white background · landscape 3:2"], delay: "continue-reverse-pc" },
    { id: "cat3", name: "Your category 3 name here", label: "White cat standing beside a feeder · bright interior · portrait 4:5", btns: [["VIEW DETAIL", "ink"], ["BUY", "accent"]], delay: "continue" },
    { id: "cat4", name: "Your category 4 name here", label: "Gray cat sitting on a sofa, front view · soft window light · vertical 4:5", btns: [["BUY", "accent"]], sub: ["Supplies 5", "Category 4 match", "Necklace chain cutout · white background · landscape 3:2"], delay: "continue-reverse-pc" },
  ];
  document.querySelector(".mr-pl__items").innerHTML = items
    .map(
      (it) => `
    <li class="mr-pl__item" id="${it.id}" data-img-area>
      <div class="mr-pl__imgWrap" data-px-area>
        <div class="mr-pl__imgIn" data-px data-y="-50" data-md-y="-200" data-ease="none"><span class="wf-img mr-pl__img" data-img-in data-delay="${it.delay}" data-px data-y="-30" data-md-y="-100" data-md-scrub="1" data-label="${it.label}"></span></div>
      </div>
      <div class="mr-pl__contents">
        <div class="mr-pl__text" data-anim data-start="80%">
          <p class="mr-pl__name" data-fadein data-y="50">${it.name}</p>
          <p class="mr-pl__desc" data-fadein data-y="50" data-delay="0.1">Here, add a four-line category description. Say it connects with the app to keep a daily record and reduces hands-on effort. You can check the status even while away from home.</p>
          <div class="mr-pl__links" data-fadein data-y="50" data-delay="0.2">${it.btns.map(([t, k]) => `<div>${b(t, k)}</div>`).join("")}</div>
        </div>
      </div>
    </li>${it.sub ? `<li class="mr-subs mr-subs--in" data-anim data-start="80%">${sub(...it.sub)}</li>` : ""}`,
    )
    .join("");

  // Photo band: when in view, a veil darkening downward fades in to .4 in .3s
  const band = document.querySelector("[data-band]");
  if (window.ScrollTrigger) ScrollTrigger.create({ trigger: band, start: "top 80%", once: true, onEnter: () => band.classList.add("is-inview") });

  const jumps = [...document.querySelectorAll(".mr-pl__jump a")];
  jumps.forEach((a) =>
    a.addEventListener("click", (e) => {
      const t = document.querySelector(a.getAttribute("href"));
      if (!t) return;
      e.preventDefault();
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      scrollTo({ top: t.getBoundingClientRect().top + scrollY - (jumps.length > 1 ? 80 : 0), behavior: reduce ? "auto" : "smooth" });
    }),
  );
})();
