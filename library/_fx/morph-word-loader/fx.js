(() => {
  kfFx.register("morph-word-loader", (el, { options, reduce }) => {
    const KEY = "fx-morph-word-loader";
    const once = (options.every || "session") !== "visit";
    const finish = () => { el.classList.add("is-fx-done"); el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true })); };
    const svg = el.querySelector("svg");
    const letters = svg ? [...svg.querySelectorAll('[data-fx-part="letter"]')] : [];
    if (reduce || !letters.length || (once && sessionStorage.getItem(KEY))) { finish(); return () => el.classList.remove("is-fx-done"); }
    if (once) sessionStorage.setItem(KEY, "1");
    const each = +(options.each ?? 0.058), grow = +(options.grow ?? 0.29), morph = +(options.morph ?? 0.44), rise = +(options.rise ?? 1);
    // A part wraps the panel and logo row, the consumer only places the svg
    const bg = document.createElement("div");
    bg.className = "fx-mwl__bg";
    const logo = document.createElement("div");
    logo.className = "fx-mwl__logo";
    svg.before(logo);
    logo.append(svg);
    el.prepend(bg);
    const sEase = kfFx.ease("0.8,0,0.833,0.833", "power2.in"), mEase = kfFx.ease("0.167,0.167,0.2,1", "power3.out");
    const r = logo.getBoundingClientRect();
    const target = options.to ? document.querySelector(options.to) : null;
    const goal = target ? target.getBoundingClientRect().top + target.offsetHeight / 2 - (r.top + r.height / 2) : 0;
    const mid = (innerHeight - r.height) / 2 - r.top;
    const tl = gsap.timeline({ onComplete: finish });
    tl.set(logo, { y: mid });
    letters.forEach((l, i) => {
      const a = l.querySelector('[data-fx-part="from"]'), b = l.querySelector('[data-fx-part="to"]'), spin = l.querySelector('[data-fx-part="spin"]');
      gsap.set(l, { opacity: 0, scaleX: 0, transformOrigin: "50% 50%" });
      tl.set(l, { opacity: 1 }, each * i);
      tl.to(l, { scaleX: 1, duration: grow, ease: sEase }, each * i);
      if (a && b && window.MorphSVGPlugin) tl.to(a, { morphSVG: { shape: b, shapeIndex: "auto" }, duration: morph, ease: mEase }, grow + each * i);
      else if (a && b) tl.set(a, { attr: { d: b.getAttribute("d") } }, grow + each * i);
      if (spin) { gsap.set(spin, { rotation: -45, transformOrigin: "50% 50%" }); tl.to(spin, { rotation: 0, duration: morph, ease: mEase }, grow + each * i); }
    });
    tl.addLabel("up");
    tl.to(logo, { y: goal, duration: rise, ease: "power3.inOut" }, "up");
    tl.to(bg, { scaleY: 0, duration: 0.5 }, "up");
    return () => {
      tl.kill();
      bg.remove();
      logo.before(svg);
      logo.remove();
      gsap.set(letters, { clearProps: "opacity,transform" });
      el.classList.remove("is-fx-done");
    };
  });
})();
