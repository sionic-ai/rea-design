(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const narrow = () => matchMedia("(max-width: 767px)").matches;
  gsap.registerPlugin(ScrollTrigger);

  /* Hero: after the background image enters from navy to wave (1.6s), logo 1.35s, description 1.2s (power2.out) starting .16s later */
  const title = document.querySelector(".um-hero__title"), desc = document.querySelector(".um-hero__desc");
  if (reduce || scrollY > 8) gsap.set([title, desc], { autoAlpha: 1 });
  else gsap.timeline({ defaults: { ease: "power2.out" }, delay: 1.6 }).to(title, { autoAlpha: 1, duration: 1.35 }).to(desc, { autoAlpha: 1, duration: 1.2 }, 0.16);
  /* On scroll the hero text fades out over 60% with 14px blur and 1.06x scale (scrub .6) */
  if (!reduce) gsap.to(".um-hero__in", { opacity: 0, filter: "blur(14px)", scale: 1.06, ease: "none", scrollTrigger: { trigger: ".um-hero", start: "top top", end: "+=60%", scrub: 0.6, invalidateOnRefresh: true } });

  if (!reduce) {
    /* Section title: resolves in 1.1s from blur and wide letter-spacing */
    document.querySelectorAll(".um-title:not(.um-lead__title)").forEach((t) => {
      gsap.set(t, { opacity: 0, filter: "blur(10px)", letterSpacing: "0.3em", scale: 0.98 });
      gsap.to(t, { opacity: 1, filter: "blur(0px)", letterSpacing: "normal", scale: 1, duration: 1.1, ease: "power2.out", scrollTrigger: { trigger: t, start: "top 85%", once: true } });
    });
    /* Description, flow row, contact note: rise 20px from below in .8s */
    document.querySelectorAll(".um-fade").forEach((n) => gsap.to(n, { opacity: 1, filter: "blur(0px)", y: 0, duration: 0.8, ease: "power2.out", scrollTrigger: { trigger: n, start: "top 70%", once: true } }));
    /* Thoughts post: two headings at .12s intervals for .9s, body after that */
    const lead = document.querySelector(".um-lead"), hg = lead.querySelectorAll(".um-lead__text, .um-lead__title"), body = lead.querySelector(".um-lead__txtwrap");
    gsap.set(hg, { opacity: 0, y: 20, filter: "blur(10px)" });
    gsap.set(body, { opacity: 0, y: 20 });
    let started = 0;
    gsap.to(hg, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.9, ease: "power2.out", stagger: 0.12, onStart: () => { started = performance.now(); },
      scrollTrigger: { trigger: lead, start: () => (narrow() ? "top bottom" : `top+=${lead.querySelector(".um-lead__hg").offsetTop} top`), once: true, invalidateOnRefresh: true } });
    ScrollTrigger.create({ trigger: lead, start: () => (narrow() ? "top bottom" : `top+=${lead.querySelector(".um-lead__hg").offsetTop + 300} top`), once: true, invalidateOnRefresh: true,
      onEnter: () => gsap.to(body, { opacity: 1, y: 0, duration: 0.9, ease: "power2.out", delay: started ? Math.max(0, 900 - (performance.now() - started)) / 1000 : 0.9 }) });
  }

  /* Case band: the list is attached once more and goes half a turn in 60s — on phone, from the seventh item it moves to a second row and reverses */
  const track = document.querySelector(".um-works__track"), list = track.querySelector(".um-works__list");
  const rows = [{ track, list, from: 0, to: -50 }];
  if (narrow() && !reduce) {
    const second = document.querySelector(".um-works__track.is-second"), l2 = second.querySelector(".um-works__list");
    [...list.children].slice(6).forEach((n) => l2.append(n));
    second.hidden = false;
    rows.push({ track: second, list: l2, from: -50, to: 0 });
  }
  const tracks = rows.map((r) => r.track);
  if (reduce) gsap.set(tracks, { opacity: 1, filter: "none" });
  else gsap.to(tracks, { opacity: 1, filter: "blur(0px)", duration: 1.2, ease: "power2.out", scrollTrigger: { trigger: ".um-works", start: "top 75%", once: true } });
  const loops = reduce ? [] : rows.map(({ list: l, from, to }) => {
    const copy = l.cloneNode(true);
    copy.setAttribute("aria-hidden", "true");
    l.after(copy);
    return gsap.fromTo(l.parentElement, { xPercent: from }, { xPercent: to, duration: 60, ease: "none", repeat: -1 });
  });
  const stop = document.querySelector("[data-works-motion]");
  let paused = false;
  stop?.addEventListener("click", () => {
    paused = !paused;
    stop.setAttribute("aria-pressed", String(paused));
    stop.textContent = paused ? "Replay Motion" : "Motion Paused";
    loops.forEach((t) => (paused ? t.pause() : t.resume()));
  });

  /* When the contact section is reached, the background art panel fades away */
  const bg = document.querySelector(".um-bg"), contact = document.querySelector(".um-contact");
  if (bg && contact && !reduce) gsap.to(bg, { opacity: 0, ease: "none", scrollTrigger: { trigger: contact, start: () => (narrow() ? "bottom bottom" : "top 50%"), end: () => (narrow() ? "bottom 85%" : "top 50px"), scrub: true, invalidateOnRefresh: true,
    onLeave: () => { bg.style.visibility = "hidden"; }, onEnterBack: () => { bg.style.visibility = ""; } } });
})();
