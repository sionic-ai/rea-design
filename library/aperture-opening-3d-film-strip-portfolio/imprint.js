/* Legal notice: when the aperture opens, large title letters rise from below one after another (original if-harf letter chunks) */
(() => {
  const t = document.querySelector(".ks-title");
  if (t && !t.querySelector(".ks-ch")) t.innerHTML = [...t.textContent].map((c) => `<span class="ks-ch">${c}</span>`).join("");
  const chars = t ? t.querySelectorAll(".ks-ch") : [];
  if (!hc.reduce) gsap.set(chars, { yPercent: 100, opacity: 0 });
  hc.loader(() => { if (!hc.reduce) gsap.to(chars, { yPercent: 0, opacity: 1, duration: 1, stagger: 0.05, ease: "expo.out" }); });
  const top = document.querySelector(".ks-foot__top");
  top && top.addEventListener("click", (e) => { e.preventDefault(); scrollTo({ top: 0, behavior: hc.reduce ? "auto" : "smooth" }); });
})();
