// Company info only: drawing branch cells and the vision photo spread — the photo plate’s left, right, top, bottom and corners from the current value
// Goes 0·0·-10%·-10%·0, from when the panel’s top edge touches the screen bottom until it reaches 10% of the screen, scrub 1 (original handleScrollVisionCompany, wide screens only)
(() => {
  const offices = [["Headquarters", "Headquarters building front · Clear daytime"], ["One Branch Name", "Branch warehouse entrance · Daytime"], ["Branch name two", "White office building and parking lot · overcast day"], ["Branch name three", "Office building side and shutter · Daytime"], ["Branch name four", "Low warehouse building · clear daytime"]];
  const card = (n, l, tel = true) => `<li class="ab-office__item"><div class="ab-office__c">
    <p class="ab-office__name">${n}</p><p class="ab-office__addr">〒000-0000<br>Your branch address in one line here</p>
    <a class="tk-map" href="#"><span data-fx="line-redraw-hover" data-fx-line-redraw-hover="look: always-half">Google map</span></a>
    ${tel ? `<div class="ab-office__tel"><p><span>TEL :</span><b>000-00-0000</b></p><p><span>FAX :</span><b>000-00-0000</b></p></div>` : ""}</div>
    <div class="ab-office__img tk-ph wf-img" data-label="${l} · Landscape 3:2"></div></li>`;
  const list = document.querySelector("[data-office-list]"), abroad = document.querySelector("[data-office-abroad]");
  if (list) list.innerHTML = offices.map(([n, l]) => card(n, l)).join("");
  if (abroad) abroad.innerHTML = card("Overseas city name", "European residential street · tree shade", false);

  const bg = document.querySelector("[data-vision-bg]");
  if (!bg) return;
  gsap.matchMedia().add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
    const cs = getComputedStyle(bg);
    gsap.fromTo(bg, { left: cs.left, right: cs.right, top: cs.top, bottom: cs.bottom, borderRadius: cs.borderRadius }, {
      left: 0, right: 0, top: "-10%", bottom: "-10%", borderRadius: 0,
      scrollTrigger: { trigger: bg, start: "top bottom", end: "top 10%", scrub: 1 },
    });
  });
})();
