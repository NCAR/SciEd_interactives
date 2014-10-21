// from: http://codepen.io/anon/pen/heGpB

var BoxOpened = "";
var ImgOpened = "";
var Counter = 0;
var ImgFound = 0;

var Source = "#boxcard";
var ImgSource = new Array();

function RandomFunction(MaxValue, MinValue) {
	return Math.round(Math.random() * (MaxValue - MinValue) + MinValue);
}

function ShuffleImages() {
	var ImgAll = $(Source).children();
	var ImgThis = $(Source + " div:first-child");
	var ImgArr = new Array();

	for (var i = 0; i < ImgAll.length; i++) {
		ImgArr[i] = $("#" + ImgThis.attr("id") + " img").attr("src");
		ImgThis = ImgThis.next();
	}

	ImgThis = $(Source + " div:first-child");

	for (var z = 0; z < ImgAll.length; z++) {
		var RandomNumber = RandomFunction(0, ImgArr.length - 1);

		$("#" + ImgThis.attr("id") + " img").attr("src", ImgArr[RandomNumber]);
		ImgArr.splice(RandomNumber, 1);
		ImgThis = ImgThis.next();
	}
}

function ResetGame() {
	ShuffleImages();
	$(Source + " div img").hide();
	$(Source + " div").css("visibility", "visible");
	Counter = 0;
	$("#success").remove();
	$("#counter").html("" + Counter);
	BoxOpened = "";
	ImgOpened = "";
	ImgFound = 0;
	return false;
}

function OpenCard() {
	var id = $(this).attr("id");

	if ($("#" + id + " img").is(":hidden")) {
		$(Source + " div").unbind("click", OpenCard);

		$("#" + id + " img").slideDown('fast');

		if (ImgOpened == "") {
			BoxOpened = id;
			ImgOpened = $("#" + id + " img").attr("src");
			setTimeout(function() {
				$(Source + " div").bind("click", OpenCard);
			}, 300);
		} else {
			CurrentOpened = $("#" + id + " img").attr("src");
			if (ImgOpened != CurrentOpened) {
				setTimeout(function() {
					$("#" + id + " img").slideUp('fast');
					$("#" + BoxOpened + " img").slideUp('fast');
					BoxOpened = "";
					ImgOpened = "";
				}, 400);
			} else {
				$("#" + id + " img").parent().css("visibility", "hidden");
				$("#" + BoxOpened + " img").parent().css("visibility", "hidden");
				ImgFound++;
				BoxOpened = "";
				ImgOpened = "";
			}
			setTimeout(function() {
				$(Source + " div").bind("click", OpenCard);
			}, 400);
		}
		Counter++;
		$("#counter").html("" + Counter);

		if (ImgFound == ImgSource.length) {
			$("#counter").prepend('<span id="success">You Found All Pictues With </span>');
		}
	}
}


$(document).ready(function init_interactive() {

	var $jsonFile = 'assets/json/data.json';
	$.getJSON($jsonFile, function json_process(data) {
		$.each(data.item, function(i, obj) {
			ImgSource.push(obj.filename);
		});

		// create two of each image
		for (var y = 0; y < 2; y++) {
			$.each(ImgSource, function create_cards(i, obj) {
				$(Source).append("<div id=card" + y + i + "><img src=" + obj + " />");
			});
		}
		$(Source + " div").click(OpenCard);
		ShuffleImages();

		$('#credits_button').html(data.credits.title);
		var ext = data.credits.content;
		$('#credits_content').html(ext);

		$("#credits_content").dialog({
			autoOpen : false,
			height : data.credits.height,
			width : data.credits.width,
			modal : true,
		});
		$("#credits_button").button().click(function() {
			$("#credits_content").dialog("open");
		});

	});
});
