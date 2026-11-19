// Contact — ending word roller (every 1.75s letters slide up at .018 intervals and new ones come from below at .022), growing text field, budget digit dots, post-send scene
KK.page("contact", (c) => {
  const $ = (s) => c.querySelector(s), $$ = (s) => [...c.querySelectorAll(s)];
  const reduce = KK.reduce, offs = [];

  (() => {
    const box = $("[data-rot]"), track = $("[data-rot-track]");
    if (!box || !track) return;
    const words = [...track.children];
    if (words.length < 2) return;
    let cur = 0, wait = null, tl = null;
    const splits = words.map((w) => new SplitText(w, { type: "chars", charsClass: "kk-contact__char" }));
    const chars = (i) => splits[i]?.chars ?? [];
    const pad = () => Math.ceil((parseFloat(getComputedStyle(box).fontSize) || 0) * 0.24);
    const width = (i) => { const r = chars(i).map((ch) => ch.getBoundingClientRect()).filter((b) => b.width); return r.length ? Math.ceil(Math.max(...r.map((b) => b.right)) - Math.min(...r.map((b) => b.left))) : Math.ceil(words[i].getBoundingClientRect().width); };
    track.dataset.ready = "";
    words.forEach((w, i) => { gsap.set(w, { autoAlpha: i === cur ? 1 : 0 }); gsap.set(chars(i), { display: "inline-block", yPercent: i === cur ? 0 : 110, autoAlpha: i === cur ? 1 : 0 }); });
    box.style.width = `${width(cur) + pad()}px`;
    const next = () => {
      const to = (cur + 1) % words.length, from = cur, w = width(to) + pad();
      if (reduce) { gsap.set(words[from], { autoAlpha: 0 }); gsap.set(words[to], { autoAlpha: 1 }); gsap.set(chars(to), { autoAlpha: 1, yPercent: 0 }); box.style.width = `${w}px`; cur = to; wait = gsap.delayedCall(1.75, next); return; }
      tl?.kill();
      gsap.set(words[to], { autoAlpha: 1 });
      tl = gsap.timeline({ defaults: { ease: "osmo" }, onComplete: () => { cur = to; wait = gsap.delayedCall(1.75, next); } })
        .to(box, { width: w, duration: 0.72, overwrite: "auto" }, 0)
        .to(chars(from), { yPercent: -110, autoAlpha: 0, duration: 0.48, stagger: 0.018, overwrite: "auto" }, 0)
        .set(words[from], { autoAlpha: 0 })
        .fromTo(chars(to), { yPercent: 110, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.72, stagger: 0.022, overwrite: "auto" }, 0.11);
    };
    // First swap at .35s after the loader and transition end
    const start = () => { removeEventListener("kk:ready", start); wait = gsap.delayedCall(0.35, next); };
    document.body.dataset.pageTransition === "active" || document.body.hasAttribute("data-initial-loader") ? addEventListener("kk:ready", start) : start();
    offs.push(() => { removeEventListener("kk:ready", start); wait?.kill(); tl?.kill(); splits.forEach((s) => s.revert()); box.style.removeProperty("width"); delete track.dataset.ready; });
  })();

  // The text box grows with its content, and the budget gets a separator dot every three digits
  const area = $("[data-autogrow]");
  const grow = () => { area.style.height = "auto"; area.style.height = `${area.scrollHeight}px`; };
  if (area) { grow(); area.addEventListener("input", grow); offs.push(() => area.removeEventListener("input", grow)); }
  const budget = $("[data-budget]");
  const fmt = () => { const d = budget.value.replace(/\D/g, ""); budget.value = d ? d.replace(/\B(?=(\d{3})+(?!\d))/g, ".") : ""; };
  if (budget) { budget.addEventListener("input", fmt); offs.push(() => budget.removeEventListener("input", fmt)); }

  // Send — doesn’t actually send, only shows a thank-you scene: the form fades out in .45s and sentence letters rise at .022 intervals. Clicking the scene brings it back
  const form = $("[data-contact-form]"), done = $("[data-contact-done]"), hero = $("[data-contact-hero]");
  const title = $("[data-done-title]"), sub = $("[data-done-sub]");
  let split = null, shown = false, tl = null;
  const show = () => {
    if (shown) return;
    shown = true;
    split?.revert();
    split = new SplitText(title, { type: "words,chars" });
    done.hidden = false;
    gsap.set(done, { autoAlpha: 1 });
    if (reduce) { gsap.set([hero, form], { autoAlpha: 0 }); return; }
    gsap.set(split.chars, { yPercent: 110, autoAlpha: 0 });
    gsap.set(sub, { yPercent: 40, autoAlpha: 0 });
    tl = gsap.timeline({ defaults: { ease: "osmo" } })
      .to([hero, form], { autoAlpha: 0, duration: 0.45 }, 0)
      .to(split.chars, { yPercent: 0, autoAlpha: 1, duration: 0.72, stagger: 0.022 }, 0.5)
      .to(sub, { yPercent: 0, autoAlpha: 1, duration: 0.6 }, ">-0.1");
  };
  const hide = () => {
    if (!shown) return;
    shown = false;
    tl?.kill();
    const end = () => { done.hidden = true; split?.revert(); split = null; };
    if (reduce) { gsap.set(done, { autoAlpha: 0 }); gsap.set([hero, form], { clearProps: "opacity,visibility" }); end(); return; }
    gsap.timeline({ defaults: { ease: "osmo" } })
      .to(done, { autoAlpha: 0, duration: 0.35, onComplete: end }, 0)
      .to([hero, form], { autoAlpha: 1, duration: 0.5, clearProps: "opacity,visibility" }, 0.2);
  };
  const submit = (e) => { e.preventDefault(); if (!form.reportValidity()) return; show(); form.reset(); if (area) area.style.removeProperty("height"); };
  if (form && done) {
    form.addEventListener("submit", submit);
    done.addEventListener("click", hide);
    offs.push(() => { form.removeEventListener("submit", submit); done.removeEventListener("click", hide); tl?.kill(); split?.revert(); });
  }
  return () => offs.forEach((f) => f());
});
