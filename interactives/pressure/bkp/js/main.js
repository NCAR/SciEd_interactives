(function($) {
	// namespace
	var slc = slc || {};
	
	var animationInProgress = false;
	var bkgStage, gaugeStage, tank1Stage, tank2Stage, tickmarkStage;
	var queue;
	var tank1, tank2, flowMeter, pressureMeter;
	var selectedLevel1, selectedLevel2;
	var units = 'meters';
	//var hStageY;
	//var skip;
	var current_time = false;
	var start_time = false;
	var chartData = [];
	var newData = [];
	var plot1;
	var b_updatingChart = false;
	var flow = 0;
	var V_T1 = 0;
	var V_T2 = 0;
	var lastFlowSpeed = 0;
	
	var chart_options = {};
	var chart_options2 = {};
	
	
	var highchart = {};
	
	var highchart2 = {};
	var highChartDataStaging = [];
	var highChartDataTank1Staging = [];
	var highChartDataTank2Staging = [];
	var highChartData = [];
	
	var highChartDataTank1 = [];
	var highChartDataTank2 = [];
	
	var timeStep =.1;
	var timecount = 0;
	//var sT2;
	//var sT1;
	var arrow_left;
	var arrow_right;
	var time_counter = 0;
	var old_timer = false;
	var densityWater = 997.0479;
	// kilograms per cubic meter (at 25 C; max is 999.9720 @ 4 C)
	var gravity = 9.80665;
	// Acceleration due to gravity at Earth's surface (meters per second squared)
	var gamma = densityWater * gravity;
	// standard variable for fluid density times gravity
	var surfacePressureValue = 101325;
	var surfacePressure = surfacePressureValue;
	var new_pressure = surfacePressure;
	// gets printed on gauge and graphed
	// Air pressure at one atmosphere
	var head1 = head2 = headpipe = gaugePressure = 0;

	// in pixel coords
	var tank1_height = tank2_height = 400;
	//in meters - default
	var tank1Data = {
		'height_meter' : 10,
		'fillLevel_meter' : 5,
		'radius_meter' : .5,
		'height_feet' : 30,
		'fillLevel_feet' : 15,
		'radius_feet' : 7.5,
		'height_inches' : 80,
		'fillLevel_inches' : 40,
		'radius_inches' : 20,
		'height_pixel' : 200,
		'fillLevel_pixel' : 100,
		'radius_pixel' : 50,
		'x_pixel' : 100,
		'y_pixel' : 0
	};
	tank1Data['mult_meter'] = tank1Data['height_pixel'] / tank1Data['height_meter'];
	tank1Data['mult_feet'] = tank1Data['height_pixel'] / tank1Data['height_feet'];
	tank1Data['mult_inches'] = tank1Data['height_pixel'] / tank1Data['height_inches'];

	var pipeData = {
		'x_pixel' : 200,
		'y_pixel' : 475,
		'radius_pixel' : 50,
		'height_pixel' : 50,
		'fillLevel_pixel' : 50,
		'height_meter' : 1,
		'fillLevel_meter' : 1,
		'radius_meter' : .25,
		'height_feet' : 4,
		'fillLevel_feet' : 4,
		'radius_feet' : 4,
		'height_inches' : 10,
		'fillLevel_inches' : 10,
		'radius_inches' : 10,
	};
	pipeData['mult_meter'] = pipeData['height_pixel'] / pipeData['height_meter'];
	pipeData['mult_feet'] = pipeData['height_pixel'] / pipeData['height_feet'];
	pipeData['mult_inches'] = pipeData['height_pixel'] / pipeData['height_inches'];

	var tank2Data = {
		'height_meter' : 10,
		'fillLevel_meter' : 5,
		'radius_meter' : .5,
		'height_feet' : 30,
		'fillLevel_feet' : 15,
		'radius_feet' : 7.5,
		'height_inches' : 80,
		'fillLevel_inches' : 40,
		'radius_inches' : 20,
		'height_pixel' : 200,
		'fillLevel_pixel' : 100,
		'radius_pixel' : 50,
		'x_pixel' : 400,
		'y_pixel' : 0,
	};

	tank2Data['mult_meter'] = tank2Data['height_pixel'] / tank2Data['height_meter'];
	tank2Data['mult_feet'] = tank2Data['height_pixel'] / tank2Data['height_feet'];
	tank2Data['mult_inches'] = tank2Data['height_pixel'] / tank2Data['height_inches'];

	// placement drawing buffers
	var drawHeightBuffer = 75;
	var tickType = 'meters';


	tickSpacing = {};
	tickSpacing['meters'] = 1;
	//tickSpacing['inches'] = 39.3701;
	tickSpacing['inches'] = 10;
	tickSpacing['feet'] = 5;
	var tickDistance = {};
	// these are in pixels
	tickDistance['meters'] = 20;
	tickDistance['inches'] = 25;
	tickDistance['feet'] = 33.33;
	var tank1_y_buffer = tank1Data['height_pixel'] + drawHeightBuffer;
	var tank2_y_buffer = tank2Data['height_pixel'] + drawHeightBuffer;

	var equalize_function = false;

	var pressureUnits = 'kPa';
	var flowUnits = 'm/s';

	/**
	 *	init function - set everything up
	 **/
	slc.init = function() {
		//slc.drawChart();
		//Create a stage by getting a reference to the canvas
		bkgStage = new createjs.Stage("bkgCanvas");
		tank1Stage = new createjs.Stage("tank1Canvas");
		tank2Stage = new createjs.Stage("tank2Canvas");
		gaugeStage = new createjs.Stage("gaugeCanvas");
		tickmarkStage = new createjs.Stage("tickmarkCanvas");
		gaugeStage.enableMouseOver(10);

		slc.drawBkg();
		slc.drawTanks();

		slc.drawFlowMeter();
		slc.drawPressureMeter();

		slc.initUIElm();

		var img_leftarrow = new Image();
		img_leftarrow.src = "img/arrow_left.png";
		img_leftarrow.onload = function imgLeftarrowLoad() {
			arrow_left = new createjs.Bitmap(this);
			arrow_left.x = tank2Data['x_pixel'];
			arrow_left.y = bkgStage.canvas.height - (50 + drawHeightBuffer);
		};

		var img_rightarrow = new Image();
		img_rightarrow.src = "img/arrow_right.png";
		img_rightarrow.onload = function imgRightarrowLoad() {
			arrow_right = new createjs.Bitmap(this);
			arrow_right.x = tank1Data['x_pixel'] + (tank1Data['radius_pixel'] * 2) - 50;
			arrow_right.y = bkgStage.canvas.height - (50 + drawHeightBuffer);
		};
		bkgStage.update();

		// initialize unit controls to presets
		$('#pressureUnits').val(pressureUnits).change();
		$('#flowUnits').val(flowUnits).change();

		createjs.Ticker.setFPS(30);
		createjs.Ticker.addEventListener("tick", slc.tick);
		gaugeStage.enableDOMEvents(true);
		createjs.Touch.enable(gaugeStage);

	};

	/**
	 *
	 * @param {Object} event
	 */
	slc.tick = function(event) {

		// check to see if gauge units have changed, if so trigger change on stage
		var checkPressureUnit = pressureMeter._units;

		if (pressureUnits != checkPressureUnit) {
			$('#pressureUnits').val(checkPressureUnit).attr('selected', true).siblings('option').removeAttr('selected');
			$('#pressureUnits').change();
		}

		var checkFlowUnit = flowMeter._units;

		if (flowUnits != checkFlowUnit) {
			$('#flowUnits').val(checkFlowUnit).attr('selected', true).siblings('option').removeAttr('selected');
			$('#flowUnits').change();
		}

		// get updated levels
		selectedLevel1 = parseInt($('#selectedLevel1').val());
		selectedLevel2 = parseInt($('#selectedLevel2').val());

		// each tick get selectedLevel1 in case it changed
		// ensure selectedLevel1 is not less than 0 or greater than height of tank
		if (selectedLevel1 > tank1._height || selectedLevel1 < 0) {
			// reset to fillLevel
			$('#selectedLevel1').val(tank1._fillLevel);
			// update var
			selectedLevel1 = parseInt($('#selectedLevel1').val());
		}

		// each tick get selectedLevel2 in case it changed
		// ensure selectedLevel2 is not less than 0 or greater than height of tank
		if (selectedLevel2 > tank2._height || selectedLevel2 < 0) {
			// reset to fillLevel
			// update var
			selectedLevel2 = parseInt($('#selectedLevel2').val());
		}

		// if in equalize function mode
		if (equalize_function == true) {
			// TODO: may have to consider when levels are odd and off by one - probably just set both to same number at that point
			// TODO: make it look like water is flowing from one tank into the othertank
			//console.log('tank1 level: '+selectedLevel1+' and tank2 level: '+selectedLevel2);
			
			
			selectedLevel1 = Number(selectedLevel1);
			selectedLevel2 = Number(selectedLevel2);
			
			if ((selectedLevel2 == selectedLevel1) ||
				((selectedLevel2 > selectedLevel1) && (selectedLevel2 <= selectedLevel1 + 1)) || // between selectedlevel1 and selectedlevel1 +1
				((selectedLevel2 < selectedLevel1) && (selectedLevel2 >= selectedLevel1 - 1)) || // between selectedlevel1 and selectedlevel1 +1 ||
				((selectedLevel1 > selectedLevel2) && (selectedLevel1 <= selectedLevel2 + 1)) || // between selectedlevel2 and selectedlevel2 +1
				((selectedLevel1 < selectedLevel2) && (selectedLevel1 >= selectedLevel2 - 1))) {// between selectedlevel2 and selectedlevel2 +1
				
				//console.log(selectedLevel2+' vs '+selectedLevel1);
				slc.calcFlow();
				// force 0
				highChartDataStaging.push([parseInt((timecount)*1000), Number(0)]);
				slc.chartTankHeights((timecount)*1000)
				slc.resetFlags();
				$('#stopCock').click();
				selectedLevel2 = selectedLevel1;
				slc.updateValueFlow(flowMeter, 0, flowMeter._units, $("#flowUnits option:selected").val());
				
			} else if (selectedLevel1 > selectedLevel2 || selectedLevel1 < selectedLevel2) {
				slc.calcFlow();
				//console.log('flow');
				//slc.flowFrom2To1();
			}
			
		
		} else {
			
			slc.flowFrom1To2Remove();
			slc.flowFrom2To1Remove();
			// compare currentLevel and selected level and change as needed by step
			// TODO: make it look like water is flowing into the tanks
			if (tank1._fillLevel < selectedLevel1) {
				tank1.changeLevel(selectedLevel1);
				slc.pourTank1();
				tank1Data['fillLevel_pixel'] = selectedLevel1;
			} else if (tank1._fillLevel > selectedLevel1) {
				tank1.changeLevel(selectedLevel1);
				tank1Data['fillLevel_pixel'] = selectedLevel1;
			}

			// compare currentLevel and selected level and change as needed by step
			if (tank2._fillLevel < selectedLevel2) {
				tank2.changeLevel(selectedLevel2);
				slc.pourTank2();
				tank2Data['fillLevel_pixel'] = selectedLevel2;
			} else if (tank2._fillLevel > selectedLevel2) {
				tank2.changeLevel(selectedLevel2);
				tank2Data['fillLevel_pixel'] = selectedLevel2;
			}

			slc.calcFillLevelActual();
		}
		slc.getPressure();



		//TODO: only update if change occurred.
		tank1Stage.update();
		// important!!
		tank2Stage.update();
		// important!!
		gaugeStage.update();
		// important!!

		// only initiate a call if not in process of doing update
		//if (newData.length && b_updatingChart == false) {
		//if (newData.length) {
		//	slc.chartUpdate();
		//}
	};

	slc.calcFlow = function() {
		
		// calc volumes
		// PI*(radius^2)*waterHeight
		V_T1 = Math.PI * (tank1Data['radius_meter'] * tank1Data['radius_meter']) * tank1Data['fillLevel_meter'];
		V_T2 = Math.PI * (tank2Data['radius_meter'] * tank2Data['radius_meter']) * tank2Data['fillLevel_meter'];

		// second
		//console.log('old filllevel 1: '+tank1Data['fillLevel_meter']);
		// step 1: get water vol for tank1
		var V_T1_old = V_T1;
		var V_T2_old = V_T2;

		// calc velocity
	
		var flowSpeed = 0;
		if (tank1Data['fillLevel_meter'] > tank2Data['fillLevel_meter']) {
			flowSpeed = Math.sqrt((2 * gravity) * (tank1Data['fillLevel_meter'] - tank2Data['fillLevel_meter']));
		} else if (tank2Data['fillLevel_meter'] > tank1Data['fillLevel_meter']) {
			flowSpeed = Math.sqrt((2 * gravity) * (tank2Data['fillLevel_meter'] - tank1Data['fillLevel_meter']));
		}
		
		//console.log("flowSpeed is "+flowSpeed);

		lastFlowSpeed = flowSpeed;
		// step 2: get Vol change
		// r sub p in meters
		var R_p = .5;
		var V_flowRate = Math.PI * (pipeData['radius_meter'] * pipeData['radius_meter']) * flowSpeed;
		

		flowUnits = $("#flowUnits option:selected").val();
		//var old_flow = flowMeter._actualValue;
		//console.log('flowSpeed: '+flowSpeed);
		
		var newFlowSpeed = slc.updateValueFlow(flowMeter, flowSpeed, flowUnits, 'm/s');
		// convert time count to milliseconds
		var time = timecount *1000;
		//slc.updateChartData(time, newFlowSpeed);
		highChartDataStaging.push([parseInt(time), Number(newFlowSpeed)]);
		
		
		slc.chartTankHeights(time);
		
		timecount = timecount+timeStep;
		
		//slc.updateChartData(false, newFlowSpeed);
		// get new tank water heights
		if (tank1Data['fillLevel_meter'] > tank2Data['fillLevel_meter']) {
			tank1Data['fillLevel_meter'] = (V_T1_old - (timeStep * V_flowRate)) / (Math.PI * (tank1Data['radius_meter'] * tank1Data['radius_meter']));
			tank2Data['fillLevel_meter'] = (V_T2_old + (timeStep * V_flowRate)) / (Math.PI * (tank2Data['radius_meter'] * tank2Data['radius_meter']));
		} else if (tank2Data['fillLevel_meter'] > tank1Data['fillLevel_meter']) {
			tank1Data['fillLevel_meter'] = (V_T1_old + (timeStep * V_flowRate)) / (Math.PI * (tank1Data['radius_meter'] * tank1Data['radius_meter']));
			tank2Data['fillLevel_meter'] = (V_T2_old - (timeStep * V_flowRate)) / (Math.PI * (tank2Data['radius_meter'] * tank2Data['radius_meter']));
		}

		// now need to update the values for all
		tank1.changeLevel(tank1Data['fillLevel_meter'] * tank1Data['mult_meter']);

		tank2.changeLevel(tank2Data['fillLevel_meter'] * tank2Data['mult_meter']);
		//console.log('1 : '+tank1Data['fillLevel_meter']*tank1Data['mult_meter']);
		//console.log('2 : '+tank2Data['fillLevel_meter']*tank2Data['mult_meter']);

		slc.updateSliderVal(1, tank1._fillLevel);
		slc.updateSliderVal(2, tank2._fillLevel);
		
		//provide value based on what selection is
		
		
	};

/**
 * 
 */
slc.chartTankHeights = function(time){
	if (tickType == 'meters') {
		//slc.updateChartData(time, tank1Data['fillLevel_meter']);
		highChartDataTank1Staging.push([parseInt(time), Number(tank1Data['fillLevel_meter'])]);
		//slc.updateChartData(time, tank2Data['fillLevel_meter']);
		highChartDataTank2Staging.push([parseInt(time), Number(tank2Data['fillLevel_meter'])]);
	} else if(tickType == 'feet'){
		highChartDataTank1Staging.push([parseInt(time), Number(tank1Data['fillLevel_feet'])]);
		highChartDataTank2Staging.push([parseInt(time), Number(tank2Data['fillLevel_feet'])]);
	} else if(tickType == 'inches'){
		highChartDataTank1Staging.push([parseInt(time), Number(tank1Data['fillLevel_inches'])]);
		highChartDataTank2Staging.push([parseInt(time), Number(tank2Data['fillLevel_inches'])]);
	}
};
	/**
	 *
	 */
	slc.getPressure = function() {
		//console.log("get pressure");
		//TODO: first determine which tank we are in
		var gaugeY_actual;
		var gaugeX_actual;
		var pressureHeight;
		var head1;
		var head2;
		var tank1_meter_height;
		var tank1_meter_fillLevel;
		var tank2_meter_fillLevel;
		var tank_mult;
		var pipe_height;
		var pipeFillLevel;
		var pipe_mult;

		if (tickType == 'meters') {
			tank1_meter_height = tank1Data['height_meter'];
			tank2_meter_height = tank2Data['height_meter'];
			tank1_meter_fillLevel = tank1Data['fillLevel_meter'];
			tank2_meter_fillLevel = tank2Data['fillLevel_meter'];
			tank1_mult = tank1Data['mult_meter'];
			tank2_mult = tank2Data['mult_meter'];
			pipe_height = pipeData['height_meter'];
			pipeFillLevel = pipeData['fillLevel_meter'];
			pipe_mult = pipeData['mult_meter'];
		} else if (tickType == 'feet') {
			// need to convert feet to meters
			tank1_meter_height = (tank1Data['height_feet'] * 12) / 39.37;
			tank2_meter_height = (tank2Data['height_feet'] * 12) / 39.37;
			tank1_meter_fillLevel = (tank1Data['fillLevel_feet'] * 12) / 39.37;
			tank2_meter_fillLevel = (tank2Data['fillLevel_feet'] * 12) / 39.37;
			tank1_mult = (tank1Data['mult_feet'] / 12) * 39.37;
			tank2_mult = (tank2Data['mult_feet'] / 12) * 39.37;

			pipe_height = (pipeData['height_meter'] * 12) / 39.37;
			pipeFillLevel = (pipeData['fillLevel_feet'] * 12) / 39.37;
			pipe_mult = (pipeData['mult_feet'] / 12) * 39.37;
		} else if (tickType == 'inches') {
			// need to convert inches to meters
			tank1_meter_height = tank1Data['height_inches'] / 39.37;
			tank2_meter_height = tank2Data['height_inches'] / 39.37;
			tank1_meter_fillLevel = tank1Data['fillLevel_inches'] / 39.37;
			tank2_meter_fillLevel = tank2Data['fillLevel_inches'] / 39.37;
			tank1_mult = tank1Data['mult_inches'] * 39.37;
			tank2_mult = tank2Data['mult_inches'] * 39.37;

			pipe_height = pipeData['height_meter'] * 39.37;
			pipeFillLevel = pipeData['fillLevel_inches'] * 39.37;
			pipe_mult = pipeData['mult_inches'] * 39.37;
		}

		var gaugeY = pressureMeter.getGaugeY();
		var gaugeX = pressureMeter.getGaugeX();
		head1 = tank1_meter_fillLevel + surfacePressure / gamma;
		head2 = tank2_meter_fillLevel + surfacePressure / gamma;
		headpipe = pipeFillLevel + surfacePressure / gamma;

		// calc vals for tank1
		var tank1_calc_height = (tank1Data['height_pixel'] + tank1Data['y_pixel']);
		var tank1_calc_fillLevel = (tank1Data['y_pixel'] + tank1Data['height_pixel']) - tank1Data['fillLevel_pixel'];
		var tank1_calc_width = (tank1Data['radius_pixel'] * 2) + tank1Data['x_pixel'];
		var tank1_calc_height = tank1Data['height_pixel'] + tank1Data['y_pixel'];

		// calc vals for tank2
		var tank2_calc_height = (tank2Data['height_pixel'] + tank2Data['y_pixel']);
		var tank2_calc_fillLevel = (tank2Data['y_pixel'] + tank2Data['height_pixel']) - tank2Data['fillLevel_pixel'];
		var tank2_calc_width = (tank2Data['radius_pixel'] * 2) + tank2Data['x_pixel'];
		var tank2_calc_height = tank2Data['height_pixel'] + tank2Data['y_pixel'];

		// calc values for pipe

		var pipe_calc_height = pipeData['height_pixel'] + pipeData['y_pixel'];
		var pipe_calc_fillLevel = (pipeData['y_pixel'] + pipeData['height_pixel']) - pipeData['fillLevel_pixel'];

		//console.log(pipeFillLevel);
		// between tankheight and tankfillLevel
		if ((gaugeX > tank1Data['x_pixel']) && (gaugeX < tank1_calc_width) && (gaugeY > tank1_calc_fillLevel) && (gaugeY < tank1_calc_height)) {
			//in tank 1
			gaugeY_actual = (gaugeY - tank1Data['y_pixel']) / tank1_mult;
			gaugeX_actual = gaugeX / tank1_mult;
			pressureHeight = tank1_meter_height - gaugeY_actual;

			gaugePressure = gamma * (head1 - pressureHeight);

			slc.updateValue(pressureMeter, gaugePressure, pressureUnits, pressureUnits);

		} else if ((gaugeX > tank2Data['x_pixel']) && (gaugeX < tank2_calc_width) && (gaugeY > tank2_calc_fillLevel) && (gaugeY < tank2_calc_height)) {
			// in tank 2
			gaugeY_actual = (gaugeY - tank2Data['y_pixel']) / tank2_mult;
			gaugeX_actual = gaugeX / tank2_mult;

			pressureHeight = tank2_meter_height - gaugeY_actual;
			gaugePressure = gamma * (head2 - pressureHeight);

			slc.updateValue(pressureMeter, gaugePressure, pressureUnits, pressureUnits);
		} else if ((gaugeX > (pipeData['x_pixel'] - 5)) && (gaugeX < ((pipeData['x_pixel'] + (pipeData['radius_pixel'] * 4) + 5))) && (gaugeY > pipe_calc_fillLevel) && (gaugeY < pipe_calc_height)) {
			// in the pipe
			// include the pixel border for this
			//console.log('in pipe');
			gaugeY_actual = (gaugeY - pipeData['y_pixel']) / pipe_mult;
			gaugeX_actual = gaugeX / pipe_mult;

			pressureHeight = pipe_height - gaugeY_actual;
			gaugePressure = gamma * (headpipe - pressureHeight);

			slc.updateValue(pressureMeter, gaugePressure, pressureUnits, pressureUnits);
		} else {
			// not in a tank
			slc.updateValue(pressureMeter, surfacePressure, pressureUnits, pressureUnits);
		}
	};

	/**
	 *
	 */
	slc.pourTank1 = function() {
		//console.log("animate water into tank1");
	};

	/**
	 *
	 */
	slc.pourTank2 = function() {
		//console.log("animate water into tank2");

	};

	/**
	 *
	 */
	slc.flowFrom1To2 = function() {
		bkgStage.addChild(arrow_right);
		bkgStage.update();
	};

	/**
	 *
	 */
	slc.flowFrom1To2Remove = function() {
		bkgStage.removeChild(arrow_right);
		bkgStage.update();
	};

	/**
	 *
	 */
	slc.flowFrom2To1 = function() {
		bkgStage.addChild(arrow_left);
		bkgStage.update();

	};

	/**
	 *
	 */
	slc.flowFrom2To1Remove = function() {
		bkgStage.removeChild(arrow_left);
		bkgStage.update();
	};

	/**
	 *
	 */
	slc.updateSliderVal = function(tanknum, val) {
		$('#selectedLevel' + tanknum).val(val);
		$("#selectedLevel" + tanknum + "-range-min").slider("value", val);

		if (tanknum == 1) {
			tank1Data['fillLevel_pixel'] = val;
		} else if (tanknum == 2) {
			tank2Data['fillLevel_pixel'] = val;
		}

		slc.calcFillLevelActual();
		slc.getPressure();
	};

	/**
	 *
	 */
	slc.drawBkg = function() {

		//Create sky
		var bgShape = new createjs.Shape();
		bgShape.graphics.beginLinearGradientFill(["#728fce", "#dee0d5", "#dee0d5", "#f4a460"], [.4, .65, .7, .9], 0, 0, 0, bkgStage.canvas.height);
		bgShape.graphics.drawRect(0, 0, bkgStage.canvas.width, bkgStage.canvas.height);
		bgShape.graphics.endFill();
		bkgStage.addChild(bgShape);

		// create ground
		var grndShape = new createjs.Shape();
		grndShape.graphics.beginFill("#A0B873");
		grndShape.graphics.drawRect(0, bkgStage.canvas.height - 100, bkgStage.canvas.width, bkgStage.canvas.height);
		grndShape.graphics.endFill();
		bkgStage.addChild(grndShape);

	};

	/**
	 *
	 */
	slc.drawPressureMeter = function() {

		var props = {
			'radius' : 25,
			'height' : 40,
			'width' : 60,
			'color' : '#CC0000',
			'toMeasure' : 'pressure',
			'units' : pressureUnits,
			'value' : 0,
			'dragEnabled' : true
		};
		pressureMeter = new Gauge(props);
		pressureMeter.x = bkgStage.canvas.width - (drawHeightBuffer);
		pressureMeter.y = tank1Data['height_pixel'] + (drawHeightBuffer*4);

		//console.log("FlowMeter has a click event handler? "+flowMeter.hasEventListener('click'));

		gaugeStage.addChild(pressureMeter);
		gaugeStage.update();
		// check here for bug
		slc.updateValue(pressureMeter, surfacePressure, 'kPa', 'pascals');
		pressureMeter.on("pressup", function pressureMeterPressup(evt) {
			slc.getPressure();
		});
	};

	/**
	 *
	 */
	slc.drawFlowMeter = function() {

		var props = {
			'radius' : 25,
			'height' : 40,
			'width' : 60,
			'color' : '#CCCCCC',
			'toMeasure' : 'flow',
			'units' : flowUnits,
			'value' : flow,
			'dragEnabled' : false
		};
		flowMeter = new Gauge(props);
		flowMeter.x = 185 + (tank1Data['radius_pixel']);
		flowMeter.y = bkgStage.canvas.height - (50) - drawHeightBuffer;
		//console.log("FlowMeter has a click event handler? "+flowMeter.hasEventListener('click'));

		gaugeStage.addChild(flowMeter);
		gaugeStage.update();

		slc.updateValueFlow(flowMeter, 0, 'm/s', 'm/s');
		flowMeter.on("pressup", function flowMeterPressup(evt) {
			var old_units_flow = flowMeter._units;
			flowUnits = $("#flowUnits option:selected").val();
			var old_flow = flowMeter._actualValue;

			slc.updateValueFlow(flowMeter, old_flow, old_units_flow, flowUnits);
		});

	};

	/**
	 *
	 */
	slc.drawTanks = function() {
		var fillLevel1;
		var fillLevel2;
		// to force fill level
		// take pixel_height/unit_height and mult by fill_unit
		if (tickType == 'meters') {
			fillLevel1 = tank1Data['mult_meter'] * tank1Data['fillLevel_meter'];
			fillLevel2 = tank2Data['mult_meter'] * tank2Data['fillLevel_meter'];

		} else if (tickType == 'feet') {
			fillLevel1 = tank1Data['mult_feet'] * tank1Data['fillLevel_feet'];
			fillLevel2 = tank2Data['mult_feet'] * tank2Data['fillLevel_feet'];

		} else if (tickType == 'inches') {
			fillLevel1 = tank1Data['mult_inches'] * tank1Data['fillLevel_inches'];
			fillLevel2 = tank2Data['mult_inches'] * tank2Data['fillLevel_inches'];

		}
		// water level for tank1
		var props2 = {
			'radius' : tank1Data['radius_pixel'],
			'height' : tank1Data['height_pixel'],
			'fillLevel' : fillLevel1,
			'color' : '3399FF'
		};
		// set selectedLevel1 to chosen preset fillLevel
		$('#selectedLevel1').val(fillLevel1);
		tank1 = new Tank(props2);
		tank1.x = tank1Data['x_pixel'];
		tank1.y = tank1Data['y_pixel'] = bkgStage.canvas.height - tank1_y_buffer;

		props2 = null;
		tank1Stage.addChild(tank1);

		// water level for tank2
		var props4 = {
			'radius' : tank2Data['radius_pixel'],
			'height' : tank2Data['height_pixel'],
			'fillLevel' : fillLevel2,
			'color' : '3399FF'
		};

		// set selectedLevel2 to chosen preset fillLevel
		$('#selectedLevel2').val(fillLevel2);
		tank2 = new Tank(props4);
		tank2.x = tank2Data['x_pixel'];
		tank2.y = tank2Data['y_pixel'] = bkgStage.canvas.height - tank2_y_buffer;
		props4 = null;
		tank2Stage.addChild(tank2);

		// outline for pipe between tanks
		var tubeGraphics = new createjs.Graphics();
		tubeGraphics.beginFill(createjs.Graphics.getRGB("0x3399FF", 0.75)).drawRect(pipeData['x_pixel'], pipeData['y_pixel'] - 10, pipeData['radius_pixel'] * 4, pipeData['height_pixel']).endFill();
		var tube = new createjs.Shape(tubeGraphics);

		var tubeGraphicsOutline = new createjs.Graphics();
		tubeGraphicsOutline.setStrokeStyle(4).beginStroke("rgba(0,0,0,1)").drawRect(pipeData['x_pixel'], pipeData['y_pixel'] - 10, pipeData['radius_pixel'] * 4, pipeData['height_pixel']).closePath();
		var tubeOutline = new createjs.Shape(tubeGraphicsOutline);
		// plus outline
		bkgStage.addChild(tube);
		bkgStage.addChild(tubeOutline);

		var bitmap = new createjs.Bitmap("img/flowvalve.png");
		bitmap.x = 100 + (tank1Data['radius_pixel'] * 2) + 12;
		bitmap.y = bkgStage.canvas.height - (140);
		bkgStage.addChild(bitmap);

	};

	/**
	 *
	 */
	slc.calcFillLevelActual = function() {
		// meter
		tank1Data['fillLevel_meter'] = tank1Data['fillLevel_pixel'] / tank1Data['mult_meter'];
		tank2Data['fillLevel_meter'] = tank2Data['fillLevel_pixel'] / tank1Data['mult_meter'];
		// feet
		tank1Data['fillLevel_feet'] = tank1Data['fillLevel_pixel'] / tank1Data['mult_feet'];
		tank2Data['fillLevel_feet'] = tank2Data['fillLevel_pixel'] / tank1Data['mult_feet'];
		// inches
		tank1Data['fillLevel_inches'] = tank1Data['fillLevel_pixel'] / tank1Data['mult_inches'];
		tank2Data['fillLevel_inches'] = tank2Data['fillLevel_pixel'] / tank1Data['mult_inches'];

	};

	/**
	 *
	 */
	//slc.updateChartData = function(flag, value) {
	slc.updateChartData = function(time, value) {	
		//console.log(value);
		//console.log(parseInt(time), Number(value));
		highChartDataStaging.push([parseInt(time), Number(value)]);

		//if (start_time == false) {
		//	start_time = current_time = $.now();
		//} else {
		//	current_time = $.now();
		//}
		//var timer = slc.getSeconds(parseInt(current_time) - parseInt(start_time));
		//var timer = slc.getmSeconds(parseInt(current_time) - parseInt(start_time));
		//var timer = parseInt(current_time) - parseInt(start_time);
		//highChartDataStaging.push([timer,Number(value)]);
		//var d = new Date();
		//var n = d.getMilliseconds();

		//highChartDataStaging.push([n,Number(value)]);
		/*if (flag == 'final') {
			//console.log(timer);
			// just remove the object with the same value
			// to ensure last value matches the value on the interactive
			//console.log(chartData);
			for (var i = chartData.length - 1; i >= 0; i--) {
				console.log(chartData[i][0]);
				if (chartData[i][0] === timer) {
					chartData.splice(i, 1);
					old_timer = false;
				}
			}

			old_timer = false;
		}
		if (timer !== old_timer) {
			*/
			// The x value is the current JavaScript time, which is the Unix time multiplied
			// by 1000.
			//$x = current_time;

			//highChartDataStaging.push([(parseInt(current_time) - parseInt(start_time)), Number(value)]);
			//old_timer = timer;
			/*
			if (tickType == 'meters') {
			newData.push([timer, tank1Data['fillLevel_meter']]);
			} else if (tickType == 'feet') {
			newData.push([timer, tank1Data['fillLevel_feet']]);
			} else if (tickType == 'inches') {
			newData.push([timer, tank1Data['fillLevel_inches']]);
			}
			*/

			//get pressure
			//console.log(new_pressure);
			//newData.push([timer, Number(value)]);
			//newData.push(Number(value));
			/*
			if (tickType == 'meters') {
			newData.push(tank1Data['fillLevel_meter']);
			} else if (tickType == 'feet') {
			newData.push(tank1Data['fillLevel_feet']);
			} else if (tickType == 'inches') {
			newData.push(tank1Data['fillLevel_inches']);
			}
			*/
			//console.log('new value: at time '+timer+' in '+flowUnits+' '+value);
		//}
	};

	/**
	 *
	 */
	slc.getSeconds = function(ms) {
		var num = Number(ms);
		var seconds = Math.floor(num / 1000);
		var minutes = Math.floor(seconds / 60);
		//var seconds = seconds - (minutes * 60);
		var mseconds = ms - (seconds * 1000);
		var format = minutes + ':' + seconds + ':' + mseconds;
		return seconds;

		//return parseFloat(Number(seconds+'.'+mseconds).toFixed(2));
	};

	/**
	 *
	 */
	slc.getmSeconds = function(ms) {
		var num = Number(ms);
		var seconds = Math.floor(num / 1000);
		var minutes = Math.floor(seconds / 60);
		//var seconds = seconds - (minutes * 60);
		var mseconds = ms - (seconds * 1000);
		var format = minutes + ':' + seconds + ':' + mseconds;
		//return seconds;

		return parseFloat(Number(seconds + '.' + mseconds).toFixed(2));
	};

	slc.clearTickMarks = function() {
		tickmarkStage.removeAllChildren();
		tickmarkStage.update();
	};

	/**
	 *
	 */
	slc.drawTickMarks = function() {
		// add tick marks
		tank1_height_convert = tank1Data['height_pixel'];
		tank1_y_convert = tank1.y;
		tank1_x_convert = tank1.x;
		tank2_y_convert = tank2.y;
		tank2_x_convert = tank2.x;
		if (tickType == 'meters') {
			tank1_height_actual_convert = tank1Data['height_meter'];
			tank1_height_mult_convert = tank1Data['mult_meter'];
		} else if (tickType == 'feet') {
			tank1_height_actual_convert = tank1Data['height_feet'];
			tank1_height_mult_convert = tank1Data['mult_feet'];
		} else if (tickType == 'inches') {
			tank1_height_actual_convert = tank1Data['height_inches'];
			tank1_height_mult_convert = tank1Data['mult_inches'];
		}

		var spacing = tickDistance[tickType];
		var counter = 0;
		for (var i = 0; i < tank1_height_convert + tank1_y_convert; i += spacing) {
			var numGraphic = ((tank1_height_actual_convert - ((counter * tickSpacing[tickType])))).toFixed(2);
			if (numGraphic >= 0) {
				var text1 = new createjs.Text(Math.abs(numGraphic), "bold 12px Arial", "#000000");
				var text2 = new createjs.Text(Math.abs(numGraphic), "bold 12px Arial", "#000000");
				text1.x = tank1Data['x_pixel'] - 90;
				text1.y = tank1Data['y_pixel'] + i;

				text2.x = tank2Data['x_pixel'] + (tank2Data['radius_pixel'] * 2) + 60;
				text2.y = tank2Data['y_pixel'] + i;

				var tickmark = new createjs.Graphics();
				tickmark.setStrokeStyle(1).beginStroke("rgba(0,0,0,.25)").moveTo(tank1_x_convert - 55, tank1_y_convert + i).lineTo(tank2_x_convert + 55 + (tank2Data['radius_pixel'] * 2), tank2_y_convert + i).closePath();
				var tickmarkOutline = new createjs.Shape(tickmark);

				tickmarkStage.addChild(tickmarkOutline, text1, text2);
			} else if (numGraphic == 0) {

			}
			counter++;
		}
		tickmarkStage.update();

	};

	/**
	 *
	 */
	slc.initUIElm = function() {
		// draw measure lines on bkg
		// main ruler 1
		var ruler1 = new createjs.Graphics();
		ruler1.setStrokeStyle(10).beginStroke("rgba(0,0,0,1)").moveTo(tank1.x - 50, tank1.y).lineTo(tank1.x - 50, tank1Data['height_pixel'] + tank1.y).closePath();
		var ruler1Outline = new createjs.Shape(ruler1);
		bkgStage.addChild(ruler1Outline);

		// main ruler 2
		var ruler2 = new createjs.Graphics();
		ruler2.setStrokeStyle(10).beginStroke("rgba(0,0,0,1)").moveTo(tank2.x + 50 + (tank2Data['radius_pixel'] * 2), tank2.y).lineTo(tank2.x + 50 + (tank2Data['radius_pixel'] * 2), tank2Data['height_pixel'] + tank2.y).closePath();
		var ruler2Outline = new createjs.Shape(ruler2);

		slc.drawTickMarks();
		bkgStage.addChild(ruler1Outline, ruler2Outline);

		// selectedLevel1 control
		$("#selectedLevel1-range-min").slider({
			value : tank1Data['fillLevel_pixel'],
			min : 0,
			max : tank1Data['height_pixel'],
			orientation : "vertical",
			slide : function selectedLevel1SliderSlide(event, ui) {
				$("#selectedLevel1").val(ui.value);
			},
			change : function selectedLevel1SliderChange(event, ui) {
				$("#selectedLevel1").val(ui.value);
				selectedLevel1 = $('#selectedLevel1').val();
				//console.log(ui.value);
				slc.getSelectedVal(1, selectedLevel1);

				slc.getPressure();
				
			}
		});
		$('#selectedLevel1_actual').val($("#selectedLevel1").val() / tank1Data['mult_meter']);

		slc.getSelectedVal(1, $("#selectedLevel1-range-min").slider("value"));

		// selectedLevel2 control
		$("#selectedLevel2-range-min").slider({
			value : tank2Data['fillLevel_pixel'],
			min : 0,
			max : tank2Data['height_pixel'],
			orientation : "vertical",
			slide : function selectedLevel2SliderSlide(event, ui) {
				$("#selectedLevel2").val(ui.value);
			},
			change : function selectedLevel2SliderChange(event, ui) {
				$("#selectedLevel2").val(ui.value);
				selectedLevel2 = $('#selectedLevel2').val();
				slc.getSelectedVal(2, selectedLevel2);
				slc.getPressure();

			}
		});

		$("#selectedLevel2").val();
		slc.getSelectedVal(2, $("#selectedLevel2-range-min").slider("value"));
		$('.pressure_units').html("(in " + tickType + ")");

		$("#resizable1").resizable({
			helper : "ui-resizable-helper",
			ghost : true
		});
		$('#resizable1').bind('resizestop', function resizable1Stop(event, ui) {
			$('#chart1').height($('#resizable1').height() * 0.96);
			$('#chart1').width($('#resizable1').width() * 0.96);
			// pass in resetAxes: true option to get rid of old ticks and axis properties
			// which should be recomputed based on new plot size.
			plot1.replot({
				resetAxes : {
					yaxis : true,
					y2axis : true
				}
			});
		});

		// initiate tank height, pressure, and flow units in selector
		$('#heightUnits').find('option[value="' + tickType + '"]').attr('selected', true);
		$('#pressureUnits').find('option[value="' + pressureUnits + '"]').attr('selected', true);
		$('#flowUnits').find('option[value="' + flowUnits + '"]').attr('selected', true);

	};

	slc.getSelectedVal = function(index, level) {
		var newVal;
		mult = tank2Data['mult_meter'];

		switch(tickType) {
			case 'meters':
				if (index == 1) {
					newVal = level / tank1Data['mult_meter'];
				} else {
					newVal = level / tank2Data['mult_meter'];
				}
				break;
			case 'feet':
				if (index == 1) {
					newVal = level / tank1Data['mult_feet'];
				} else {
					newVal = level / tank2Data['mult_feet'];
				}
				break;
			case 'inches':
				if (index == 1) {
					newVal = level / tank1Data['mult_inches'];
				} else {
					newVal = level / tank2Data['mult_inches'];
				}
				break;
		}
		$('#selectedLevel' + index + '_actual').val(newVal.toFixed(2));
	};

	// inc surface pressure
	$('#incSurfacePressure').on('change', function increaseSurfacePressureChange() {
		if ($(this).is(':checked')) {
			surfacePressure = surfacePressureValue;
		} else {
			surfacePressure = 0;
		}

	});
	// stopcock handler
	$('#stopCock').on('click', function stopCockClick() {
		//alert('equalizing');
		// reset timer
		timecount = 0;
		// update chart units
		/*highchart.yAxis[0].update({
            tooltip : {
				valueSuffix: ' '+flowUnits
			},
        });
        highchart.yAxis[1].update({
            tooltip : {
				valueSuffix: ' '+tickType
			},
        });
        highchart.yAxis[2].update({
            tooltip : {
				valueSuffix: ' '+tickType
			},
        });
        */
		// swap text
		var val = $(this).val();
		if (val == 'Off') {
			$(this).val('On');
			$(this).html('On');
			// make water flow
			equalize_function = true;
			chartData = [];

			// need to clear the highchart data before re-running chart
			//highchart.destroy();
			slc.drawHighChart();
			// show
			//$('#resizable1').removeClass('hidden');
		} else {
			$(this).val('Off');
			$(this).html('Off');
			// stop water from flowing

			equalize_function = false;
		}
	});

	$('#equalize').on('click', function equalizeClick() {
		// check if stopcock is on
		// if yes, equalize the water
		if ($('#stopCock').val() == 'On') {
			// is tank1 higher or tank2
			equalize_function = true;
		} else {
			equalize_function = false;
		}
	});

	/**
	 *
	 * @param {Object} meterObj  likely the pressuremeter
	 * @param {Object} old_pressure		the calculated pressure value - typically in pascals
	 * @param {Object} new_units		the new units
	 * @param {Object} old_units		the previously used unites
	 */
	slc.updateValue = function(meterObj, old_pressure, new_units, old_units) {
		//console.log("new_units:"+new_units);
		//console.log("old_units:"+old_units);
		//console.log("old_pressure:"+old_pressure);
		switch(new_units) {
			case 'psi':
				if (old_units == 'kPa') {
					new_pressure = ((old_pressure * 1000) / 6894.76);
				} else if (old_units == 'pascals') {
					new_pressure = ((old_pressure) / 6894.76);
				} else if (old_units == 'millibars') {
					new_pressure = ((old_pressure * 100) / 6894.76);
				} else if (old_units == "psi") {
					new_pressure = ((old_pressure) / 6894.76);
				} else {
					console.log('unhandled psi');
					//var new_pressure = ((old_pressure)/6894.76).toFixed(2);
					// change value
					//meterObj.changeValue(new_pressure);
				}
				break;
			case 'kPa':
				if (old_units == 'pascals') {
					new_pressure = old_pressure / 1000;
				} else if (old_units == 'psi') {
					new_pressure = ((old_pressure * 6894.76) / 1000);
				} else if (old_units == 'millibars') {
					new_pressure = (old_pressure / 10);
				} else if (old_units == 'kPa') {
					new_pressure = old_pressure / 1000;
				} else {
					console.log('unhandled kPa');
				}
				break;
			case 'pascals':
				if (old_units == 'kPa') {
					//console.log('in');
					new_pressure = (old_pressure * 1000);
				} else if (old_units == 'psi') {
					new_pressure = (old_pressure * 6894.76);
				} else if (old_units == 'millibars') {
					new_pressure = (old_pressure * 100);
				} else if (old_units == 'pascals') {
					new_pressure = old_pressure;
				} else {
					console.log('unhandled pascals');
				}
				break;
			case 'millibars':
				if (old_units == 'kPa') {
					new_pressure = (old_pressure * 10);
				} else if (old_units == 'psi') {
					new_pressure = ((old_pressure / 100) * 6894.76);
				} else if (old_units == 'pascals') {
					new_pressure = (old_pressure / 100);
				} else if (old_units == 'millibars') {
					new_pressure = (old_pressure / 100);
				} else {
					console.log('unhandled millibars');
				}
				break;
			default:
				// do nothing
				console.log("unhandled");
		}

		meterObj.changeActualValue(new_pressure);
		new_pressure = new_pressure.toFixed(2);
		meterObj.changeValue(new_pressure);
	};
	/**
	 *
	 * @param {Object} meterObj  likely the flowmeter
	 * @param {Object} old_flow		the calculated pressure value - typically in m/s
	 * @param {Object} new_units		the new units
	 * @param {Object} old_units		the previously used unites
	 */
	slc.updateValueFlow = function(meterObj, old_flow, new_units, old_units) {
		//console.log("new_units:"+new_units);
		//console.log("old_units:"+old_units);
		//console.log("old_flow:"+old_flow);
		var new_flow = 0;
		switch(new_units) {
			case 'ft/sec':
				if (old_units == 'm/s') {
					new_flow = old_flow * (3.28084);
				} else if (old_units == 'mph') {
					new_flow = old_flow * (5280 / 3600);
				} else if (old_units == 'km/hr') {
					new_flow = old_flow * (3280 / 3600);
				} else if (old_units == 'ft/sec') {
					new_flow = old_flow;
				} else {
					console.log('unhandled ft/sec');
				}
				break;
			case 'mph':
				if (old_units == 'm/s') {
					new_flow = old_flow * (3600 / 1609.34);
				} else if (old_units == 'ft/sec') {
					new_flow = old_flow * (3600 / 5280);
				} else if (old_units == 'km/hr') {
					new_flow = old_flow / 1.60934;
				} else if (old_units == 'mph') {
					new_flow = old_flow;
				} else {
					console.log('unhandled mph');
				}
				break;
			case 'km/hr':
				if (old_units == 'm/s') {
					new_flow = old_flow * (3600 / 1000);
				} else if (old_units == 'ft/sec') {
					new_flow = old_flow * (3600 / 3280);
				} else if (old_units == 'mph') {
					new_flow = old_flow * 1.60934;
				} else if (old_units == 'km/hr') {
					new_flow = old_flow;
				} else {
					console.log('unhandled km/hr');
				}
				break;
			case 'm/s':
				if (old_units == 'ft/sec') {

					new_flow = old_flow / 3.28084;
				} else if (old_units == 'mph') {

					new_flow = old_flow * (1609.34 / 36000);
				} else if (old_units == 'km/hr') {

					new_flow = old_flow * (1000 / 3600);
				} else if (old_units == 'm/s') {
					new_flow = old_flow;
				} else {
					console.log('unhandled m/s');
				}
				break;
			default:
				// do nothing
				console.log("unhandled");
		}

		meterObj.changeActualValue(new_flow);
		meterObj.changeValue(new_flow.toFixed(2));

		return new_flow;
	};
	// change units for pressure gauge
	$('#pressureUnits').on('change', function pressureUnitChange() {
		slc.drawHighChart();
		var old_units = pressureMeter._units;
		pressureUnits = $("#pressureUnits option:selected").val();
		pressureMeter.changeUnits(pressureUnits);
		var old_pressure = pressureMeter._actualValue;

		if (old_units != pressureUnits) {
			slc.updateValue(pressureMeter, old_pressure, pressureUnits, old_units);
		}
		
	});

	// change units for flow gauge
	$('#flowUnits').on('change', function flowUnitChange() {
		slc.drawHighChart();
		var old_units_flow = flowMeter._units;
		flowUnits = $("#flowUnits option:selected").val();
		flowMeter.changeUnits(flowUnits);
		var old_flow = flowMeter._actualValue;

		if (old_units_flow != flowUnits) {
			slc.updateValueFlow(flowMeter, old_flow, flowUnits, old_units_flow);
		}

		switch(flowUnits){
			case 'm/s':
				highchart.yAxis[0].update({
                	max: 15
        		});
        		break;
			case 'ft/sec':
				highchart.yAxis[0].update({
                	max: 50
        		});
        		//console.log('change to highchart 45');
        		break;
			case 'mph':
				highchart.yAxis[0].update({
                	max: 35
        		});
        		break;
			case 'km/hr':
				highchart.yAxis[0].update({
                	max: 50
        		});
        		break;	
		}
		
	});

	// change units for height
	$('#heightUnits').on('change', function heightUnitChange() {
		slc.drawHighChart();
		//console.log('change height units');
		// update tick type
		tickType = $("#heightUnits option:selected").val();
		// redraw tickmarks
		slc.clearTickMarks();
		slc.drawTickMarks();
		// reset slider bar to neutral and reset selector value (and actual)
		switch(tickType) {
			case 'feet':
				num1 = tank1Data['fillLevel_feet'];
				num2 = tank2Data['fillLevel_feet'];
				break;
			case 'inches':
				num1 = tank1Data['fillLevel_inches'];
				num2 = tank2Data['fillLevel_inches'];
				break;
			case 'meters':
				num1 = tank1Data['fillLevel_meter'];
				num2 = tank2Data['fillLevel_meter'];
				break;

		}
		//console.log(num1);
		$('#selectedLevel1_actual').val(num1);
		$('#selectedLevel2_actual').val(num2);
		//slc.updateSliderVal(1,num1);
		//slc.updateSliderVal(2,num2);

		// reset calculation on pressure gauge

		// recalucalculate values in selector

		// redraw graph?
	});

	// chart
	slc.chartUpdate = function() {
		if (newData.length) {
			b_updatingChart = true;
			var val = newData.shift();

			var newVal = val;
			/* update storedData array*/
			chartData.push(newVal);
			//console.log(chartData);
			slc.drawChart();
			// continue until done
			//setTimeout(slc.chartUpdate, 1);
		} else {
			b_updatingChart = false;
			old_timer = start_time = current_time = false;
			//console.log('done');
		}
	};

	slc.resetFlags = function() {
		current_time = start_time = old_timer = false;

	};

	// need to abstract this out
	slc.drawChart = function() {
		if (plot1) {
			plot1.destroy();
		}
		if (chartData.length > 0) {
			chartOptions = {
				seriesDefaults : {
					showMarker : false
				},
				// Turns on animation for all series in this plot.
				animate : false,
				grid : {
					borderColor : '#255381', // CSS color spec for border around grid.
					shadow : false,
				},
				seriesDefaults : {
					showMarker : true,
					shadow : false,
					color : '#255381'
				},
				series : [{
					markerOptions : {
						style : 'circle',
						shadow : false
					}
				}],
				axesDefaults : {
					min : 0,
					renderer : $.jqplot.CategoryAxisRenderer,
					labelRenderer : $.jqplot.CanvasAxisLabelRenderer,
					tickRenderer : $.jqplot.CanvasAxisTickRenderer,
					tickOptions : {
						mark : 'outside',
						showGridline : true,
						fontSize : '10pt',
						labelPosition : 'middle',
					},
					endOnTick: false
				},
				axes : {
					xaxis : {
						label : 'seconds',
						// need to get this to print out seconds or something
						tickOptions : {
							formatString : "%d ",
							angle : 50
						},
						tickInterval : 1
					},
					yaxis : {
						label : 'Flow (' + flowUnits + ')',
						tickOptions : {
							formatString : "%'d "
						}
					},
				},

				highlighter : {
					show : true,
					sizeAdjust : 10
				}

			};
			plot1 = $.jqplot("chart1", [chartData], chartOptions);
		}
	};

	slc.requestChartData = function() {
		// check staging

		if (highchart.series) {
			if (highChartDataStaging.length > 0) {
				//console.log("Before staging data: "+highChartDataStaging);
				point = highChartDataStaging.shift();
				//console.log("After staging data: "+highChartDataStaging);
				// query the temp data and see if has any data to chart
				var series = highchart.series[0], shift = series.length > 20;
				// shift if series is longer than 20

				// add the point
				highchart.series[0].addPoint(point, true, shift);
			}
		}
		
		if (highchart2.series) {
			if (highChartDataTank1Staging.length > 0) {
				//console.log("Before staging data: "+highChartDataStaging);
				point = highChartDataTank1Staging.shift();
				//console.log("After staging data: "+highChartDataStaging);
				// query the temp data and see if has any data to chart
				var series = highchart2.series[0], shift = series.length > 20;
				// shift if series is longer than 20

				// add the point
				highchart2.series[0].addPoint(point, true, shift);
			}
			
			if (highChartDataTank2Staging.length > 0) {
				//console.log("Before staging data: "+highChartDataStaging);
				point = highChartDataTank2Staging.shift();
				//console.log("After staging data: "+highChartDataStaging);
				// query the temp data and see if has any data to chart
				var series = highchart2.series[1], shift = series.length > 20;
				// shift if series is longer than 20

				// add the point
				highchart2.series[1].addPoint(point, true, shift);
			}
		}
		// call it again after one second
		setTimeout(slc.requestChartData, 100);

	};
	var today_date = new Date();
	var today_year = today_date.getFullYear();
	var today_day = today_date.getDate();
	var today_month = today_date.getMonth();
	var today_min = today_date.getMinutes();
	var today_hour = today_date.getHours();
	var today_sec = today_date.getSeconds();
	var today_msec = today_date.getMilliseconds();

	chart_options = {
		chart : {
			renderTo : 'highchart',
			defaultSeriesType : 'spline',
			events : {
				load : slc.requestChartData
			}
		},
		title: { 
			text: "",
		},
		xAxis : {
			gridLineWidth : 1,
			title : {
				text : 'Time (seconds)'
			},
			labels : {

				rotation : 90,
				align : 'left',
				formatter: function chart1_xAxisformatter() {
			            return (this.value/1000);
			        }
			},
			type : "datetime",
			showFirstLabel : false,
			min : 0,
			max : 3000,
		},
		yAxis : [{ //primary axis
			
			title : {
				text : 'Speed of Flow in Pipe'
			},
			labels : {
				formatter : function chart1_chartYAxisLabelFormatter() {
					return this.value + ' ' + flowUnits;
				}
			},
			showFirstLabel : false,
			min : 0,
			max : 15,
		}],
		tooltip : {
			crosshairs : [true, true],
			shared: true,
			formatter: function chart1_tooltipFormatter() {
                var s = '<b>'+ (this.x/1000) +' seconds</b>';
                
                $.each(this.points, function chart1_tooltipFormatter_each(i, point) {
                    s += '<br/>'+ point.series.name +': ';
                   s += Highcharts.numberFormat(point.y,2)+' '+flowUnits;
                   
                });
                
                return s;
            },
		},
		series : [{
			name : 'Flow in pipe',
			 showInLegend: false,               
			data : [],
			pointStart : 0,
			pointInterval : 250,
		},
		]
	};
	
	
	chart_options2 = {
		chart : {
			renderTo : 'highchart2',
			defaultSeriesType : 'spline',
			events : {
				load : slc.requestChartData
			}
		},
		title: { 
			text: "",
		},
		xAxis : {
			gridLineWidth : 1,
			title : {
				text : 'Time (seconds)'
			},
			labels : {

				rotation : 90,
				align : 'left',
				formatter: function chart2_xAxisformatter() {
			            return (this.value/1000);
			        }
			},
			type : "datetime",
			showFirstLabel : false,
			min : 0,
			max : 3000,
		},
		yAxis : [{ //primary axis
			
			title : {
				text : 'Height of water in tanks'
			},
			labels : {
				formatter : function chart2_chartYAxisLabelFormatter() {
					return this.value + ' ' + flowUnits;
				}
			},
		}],
		tooltip : {
			crosshairs : [true, true],
			shared: true,
			formatter: function chart2_tooltipFormatter() {
                var s = '<b>'+ (this.x/1000) +' seconds</b>';
                
                $.each(this.points, function chart2_tooltipFormatter_each(i, point) {
                    s += '<br/>'+ point.series.name +': ';
                    s += Highcharts.numberFormat(point.y,1)+' '+tickType;
                    
                });
                
                return s;
            },
		},
		series : [
		{
			name: 'Tank 1 water level',
			data: [],
		},
		{
			name: 'Tank 2 water level',
			data: [],
		}]
	};
	

	slc.drawHighChart = function() {
		// first clear series
		if (highchart.series) {
			highchart.series[0].setData([]);
			//highchart.series[1].setData([]);
			//highchart.series[2].setData([]);
			
		} else {
			highchart = new Highcharts.Chart(chart_options);
		}
		if(highchart2.series){
			highchart2.series[0].setData([]);
			highchart2.series[1].setData([]);
			
		} else {
			
			highchart2 = new Highcharts.Chart(chart_options2);
		}
		//console.log(highchart.series[0]);
	};

	slc.drawHighChart();

	slc.init();
})(jQuery);
