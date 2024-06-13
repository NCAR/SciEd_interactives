(function(){
	var bkgStage,gaugeStage,tank1Stage,tank2Stage,gaugeStage,graphStage;
	var queue;
	var tank1,tank2,flowMeter,pressureMeter;
	var selectedLevel1,selectedLevel2;
	
	var densityWater = 997.0479; // kilograms per cubic meter (at 25 C; max is 999.9720 @ 4 C)
	var gravity = 9.80665; // Acceleration due to gravity at Earth's surface (meters per second squared)
	var gamma = densityWater*gravity; // standard variable for fluid density times gravity
	var surfacePressure = 101325; // Air pressure at one atmosphere
	var head1 = head2 = gaugePressure = 0;
	
	var tank1_height = tank2_height = 400;
	var tank1_height_actual = tank2_height_actual = 10;
	var tank1_height_mult = tank2_height_mult = tank1_height/tank1_height_actual;
	var tank1_x = 100;
	var tank1_y = 0;
	var tank2_x = 500;
	var tank2_y = 0;
	
	// placement drawing buffers
	var drawHeightBuffer = 100;
	var tank1_y_buffer = tank1_height + 50 + drawHeightBuffer;
	var tank2_y_buffer = tank2_height + 50 + drawHeightBuffer;
	
	//var tank1_fillLevel = tank2_fillLevel = 200;
	var tank1_fillLevel_actual = tank2_fillLevel_actual = 5;
	var tank1_fillLevel = tank2_fillLevel = tank1_fillLevel_actual*tank1_height_mult;
	//var tank1_fillLevel_mult = tank2_fillLevel_mult = tank1_fillLevel/tank1_fillLevel_actual;
	
	var tank1_radius_actual = tank2_radius_actual = 2.5;
	var tank1_radius = tank2_radius = tank1_radius_actual*tank1_height_mult;
	//var tank1_radius_mult = tank2_radius_mult = tank1_radius/tank1_radius_actual;
	
	var equalize_function = false;
	
	var pressureUnits = 'pascals';
	var flowUnits = 'm/s'
	
var myIcon;
	/**
	 *  
	 */
	function init(){
		//Create a stage by getting a reference to the canvas
	    bkgStage = new createjs.Stage("bkgCanvas");
	    tank1Stage = new createjs.Stage("tank1Canvas");
	    tank2Stage = new createjs.Stage("tank2Canvas");
	    gaugeStage = new createjs.Stage("gaugeCanvas");
	    gaugeStage.enableMouseOver(10);

	    drawBkg();
	    drawTanks();
	 	
	 	drawFlowMeter();
	 	drawPressureMeter();
  
  		initUIElm();
  		
	    bkgStage.update();
	    
	    // initialize unit controls to presets
	    $('#pressureUnits').val(pressureUnits).change();
	    $('#flowUnits').val(flowUnits).change();
	    
		createjs.Ticker.setFPS(40);    
		createjs.Ticker.addEventListener("tick", tick);
		createjs.Touch.enable(gaugeStage);
	}
	
	/**
	 * 
 	 * @param {Object} event
	 */
	function tick(event) {
		
		// get updated levels

		selectedLevel1 = parseInt($('#selectedLevel1').val());
		selectedLevel2 = parseInt($('#selectedLevel2').val());
	    
	    // for now use random numbers to update flow meter values
	    // TODO: update with actual flow values
	    // TODO: link to graph?
	    var temp = Math.floor(Math.random()*100);
	   // pressureMeter.changeValue(temp); 
	    //flowMeter.changeValue(temp);
	    
		// each tick get selectedLevel1 in case it changed
		// ensure selectedLevel1 is not less than 0 or greater than height of tank
		if(selectedLevel1 > tank1._height || selectedLevel1 < 0){
			// reset to fillLevel
			$('#selectedLevel1').val(tank1._fillLevel);
			// update var
			selectedLevel1 = parseInt($('#selectedLevel1').val());
		}
		
		// each tick get selectedLevel2 in case it changed
		// ensure selectedLevel2 is not less than 0 or greater than height of tank
		if(selectedLevel2 > tank2._height || selectedLevel2 < 0){
			// reset to fillLevel
			// update var
			selectedLevel2 = parseInt($('#selectedLevel2').val());
		}
		
		// if in equalize function mode
		if(equalize_function == true){
			// TODO: may have to consider when levels are odd and off by one - probably just set both to same number at that point
			// TODO: make it look like water is flowing from one tank into the othertank
			console.log('tank1 level: '+selectedLevel1+' and tank2 level: '+selectedLevel2);
			if(selectedLevel1 > selectedLevel2){
				console.log('tank1 higher: tank1 level: '+selectedLevel1+' and tank2 level: '+selectedLevel2);
				
				// decrease tank1
				step = tank1._fillLevel - 1;
				tank1.changeLevel(step);
				updateSliderVal(1,step);	
				
				// increase tank2		
				step = tank2._fillLevel + 1;
				tank2.changeLevel(step);
				updateSliderVal(2,step);
				
				flowFrom1To2();
				
			} else if(selectedLevel1 < selectedLevel2){
				console.log('tank2 higher: tank1 level: '+selectedLevel1+' and tank2 level: '+selectedLevel2);
				// increase tank1	
				step = tank1._fillLevel + 1;
				tank1.changeLevel(step);
				updateSliderVal(1,step);	
				
				// decrease tank2
				step = tank2._fillLevel - 1;
				tank2.changeLevel(step);
				updateSliderVal(2,step);
				flowFrom2To1();
				
			}
			
			// turn off equalize if equal level
			// check if values are only one off from each other
			// to prevent constant back and forth
			if(selectedLevel2 == selectedLevel1 || 
			  (selectedLevel2 == selectedLevel1+1) || 
			  (selectedLevel2 == selectedLevel1-1)){
				console.log('tanks same...essentially');
				equalize_function = false;
			}
		} else {
			// compare currentLevel and selected level and change as needed by step
			// TODO: make it look like water is flowing into the tanks
			if(tank1._fillLevel < selectedLevel1){
				//step = tank1._fillLevel +1;
			//	tank1.changeLevel(step);
				tank1.changeLevel(selectedLevel1);
				pourTank1();
				
				tank1_fillLevel = selectedLevel1;
			} else if(tank1._fillLevel > selectedLevel1){
				//step = tank1._fillLevel -1;
				//tank1.changeLevel(step);
				tank1.changeLevel(selectedLevel1);
				tank1_fillLevel = selectedLevel1;
			}
			
			// compare currentLevel and selected level and change as needed by step
			if(tank2._fillLevel < selectedLevel2){
				//step = tank2._fillLevel +1;
				//tank2.changeLevel(step);
				tank2.changeLevel(selectedLevel2);
				pourTank2();
				
				tank2_fillLevel = selectedLevel2;
			} else if(tank2._fillLevel > selectedLevel2){
				//step = tank2._fillLevel -1;
				//tank2.changeLevel(step);
				
				tank2.changeLevel(selectedLevel2);
				tank2_fillLevel = selectedLevel2;
			}
			
			calcFillLevelActual();
	   }
	  // getPressure();
	  
		//TODO: only update if change occurred.
	   tank1Stage.update(); // important!!
	   tank2Stage.update(); // important!!
	   gaugeStage.update(); // important!!
	}
	
	/**
	 * 
	 */
	function getPressure(){
		console.log("get pressure");
		//TODO: first determine which tank we are in
		var meterY = pressureMeter.getMeterY();
		var meterY_actual = meterY/tank1_height_mult;
		var meterX = pressureMeter.getMeterX();
		var meterX_actual = meterX/tank1_height_mult;
		var pressureHeight = tank1_height_actual - meterY_actual;
		
		// calc vals for tank1
		var tank1_calc_height = (tank1_height+tank1_y);
		var tank1_calc_fillLevel = (tank1_y + tank1_height)-tank1_fillLevel;
		var tank1_calc_width = (tank1_radius*2)+tank1_x;
		var tank1_calc_height = tank1_height+tank1_y;
		
		// calc vals for tank2
		var tank2_calc_height = (tank2_height+tank2_y);
		var tank2_calc_fillLevel = (tank2_y + tank2_height)-tank2_fillLevel;
		var tank2_calc_width = (tank2_radius*2)+tank2_x;
		var tank2_calc_height = tank2_height+tank2_y;

		// between tankheight and tankfillLevel
		if((meterX > tank1_x) && 
		   (meterX < tank1_calc_width) &&
		   (meterY > tank1_calc_fillLevel) &&
		   (meterY < tank1_calc_height)){
		   	//console.log("meterY: "+meterY);
		   //	console.log("tank1_calc_fillLevel: "+tank1_calc_fillLevel)
			// get pressure at this point in tank1
			head1 = tank1_fillLevel_actual + surfacePressure/gamma;
			gaugePressure = Math.round(gamma*(head1 - pressureHeight));
			console.log(gaugePressure);
			pressureMeter.changeValue(gaugePressure);
		} else if((meterX > tank2_x) && 
		   (meterX < tank2_calc_width) &&
		   (meterY > tank2_calc_fillLevel) &&
		   (meterY < tank2_calc_height)){
			// get pressure at this point in tank2
			head2 = tank2_fillLevel_actual + surfacePressure/gamma;
			gaugePressure = Math.round(gamma*(head2 - pressureHeight));
			console.log(gaugePressure);
			pressureMeter.changeValue(gaugePressure);
		} else {
			pressureMeter.changeValue(surfacePressure);
		}
	}
	/**
	 * 
	 */
	function pourTank1(){
		console.log("animate water into tank1");
	}
	
	/**
	 * 
	 */
	function pourTank2(){
		console.log("animate water into tank2");
		
	}
	
	/**
	 * 
	 */
	function flowFrom1To2(){
		console.log("animate water flowing from tank1 into tank2");
		var img = new Image();
		var bmp;
        img.src= "img/arrow_right.png";
       
        img.onload = function () {
        	bmp = new createjs.Bitmap(this); 
        	bmp.x = 100;
        	bmp.y = bkgStage.canvas.height - 100;
        	var tween = new createjs.Tween(); 
        	createjs.Tween.get(bmp, {loop:true, useTicks:true}).to({x:500}).call(function(bmp){
        		
        		bkgStage.removeChild(bmp);
        		bkgStage.update();
        	});

        	bkgStage.addChild(bmp);
        	bkgStage.update();
        };
        
	}
	/**
	 * 
	 */
	function flowFrom2To1(){
		console.log("animate water flowing from tank2 into tank1");
		
		var img = new Image();
		var bmp;
        img.src= "img/arrow_left.png";
       
        img.onload = function () {
        	bmp = new createjs.Bitmap(this); 
        	bmp.x = 500;
        	bmp.y = bkgStage.canvas.height - 100;
        	createjs.Tween.get(bmp, {loop:true, useTicks:true}).to({x:100+tank1_radius,useTicks:true}).call(function(bmp){
        		
        		bkgStage.removeChild(bmp);
        		//bkgStage.update();
        	});

        	bkgStage.addChild(bmp);
        	//bkgStage.update();
        };
        
	}
	function onComplete(){
		console.log("Tween done");	

	}
	/**
	  * 
	  */
	 function updateSliderVal(tanknum,val){
	 	$('#selectedLevel'+tanknum).val(val);
	 	$( "#selectedLevel"+tanknum+"-range-min" ).slider( "value", val );
	 	
	 	if(tanknum == 1){
	 		tank1_fillLevel = val;
	 	} else if(tanknum == 2){
	 		tank2_fillLevel = val;
	 	}
		
		calcFillLevelActual();
		getPressure();
	 }
	 
	/**
	 * 
	 */
	function drawBkg(){
		
	    //Create sky
	    var bgShape = new createjs.Shape();
	    bgShape.graphics.beginLinearGradientFill(
	    	["#728fce","#dee0d5","#dee0d5","#f4a460"], 
	    	[.2,.6,.63,.9], 
	    	0,0,
	    	0,bkgStage.canvas.height
	    );
	    bgShape.graphics.drawRect(0,0,bkgStage.canvas.width,bkgStage.canvas.height);
	    bgShape.graphics.endFill();
	    bkgStage.addChild(bgShape);
	    
	  	// create ground
	  	var grndShape = new createjs.Shape();
	  	grndShape.graphics.beginFill("#003300");
	  	grndShape.graphics.drawRect(0,bkgStage.canvas.height-150,bkgStage.canvas.width,bkgStage.canvas.height);
	  	grndShape.graphics.endFill();
	    bkgStage.addChild(grndShape);
	    
	}
	
	/**
	 * 
	 */
	function drawPressureMeter(){
		
		var props = {
			'radius' : 25,
			'height' :60,
			'width' : 60,
			'color' : '#CC0000',
			'toMeasure' : 'pressure',
			'units' : pressureUnits,
			'value' : 0,
			'dragEnabled' : true
		};
		pressureMeter = new Gauge(props);
		pressureMeter.x = 100;
		pressureMeter.y = tank1_height + drawHeightBuffer;
		//console.log("FlowMeter has a click event handler? "+flowMeter.hasEventListener('click'));

	    gaugeStage.addChild(pressureMeter);	
	    gaugeStage.update();
	    pressureMeter.changeValue(surfacePressure);
	    pressureMeter.on("pressup", function(evt) { 
			getPressure();
		});
	}

	
	/**
	 * 
	 */
	function drawFlowMeter(){
		
		var props = {
			'radius' : 25,
			'height' :60,
			'width' : 60,
			'color' : '#CCCCCC',
			'toMeasure' : 'flow',
			'units' : flowUnits,
			'value' : 0,
			'dragEnabled' : false
		};
		flowMeter = new Gauge(props);
		flowMeter.x = 200+(tank1_radius*2);
		flowMeter.y = bkgStage.canvas.height - (75)-drawHeightBuffer;
		//console.log("FlowMeter has a click event handler? "+flowMeter.hasEventListener('click'));

	    gaugeStage.addChild(flowMeter);	
	    gaugeStage.update();
	    
	}


	/**
	 * 
	 */
	function drawTanks(){
		// water level for tank1
		var props2 = {
			'radius':tank1_radius,
			'height':tank1_height,
			'fillLevel':tank1_fillLevel,
			'color': '3399FF'
		};
		// set selectedLevel1 to chosen preset fillLevel
		$('#selectedLevel1').val(tank1_fillLevel);
		tank1 = new Tank(props2);
		tank1.x = tank1_x;
		tank1.y = tank1_y = bkgStage.canvas.height - tank1_y_buffer;
			
		props2 = null;
	    tank1Stage.addChild(tank1);
	    
	 
		// water level for tank2
		var props4 = {
			'radius':tank2_radius,
			'height':tank2_height,
			'fillLevel':tank2_fillLevel,
			'color': '3399FF'
		};

		// set selectedLevel2 to chosen preset fillLevel
		$('#selectedLevel2').val(tank2_fillLevel);
		tank2 = new Tank(props4);
		
		tank2.x = tank2_x;
		tank2.y = tank2_y = bkgStage.canvas.height - tank2_y_buffer;
		props4 = null;
	    tank2Stage.addChild(tank2);
	    
	    // outline for pipe between tanks
	     var tubeGraphics = new createjs.Graphics(); 
    	tubeGraphics.beginFill(createjs.Graphics.getRGB("0x3399FF", 0.75))
    	.drawRect(100+(tank1_radius*2),bkgStage.canvas.height - (100+drawHeightBuffer),(tank1_radius*2),50)
    	.endFill();	
	  	var tube= new createjs.Shape(tubeGraphics);
	     	
	    var tubeGraphicsOutline = new createjs.Graphics(); 
    	tubeGraphicsOutline.setStrokeStyle(4)
    	.beginStroke("rgba(0,0,0,1)")
    	.drawRect(100+(tank1_radius*2),bkgStage.canvas.height - (100+drawHeightBuffer),(tank1_radius*2),50)
    	.closePath();	
	  	var tubeOutline= new createjs.Shape(tubeGraphicsOutline);
	     // plus outline
	   bkgStage.addChild(tube);
	   bkgStage.addChild(tubeOutline);
	    
	      // draw stop cock on pipe
	    // just a rectangle
	    var rect= new createjs.Shape();
    	rect.graphics.beginFill(createjs.Graphics.getRGB(112,128,144, 1)).drawRect(100+(tank1_radius*2)+20, bkgStage.canvas.height - (208), 10, 60);
	    bkgStage.addChild(rect);
	    
	}
	
	  
	  function calcFillLevelActual(){
	  	tank1_fillLevel_actual = tank1_fillLevel/tank1_height_mult;
	  	tank2_fillLevel_actual = tank2_fillLevel/tank1_height_mult;
	  }
	function initUIElm(){
		// draw measure lines on bkg
		// main ruler 1
		var ruler1 = new createjs.Graphics(); 
	    	ruler1.setStrokeStyle(10)
	    	.beginStroke("rgba(0,0,0,1)")
	    	.moveTo(tank1.x-50,tank1.y)
	    	.lineTo(tank1.x-50,tank1_height+tank1.y)
	    	.closePath();	
		var ruler1Outline= new createjs.Shape(ruler1);
		bkgStage.addChild(ruler1Outline);
		
		// tick marks
		// and numbers
		for(var i=0;i<tank1_height+tank1.y;i += 50){
			var tickmark = new createjs.Graphics();
			var text = new createjs.Text(tank1_height_actual-(i/tank1_height_mult), "bold 12px Arial","#000000");
		//var text = new createjs.Text(tank1_height-(i), "bold 12px Arial","#000000");
			text.x = tank1.x-90;
			text.y = tank1.y + i;
			tickmark.setStrokeStyle(1)
			.beginStroke("rgba(0,0,0,1)")
		    .moveTo(tank1.x-55,tank1.y + i)
		    .lineTo(tank1.x-30,tank1.y + i)
		    .closePath();	
			var tickmarkOutline= new createjs.Shape(tickmark);
			bkgStage.addChild(tickmarkOutline,text);
		}
		
		// main ruler 2
		var ruler2 = new createjs.Graphics(); 
	    	ruler2.setStrokeStyle(10)
	    	.beginStroke("rgba(0,0,0,1)")
	    	.moveTo(tank2.x+50+(tank2_radius*2),tank2.y)
	    	.lineTo(tank2.x+50+(tank2_radius*2),tank2_height+tank2.y)
	    	.closePath();	
		var ruler2Outline= new createjs.Shape(ruler2);
		bkgStage.addChild(ruler2Outline);
		
		// tick marks
		// and numbers
		for(var i=0;i<tank2_height+tank2.y;i += 50){
			var tickmark = new createjs.Graphics();
			var text = new createjs.Text(tank2_height_actual-(i/tank2_height_mult), "bold 12px Arial","#000000");
			text.x = tank2.x+70+(tank2_radius*2);
			text.y = tank2.y + i;
			tickmark.setStrokeStyle(1)
			.beginStroke("rgba(0,0,0,1)")
		    .moveTo(tank2.x+55+(tank2_radius*2),tank2.y + i)
		    .lineTo(tank2.x+30+(tank2_radius*2),tank2.y + i)
		    .closePath();	
			var tickmarkOutline= new createjs.Shape(tickmark);
			bkgStage.addChild(tickmarkOutline,text);
		}
		
		// selectedLevel1 control
	$( "#selectedLevel1-range-min" ).slider({
		value: tank1_fillLevel,
		min: 0,
		max: tank1_height,
		orientation: "vertical",
		slide: function( event, ui ) {
			$( "#selectedLevel1" ).val( ui.value );
		},
		change: function( event, ui ) {
			selectedLevel1 = $('#selectedLevel1').val();
			//console.log(ui.value);
			$('#selectedLevel1_actual').val(selectedLevel1/tank1_height_mult);
			getPressure();
		}
	});
	$( "#selectedLevel1" ).val(  $( "#selectedLevel1-range-min" ).slider( "value" ));
	$('#selectedLevel1_actual').val($( "#selectedLevel1" ).val()/tank1_height_mult);
	
	
	// selectedLevel2 control
	$( "#selectedLevel2-range-min" ).slider({
		value: tank2_fillLevel,
		min: 0,
		max: tank2_height,
		orientation: "vertical",
		slide: function( event, ui ) {
			$( "#selectedLevel2" ).val( ui.value );
		},
		change: function( event, ui ) {
			selectedLevel2 = $('#selectedLevel2').val();
			//console.log(ui.value);
			$('#selectedLevel2_actual').val(selectedLevel2/tank1_height_mult);
			getPressure();
		}
	});
	$( "#selectedLevel2" ).val($( "#selectedLevel2-range-min" ).slider( "value" ));
	$('#selectedLevel2_actual').val($( "#selectedLevel2" ).val()/tank1_height_mult);
}
	
	
	
	
	// stopcock handler
	$('#stopCock').on('click',function(){
		// swap text
		var val = $(this).val();
		if(val == 'Off'){
			$(this).val('On');
			$(this).html('On');
			// make water flow
		} else {
			$(this).val('Off');
			$(this).html('Off');
			// stop water from flowing
		}		
	});
	
	$('#equalize').on('click',function(){
		// check if stopcock is on
		// if yes, equalize the water
		if($('#stopCock').val() == 'On'){
			// is tank1 higher or tank2
			equalize_function = true;
		} else {
			equalize_function = false;
		}
	});
	
	
	// change units for pressure gauge
	$('#pressureUnits').on('change',function(){
		pressureUnits = $("#pressureUnits option:selected").val();
		pressureMeter.changeUnits(pressureUnits);
	});

	// change units for flow gauge
	$('#flowUnits').on('change',function(){
		flowUnits = $("#flowUnits option:selected").val();
		flowMeter.changeUnits(flowUnits);
	});
	
	// chart
	// need to abstract this out
	$.jqplot('chartdiv',  [[[1, 2],[3,5.12],[5,13.1],[7,33.6],[9,85.9],[11,219.9]]],
		{ title:'Exponential Line',
		  axes:{yaxis:{min:-10, max:240}},
		  series:[{color:'#5FAB78'}]
		});

	init();
})();
