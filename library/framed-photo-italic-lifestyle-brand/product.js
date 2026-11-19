// Product: per step spec + photo (clicking a color dot fades to .25 in 300ms → swaps → back to 1 in 500ms, first three colors use the default table·the rest the limited table — original product_info)
jQuery(($) => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ROWS = [
    ["1-step", "Black 1-step ladder cutout", ["s1", "s2", "s3", "l2", "l3"]],
    ["2-step", "White 2-step ladder cutout", ["s1", "s2", "s3", "l2", "l3", "l4"]],
    ["3-step", "Pink 3-step ladder cutout", ["s1", "s2", "s3", "l2", "l3"]],
  ];
  const row = ([step, label, dots], dark) => `
    <article class="p-row${dark ? " is-dark" : ""}">
      <div class="p-row__text">
        <h3 class="lc-big">${step}</h3>
        <p class="p-row__price">(Plus tax) ¥00,000</p>
        <dl class="p-row__spec">
          <dt>Color · item no.</dt><dd>${dots.map((c, i) => `<span><i class="sw-${c}"></i>Color name ${i + 1}<em>ML-0${i}</em></span>`).join("")}</dd>
          <dt>Size</dt><dd>Open W00×D00×H00 cm<br>Folded W00×D00×H00 cm</dd>
          <dt>Weight · Material</dt><dd>0.0kg · Aluminum alloy, etc.</dd>
          <dt>Max load capacity</dt><dd>100kg</dd>
        </dl>
      </div>
      <div class="img">
        <p class="cat"><span class="st">Standard</span><span class="st is-fill">2-Year Warranty</span><span class="lim">Limited</span></p>
        <figure><div class="wf-img" data-label="${label} · Color 1 · Front, slightly angled"></div></figure>
        <div class="dots">${dots.map((c, i) => `<a href="#" class="sw-${c}${i === 0 ? " active" : ""}" aria-label="Color ${i + 1}"></a>`).join("")}</div>
      </div>
      <ul class="p-row__awards"><li><span class="wf-logo">Award 1</span></li><li><span class="wf-logo">Award 2</span></li></ul>
      ${dark ? '<a class="p-row__buy" href="#">Buy Now</a>' : ""}
    </article>`;
  $(".product-rows:not(.is-dark)").html(ROWS.map((r) => row(r, false)).join(""));
  $("[data-premium]").html(row(["3-step", "Gold 3-step ladder cutout", ["p1", "p2", "p3"]], true));

  const updateCat = (img) => {
    const i = img.find(".dots a").index(img.find(".dots a.active"));
    img.find(".cat .st").toggle(i <= 2);
    img.find(".cat .lim").toggle(i > 2);
  };
  $(".product-rows .img").each(function () { updateCat($(this)); });
  $(document).on("click", ".product-rows .dots a", function () {
    const img = $(this).closest(".img");
    img.find(".dots a").removeClass("active");
    $(this).addClass("active");
    updateCat(img);
    const t = img.find("figure .wf-img");
    const base = t.attr("data-label").replace(/ · color \d+ · /, " · ");
    t.stop(true).animate({ opacity: 0.25 }, reduce ? 0 : 300, () => {
      t.attr("data-label", base.replace(" · Front view", ` · Color ${$(this).index() + 1} · Front view`));
      t.animate({ opacity: 1 }, reduce ? 0 : 500);
    });
    return false;
  });
  window.lcMotion?.();
});
