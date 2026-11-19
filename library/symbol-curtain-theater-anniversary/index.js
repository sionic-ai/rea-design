// Home — the original page-top.js opening order as is: once the video plays (if none, 3s after load, 10s at the latest) is-load (the white curtain lifts over 2s)
// → 1.8s is-op1 (TH · title drops out at 1.2s) → .8s is-op2 → 50ms is-op3 (symbol grows to 50vh×100vh over 1.6s) → 1.7s is-op4 (width 100vw 1.3s, pieces split to both ends)
// → 1.4s is-op5 (scroll release · tagline · header). Past 200px of scroll the symbol keeps only its outline (is-symbol-sticky).
(() => {
  const html = document.documentElement, body = document.body;
  const reduce = window.kgReduce;
  const later = (ms, fn) => setTimeout(fn, ms);
  let started = false;
  const opening = () => {
    if (started) return;
    started = true;
    if (reduce) { ["is-load", "is-op1", "is-op2", "is-op3", "is-op4", "is-op5", "is-scroll"].forEach((c) => body.classList.add(c)); html.classList.add("is-scroll"); return; }
    body.classList.add("is-load");
    later(1800, () => { body.classList.add("is-op1");
      later(800, () => { body.classList.add("is-op2");
        later(50, () => { body.classList.add("is-op3");
          later(1700, () => { body.classList.add("is-op4");
            later(1400, () => { html.classList.add("is-scroll"); body.classList.add("is-scroll", "is-op5"); ScrollTrigger.refresh(); });
          });
        });
      });
    });
  };
  // Video slot — when playback starts, the opening begins (original loadVideo playing)
  const box = document.querySelector(".kg-visual__bg");
  const video = box?.querySelector("video");
  if (location.hash) { html.classList.add("is-scroll"); body.classList.add("is-scroll"); }
  addEventListener("load", () => {
    if (!location.hash) scrollTo(0, 0);
    if (video) {
      const playing = () => { box.classList.add("is-view"); opening(); video.removeEventListener("playing", playing); };
      video.addEventListener("playing", playing);
      video.src = video.dataset.src;
      video.play().catch(() => {});
    }
    later(3000, opening);
  });
  later(10000, opening);

  // Past 200px of scroll, the symbol becomes an outline
  const sym = () => body.classList.toggle("is-symbol-sticky", scrollY > 200);
  addEventListener("scroll", sym, { passive: true });
  addEventListener("load", sym);

  // Vertical tagline height — runs continuously from the hero tagline down to the concept section’s tagline slot (PC)
  const catchEl = document.querySelector(".kg-visual__catch");
  const target = document.querySelector(".kg-concept__catch");
  const fit = () => {
    if (innerWidth < 1024) { catchEl.style.height = ""; return; }
    const y = scrollY;
    catchEl.style.height = (target.getBoundingClientRect().top + y) - (catchEl.getBoundingClientRect().top + y) + target.clientHeight + "px";
  };
  addEventListener("load", fit);
  addEventListener("resize", fit);

  // Archive disc — next year every 5s (1.4s overlap), and when the year changes the outer arc is drawn in a 5s straight line to the next slot (the last year stays as is, rewinds when looping back to the start)
  const dial = document.querySelector("[data-dial]");
  const prog = document.querySelector(".kg-archive__time .prog");
  if (dial && prog) {
    const L = prog.getTotalLength(), n = dial.children.length, one = L / (n - 1);
    prog.style.strokeDasharray = L;
    prog.style.strokeDashoffset = L;
    const step = (i) => { if (i === n - 1) return; prog.style.transition = "stroke-dashoffset 5000ms linear"; prog.style.strokeDashoffset = L - (one * i + one); };
    dial.children[0].classList.add("is-shown");
    requestAnimationFrame(() => step(0));
    window.kgSlider(dial, { onChange: (i, li) => { li.classList.add("is-shown"); setTimeout(() => [...dial.children].forEach((x) => x !== li && x.classList.remove("is-shown")), 1400); step(i); } });
  }

  // Message window — clicking makes a black window appear in .5s, and close makes it vanish
  const modal = document.querySelector(".kg-modal");
  if (modal) {
    const cat = modal.querySelector("[data-modal-cat]"), name = modal.querySelector("[data-modal-name]");
    const setOpen = (on) => { modal.classList.toggle("is-open", on); modal.setAttribute("aria-hidden", String(!on)); body.style.overflow = on ? "hidden" : ""; };
    document.querySelectorAll(".kg-message__button").forEach((b) => b.addEventListener("click", () => {
      cat.textContent = b.querySelector(".kg-message__cat").textContent;
      name.textContent = b.querySelector(".kg-message__name").textContent;
      setOpen(true);
    }));
    modal.querySelector(".kg-modal__close button").addEventListener("click", () => setOpen(false));
    addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
  }

  // Facilities tab
  const tabs = [...document.querySelectorAll(".kg-facility__switch-list li")];
  const items = [...document.querySelectorAll(".kg-facility__item")];
  tabs.forEach((li, i) => li.querySelector("button").addEventListener("click", () => {
    tabs.forEach((t, k) => t.classList.toggle("is-active", k === i));
    items.forEach((t, k) => t.classList.toggle("is-show", k === i));
  }));
})();
