(() => {
  // Hero intro — while the mark stays fixed at screen center being drawn (wait seconds, or until the mark emits fx:mark-done), it waits and then
  // After a pause of N seconds, it shrinks by slot width ÷ marker width and flies to the top-edge center of the head slot over dur seconds on cubic-bezier(.87,0,.13,1), then lands (top-edge center axis).
  // On docking it hides the marker, adds is-docked to the slot and emits fx:docked, then the reveal cells appear .05s later each over .4s cubic-bezier(.77,0,.175,1).
  kfFx.register("emblem-dock-intro", (el, { options, reduce }) => {
    const mark = el.querySelector('[data-fx-part="mark"]');
    const slot = el.querySelector('[data-fx-part="slot"]');
    if (!mark || !slot) return;
    const reveals = [...el.querySelectorAll('[data-fx-part="reveal"]')];
    const num = (k, d) => { const v = parseFloat(options[k]); return Number.isFinite(v) ? v : d; };
    const wait = num("wait", 2.1), pause = num("pause", 0.5), dur = num("dur", 0.7), fade = num("reveal", 0.4), stagger = num("stagger", 0.05);
    const snap = window.CustomEase ? CustomEase.create("fx-dock-snap", "M0,0 C0.87,0 0.13,1 1,1") : "expo.inOut";
    const io = window.CustomEase ? CustomEase.create("fx-dock-io", "M0,0 C0.77,0 0.175,1 1,1") : "power3.inOut";
    let timer = 0, gone = false;
    const tweens = [];
    const land = () => {
      if (gone) return;
      mark.style.visibility = "hidden";
      slot.classList.add("is-docked");
      el.dispatchEvent(new CustomEvent("fx:docked", { bubbles: true }));
      reveals.forEach((r, i) => {
        if (reduce || fade <= 0) { gsap.set(r, { opacity: 1 }); return; }
        tweens.push(gsap.to(r, { opacity: 1, duration: fade, delay: i * stagger, ease: io }));
      });
    };
    gsap.set(reveals, { opacity: 0 });
    if (reduce) { land(); return () => { gsap.set(reveals, { clearProps: "opacity" }); slot.classList.remove("is-docked"); mark.style.visibility = ""; }; }
    gsap.set(mark, { position: "fixed", left: "50%", top: "50%", xPercent: -50, yPercent: -50, scale: 1, transformOrigin: "50% 0%", zIndex: 10 });
    const fly = () => {
      if (gone) return;
      const s = slot.getBoundingClientRect(), m = mark.getBoundingClientRect();
      const k = m.width ? s.width / m.width : 1;
      tweens.push(gsap.to(mark, { top: s.top, left: s.left + s.width / 2, yPercent: 0, scale: k, duration: dur, ease: snap, onComplete: land }));
    };
    const go = () => { clearTimeout(timer); timer = setTimeout(fly, pause * 1000); };
    const onDone = () => go();
    mark.addEventListener("fx:mark-done", onDone, { once: true });
    timer = setTimeout(go, wait * 1000);
    return () => {
      gone = true;
      clearTimeout(timer);
      mark.removeEventListener("fx:mark-done", onDone);
      tweens.forEach((t) => t.kill());
      gsap.set(mark, { clearProps: "all" });
      gsap.set(reveals, { clearProps: "opacity" });
      mark.style.visibility = "";
      slot.classList.remove("is-docked");
    };
  });
})();
