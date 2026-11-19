(() => {
  kfFx.register("letter-swap-window-lift", (el, { options, reduce }) => {
    const title = el.querySelector('[data-fx-part="title"]');
    if (!title || !title.textContent.trim()) return;
    if (reduce) { el.classList.add("is-done"); return () => el.classList.remove("is-done"); }
    const sec = (k, d) => Math.max(0, +(options[k] ?? d));
    const hold = sec("hold", 0.7), each = sec("each", 0.05), dur = sec("dur", 1.8);
    const lift = options.lift !== "off";
    const phone = innerWidth < 680;

    const text = title.textContent.trim();
    const original = title.innerHTML;
    const row = (cls) => {
      const r = document.createElement("span");
      r.className = cls;
      r.style.display = "block";
      for (const ch of text) { const s = document.createElement("span"); s.textContent = ch; r.append(s); }
      return r;
    };
    title.textContent = "";
    const inRow = row("fx-lsw-in"), outRow = row("fx-lsw-out");
    outRow.setAttribute("aria-hidden", "true");
    title.append(inRow, outRow);

    const win = el.querySelector('[data-fx-part="window"]');
    const photo = el.querySelector('[data-fx-part="photo"]');
    const count = el.querySelector('[data-fx-part="count"]');
    const fades = el.querySelectorAll('[data-fx-part="fade"]');
    const from = phone ? "inset(30vh 25vw 30vh 25vw)" : "inset(22vh 38vw 22vh 38vw)";
    if (win) gsap.set(win, { clipPath: from });

    let n = 0;
    const counter = count ? setInterval(() => {
      if (n < 99) { n += 3; count.textContent = n; } else { clearInterval(counter); count.textContent = "100"; }
    }, 10.1) : null;
    if (fades.length) gsap.to(fades, { opacity: 1, duration: 0.3, delay: 0.15 });

    const tl = gsap.timeline({ delay: hold, onComplete: () => { if (lift) el.classList.add("is-done"); el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true })); } });
    tl.to(inRow.children, { top: "-14vw", duration: 0.5, ease: "power1.in", stagger: each }, 0);
    tl.to(outRow.children, { top: "0vh", duration: 0.9, ease: "power3.out", stagger: each }, "<0.2");
    tl.to(title, { marginTop: "-30vh", duration: 2, ease: "power4.inOut" }, "<0.2");
    if (photo) tl.to(photo, { width: "130%", duration: dur, ease: "power2.inOut" }, "<");
    if (win) {
      tl.fromTo(win, { clipPath: from }, { clipPath: "inset(0vh 0vw 0vh 0vw)", duration: dur, ease: "expo.inOut" }, "<");
      if (!phone) tl.to(win, { y: "-10vh", duration: dur + 0.2, ease: "expo.inOut" }, "<");
    }
    if (lift) tl.fromTo(el, { clipPath: "inset(0vh 0vw 0vh 0vw)" }, { clipPath: "inset(0vh 0vw 100vh 0vw)", duration: dur, ease: "expo.inOut" }, "<");
    tl.call(() => el.dispatchEvent(new CustomEvent("fx:enter", { bubbles: true })), null, "<1");

    return () => {
      clearInterval(counter);
      tl.kill();
      gsap.killTweensOf(fades);
      gsap.set([el, win, photo, title].filter(Boolean), { clearProps: "all" });
      title.innerHTML = original;
      el.classList.remove("is-done");
    };
  });
})();
