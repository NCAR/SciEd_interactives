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

	var newData = [];
	var plot1;
	var b_updatingChart = false;
	var flow = 0;
	var V_T1 = 0;
	var V_T2 = 0;
	var lastFlowSpeed = 0;

	var d3Data1Staging = [];
	var d3Data2Staging = [];

	var flowHtml = '';
	var waterHeightHtml = '';
	
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
		'y_pixel' : 575,
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
	var heightUnits = 'meters';

	// Initial empty data
	let data = [];

	// Set dimensions
	const margin = {top: 20, right: 30, bottom: 30, left: 40},
		width = 800 - margin.left - margin.right,
		height = 400 - margin.top - margin.bottom;

	// Define global variables for the SVG, scales, axes, line, and path
	let svg, x, y, xAxis, yAxis, line, path;
	let svg2, x2, y2, xAxis2, yAxis2, line21, line22, path21, path22;

	/**
	 *	init function - set everything up
	 **/
	slc.init = function ()
	{
		console.log('init');

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


		this.createD31Graph();
		this.createD32Graph();

	};


	slc.createD31Graph = function ()
	{
		console.log('create');
    // Define margins and dimensions
    const margin = {top: 20, right: 30, bottom: 50, left: 80}; // Adjusted margins for axis labels
    const width = 700 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create SVG container
    svg = d3.select("#d3chart1").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set scales
    x = d3.scaleLinear().range([0, width]);  // Linear scale for time in seconds
    y = d3.scaleLinear().range([height, 0]);  // Linear scale for speed in m/s

    // Add x-axis and y-axis groups
    xAxis = svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`);

    yAxis = svg.append("g")
        .attr("class", "y-axis");

    // Create the line
    line = d3.line()
        .x(d => x(d.time))  // x based on time in seconds
        .y(d => y(d.speed));  // y based on speed in m/s

    // Append the line to the SVG
    path = svg.append("path")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5);

    // Add x-axis label
    svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .text("Time (seconds)");

    // Add y-axis label
    svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("y", -margin.left + 15)
        .attr("x", -height / 4)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text("Speed of Flow in Pipe");
	}

	// Function to update the graph with new data
	slc.updateD31Graph = function (data)
	{
// Determine the max y-value and unit label based on flowUnits
    let yUnitLabel;
    switch(flowUnits) {
        case 'm/s':
            yUnitLabel = " m/s";
			yTickStep = '5';
            break;
        case 'ft/sec':
            yUnitLabel = " ft/sec";
			yTickStep = '10';
            break;
        case 'mph':
            yUnitLabel = " mph";
			yTickStep = '5';
            break;
        case 'km/hr':
            yUnitLabel = " km/hr";
			yTickStep = '10';
            break;
        default:
            yUnitLabel = "1";
    }

    // Update the scales
    x.domain([0, d3.max(data, d => Math.ceil(d.time * 2) / 2)]);  // Ensure domain covers the full range and ends at the nearest half-second
    y.domain([0, d3.max(data, d => d.speed)]);  // Speed in specified units

    // Update the axes
    xAxis.call(d3.axisBottom(x).tickFormat(d3.format(".1f")).ticks((d3.max(data, d => Math.ceil(d.time * 2) / 2)) / 0.5));  // Format x-axis to 0.1 and add ticks every 0.5 seconds
    yAxis.call(d3.axisLeft(y).tickFormat(d => `${d}${yUnitLabel}`).ticks(5));  // Format y-axis to include unit and add ticks every 5 units

    // Remove existing gridlines
    svg.selectAll(".grid").remove();

    // Append gridlines to x axis
    svg.append("g")
        .attr("class", "grid")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x)
            .tickSize(-height)  // Adjust tick size to be slightly less than the chart height
            .tickFormat("")
            .ticks((d3.max(data, d => Math.ceil(d.time * 2) / 2)) / 0.5)  // Ensure x-axis ticks every 0.5 seconds
        );

    // Append gridlines to y axis
    svg.append("g")
        .attr("class", "grid")
        .call(d3.axisLeft(y)
            .tickSize(-width)  // Adjust tick size to be slightly less than the chart width
            .tickFormat("")
            .ticks(5)  // Ensure y-axis ticks every 5 units
        );

    // Update the line
    path.datum(data)
        .attr("d", line);

    // Update the points
    const points = svg.selectAll("circle")
        .data(data);

    points.enter().append("circle")
        .attr("fill", "red")
        .attr("r", 5)
        .merge(points)
        .attr("cx", d => x(d.time))
        .attr("cy", d => y(d.speed))
        .append("title") // Append a title element for tooltip
        .text(d => `Time: ${d.time.toFixed(1)} s, Speed: ${d.speed.toFixed(1)} ${flowUnits}`);
    
        points.exit().remove();

		// Add or update the data table in the d3table1 element
		var d3table = document.getElementById("d3table1");
		// Create the table element
		const table = document.createElement("table");
		table.className = "datatable";

		// Create the table header
		const thead = document.createElement("thead");
		const headerRow = document.createElement("tr");

		// Create and append the header cells
		const timeHeader = document.createElement("th");
		timeHeader.textContent = "Time (s)";
		headerRow.appendChild(timeHeader);

		const speedHeader = document.createElement("th");
		speedHeader.textContent = `Speed (${flowUnits})`;
		headerRow.appendChild(speedHeader);

		thead.appendChild(headerRow);
		table.appendChild(thead);

		// Create the table body
		const tbody = document.createElement("tbody");

		// Create and append the data rows
		data.forEach(d => {
			const row = document.createElement("tr");

			const timeCell = document.createElement("td");
			timeCell.textContent = d.time.toFixed(1);
			row.appendChild(timeCell);

			const speedCell = document.createElement("td");
			speedCell.textContent = d.speed.toFixed(2);
			row.appendChild(speedCell);

			tbody.appendChild(row);
		});

		table.appendChild(tbody);

		// Clear the target element and append the new table
		d3table.innerHTML = "";
		d3table.appendChild(table);

	}
slc.createD32Graph = function () {
    console.log('create second graph');
    const margin = {top: 20, right: 30, bottom: 50, left: 80};
    const width = 700 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    svg2 = d3.select("#d3chart2").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    x2 = d3.scaleLinear().range([0, width]);
    y2 = d3.scaleLinear().range([height, 0]);

    xAxis2 = svg2.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`);

    yAxis2 = svg2.append("g")
        .attr("class", "y-axis");

    line21 = d3.line()
        .x(d => x2(d.time))
        .y(d => y2(d.value1)); // Assuming 'value1' is the key for the first line in the second graph

    line22 = d3.line()
        .x(d => x2(d.time))
        .y(d => y2(d.value2)); // Assuming 'value2' is the key for the second line in the second graph

    path21 = svg2.append("path")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5);

    path22 = svg2.append("path")
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 1.5);

    svg2.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .text("Time (seconds)"); // Adjust as needed

    svg2.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("y", -margin.left + 15)
        .attr("x", -height / 4)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text("Height of water in Tanks"); // Adjust as needed
};

