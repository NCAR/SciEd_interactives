( function(window) {
		var PressureGauge = function(obj) {
			Gauge.call(this, obj);

			if (obj.units == 'undefined') {
				obj.units = units = 'psi';
			} else {
				units = obj.units;
			}
			// verify the selected units makes sense
			if (units != 'psi' && units != 'millibars' && units != 'pascals' && units != 'kPa') {
				obj.units = units = 'psi';
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
				this.unitText = new createjs.Text(this._units, "bold 12px Arial", "#000000");
				this.unitText.textAlign = "center";
				this.unitText.y = (this._height / 2) + this._radius+13;
				this.unitText.x = (this._width / 2);

				this.addChild(this.unitText);
			};

			this.drawTitle();
			this.drawText();

		};
		PressureGauge.prototype = new Gauge();
		PressureGauge.prototype.constructor = PressureGauge;

		/**
		 * Change the units of the Gauge, clear and redraw
		 * @param {Object} value
		 **/
		PressureGauge.prototype.changeUnits = function(value) {
			this._units = value;
			// update value
			this.text.set({
				text : this._value + "\r\n" + this._units
			});
			// redraw dial
			this.dial.graphics.clear();
			this.drawDial();
			this.addChild(this.dial);

			//this.circle.updateCache();

		};

		window.PressureGauge = PressureGauge;
	}(window));
