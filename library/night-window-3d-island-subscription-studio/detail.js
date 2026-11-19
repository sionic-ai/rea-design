// One case study: when arriving from a card (home·list cards leave their position in sessionStorage), a color board at that position unfolds into the hero image position in 1s cubic-bezier(.76,0,.24,1)
(() => {
  const raw = sessionStorage.getItem("sq-flip");
  sessionStorage.removeItem("sq-flip");
  const target = document.querySelector("[data-flip-target]");
  if (!raw || !target || window.SQ.reduced) return;
  const from = JSON.parse(raw), to = target.getBoundingClientRect();
  const layer = document.createElement("div");
  layer.className = "sq-flip";
  layer.style.setProperty("--case-bg", getComputedStyle(target).getPropertyValue("--case-bg"));
  document.body.append(layer);
  gsap.set(target, { autoAlpha: 0 });
  gsap.fromTo(layer, { left: from.x, top: from.y, width: from.w, height: from.h }, {
    left: to.left, top: to.top, width: to.width, height: to.height, borderRadius: 24, duration: 1, ease: window.CustomEase ? CustomEase.create("sq-flip", "0.76,0,0.24,1") : "power3.inOut",
    onComplete: () => { gsap.set(target, { autoAlpha: 1 }); gsap.to(layer, { autoAlpha: 0, duration: 0.3, onComplete: () => layer.remove() }); },
  });
})();
