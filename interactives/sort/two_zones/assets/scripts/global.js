/**
 *	Drag and Drop sort with two zones	 
 *
 */
$(document).ready(function init_interactive() {
	//initially hide the first success message
	$('#successMessage').find('h2:first').hide();
	var totalScore = 0;

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

		// place title
		$('h1').html(title);
		$('title').text(title);

		// place credits
		$('.credits_button').html(credits_title);
		$('.credits_content').html(credits_body);
		$(".credits_content").dialog({
			autoOpen : false,
			height : credits_height,
			width : credits_width,
			modal : true,
		});
		$(".credits_button").button().click(function click_credits() {
			$(".credits_content").dialog("open");
		});

		// place instructions
		$('.instructions_button').html(instructions_title);
		$('.instructions_content').html(instructions_body);
		$(".instructions_content").dialog({
			autoOpen : false,
			height : instructions_height,
			width : instructions_width,
			modal : true,
		});
		$(".instructions_button").button().click(function click_instructions() {
			$(".instructions_content").dialog("open");
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
			var style = 'background:no-repeat url('+DropZoneImage+') bottom center #DDDDDD;';
			var html = '<div style="'+style+'" class="ui-widget-content dropspot ' + DropZoneClass + '"><h4 class="ui-widget-header">' + DropZoneTitle + ' ' + DropZoneDescription + '</h4></div>';
			$('.dropzone_container').append(html);
		});

		//place the draggable images
		$.each(data.SORT.DRAGGABLE, function create_draggable(i) {
			var draggableTitle = this.TITLE;
			var draggableID = this.ID;
			var draggableCorrectDiv = this.correctDiv;
			var draggableImage = this.IMAGE;
			var draggableCorrectResponseTitle = this.CorrectResponseTitle;
			var draggableCorrectResponseBody = this.CorrectResponseBody;
			var draggableWrongResponseTitle = this.WrongResponseTitle;
			var draggableWrongResponseBody = this.WrongResponseBody;

			var html = '<li class="ui-widget-content ui-corner-tr draggable ' + draggableCorrectDiv + '" id="' + draggableID + '"><h5 class="ui-widget-header">' + draggableTitle + '</h5>';
			html += '<img src=' + draggableImage + ' alt="' + draggableTitle + '" title="' + draggableTitle + '"/>';
			html += '<div class="correctResponse"><h1>' + draggableCorrectResponseTitle + '</h1><span class="textBody">' + draggableCorrectResponseBody + '</span></div>';
			html += '<div class="wrongResponse"><h1>' + draggableWrongResponseTitle + '</h1><span class="textBody">' + draggableWrongResponseBody + '</span></div>';
			html += '</li>';

			$('.gallery').append(html);
			$('#' + draggableID).draggable({
				cursor : "move",
				helper : "clone",
				revert : "invalid"
			});
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
					ui.draggable.fadeOut();
					
					// copy image to dropzone and shrink
					var $list = $("ul", $dropzone_upper).length ? $("ul", $dropzone_upper) : $("<ul class='gallery gallery-upper ui-helper-reset'/>").appendTo($dropzone_upper);
					ui.draggable.clone().appendTo($list);
					$('.gallery-upper').find('li:last').animate({
							width : "93px",
							fontSize: "12px",
						}).find("img").animate({
							height : "75px"
						});
				} else {
					//wrong
					$('#wrongAudio').get(0).play();
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
					ui.draggable.fadeOut();
					// copy image to dropzone and shrink
					var $list = $("ul", $dropzone_lower).length ? $("ul", $dropzone_lower) : $("<ul class='gallery gallery-lower ui-helper-reset'/>").appendTo($dropzone_lower);
					ui.draggable.clone().appendTo($list);
					$('.gallery-lower').find('li:last').animate({
							width : "93px",
							fontSize: "12px",
						}).find("img").animate({
							height : "75px"
						});
				} else {
					//wrong
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
			$response.clone().appendTo('div.response');
			$("div.response div.correctResponse").css('display', 'inline').find('h1').css("color", "#599156");
			$galleryCount--;
			//score
			totalScore=totalScore+25;
			$('span.score').text(totalScore);
		}

		/*
		 * answer is wrong, so deduct score and give notice
		 */
		function wrongAnswer($response) {
			// populate wrong feedback text
			$('div.response').empty();
			$response.clone().appendTo('div.response');
			$("div.response div.wrongResponse").css('display', 'inline').effect("bounce", {
				times : 3
			}, 300);
			// descore
			totalScore=totalScore-5;
			$('span.score').text(totalScore);
		}

		/**
		 * check if the game is completed 
		 */
		function checkFinished() {
			if ($galleryCount == 0) {
				$('div.response').empty();
				$('#successMessage').find('h2:first').show();
				$('#successMessage').dialog({
					modal : true,
					zIndex : 10,
					buttons : {
						"Next Level" : function dialog_button_next() {
							window.location.href = 'level2.html?score=' + $totalScore;
						}
					}
				});
				
				$('#finishedAudio').get(0).play();
			}
		}

	});
});
