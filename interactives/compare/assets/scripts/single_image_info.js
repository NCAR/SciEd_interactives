var initial_image_index = 0;
// ensure special characters are encoded: http://symbolcodes.tlt.psu.edu/web/codehtml.html

if ( typeof (data1) != 'undefined' && data1.item.length > 0) {
	// create controls
	var div1 = document.getElementById('image_compare1');

	// create label
	var label = document.createElement('label');
	label.setAttribute('for', 'image_selector1');
	var txt = document.createTextNode("Select a photo: ");
	label.appendChild(txt);
	div1.appendChild(label);

	// create dropdown from data
	var select1 = document.createElement('select');
	select1.setAttribute('id', 'image_selector1');
	$.each(data1.item, function(k, v) {
		var option = document.createElement('option');
		var txt = document.createTextNode(v.name);
		option.appendChild(txt);
		option.setAttribute("value", k);

		select1.appendChild(option);
	});

	div1.appendChild(select1);

	// instrument the first image to show
	$('#image_container1').html('<img src="' + data1.item[initial_image_index].filename + '"/>');
	//$('#image_content1').html(data1.item[initial_image_index].content);
	var ext = data1.item[initial_image_index].content;
	$('#image_content1').load(ext);
	//instrument what happens when select is clicked
	$('#image_selector1').change(function() {
		var selected_index = $('#image_selector1 option:selected').val();
		$('#image_container1').html('<img src="' + data1.item[selected_index].filename + '"/>');
		//$('#image_content1').html(data1.item[selected_index].content);
		var ext = data1.item[selected_index].content;
		$('#image_content1').load(ext);
	});

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