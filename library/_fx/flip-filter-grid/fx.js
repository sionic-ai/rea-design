// MixItUp-style filtering — cards leaving fade and shrink in place (fade scale), remaining cards slide to their new positions, and returning cards grow from small at their new positions.
// List height shrinks or grows at the same tempo so the content below doesn’t jump at once. All three move together in one beat (.6s), and the removed card leaves the flow only once it ends.
// GSAP Flip’s absolute mode releases the position lock at the end and all cards jump at once (unlike MixItUp), so we measure the start, middle and end positions by hand.
(() => {
  kfFx.register("flip-filter-grid", (el, { options, reduce }) => {
    const ac = new AbortController(), signal = ac.signal;
    const btns = () => [...el.querySelectorAll("[data-fx-part=filter]")];
    const items = () => [...el.querySelectorAll("[data-fx-part=item]")];
    const dur = reduce ? 0 : +(options.dur ?? 0.6);
    const delay = reduce ? 0 : +(options.delay ?? 0);
    const scale = +(options.scale ?? 0.01);
    const ease = kfFx.ease(options.ease || "0.25,0.1,0.25,1", "power1.inOut");
    // Measuring the original (MixItUp), only the fade goes straight — position and size use ease
    const fade = kfFx.ease(options.fade || "0,0,1,1", "none");
    let run = null;
    btns().forEach((b) => b.setAttribute("aria-pressed", String(b.classList.contains("is-on"))));
    const shown = (c) => c.style.display !== "none";
    const at = (c) => { const r = c.getBoundingClientRect(); return [r.left, r.top]; };
    el.addEventListener("click", (e) => {
      const b = e.target.closest("[data-fx-part=filter]");
      if (!b || !el.contains(b)) return;
      btns().forEach((x) => { x.classList.toggle("is-on", x === b); x.setAttribute("aria-pressed", String(x === b)); });
      const f = b.dataset.f || "";
      const list = items();
      if (!list.length) return;
      const match = (c) => !f || (c.dataset.cat || "").split(/\s+/).includes(f);
      const done = () => el.dispatchEvent(new CustomEvent("fx:filtered", { bubbles: true, detail: { filter: f } }));
      run?.progress(1);
      if (!window.gsap || !dur) { list.forEach((c) => (c.style.display = match(c) ? "" : "none")); done(); return; }
      const box = list[0].parentElement;
      const was = list.filter(shown), hide = was.filter((c) => !match(c)), stay = was.filter(match), enter = list.filter((c) => !shown(c) && match(c));
      const startH = box.offsetHeight, start = new Map(was.map((c) => [c, at(c)]));
      // Middle: cards about to enter are in the flow and cards about to leave are still kept. While moving, only the offset values change on this layout.
      enter.forEach((c) => (c.style.display = ""));
      const inter = new Map(stay.concat(enter, hide).map((c) => [c, at(c)]));
      hide.forEach((c) => (c.style.display = "none"));
      const fin = new Map(stay.concat(enter).map((c) => [c, at(c)])), endH = box.offsetHeight;
      hide.forEach((c) => (c.style.display = ""));
      const off = (m, c) => ({ x: m.get(c)[0] - inter.get(c)[0], y: m.get(c)[1] - inter.get(c)[1] });
      // fromTo paints the start value immediately, so the cards stand at their first positions even while waiting
      run = gsap.timeline({
        delay,
        onComplete: () => {
          hide.forEach((c) => (c.style.display = "none"));
          gsap.set(list, { clearProps: "transform,opacity" });
          gsap.set(box, { clearProps: "height" });
          run = null;
          done();
        },
      });
      run.fromTo(box, { height: startH }, { height: endH, duration: dur, ease }, 0);
      stay.forEach((c) => run.fromTo(c, off(start, c), { ...off(fin, c), duration: dur, ease }, 0));
      hide.forEach((c) => {
        run.fromTo(c, { ...off(start, c), scale: 1 }, { scale, duration: dur, ease }, 0);
        run.fromTo(c, { opacity: 1 }, { opacity: 0, duration: dur, ease: fade }, 0);
      });
      enter.forEach((c) => {
        run.fromTo(c, { ...off(fin, c), scale }, { scale: 1, duration: dur, ease }, 0);
        run.fromTo(c, { opacity: 0 }, { opacity: 1, duration: dur, ease: fade }, 0);
      });
    }, { signal });
    return () => { ac.abort(); run?.progress(1); run?.kill(); items().forEach((c) => { c.style.display = ""; if (window.gsap) gsap.set(c, { clearProps: "opacity,transform" }); }); };
  });
})();
