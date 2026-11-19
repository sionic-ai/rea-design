// Home-only motion — hero slick fade + approach, staggered photo band, a tree turning on trunk first and then leaves
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Original: slick fade (stays 5s · .7s linear), before advancing adds isZoom to the next slide photo (10s linear 1.1x), removes isZoom from the previous slide after .7s
  const $slide = window.jQuery && jQuery("#cm-vis-slide");
  if ($slide && $slide.length && jQuery.fn.slick) {
    const media = () => $slide.find(".cm-vis__image > .wf-img");
    $slide.on("init", () => media().eq(0).addClass("is-zoom"));
    $slide.on("beforeChange", (e, s, cur, next) => {
      media().eq(next).addClass("is-zoom");
      setTimeout(() => requestAnimationFrame(() => media().eq(cur).removeClass("is-zoom")), 700);
    });
    $slide.slick({ autoplay: !reduce, autoplaySpeed: 5000, fade: true, pauseOnFocus: false, pauseOnHover: false, speed: 700, cssEase: "linear", arrows: false, dots: true, dotsClass: "cm-vis__dots" });
  }

  // Original: six cards (staggered heights) chained four sets, drifting 25% (one set) in 90s
  const track = document.querySelector(".cm-gallery__track");
  if (track) {
    const shots = [
      ["Clinic exterior · black timber gable roof · blue sky · panel with slanted top edge", 467, 388, 35],
      ["Nurse shot · reaching out in front of a medicine shelf · bright interior · portrait panel", 374, 306, 147],
      ["Foliage plant · green leaves and pendant lamp · blurred background · landscape panel", 466, 262, 0],
      ["Reception desk · wooden lattice partition and staff · warm interior · landscape panel", 378, 296, 114],
      ["Waiting room · wooden pillar and window chair · morning light · landscape panel", 420, 300, 68],
      ["Exam room · white bed and equipment · bright interior · landscape", 360, 270, 201],
    ];
    const one = shots.map(([label, w, h, top], i) => `<div class="cm-gallery__item cm-gallery__item--no${i + 1}" style="padding-top:${top}px"><div class="cm-gallery__image" style="width:${w}px;height:${h}px"><div class="wf-img" data-label="${label}"></div></div></div>`).join("");
    track.innerHTML = one.repeat(4);
  }

  // Original: two layers of the tree drawing (<use>) turns on in 1s when visible, and the second layer (leaf) is delayed by 2s
  const host = document.querySelector(".cm-top-about__trunk");
  const sym = document.getElementById("cm-tree");
  if (host && sym) {
    const kids = [...sym.children];
    host.innerHTML = `<svg class="cm-tree-svg" viewBox="${sym.getAttribute("viewBox")}" aria-hidden="true"><g class="cm-tree-layer">${kids[0].outerHTML}</g><g class="cm-tree-layer">${kids.slice(1).map((k) => k.outerHTML).join("")}</g></svg>`;
    const show = () => host.closest(".cm-top-about__tree").classList.add("is-in");
    if (reduce || !window.ScrollTrigger) show();
    else { gsap.registerPlugin(ScrollTrigger); ScrollTrigger.create({ trigger: host, start: "top bottom", once: true, onEnter: show }); }
  }
})();
