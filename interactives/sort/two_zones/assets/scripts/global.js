/**
 *	Drag and Drop sort with two zones
 *
 */
$(document).ready(function init_interactive() {

	// record mouse position
	var x;
	var y;
	var mousetarget;
	var dragtarget;
	var dropCorrect = false;
	$(document).mousemove(function(e) {
		x = e.pageX;
		y = e.pageY;
		mousetarget = e;
	});

	//initially hide the first success message
	$('#successMessage').find('h2:first').hide();
	var totalScore = 0;

	// init response
	$("div.response").dialog({
		dialogClass : "no-close",
		width : 500,
		autoOpen : false,
		resizable : false,
		modal : false,
		buttons : [{
			text : "OK",
			click : function() {
				$(this).dialog("close");
			}
		}]
	});
	// if dialog is open and the body is clicked close the dialog
	$('body').on('mousedown', function onBodyClick(e) {
		if ($("div.response").dialog('isOpen')) {
			$("div.response").dialog('close');
		}
		if ($(".instructions_content").dialog('isOpen')) {
			$(".instructions_content").dialog('close');
		}
		if ($(".credits_content").dialog('isOpen')) {
			$(".credits_content").dialog('close');
		}
	});

	/**
	 * process the json file and set everything up
	 */
	$.getJSON($jsonFile, function json_process(data) {
		// get data
		var title = data.SORT.PAGEINFO.PageTitle;
		var correctAudioMP3 = data.SORT.PAGEINFO.correctAudioMP3;
		var correctAudioOGG = data.SORT.PAGEINFO.correctAudioOGG;
		var wrongAudioMP3 = data.SORT.PAGEINFO.wrongAudioMP3;
		var wrongAudioOGG = data.SORT.PAGEINFO.wrongAudioOGG;
		var finishedAudioMP3 = data.SORT.PAGEINFO.finishedAudioMP3;
		var finishedAudioOGG = data.SORT.PAGEINFO.finishedAudioOGG;
		var instructions_title = data.SORT.PAGEINFO.instructions_title;
		var instructions_body = data.SORT.PAGEINFO.instructions_body;
		var instructions_width = data.SORT.PAGEINFO.instructions_width;
		var instructions_height = data.SORT.PAGEINFO.instructions_height;
		var credits_title = data.SORT.PAGEINFO.credits_title;
		var credits_body = data.SORT.PAGEINFO.credits_body;
		var credits_width = data.SORT.PAGEINFO.credits_width;
		var credits_height = data.SORT.PAGEINFO.credits_height;
		var choose_level_title = data.SORT.PAGEINFO.choose_level_title;
		var choose_level_body = data.SORT.PAGEINFO.choose_level_body;

		// place title
		$('h1').html(title);
		$('title').text(title);

		// place credits
		$('.credits_button').html(credits_title);
		$('.credits_content').html(credits_body).dialog({
			autoOpen : false,
			title : credits_title,
			height : credits_height,
			width : credits_width,
			modal : true,
		});
		$(".credits_button").button().click(function click_credits() {
			$(".credits_content").dialog("open");
		});

		// place instructions button
		$('.instructions_button').html(instructions_title);
		$('.instructions_content').html(instructions_body).dialog({
			autoOpen : true,
			title : instructions_title,
			height : instructions_height,
			width : instructions_width,
			modal : false,
		});
		$(".instructions_button").button().click(function click_instructions() {
			$(".instructions_content").dialog("open");
		});

		// place levels button
		$('.choose_level_button').html(choose_level_title);
		$('.choose_level_content').html(choose_level_body).dialog({
			autoOpen : false,
			title : choose_level_title,
			modal : true,
			width : "300px",
		});
		// instrument level buttons
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

		$(".choose_level_button").button().click(function click_choose_level() {
			$(".choose_level_content").dialog("open");
		});

		//init start over button
		$(".start_over_button").button().click(function click_restart() {
			window.location.reload();
		});

		// place the audio
		var html = '<audio id="correctAudio" preload="auto">';
		html += '<source src="' + correctAudioMP3 + '">';
		html += '<source src="' + correctAudioOGG + '">';
		html += '</audio>';

		html += '<audio id="wrongAudio" preload="auto">';
		html += '<source src="' + wrongAudioMP3 + '">';
		html += '<source src="' + wrongAudioOGG + '">';
		html += '</audio>';

		html += '<audio id="finishedAudio" preload="auto">';
		html += '<source src="' + finishedAudioMP3 + '">';
		html += '<source src="' + finishedAudioOGG + '">';
		html += '</audio>';

		$('.audio').html(html);

		// Place the dropzones
		$.each(data.SORT.DROPZONE, function create_dropzone(i) {
			var DropZoneClass = this.DropZoneClass;
			var DropZoneTitle = this.DropZoneTitle;
			var DropZoneDescription = this.DropZoneDescription;
			var DropZoneImage = this.DropZoneImage;
			var DropZoneImageHeight = this.DropZoneImageHeight;
			var DropZoneImageWidth = this.DropZoneImageWidth;

			// just trying to fill the space
			var zoneHeight = Math.floor((600 - 25) / 2);

			var style = 'background:no-repeat url(' + DropZoneImage + ') bottom center #FFFFFF;width:' + DropZoneImageWidth + ';height:' + zoneHeight + 'px;';
			var html = '<div style="' + style + '" class="ui-widget-content dropspot ' + DropZoneClass + '"><h4 class="ui-widget-header">' + DropZoneTitle + ' ' + DropZoneDescription + '</h4></div>';
			$('.dropzone_container').append(html);
		});

		// holder for draggables so they can be randomized
		var a_drag = new Array();
		//place the draggable images
		$.each(data.SORT.DRAGGABLE, function create_draggable(i) {
			var draggableTitle = this.TITLE;
			var draggableID = this.ID;
			var draggableCorrectDiv = this.correctDiv;
			var draggableImage = this.IMAGE;
			var draggableUpperResponseTitle = this.upperResponseTitle;
			var draggableUpperResponseBody = this.upperResponseBody;
			var draggableLowerResponseTitle = this.lowerResponseTitle;
			var draggableLowerResponseBody = this.lowerResponseBody;

			var imgHeight = this.imgHeight;
			var imgWidth = this.imgWidth;

			var html = '<li class="ui-widget-content ui-corner-tr draggable ' + draggableCorrectDiv + '" id="' + draggableID + '"><h5 class="ui-widget-header">' + draggableTitle + '</h5>';
			html += '<img src=' + draggableImage + ' alt="' + draggableTitle + '" title="' + draggableTitle + '"/>';

			if (draggableCorrectDiv == 'upper') {
				html += '<div class="correctResponse"><h1>' + draggableUpperResponseTitle + '</h1><span class="textBody">' + draggableUpperResponseBody + '</span></div>';
				html += '<div class="wrongResponse"><h1>' + draggableLowerResponseTitle + '</h1><span class="textBody">' + draggableLowerResponseBody + '</span></div>';

			} else {
				html += '<div class="correctResponse"><h1>' + draggableLowerResponseTitle + '</h1><span class="textBody">' + draggableLowerResponseBody + '</span></div>';
				html += '<div class="wrongResponse"><h1>' + draggableUpperResponseTitle + '</h1><span class="textBody">' + draggableUpperResponseBody + '</span></div>';

			}
			html += '</li>';

			html += '</li>';
			a_drag.push(html);

		});

		var draggables = shuffleArray(a_drag).join('');
		$('.gallery').append(draggables);

		// need to be able to hide tile then animate back into existence
		$('.draggable').draggable({
			containment : ".simulation",
			scroll : false,
			appendTo : 'body',
			cursor : "move",
			cursorAt : {
				top : 50,
				left : 50
			},
			helper : "clone",
			revert : "invalid",
			start : function startDraggable(e) {
				//hide original while dragging
				dragtarget = e.target.id;
				$('#' + dragtarget).animate({
					opacity : 0
				}, 400);
				// starting over so reset to false
				dropCorrect = false;
			},
			stop : function stopDraggable() {
				// re-show original when stop dragging if it was invalid
				if (dropCorrect == false) {
					$('#' + dragtarget).animate({
						opacity : 1
					}, 400);
				} else {

				}
			}
		});

		$('.correctResponse').css('display', 'none');
		$('.wrongResponse').css('display', 'none');

		var $gallery = $("#gallery");
		var $dropzone_upper = $(".dropzone_container .upper");
		var $dropzone_lower = $(".dropzone_container .lower");
		var $galleryCount = $("ul.gallery").find('li').length;

		/*
		 * make the upper zone droppable and handle interactions
		 */
		$dropzone_upper.droppable({
			drop : function droppable_upper(event, ui) {
				if (ui.draggable.is('.upper')) {
					//correct
					$('#correctAudio').get(0).play();
					correctAnswer(ui.draggable.find('div.correctResponse'));

					// delete image
					// copy image to dropzone and shrink
					var $list = $("ul", $dropzone_upper).length ? $("ul", $dropzone_upper) : $("<ul class='gallery gallery-upper ui-helper-reset'/>").appendTo($dropzone_upper);
					var id = ui.draggable[0].id;
					console.log(ui.draggable);
					var cloned = ui.draggable;
					cloned.clone().attr('id', id + '_1').appendTo($list);
					ui.draggable.remove();
					console.log('removed original ' + id);
					$('#' + id + '_1').animate({
						opacity : 1
					}, 400);
					dropCorrect = true;
					console.log('fadein cloned ' + id + '_1');
					$('.gallery-upper').find('li:last').animate({
						width : "75px",
						fontSize : "12px",
					}).find("img").animate({
						height : "75px"
					});
				} else {
					//wrong
					$('#wrongAudio').get(0).play();

					dropCorrect = false;
					ui.draggable.animate({
						opacity : 1
					}, 400);

					wrongAnswer(ui.draggable.find('div.wrongResponse'));
				}
				checkFinished();
			}
		});

		/*
		 * make the lower zone droppable and handle interactions
		 */
		$dropzone_lower.droppable({
			drop : function droppable_lower(event, ui) {
				if (ui.draggable.is('.lower')) {
					//correct
					$('#correctAudio').get(0).play();
					correctAnswer(ui.draggable.find('div.correctResponse'));

					// delete image
					// copy image to dropzone and shrink
					var $list = $("ul", $dropzone_lower).length ? $("ul", $dropzone_lower) : $("<ul class='gallery gallery-lower ui-helper-reset'/>").appendTo($dropzone_lower);
					var id = ui.draggable[0].id;
					console.log(ui.draggable);
					var cloned = ui.draggable;
					cloned.clone().attr('id', id + '_1').appendTo($list);
					ui.draggable.remove();
					console.log('removed original ' + id);
					$('#' + id + '_1').animate({
						opacity : 1
					}, 400);
					dropCorrect = true;
					console.log('fadein cloned ' + id + '_1');
					$('.gallery-lower').find('li:last').animate({
						width : "75px",
						fontSize : "12px",
					}).find("img").animate({
						height : "75px"
					});
				} else {
					//wrong

					dropCorrect = false;
					ui.draggable.animate({
						opacity : 1
					}, 400);
					$('#wrongAudio').get(0).play();
					wrongAnswer(ui.draggable.find('div.wrongResponse'));
				}
				checkFinished();
			}
		});

		/**
		 * answer is correct, so add to score and give notice
		 */
		function correctAnswer($response) {
			// populate wrong feedback text
			$('div.response').empty();

			var response_content = $($response).find('span.textBody').html();
			var response_title = $($response).find('h1').html();

			$('div.response').html(response_content);
			$('div.response').dialog("option", "title", response_title);
			$("div.response").dialog("open");

			$galleryCount--;
			//score
			totalScore = totalScore + 25;
			$('span.score').text(totalScore);
		}

		/*
		 * answer is wrong, so deduct score and give notice
		 */
		function wrongAnswer($response) {
			// populate wrong feedback text
			$('div.response').empty();

			var response_content = $($response).find('span.textBody').html();
			var response_title = $($response).find('h1').html();

			$('div.response').html(response_content);
			$('div.response').dialog("option", "title", response_title);
			$("div.response").dialog("open");

			// descore
			totalScore = totalScore - 5;
			$('span.score').text(totalScore);
		}

		/**
		 * check if the game is completed
		 */
		function checkFinished() {
			if ($galleryCount == 0) {
				//$('div.response').empty();
				$('#successMessage').find('h2:first').show();
				/*
				 $('#successMessage').dialog({
				 modal : true,
				 zIndex : 10,
				 buttons : {
				 "Next Level" : function dialog_button_next() {
				 window.location.href = 'level2.html?score=' + $totalScore;
				 }
				 }
				 });
				 */

				$('#finishedAudio').get(0).play();
			}
		}

	});
	
	/**
	 * Randomize array element order in-place.
	 * Using Fisher-Yates shuffle algorithm.
	 * from: http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
	 */
	function shuffleArray(array) {
		for (var i = array.length - 1; i > 0; i--) {
			var j = Math.floor(Math.random() * (i + 1));
			var temp = array[i];
			array[i] = array[j];
			array[j] = temp;
		}
		return array;
	}
});