slc.updateD32Graph = function (data) {
    // Determine the y-axis unit label based on heightUnits
    let yUnitLabel;
    switch(heightUnits) {
        case 'meters':
			yUnitLabel = " m";
            break;
        case 'feet':
            yUnitLabel = " ft";
            break;
        case 'inches':
            yUnitLabel = " in";
            break;
        default:
            yUnitLabel = "";
    }

    // Update the scales
    x2.domain([0, d3.max(data, d => d.time)]); // Full range of time in seconds
	y2.domain([0, d3.max(data, d => Math.max(d.height1, d.height2))]); // Full range of heights
	
	// Specify the desired number of ticks for the x-axis
    const numberOfXTicks = Math.ceil(d3.max(data, d => d.time) / 2); // Adjust the divisor to control the number of ticks

// Update the axes with specific ticks
    xAxis2.call(d3.axisBottom(x2).tickFormat(d3.format(".1f")).ticks(numberOfXTicks)); // Reduced number of ticks
    yAxis2.call(d3.axisLeft(y2).tickFormat(d => `${d}${yUnitLabel}`).ticks(5)); // Ticks in whole units


    // Remove existing gridlines
    svg2.selectAll(".grid").remove();

    // Append gridlines to x axis
    svg2.append("g")
        .attr("class", "grid")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x2)
            .tickSize(-height)
            .tickFormat("")
            .ticks((d3.max(data, d => d.time)) * 2));

    // Append gridlines to y axis
    svg2.append("g")
        .attr("class", "grid")
        .call(d3.axisLeft(y2)
            .tickSize(-width)
            .tickFormat("")
            .ticks(5));

    // Update the paths for both lines
    path21.datum(data)
        .attr("d", line21);

    path22.datum(data)
        .attr("d", line22);

    // Update the points for line21
    const points21 = svg2.selectAll("circle.height1")
        .data(data);

    points21.enter().append("circle")
        .attr("class", "height1")
        .attr("fill", "blue")
        .attr("r", 5)
        .merge(points21)
        .attr("cx", d => x2(d.time))
        .attr("cy", d => y2(d.height1))
        .append("title")
        .text(d => `Time: ${d.time.toFixed(1)} s, Height1: ${d.height1.toFixed(1)}${yUnitLabel}`);

    points21.exit().remove();

    // Update the points for line22
    const points22 = svg2.selectAll("circle.height2")
        .data(data);

    points22.enter().append("circle")
        .attr("class", "height2")
        .attr("fill", "red")
        .attr("r", 5)
        .merge(points22)
        .attr("cx", d => x2(d.time))
        .attr("cy", d => y2(d.height2))
        .append("title")
        .text(d => `Time: ${d.time.toFixed(1)} s, Height2: ${d.height2.toFixed(1)}${yUnitLabel}`);

    points22.exit().remove();

	
	// Add or update the data table in the d3table1 element
		var d3table = document.getElementById("d3table2");
		// Create the table element
		const table = document.createElement("table");
		table.className = "datatable";

		// Create the table header
		const thead = document.createElement("thead");
		const headerRow = document.createElement("tr");

		// Create and append the header cells
		const timeHeader = document.createElement("th");
		timeHeader.textContent = "Time (s)";
		headerRow.appendChild(timeHeader);

		const height1Header = document.createElement("th");
		height1Header.textContent = `Tank 1 Height (${heightUnits})`;
		headerRow.appendChild(height1Header);
	
		const height2Header = document.createElement("th");
		height2Header.textContent = `Tank 2 Height (${heightUnits})`;
		headerRow.appendChild(height2Header);

		thead.appendChild(headerRow);
		table.appendChild(thead);

		// Create the table body
		const tbody = document.createElement("tbody");

		// Create and append the data rows
		data.forEach(d => {
			const row = document.createElement("tr");

			const timeCell = document.createElement("td");
			timeCell.textContent = d.time.toFixed(1);
			row.appendChild(timeCell);

			const height1Cell = document.createElement("td");
			height1Cell.textContent = d.height1.toFixed(2);
			row.appendChild(height1Cell);

			const height2Cell = document.createElement("td");
			height2Cell.textContent = d.height2.toFixed(2);
			row.appendChild(height2Cell);

			tbody.appendChild(row);
		});

		table.appendChild(tbody);

		// Clear the target element and append the new table
		d3table.innerHTML = "";
		d3table.appendChild(table);
};


	/**
	 *
	 * @param {Object} event
	 */
	slc.tick = function (event)
	{
		//console.log('tick');

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
		if (equalize_function == true)
		{
			
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

				d3Data1Staging.push(
					{
						time: Number((timecount)),
						speed: Number(0)
					}
				);
				slc.updateD31Graph(d3Data1Staging);
			
				//slc.chartTankHeights((timecount) * 1000);
				slc.chartTankHeights((timecount));
				slc.updateD32Graph(d3Data2Staging);

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
			
				tank1Data['fillLevel_pixel'] = selectedLevel1;
			} else if (tank1._fillLevel > selectedLevel1) {
				tank1.changeLevel(selectedLevel1);
				tank1Data['fillLevel_pixel'] = selectedLevel1;
			}

			// compare currentLevel and selected level and change as needed by step
			if (tank2._fillLevel < selectedLevel2) {
				tank2.changeLevel(selectedLevel2);
				
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
	};

	slc.calcFlow = function ()
	{
		//console.log('calc flow');
		
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
	

		lastFlowSpeed = flowSpeed;
		// step 2: get Vol change
		// r sub p in meters
		var R_p = .5;
		var V_flowRate = Math.PI * (pipeData['radius_meter'] * pipeData['radius_meter']) * flowSpeed;
		

		flowUnits = $("#flowUnits option:selected").val();
		
		var newFlowSpeed = slc.updateValueFlow(flowMeter, flowSpeed, flowUnits, 'm/s');

		// convert time count to milliseconds
		var time = timecount * 1000;

		d3Data1Staging.push(
			{
				time: Number((time/1000)),
				speed: Number(newFlowSpeed)
			}
		);

		slc.chartTankHeights(time/1000);
		
		timecount = timecount+timeStep;
		
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
	slc.chartTankHeights = function (time)
	{
		//console.log('chart tank heights');
		if (tickType == 'meters')
		{
			d3Data2Staging.push({time: Number(time), height1: Number(tank1Data['fillLevel_meter']), height2: Number(tank2Data['fillLevel_meter'])});
		} else if(tickType == 'feet'){
			d3Data2Staging.push({time: Number(time), height1: Number(tank1Data['fillLevel_feet']), height2: Number(tank2Data['fillLevel_feet'])});

		} else if(tickType == 'inches'){
			d3Data2Staging.push({time: Number(time), height1: Number(tank1Data['fillLevel_inches']), height2: Number(tank2Data['fillLevel_inches'])});
		}

		
};
	/**
	 *
	 */
	slc.getPressure = function ()
	{
		//console.log('get pressure');
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
	slc.flowFrom1To2 = function ()
	{
		//console.log('flow from 1 to 2');
		bkgStage.addChild(arrow_right);
		bkgStage.update();
	};

	/**
	 *
	 */
	slc.flowFrom1To2Remove = function ()
	{
		//console.log('flow from 1 to 2 remove');
		bkgStage.removeChild(arrow_right);
		bkgStage.update();
	};

	/**
	 *
	 */
	slc.flowFrom2To1 = function ()
	{
		//console.log('flow from 2 to 1');
		bkgStage.addChild(arrow_left);
		bkgStage.update();

	};

	/**
	 *
	 */
	slc.flowFrom2To1Remove = function ()
	{
		//console.log('flow from 2 to 1 remove');
		bkgStage.removeChild(arrow_left);
		bkgStage.update();
	};

	/**
	 *
	 */
	slc.updateSliderVal = function (tanknum, val)
	{
		//console.log('update slider val');
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
	slc.drawBkg = function ()
	{
		//console.log('draw bkg');

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
		//console.log('draw pressure meter');
		var props = {
			'radius' : 25,
			'height' : 40,
			'width' : 60,
			'color' : '#CC0000',
			'toMeasure' : 'pressure',
			'units' : pressureUnits,
			'value' : 0,
			'dragEnabled': true,
			'onMove': function ()
			{
				slc.getPressure();
                gaugeStage.update(); // Ensure the gauge stage is updated
			}
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
		//console.log('draw flow meter');
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
	slc.drawTanks = function ()
	{
		//console.log('draw tanks');
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
	slc.calcFillLevelActual = function ()
	{
		//console.log('calcfilllevelactual');
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
	slc.drawTickMarks = function ()
	{
		
		//('draw tick marks');
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
	slc.initUIElm = function ()
	{
		
		//console.log('init UI Elm');
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

		// initiate tank height, pressure, and flow units in selector
		$('#heightUnits').find('option[value="' + tickType + '"]').attr('selected', true);
		$('#pressureUnits').find('option[value="' + pressureUnits + '"]').attr('selected', true);
		$('#flowUnits').find('option[value="' + flowUnits + '"]').attr('selected', true);

	};

	slc.getSelectedVal = function (index, level)
	{
		
		//console.log('get selected val');
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
	$('#stopCock').on('click', function stopCockClick()
	{
		//console.log('stop cock on click');
		// reset timer
		timecount = 0;

		// swap text
		var val = $(this).val();
		if (val == 'Off') {
			$(this).val('On');
			$(this).html('On');
			// make water flow
			equalize_function = true;

			d3Data1Staging = [];
			d3Data2Staging = [];


			// show
		} else {
			$(this).val('Off');
			$(this).html('Off');
			// stop water from flowing

			equalize_function = false;
		}
	});

	$('#equalize').on('click', function equalizeClick()
	{
		//console.log('equialize on click');
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
	slc.updateValue = function (meterObj, old_pressure, new_units, old_units)
	{
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
	slc.updateValueFlow = function (meterObj, old_flow, new_units, old_units)
	{
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
	$('#pressureUnits').on('change', function pressureUnitChange()
	{
		var old_units = pressureMeter._units;
		pressureUnits = $("#pressureUnits option:selected").val();
		pressureMeter.changeUnits(pressureUnits);
		var old_pressure = pressureMeter._actualValue;

		if (old_units != pressureUnits) {
			slc.updateValue(pressureMeter, old_pressure, pressureUnits, old_units);
		}
		
	});

	// change units for flow gauge
	$('#flowUnits').on('change', function flowUnitChange()
	{

		var old_units_flow = flowMeter._units;
		flowUnits = $("#flowUnits option:selected").val();
		this.flowUnits = flowUnits;
		flowMeter.changeUnits(flowUnits);
		var old_flow = flowMeter._actualValue;

		if (old_units_flow != flowUnits) {
			slc.updateValueFlow(flowMeter, old_flow, flowUnits, old_units_flow);
		}
		
	});

	// change units for height
	$('#heightUnits').on('change', function heightUnitChange()
	{

		// update tick type
		tickType = $("#heightUnits option:selected").val();
		this.heightUnits = tickType;
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

	});


	slc.init();
})(jQuery);
