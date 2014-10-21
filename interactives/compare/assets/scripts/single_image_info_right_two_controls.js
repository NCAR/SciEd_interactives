var initial_image_index = 0;
// ensure special characters are encoded: http://symbolcodes.tlt.psu.edu/web/codehtml.html

var select_labels = {
	"select1" : "Continent",
	"select2" : "Data"
};

if ( typeof (data1) != 'undefined' && data1.item.length > 0) {
	// create controls
	var div1 = document.getElementById('image_compare1');

	// create label
	var label = document.createElement('label');
	label.setAttribute('for', 'image_selector1');
	var txt = document.createTextNode("Select a photo: ");
	label.appendChild(txt);
	div1.appendChild(label);

	// create dropdowns from data
	// get select options
	var select1 = document.createElement('select');
	var select2 = document.createElement('select');
	var a_options_tracker1 = a_options_tracker2 = [];
	select1.setAttribute('id', 'image_selector1');
	select2.setAttribute('id', 'image_selector2');
	$.each(data1.item, function(k, v) {
		if ($.inArray(v.select1, a_options_tracker1) == -1) {
			a_options_tracker1.push(v.select1);
			var option = document.createElement('option');
			var txt = document.createTextNode(v.select1);
			option.appendChild(txt);
			option.setAttribute("value", v.select1);

			select1.appendChild(option);
		}
		if ($.inArray(v.select2, a_options_tracker2) == -1) {
			a_options_tracker2.push(v.select2);
			var option = document.createElement('option');
			var txt = document.createTextNode(v.select2);
			option.appendChild(txt);
			option.setAttribute("value", v.select2);

			select2.appendChild(option);
		}
	});

	div1.appendChild(select1);
	div1.appendChild(select2);

	// instrument the first image to show
	$('#image_container1').html('<img src="' + data1.item[initial_image_index].filename + '"/>');
	//$('#image_content1').html(data1.item[initial_image_index].content);
	var ext = data1.item[initial_image_index].content;
	$('#image_content1').load(ext);

	//instrument what happens when eiterh select is clicked
	$('#image_selector1').change(function() {
		changeImage();
	});
	$('#image_selector2').change(function() {
		changeImage()

	});
	function changeImage() {
		// get values of select and change
		var selected_index1 = $('#image_selector1 option:selected').val();
		var selected_index2 = $('#image_selector2 option:selected').val();

		$.each(data1.item, function(k, v) {

			if (data1.item[k].select1 == selected_index1 && data1.item[k].select2 == selected_index2) {
				$('#image_container1').html('<img src="' + data1.item[k].filename + '"/>');
				//$('#image_content1').html(data1.item[k].content);
				var ext = data1.item[k].content;
				$('#image_content1').load(ext);
			}

		});

	}

	// if instructions values exist, configure them
	if ( typeof (instructions) != 'undefined') {
		var ext = instructions.content;
		$('#instructions_content').load(ext);

	}

	// if credits values exist, configure them
	if ( typeof (credits) != 'undefined' && credits.label != undefined) {
		$('#credits_button').html(credits.label);
		//$('#credits_content').html(credits.content);
		var ext = credits.content;
		$('#credits_content').load(ext);
		$("#credits_content").dialog({
			autoOpen : false,
			height : credits.height,
			width : credits.width,
			modal : true,
		});
		$("#credits_button").button().click(function() {
			$("#credits_content").dialog("open");
		});
	} else {
		$('#credits_button').css("display", "none");
	}
}