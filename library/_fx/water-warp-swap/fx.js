// When swapping a block of text, it changes with a ripple as if seen through water — on receiving the fx:swap event (detail.apply function)
// fades out blurred in .2s power1.in while refraction grows 0→26 (power2.in), swaps the content right there with apply, then returns in .5s power2.out and
// Refraction settles in .7s power3.out. Meanwhile the ripple noise grain (baseFrequency) gets finer from .012 .05 to .02 .09 over .8s.
(() => {
  let made = 0;
  const NS = "http://www.w3.org/2000/svg";

  kfFx.register("water-warp-swap", (el, { options, reduce }) => {
    const out = +(options.out ?? 0.2), back = +(options.in ?? 0.5), settle = +(options.settle ?? 0.7);
    const scale = +(options.scale ?? 26), ripple = +(options.ripple ?? 0.8);
    const from = options.from || "0.012 0.05", to = options.to || "0.02 0.09";
    const id = `fx-wws-${++made}`;
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("class", "fx-wws-defs");
    svg.innerHTML = `<filter id="${id}" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="${from}" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="0" xChannelSelector="R" yChannelSelector="G"/></filter>`;
    el.append(svg);
    const turb = svg.querySelector("feTurbulence"), disp = svg.querySelector("feDisplacementMap");
    el.style.setProperty("--fx-wws-filter", `url(#${id})`);
    let tl = null;

    const onSwap = (ev) => {
      const apply = typeof ev.detail?.apply === "function" ? ev.detail.apply : () => {};
      tl?.kill();
      if (reduce) { apply(); return; }
      el.classList.add("is-flowing");
      tl = gsap.timeline({ onComplete: () => el.classList.remove("is-flowing") })
        .to(el, { opacity: 0, duration: out, ease: "power1.in" }, 0)
        .fromTo(disp, { attr: { scale: 0 } }, { attr: { scale }, duration: out, ease: "power2.in" }, 0)
        .fromTo(turb, { attr: { baseFrequency: from } }, { attr: { baseFrequency: to }, duration: ripple, ease: "none" }, 0)
        .call(apply, null, out)
        .to(el, { opacity: 1, duration: back, ease: "power2.out" }, out)
        .to(disp, { attr: { scale: 0 }, duration: settle, ease: "power3.out" }, out);
    };
    el.addEventListener("fx:swap", onSwap);

    return () => {
      tl?.kill();
      el.removeEventListener("fx:swap", onSwap);
      el.classList.remove("is-flowing");
      el.style.removeProperty("--fx-wws-filter");
      gsap.set(el, { clearProps: "opacity" });
      svg.remove();
    };
  });
})();
