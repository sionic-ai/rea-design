// Product page — head, code card, field chips, ring (original animation-player slot), developer tab swap
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Original played Rive (.riv) here — .riv can’t be ported, so the sequence measured by opening the original and capturing at .3s intervals is ported to GSAP:
  // .6s empty code card → 1.2–1.9s lines typed → 2.1–3s value chips → 3.3s white file card rises from below and overlaps → from 3.9s file lines turn yellow
  const stage = document.querySelector("[data-hero-code]");
  if (stage && window.gsap) {
    const card = stage.querySelector(".i-rivecard"), file = stage.querySelector(".i-rivefile");
    const lines = stage.querySelectorAll(".i-rivecard__code li"), chips = stage.querySelectorAll(".i-rivecard__code b"), marks = stage.querySelectorAll(".i-rivefile mark");
    const quint = "expo.out";
    if (reduce) {
      chips.forEach((c) => c.classList.add("is-on"));
      marks.forEach((m) => m.classList.add("is-on"));
    } else {
      // The original runs once and stays on the status card (the first screen, shot while moving the mouse position, goes from the file card → status card and stays)
      const tl = gsap.timeline();
      tl.set(card, { opacity: 0, scale: 0.96 }, 0)
        .set(lines, { clipPath: "inset(0 100% 0 0)" }, 0)
        .set(file, { opacity: 0, y: 240 }, 0)
        .to(card, { opacity: 1, scale: 1, duration: 0.3, ease: quint }, 0.6)
        .to(lines, { clipPath: "inset(0 0% 0 0)", duration: 0.15, stagger: 0.07, ease: "none" }, 1.2);
      chips.forEach((c, i) => tl.call(() => c.classList.add("is-on"), null, 2.1 + i * 0.12));
      tl.to(file, { opacity: 1, y: 0, duration: 0.5, ease: quint }, 3.3);
      marks.forEach((m, i) => tl.call(() => m.classList.add("is-on"), null, 3.9 + i * 0.15));
      // Third scene — the file card drops out and the transfer status card rises, adding steps one by one
      const stat = stage.querySelector(".i-rivestat"), steps = stage.querySelectorAll(".i-rivestat li");
      if (stat) {
        tl.set(stat, { opacity: 0, y: 240 }, 0).set(steps, { opacity: 0, y: 5 }, 0)
          .to(file, { opacity: 0, y: -20, duration: 0.4, ease: quint }, 5)
          .to(stat, { opacity: 1, y: 0, duration: 0.5, ease: quint }, 5.1)
          .to(steps, { opacity: 1, y: 0, duration: 0.4, stagger: 0.25, ease: quint }, 5.5);
      }
    }
  }

  // Code and description per tab — the original uses react state, so it switches instantly with no transition
  const TABS = [
    { m: "create", d: "Your task description here" },
    { m: "return", d: "Your task two description here" },
    { m: "reject", d: "Your task three description here" },
    { m: "save", d: "Your task four description here" },
  ];
  const code = document.querySelector("[data-tabcode]");
  const desc = document.querySelector("[data-tabdesc]");
  const tabs = [...document.querySelectorAll(".i-tab")];
  const show = (k) => {
    const t = TABS[k];
    tabs.forEach((b, i) => { b.classList.toggle("is-on", i === k); b.setAttribute("aria-selected", String(i === k)); });
    code.innerHTML = `<span class="p">await </span><span class="f">client</span><span class="p">.</span><span class="f">transfers</span><span class="p">.</span><span class="f">${t.m}</span><span class="p">({</span>\n`
      + `  <span class="k">account_id</span>: <span class="s">"account_id_0000"</span>,\n  <span class="k">amount</span>: <span class="n">${(k + 1) * 1000}</span>,\n`
      + `  <span class="k">routing_number</span>: <span class="s">"000000000"</span>,\n  <span class="k">account_number</span>: <span class="s">"000000000"</span>,\n`
      + `  <span class="k">individual_name</span>: <span class="s">"Person Name"</span>,\n  <span class="k">statement_descriptor</span>: <span class="s">"Descriptor"</span>,\n<span class="p">});</span>`;
    desc.textContent = t.d;
  };
  if (code && desc && tabs.length) {
    tabs.forEach((b, i) => b.addEventListener("click", () => show(i)));
    show(0);
  }
})();
