// Subpages — as in the original, match card title and info row heights with jquery-match-height,
// Pressing ‹Load more› hides the button and, after a loading indicator, appends a batch of the same type (the original uses ajax — here we clone the first batch just to fill the space).
$(function () {
  const fit = () => {
    if (!$.fn.matchHeight) return;
    $(".br-colList__item .br-colList__ttl").matchHeight();
    $(".br-colList__item .br-colList__info").matchHeight();
    $(".br-bookList__item .br-bookList__name").matchHeight();
    $(".br-bookList__item .br-bookList__info").matchHeight();
  };
  fit();

  $(".br-archiveBt.is-more").each(function () {
    const $bt = $(this);
    const $wrap = $bt.closest(".br-more").length ? $bt.closest(".br-more") : $bt.parent();
    const $list = $(".br-colPage__list, .br-book__list, .br-store__news, .br-back__secs").first();
    const $loading = $('<p class="br-loading" aria-label="Loading"></p>').insertAfter($bt);
    const $count = $wrap.find(".br-more__count, .br-store__count").first();
    const total = parseInt(($count.text().match(/Total (\d+)/) || [])[1] || "0", 10);
    const $first = $list.children().clone();
    $bt.on("click", function () {
      $loading.css("display", "flex");
      $bt.hide();
      setTimeout(() => {
        $list.append($first.clone());
        fit();
        const shown = $list.children().length;
        if ($count.length) $count.text($count.text().replace(/~\d+/, "~" + Math.min(shown, total || shown)));
        $loading.hide();
        if (total && shown >= total) $bt.remove();
        else $bt.show();
      }, 400);
      return false;
    });
  });
});
