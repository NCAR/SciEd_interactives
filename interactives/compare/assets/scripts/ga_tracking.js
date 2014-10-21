(function(i, s, o, g, r, a, m) {
	i['GoogleAnalyticsObject'] = r;
	i[r] = i[r] ||
	function() {
		(i[r].q = i[r].q || []).push(arguments)
	}, i[r].l = 1 * new Date();
	a = s.createElement(o), m = s.getElementsByTagName(o)[0];
	a.async = 1;
	a.src = g;
	m.parentNode.insertBefore(a, m)
})(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

// replace with GA account
ga('create', 'UA-XXXXXXXX-X', 'domain.ext');
ga('send', 'pageview');

function send_event(event_category, event_action, event_label, event_value) {
	// category and action are required
	if (event_category.length == 0 || event_action.length == 0) {
		return false;
	} else if (event_label.length == 0) {
		ga('send', 'event', event_category, event_action);
	} else if (event_value.length == 0) {
		ga('send', 'event', event_category, event_action, event_label);
	} else {
		ga('send', 'event', event_category, event_action, event_label, event_value);
	}

}


jQuery(document).ready(function($) {
	//$(function () {

	// extension that enables binding a listener to fire first when an event occurs
	$.fn.bindFirst = function(name, fn) {
		var elem, handlers, i, _len;
		this.bind(name, fn);
		for ( i = 0, _len = this.length; i < _len; i++) {
			elem = this[i];
			handlers = jQuery._data(elem).events[name.split('.')[0]];
			handlers.unshift(handlers.pop());
		}
	};

	/**
	 *  Slider: link/handle
	 *
	 **/
	$('#simulation div.ui-slider a.ui-slider-handle').on('click', function(e) {

		var this_id = $(this).parent().siblings('input').attr('id');
		var this_val = this.title;

		send_event('simulation', 'change_slider_handle', this_id + '_' + this_val, '');

		console.log('change_slider_handle');
		console.log(this_id + '_' + this_val);

	});
	/**
	 *  Slider: input box
	 *
	 **/
	$('#simulation div.ui-slider input').on('blur', function(e) {

		var this_id = this.id;
		var this_val = $(this).siblings('div.ui-slider-track').children('a').attr('title');
		send_event('simulation', 'change_slider_input', this_id + '_' + this_val, '');

		console.log('change_slider_input');
		console.log(this_id + '_' + this_val);

	});

	/**
	 * track tab clicks
	 */
	$('#tab-list li a').click(function() {
		var this_id = $(this).attr('href');
		var this_val = $(this).siblings('div.ui-slider-track').children('a').attr('title');
		send_event('simulation', 'click_tab', this_id, '');

		console.log('click_tab');
		console.log(this_id);
	});
	/**
	 *  Slider: slider/track
	 *ISSUE: doesn't work.  if can get this to work then may be able to remove the link one
	 **/
	$('#simulation div.ui-slider-track').on('click', function(e) {

		//alert('test');

	});

	/**
	 *	for pop ups connected to a link
	 **/
	$('#simulation a[data-rel=popup]').on('click', function(e) {

		//name of simulation, verb and label of control, value used, if any?
		var this_id = this.id;
		send_event('simulation', 'click_popup', this_id, '');

		console.log('click_popup');
		console.log(this_id);

	});

	/**
	 *  ISSUE: this shows the result of the value change, use extension bindFirst to make it fire off first
	 **/
	$('#simulation input[type=button]').bindFirst('click', function(e) {

		var this_id = this.id;
		var this_val = this.value;
		send_event('simulation', 'click_button', this_id + '_' + this_val, '');

		console.log('click_button');
		console.log(this_id + '_' + this_val);

	});

	/**
	 *	for select dropdowns
	 **/

	$('#simulation select').on('change', function(e) {

		var this_id = this.id;
		var this_val = $('#' + this.id + ' :selected').text();
		send_event('simulation', 'change_dropdown', this_id + '_' + this_val, '');

		console.log('change_dropdown');
		console.log(this_id + '_' + this_val);

	});

});
