( function(window) {
		var FlowGauge = function(obj) {
			
			Gauge.call(this, obj);

			if (obj.units == 'undefined') {
				obj.units = units = 'mph';
			} else {
				units = obj.units;
			}
			// verify the selected units makes sense
			if (units != 'm/s' && units != 'ft/sec' && units != 'mph' && units != 'km/hr') {
				obj.units = units = 'mph';
			}

			
			this._units = units;
			this._unitText;
			
			this.drawTitle = function() {

				//include the type of gauge title
				var title = new createjs.Text("Pressure", "bold 12px Arial", "#000000");
				title.textAlign = "center";
				title.x = this._width / 2;
				title.y = -8;
				this.addChild(title);
			};
			/**
			 *
			 */
			this.drawText = function() {
			
				//this.addChild(this.unitText);
			};

			this.drawTitle();
			//this.drawText();

		};
		FlowGauge.prototype = new Gauge();
		FlowGauge.prototype.constructor = FlowGauge;

		/**
		 * Change the units of the Gauge, clear and redraw
		 * @param {Object} value
		 **/
		FlowGauge.prototype.changeUnits = function(value) {
			this._units = value;
			// update value
			this.text.set({
				text : this._units
			});
			// redraw dial
			this.dial.graphics.clear();
			this.drawDial();
			this.addChild(this.dial);

			//this.circle.updateCache();

		};

		window.FlowGauge = FlowGauge;
	}(window));
