$.preloadImages = function()
{
       for(var i = 0; i<arguments.length; i++)
       {
            var test = $("<img />").attr("src", arguments[i]);
       }
};

$(document).ready(function()
{
	// if data1 exists, get all item filenames
	var img = [];
	if ( typeof (data1) != 'undefined' && data1.item.length > 0) {
		$.each(data1.item, function(k, v) {
			img[k] = image_base_url + data1.item[k].filename;
		});
	}
    $.preloadImages.apply(window,img);
});