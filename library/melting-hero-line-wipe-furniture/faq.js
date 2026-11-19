/* FAQ — pressing a question adds the open marker (is-shown), turns the answer text on over .6s, and .5s later re-measures the smooth scroll height (original accordion).
   Open details first so the answer text is painted transparent, then attach the mark to the frame — attaching it to the same frame would make the text appear already on, and the transition would not run */
(() => {
  const { $$ } = EDI;
  EDI.view("page", (c) => {
    const rows = $$(".e-acc", c);
    const fns = rows.map((d) => {
      const fn = (e) => {
        e.preventDefault();
        if (d.classList.contains("is-shown")) {
          d.classList.remove("is-shown");
          d.open = false;
        } else {
          d.open = true;
          void d.offsetHeight;
          requestAnimationFrame(() => d.classList.add("is-shown"));
        }
        setTimeout(() => { EDI.lenis?.resize(); ScrollTrigger.refresh(); }, 500);
      };
      d.querySelector("summary").addEventListener("click", fn);
      return fn;
    });
    return () => rows.forEach((d, i) => d.querySelector("summary").removeEventListener("click", fns[i]));
  });
})();
