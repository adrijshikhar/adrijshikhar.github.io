(function ($) {
	// Start of use strict

	// Smooth scrolling using jQuery easing
	$('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function () {
		if (
			location.pathname.replace(/^\//, '') ==
				this.pathname.replace(/^\//, '') &&
			location.hostname == this.hostname
		) {
			let target = $(this.hash);
			target = target.length ? target : $(`[name=${this.hash.slice(1)}]`);
			if (target.length) {
				$('html, body').animate(
					{
						scrollTop: target.offset().top,
					},
					1000,
					'easeInOutExpo'
				);
				return false;
			}
		}
	});

	// Closes responsive menu when a scroll trigger link is clicked
	$('.js-scroll-trigger').click(() => {
		$('.navbar-collapse').collapse('hide');
	});

})(jQuery); // End of use strict
