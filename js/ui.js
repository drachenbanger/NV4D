$(function() {
  $('.mirror-select').on('click', function(e) {
    e.preventDefault();
    $('body').toggleClass('active-mirror-selection');
  });
});