// Story — per block, text 1.2s → .3s later the photo sharpens from a 10px blur (1.2s), on PC the photo rises inside the panel. Person panel open and close. Flowing English line. Closing title letters
(() => {
  const BREAKPOINT = 814;
  const html = document.documentElement;
  const splitChars = (el) => {
    const text = el.textContent;
    el.textContent = "";
    for (const ch of text) {
      if (/\s/.test(ch)) { el.append(ch); continue; }
      const s = document.createElement("span");
      s.className = "tn-char";
      s.textContent = ch;
      el.append(s);
    }
  };
  const msgSpans = [...document.querySelectorAll("[data-tn-split-msg]")];
  msgSpans.forEach(splitChars);

  const onLoad = () => {
    const mm = gsap.matchMedia();

    document.querySelectorAll(".tn-sblock").forEach((block) => {
      const text = block.querySelector(".tn-sblock__text"), inner = block.querySelector(".tn-sblock__inner");
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(text, { opacity: 0 });
        gsap.set(inner, { opacity: 0, filter: "blur(10px)" });
        ScrollTrigger.create({
          trigger: block, start: "top 60%", once: true,
          onEnter: () => gsap.timeline({ onComplete: () => gsap.set([text, inner], { clearProps: "all" }) })
            .to(text, { opacity: 1, duration: 1.2 })
            .to(inner, { opacity: 1, filter: "blur(0px)", duration: 1.2 }, 0.3),
        });
      });
      mm.add(`(min-width: ${BREAKPOINT}px) and (prefers-reduced-motion: no-preference)`, () => {
        const img = inner.querySelector(".tn-sblock__img");
        gsap.fromTo(img, { y: () => inner.clientHeight - inner.scrollHeight }, { y: 0, ease: "none", scrollTrigger: { trigger: inner, scrub: true, start: "top bottom", end: "bottom top", invalidateOnRefresh: true } });
      });
    });

    // Person panel — open .8s · close .4s
    const modal = document.querySelector(".tn-bmodal");
    const opener = document.querySelector("[data-tn-block-modal]");
    if (modal && opener) {
      opener.addEventListener("click", () => { html.classList.add("block-modal-show"); gsap.to(modal, { opacity: 1, duration: 0.8 }); });
      modal.querySelector(".tn-bmodal__foot button").addEventListener("click", () => {
        gsap.to(modal, { opacity: 0, duration: 0.4, onComplete: () => html.classList.remove("block-modal-show") });
      });
    }

    // Closing title: letters at the 40% line of the screen, .05s stagger, .8s
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const chars = msgSpans.flatMap((s) => [...s.querySelectorAll(".tn-char")]);
      if (!chars.length) return;
      gsap.set(chars, { opacity: 0, yPercent: 22 });
      ScrollTrigger.create({ trigger: ".tn-message__title", start: "top 40%", once: true, onEnter: () => gsap.to(chars, { opacity: 1, yPercent: 0, stagger: 0.05, duration: 0.8, onComplete: () => gsap.set(chars, { clearProps: "all" }) }) });
    });

    // Flowing English line — one loop = Letter count × width × 1.5ms (1.8ms on phones), runs only while on screen (applied after .5s like the original)
    const loops = document.querySelectorAll(".tn-loop");
    const setLoop = () => {
      const t = Math.floor(innerWidth * (innerWidth < BREAKPOINT ? 180 : 150)) / 100;
      loops.forEach((el) => el.style.setProperty("--animation", `${Number(getComputedStyle(el).getPropertyValue("--letter")) * t}ms`));
    };
    setTimeout(() => {
      setLoop();
      loops.forEach((el) => {
        const run = () => el.style.setProperty("--state", "running"), stop = () => el.style.setProperty("--state", "paused");
        ScrollTrigger.create({ trigger: el, onEnter: run, onEnterBack: run, onLeave: stop, onLeaveBack: stop });
      });
    }, 500);
    let rt = 0;
    addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(setLoop, 500); });
  };
  if (document.readyState === "complete") onLoad(); else addEventListener("load", onLoad);
})();
