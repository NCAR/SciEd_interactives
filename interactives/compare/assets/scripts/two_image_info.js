var initial_image_index = 0;
// ensure special characters are encoded: http://symbolcodes.tlt.psu.edu/web/codehtml.html

if ( typeof (data1) != 'undefined' && data1.item.length > 0) {
	// create controls
	var div1 = document.getElementById('image_compare1');
	var div2 = document.getElementById('image_compare2');

	// create label
	var label1 = document.createElement('label');
	label1.setAttribute('for', 'image_selector1');
	var txt1 = document.createTextNode("Select a photo: ");
	label1.appendChild(txt1);
	// create label
	var label2 = document.createElement('label');
	label2.setAttribute('for', 'image_selector2');
	var txt2 = document.createTextNode("Select a photo: ");
	label2.appendChild(txt2);
	div1.appendChild(label1);
	div2.appendChild(label2);

	// create dropdown from data
	var select1 = document.createElement('select');
	select1.setAttribute('id', 'image_selector1');
	// create dropdown from data
	var select2 = document.createElement('select');
	select2.setAttribute('id', 'image_selector2');

	$.each(data1.item, function(k, v) {
		var option1 = document.createElement('option');
		var txt1 = document.createTextNode(v.name);
		option1.appendChild(txt1);
		option1.setAttribute("value", k);
		select1.appendChild(option1);

		var option2 = document.createElement('option');
		var txt2 = document.createTextNode(v.name);
		option2.appendChild(txt2);
		option2.setAttribute("value", k);
		select2.appendChild(option2);

	});

	div1.appendChild(select1);
	div2.appendChild(select2);

	// instrument the first image to show
	$('#image_container1').html('<img src="' + data1.item[initial_image_index].filename + '"/>');
	//$('#image_content1').html(data1.item[initial_image_index].content);
	var ext = data1.item[initial_image_index].content;
	$('#image_content1').load(ext);

	// instrument the first image to show
	$('#image_container2').html('<img src="' + data1.item[initial_image_index + 1].filename + '"/>');
	//$('#image_content2').html(data1.item[initial_image_index].content);
	var ext = data1.item[initial_image_index + 1].content;
	$('#image_content2').load(ext);

	$('#image_selector2 option[value="' + (initial_image_index + 1) + '"]').attr('selected', 'selected');

	//instrument what happens when select is clicked
	$('#image_selector1').change(function() {
		var selected_index = $('#image_selector1 option:selected').val();
		$('#image_container1').html('<img src="' + data1.item[selected_index].filename + '"/>');
		//$('#image_content1').html(data1.item[selected_index].content);
		var ext = data1.item[selected_index].content;
		$('#image_content1').load(ext);

	});
	//instrument what happens when select is clicked
	$('#image_selector2').change(function() {
		var selected_index = $('#image_selector2 option:selected').val();
		$('#image_container2').html('<img src="' + data1.item[selected_index].filename + '"/>');
		//$('#image_content2').html(data1.item[selected_index].content);
		var ext = data1.item[selected_index].content;
		$('#image_content2').load(ext);

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