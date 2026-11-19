// First page: loader, three layers of city rising by scrub over the sentence, photo flow, fish bars, seasonal calendar, harbor map.
// Original values (design width 1440 proportional Er(px)=/  min(vw·px/1440, px)): behind city -600 · center -1200 (phone 800) · front -860 (phone 590), deco start top top
//           When the intro text reaches 68%, the front city goes to .4 over 1.6s · loader .7/.7/.9s → logo x 1.2s power3 · nav 1.8s · title · sun blur+y40 1.4s power1
(() => {
  const { reduced } = NM;
  const isSp = () => matchMedia("(max-width: 767px)").matches;
  // Original Er: scales proportionally to the design width (PC 1440 · 390 below 767px) but never exceeds px
  const Er = (px) => Math.min(innerWidth * (px / (isSp() ? 390 : 1440)), px);

  document.getElementById("emblem").innerHTML = NM.emblem();
  ["back", "mid", "front"].forEach((k) => (document.getElementById("city-" + k).innerHTML = NM.city(k)));
  document.querySelectorAll("[data-fish]").forEach((el, i) => (el.outerHTML = NM.fish(i + 1)));
  document.getElementById("cal").innerHTML = NM.calendar();
  document.getElementById("map").innerHTML = NM.harbor();

  const labels = ["Fishing boat in night harbor · Lights", "Tuna on the auction floor · from above", "Merchant holding a knife · side light", "Market signboard · red lettering", "In front of fish market building · day", "Row of fish on ice · Top view", "Shop counter · sashimi plate", "Dawn harbor · Blue sky", "Auctioneer’s hand gesture · close-up", "Customer picking out fish · Side view"];
  const sizes = [[150, 190, -120], [220, 200, 40], [190, 260, -40], [160, 140, -150], [230, 170, 120], [180, 230, -90], [210, 160, 90], [150, 200, -160], [240, 180, 20], [170, 220, 140]];
  // Original piece image height 460 (phone 320) proportional to design width, one set width ≈3250 (whole strip 6501) — cell size shrinks together via --u and --deco-k (phone 320/460)
  const ph = (i) => { const [w, h, dy] = sizes[i]; return `<div class="deco2__ph" style="width:calc(${w * 1.5} * var(--u) * var(--deco-k));height:calc(${h * 1.2} * var(--u) * var(--deco-k));transform:translateY(calc(${dy} * var(--u) * var(--deco-k)))"><div class="wf-img" data-label="${labels[i]}"></div></div>`; };
  const one = labels.map((_, i) => ph(i)).join("");
  document.querySelector(".deco2__track").innerHTML = one + one;

  // Original: city block height = Floor of the previous city (images fill in late, so re-measure after load and on every window resize)
  const deco = document.querySelector(".deco1"), front = document.getElementById("city-front");
  const fit = () => { const h = front.offsetTop + front.offsetHeight; if (h > 0) deco.style.height = `${h}px`; ScrollTrigger.refresh(); };
  addEventListener("load", fit);
  addEventListener("resize", fit);

  const mm = gsap.matchMedia();
  mm.add({ motion: "(prefers-reduced-motion: no-preference)", sp: "(max-width: 767px)" }, ({ conditions }) => {
    if (!conditions.motion) return;
    const scrub = (id, px) =>
      gsap.to(id, { y: () => -Er(px), ease: "none", scrollTrigger: { trigger: ".deco1", start: "top top", end: () => `+=${Er(px)}`, scrub: true, invalidateOnRefresh: true } });
    scrub("#city-back", 600);
    scrub("#city-mid", conditions.sp ? 800 : 1200);
    scrub("#city-front", conditions.sp ? 590 : 860);
    const dim = (o) => () => gsap.to("#city-front", { opacity: o, duration: 1.6, overwrite: "auto" });
    ScrollTrigger.create({ trigger: ".sec1", start: "top 68%", end: "bottom top", onEnter: dim(0.4), onEnterBack: dim(0.4), onLeave: dim(1), onLeaveBack: dim(1) });

    // Phone: the fixed vertical slogan moves up by its own height following the About text
    if (conditions.sp) {
      const t = document.getElementById("kv-title");
      const off = () => t.offsetTop + t.offsetHeight;
      gsap.to(t, { y: () => -off(), ease: "none", scrollTrigger: { trigger: ".sec1", start: () => `top ${off()}px`, end: () => `+=${off()}`, scrub: true, invalidateOnRefresh: true } });
      return;
    }

    // PC: the ‹What is a brand?› section stays pinned to the top of the screen while only the right column rises 1920, and when it’s done the section is released at its current spot
    const sec = document.querySelector(".sec2");
    sec.classList.add("nm-sticky");
    gsap.to(".sec2__right", {
      y: () => -Er(1920), ease: "none",
      scrollTrigger: {
        trigger: ".sec2__left", start: "top top", end: () => `+=${Er(1920)}`, scrub: true, invalidateOnRefresh: true,
        onLeave: (st) => {
          const r = sec.getBoundingClientRect().top + st.end;
          sec.classList.remove("nm-sticky");
          const t = sec.getBoundingClientRect().top + scrollY;
          sec.style.position = "relative";
          sec.style.top = `${r - t}px`;
        },
        onEnterBack: () => { sec.style.position = ""; sec.style.top = ""; sec.classList.add("nm-sticky"); },
      },
    });
    return () => { sec.classList.remove("nm-sticky"); sec.style.position = ""; sec.style.top = ""; };
  });

  addEventListener("load", () => ScrollTrigger.refresh());
})();
