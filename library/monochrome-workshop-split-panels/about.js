// Person intro fold — on PC the ”Read story” button opens the body, on phones tapping the photo or tagline opens a two-column-wide box (if the paired cell is open, close it first and open .5s later).
(() => {
  document.querySelectorAll(".tn-crafts__block").forEach((block, i) => {
    const pc = tnAccordion(block, block.querySelector(".tn-crafts__story"), block.querySelector(".tn-crafts__story-in"));
    const sp = tnAccordion(block, block.querySelector(".tn-crafts__container"), block.querySelector(".tn-crafts__contents"));
    block._tnSp = sp;
    block.querySelector(".tn-crafts__more").addEventListener("click", () => { if (tnContext() === "pc") pc.toggle(); });
    block.querySelector(".tn-crafts__label").addEventListener("click", () => {
      if (tnContext() !== "sp") return;
      const pair = i % 2 === 0 ? block.nextElementSibling : block.previousElementSibling;
      let late = false;
      if (pair && pair.classList.contains("is-open")) { late = true; pair._tnSp.close(); }
      if (block.classList.contains("is-open")) sp.close();
      else sp.open(late);
    });
    tnOnContext(() => { pc.reset(); sp.reset(); });
  });
})();
