// FAQ: builds a question row per group, and clicking the head opens it to the body height with max-height .4s (original js-accordion)
(() => {
  const Q = ["Your question goes here in one line?", "Your slightly shorter question here?", "Your question here. Is this a slightly longer, running question?", "Your short query here?", "Your one-line question goes here?", "Your footer question here?"];
  document.querySelectorAll(".faq__cat[data-faq]").forEach((cat) => {
    const n = +cat.dataset.faq;
    cat.insertAdjacentHTML("beforeend", Array.from({ length: n }, (_, i) => `
      <dl class="faq__dl">
        <dt class="faq__head"><span>${Q[i % Q.length]}</span><i class="faq__icon" aria-hidden="true"></i></dt>
        <dd class="faq__body"><span class="faq__answer"><span class="faq__answer-label">ANSWER</span>Your answer goes here in three or four sentences. Describe in order how it arrives, the box size, and how long it takes to expand when first opened. Add one line with a guide page link or a note of caution if needed.<br>Your second paragraph goes here, in one or two lines. Guidance leading to similar questions also goes here.<br>Your third paragraph here: add one line on the contact desk and how many days until you get a reply, then one slightly longer note sentence.<br>Your fourth paragraph here with a short note of caution. Add one line on the order for opening the box and how to dispose of it.</span></dd>
      </dl>`).join(""));
  });
  document.querySelectorAll(".faq__dl").forEach((dl) => {
    const head = dl.querySelector(".faq__head"), body = dl.querySelector(".faq__body");
    const close = () => { head.classList.remove("is-active"); body.style.maxHeight = "0px"; };
    head.addEventListener("click", () => {
      if (head.classList.contains("is-active")) return close();
      head.classList.add("is-active");
      body.style.maxHeight = `${body.scrollHeight}px`;
    });
    body.addEventListener("click", (e) => { if (!e.target.closest("a")) close(); });
    body.addEventListener("transitionend", () => window.yrMeasure?.());
  });
  window.yrMeasure?.();
})();
