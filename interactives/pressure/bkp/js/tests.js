/*
 * http://qunitjs.com/
 * mock data: http://appendto.com/2010/07/mock-your-ajax-requests-with-mockjax-for-rapid-development/
 * grunt javascript task runner: http://gruntjs.com/
 * ok
 * equal
 * notequal
 * strictequal
 * notstrictequal
 * deepequal - only for simple props
 * notdeepequal
 */
(function($) {
	QUnit.begin(function() {

	});

	QUnit.module("tests for event handlers");


	QUnit.test("test click event handlers", function() {
		var events = $._data($("#stopCock")[0], "events");
		equal(events.click[0].handler.name, "stopCockClick", "Correct click handler attached to #stopCock.");

		/*  this object currently doesn't exist
		 var events = $._data($("#equalize")[0],"events");
		 equal(events.click[0].handler.name, "equalizeClick", "Correct click handler attached.");
		 */
	});


	QUnit.test("test change event handlers", function() {
		var events = $._data($("#incSurfacePressure")[0], "events");
		equal(events.change[0].handler.name, "increaseSurfacePressureChange", "Correct change handler attached to #incSurfacePressure.");

		var events = $._data($("#pressureUnits")[0], "events");
		equal(events.change[0].handler.name, "pressureUnitChange", "Correct change handler attached to #pressureUnits.");

		var events = $._data($("#flowUnits")[0], "events");
		equal(events.change[0].handler.name, "flowUnitChange", "Correct change handler attached to #flowUnits.");

		var events = $._data($("#heightUnits")[0], "events");
		equal(events.change[0].handler.name, "heightUnitChange", "Correct change handler attached to #heightUnits.");

		/* these don't work
		 var events = $._data($("#selectedLevel1-range-min")[0],"events");
		 equal(events.change[0].handler.name, "selectedLevel1SliderChange", "Correct change handler attached to #selectedLevel1-range-min.");

		 var events = $._data($("#selectedLevel2-range-min")[0],"events");
		 equal(events.change[0].handler.name, "selectedLevel2SliderChange", "Correct change handler attached to #selectedLevel2-range-min.");
		 */
	});

	QUnit.module("tests for UI elements");



	QUnit.module("tests for correct num values after actions", {
		setup : function() {
			// set flow units
			$('#flowUnits').val('m/s').trigger('change');
			// set tank height units

			$('#heightUnits').val('meters').trigger('change');
			// set tank1 water height
			// need to set to 10 meters
			// and trigger change event
			// set to height of tank1 in pixels which is 400
			var val1 = 400;
			$('#selectedLevel1-range-min').slider('value', val1);
			// set to height of tank2 in pixels which is 40
			var val2 = 40;
			$('#selectedLevel2-range-min').slider('value', val2);
		},
		teardown : function() {
			// reset to defaults
			// reset to default pixels which is 200
			//var val = 200;
			//$('#selectedLevel1-range-min').slider('value', val);
			//$('#selectedLevel2-range-min').slider('value', val);
		}
	});
	

	QUnit.test("test waterlevel 1 value init", function(assert) {
		assert.equal(Number($('#selectedLevel1_actual').val()), 10, "slider value is correct for #selectedLevel1_actual");
	});
	

	QUnit.test("test waterlevel 2 value init", function(assert) {
		assert.equal(Number($('#selectedLevel2_actual').val()), 1, "slider value is correct for #selectedLevel2_actual");
	});
	// this doesn't work
	/*QUnit.test("test flow after equalize", function(assert) {

		$('#stopCock').trigger("click");
		if(flowMeter){
			alert(flowMeter._actualValue);
			assert.equal(Number(flowMeter._actualValue), 0.85, "flow value is correct");
		} else {
			assert(false, 'flowMeter does not exist - cannot test');
		}
	
	});
	*/

	QUnit.test("test waterlevel 1 value post", function(assert) {
		assert.equal(Number($('#selectedLevel1_actual').val()), 5, "slider value is correct for #selectedLevel1_actual");
	});
	

	QUnit.test("test waterlevel 2 value post", function(assert) {
		assert.equal(Number($('#selectedLevel2_actual').val()), 5, "slider value is correct for #selectedLevel2_actual");
	});


	QUnit.done(function(details) {
		console.log("Total: ", details.total, " Failed: ", details.failed, " Passed: ", details.passed, " Runtime: ", details.runtime);
	});
} )(jQuery);
