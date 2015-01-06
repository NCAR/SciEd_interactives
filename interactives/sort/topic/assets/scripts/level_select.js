/**
 *	instrument level changing buttons
 *
 */
$(document).ready(function init_levelchanger() {
	// instrument level buttons
	// poll until select options are available
	var interval_select_available = setInterval(instrument_select, 300);

	function instrument_select() {
		if ($('.choose_level_content form select') != undefined) {
			$('.choose_level_content form select').on('change', function selectLevelChange(e) {

			var chosenLevel = $(this).find("option:selected").text();

			switch(chosenLevel) {
			case 'Level 1':
				window.location = 'https://scied.ucar.edu/sites/default/files/interactives/sort/sun/two_zones/index.html';
				break;
			case 'Level 2':
				window.location = 'https://scied.ucar.edu/sites/default/files/interactives/sort/sun/three_zones/index.html';
				break;
			}


			});
			clearInterval(interval_select_available);
		}
	}
});
