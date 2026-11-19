// Work detail — expanding text: height 1.5s power4.inOut, arrow 180° 1s power4.out (.2s, delayed .8s when collapsing), the More ↔ Less label letters slide up and down
(() => {
  const acc = document.querySelector("[data-acc]");
  if (!acc) return;
  const body = acc.querySelector("[data-acc-body]");
  const icon = acc.querySelector("[data-acc-icon]");
  const open = acc.querySelector("[data-open]");
  const close = acc.querySelector("[data-close]");
  const oc = TW.chars(open), cc = TW.chars(close);
  gsap.set(cc, { yPercent: -110 });
  let on = false;
  acc.querySelector("[data-acc-btn]").addEventListener("click", () => {
    on = !on;
    const d = on ? 0.2 : 0.8;
    if (on) gsap.fromTo(body, { height: 0 }, { height: body.scrollHeight, duration: 1.5, ease: "power4.inOut", onComplete: () => gsap.set(body, { height: "auto" }) });
    else { gsap.set(body, { height: body.offsetHeight }); gsap.to(body, { height: 0, duration: 1.5, ease: "power4.inOut" }); }
    gsap.to(icon, { rotation: on ? 180 : 0, duration: 1, ease: "power4.out", delay: d });
    const [out, inn] = on ? [oc, cc] : [cc, oc];
    gsap.to(out, { yPercent: on ? 110 : -110, duration: 0.5, stagger: 0.025, ease: "power4.out", delay: d });
    gsap.fromTo(inn, { yPercent: on ? -110 : 110 }, { yPercent: 0, duration: 1, stagger: 0.025, ease: "power4.out", delay: d });
  });
})();
