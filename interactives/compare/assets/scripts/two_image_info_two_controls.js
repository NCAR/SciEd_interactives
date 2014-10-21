var initial_image_index = 0;
// ensure special characters are encoded: http://symbolcodes.tlt.psu.edu/web/codehtml.html

if ( typeof (data1) != 'undefined' && data1.item.length > 0) {
	// create controls
	var div1 = document.getElementById('image_compare1');
	var div2 = document.getElementById('image_compare2');

	// create label
	var label1 = document.createElement('label');
	label1.setAttribute('for', 'image_selector11');
	var txt1 = document.createTextNode("Map: ");
	label1.appendChild(txt1);

	var label2 = document.createElement('label');
	label2.setAttribute('for', 'image_selector12');
	var txt2 = document.createTextNode("Map: ");
	label2.appendChild(txt2);

	div1.appendChild(label1);
	div2.appendChild(label2);

	// create dropdowns from data
	// get select options
	var select11 = document.createElement('select');
	var select21 = document.createElement('select');

	var select12 = document.createElement('select');
	var select22 = document.createElement('select');
	var a_options_tracker1 = a_options_tracker2 = [];
	select11.setAttribute('id', 'image_selector11');
	select21.setAttribute('id', 'image_selector21');
	select12.setAttribute('id', 'image_selector12');
	select22.setAttribute('id', 'image_selector22');
	$.each(data1.item, function(k, v) {
		if ($.inArray(v.select1, a_options_tracker1) == -1) {
			a_options_tracker1.push(v.select1);
			var option1 = document.createElement('option');
			var txt1 = document.createTextNode(v.select1);
			option1.appendChild(txt1);
			option1.setAttribute("value", v.select1);

			var option2 = document.createElement('option');
			var txt2 = document.createTextNode(v.select1);
			option2.appendChild(txt2);
			option2.setAttribute("value", v.select1);

			select11.appendChild(option1);
			select12.appendChild(option2);
		}
		if ($.inArray(v.select2, a_options_tracker2) == -1) {
			a_options_tracker2.push(v.select2);
			var option1 = document.createElement('option');
			var txt1 = document.createTextNode(v.select2);
			option1.appendChild(txt1);
			option1.setAttribute("value", v.select2);

			var option2 = document.createElement('option');
			var txt2 = document.createTextNode(v.select2);
			option2.appendChild(txt2);
			option2.setAttribute("value", v.select2);

			select21.appendChild(option1);
			select22.appendChild(option2);
		}
	});

	div1.appendChild(select11);
	div1.appendChild(select21);
	div2.appendChild(select12);
	div2.appendChild(select22);

	// instrument the first image to show
	$('#image_container1').html('<img src="' + data1.item[initial_image_index].filename + '"/>');
	//$('#image_content1').html(data1.item[initial_image_index].content);
	var ext = data1.item[initial_image_index].content;
	$('#image_content1').load(ext);
	// make two different images
	$('#image_container2').html('<img src="' + data1.item[initial_image_index + 1].filename + '"/>');
	//$('#image_content2').html(data1.item[initial_image_index + 1].content);
	var ext = data1.item[initial_image_index + 1].content;
	$('#image_content2').load(ext);
	$('#image_selector22 option[value="Precipitation"]').attr('selected', 'selected');

	//instrument what happens when eiterh select is clicked
	$('#image_selector11').change(function() {
		changeImage(1);
	});
	$('#image_selector21').change(function() {
		changeImage(1);

	});

	$('#image_selector12').change(function() {
		changeImage(2);
	});
	$('#image_selector22').change(function() {
		changeImage(2);

	});
	function changeImage(node) {
		// get values of select and change
		var selected_index1 = $('#image_selector1' + node + ' option:selected').val();
		var selected_index2 = $('#image_selector2' + node + ' option:selected').val();

		$.each(data1.item, function(k, v) {

			if (data1.item[k].select1 == selected_index1 && data1.item[k].select2 == selected_index2) {
				$('#image_container' + node).html('<img src="' + data1.item[k].filename + '"/>');
				//$('#image_content' + node).html(data1.item[k].content);
				var ext = data1.item[k].content;
				$('#image_content' + node).load(ext);
			}

		});

	}

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
		title : credits.label
	});
	$("#credits_button").button().click(function() {
		$("#credits_content").dialog("open");
	});
} else {
	$('#credits_button').css("display", "none");
}