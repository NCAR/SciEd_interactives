( function(window) {
		function Gauge(obj) {

			var _this = this;
			

			// provide defaults
			radius = typeof obj.radius !== 'undefined' ? obj.radius : 5;
			height = typeof obj.height !== 'undefined' ? obj.height : 30;
			width = typeof obj.width !== 'undefined' ? obj.width : 30;
			color = typeof obj.color !== 'undefined' ? obj.color : "#FFE900";
			value = typeof obj.value !== 'undefined' ? obj.value : 0;
			dragEnabled = typeof obj.dragEnabled !== 'undefined' ? obj.dragEnabled : false;

			this.initialize(radius, height, width, color, value, dragEnabled);
		}

		//Inheritance from Container
		var p = Gauge.prototype = new createjs.Container();
		p.Container_initialize = Gauge.prototype.initialize;
		p.Container_tick = Gauge.prototype._tick;
		var boxBuffer = 10;
		/**
		 *
		 */
		p.initialize = function(radius, height, width, color, value, dragEnabled) {
			//call to initialize() method from parent class
			this.Container_initialize();

			this._radius = radius;
			this._height = height;
			this._width = width;
			this._color = color;
			this._value = value;
			this._actualValue = value;
			var _dragEnabled = dragEnabled;
			this._hex = "0x" + this._color;
			var box;
			this.text;
			this.dial;
			var meter;
			this.boundingBox;
			this._measureX = -boxBuffer;
			this._measureY = this._height / 2;

			//this.circle.cache(-this._width/2,-this._width/2,this._width*2,this._width*2);

			/**
			 *
			 **/
			this.drawBox = function() {
				box = new createjs.Shape();
				// need to add some buffer at the bottom so text will fit
				box.graphics.beginFill(this._color).drawRect(0, -boxBuffer, this._width, this._height + (boxBuffer * 3), 5).endFill();
				box.graphics.setStrokeStyle(2).beginStroke("rgba(0,0,0,1)").drawRect(0, -boxBuffer, this._width, this._height + (boxBuffer * 3), 5).endStroke();
				// draw a white dial
				box.graphics.beginFill("#ffffff").drawCircle((this._width / 2), (this._height / 2), this._radius).endFill();


				this.addChild(box);

			};

			/**
			 *
			 */
			this.drawTickMarks = function() {
				var tickCont = new createjs.Container();
				tickCont.x = (this._width / 2);
				tickCont.y = (this._height / 2);
				for ( deg = 0; deg <= 360; deg += 36) {// rotate to create 10 markers
					var radius = 2;
					// default size of markers
					var ticks = new createjs.Shape();
					ticks.graphics.beginFill("#CC0000").drawCircle(0, this._radius - (boxBuffer / 2), radius).endFill();
					ticks.rotation = deg;
					// draw markers for all 60 minutes
					tickCont.addChild(ticks);
				}
				// add tick marks to object

				this.addChild(tickCont);
			};

			/**
			 *
			 */
			this.drawDial = function() {
				this.dial = new createjs.Shape();
				this.dial.x = (this._width / 2);
				this.dial.y = (this._height / 2);

				Math.TAU = 2 * Math.PI;
				//TODO: math likely needs help
				var hArmRadians = Math.TAU * (this._value / 12);
				// console.log(hArmRadians);
				var hArmLength = this._radius;
				//  this is where the x and y value the other end of the arm should point to
				var targetX = Math.floor(Math.cos(hArmRadians - (Math.TAU / 4)) * hArmLength);
				var targetY = Math.floor(Math.sin(hArmRadians - (Math.TAU / 4)) * hArmLength);

				//console.log(targetX);
				//console.log(targetY);
				this.dial.graphics.setStrokeStyle(2).beginStroke('#666666').moveTo(0, 0).lineTo(targetX, targetY).endStroke();
				this.addChild(this.dial);

			};

			/**
			 *
			 */
			this.drawText = function() {
				this.text = new createjs.Text(this._value, "bold 12px Arial", "#000000");
				this.text.textAlign = "center";
				this.text.y = (this._height / 2) + this._radius;
				this.text.x = (this._width / 2);

				this.addChild(this.text);
			};

			/**
			 *
			 */
			this.drawGauge = function() {
				meter = new createjs.Shape();
				// need to add some buffer at the bottom so text will fit
				meter.graphics.beginFill(this._color).moveTo(0, -boxBuffer).lineTo(-boxBuffer, -boxBuffer).lineTo(0, 0).endFill();
				meter.graphics.setStrokeStyle(2).beginStroke('#000000').moveTo(0, -boxBuffer).lineTo(-boxBuffer, -boxBuffer).lineTo(0, 0).endStroke();
				// draw a circle centered at point to be indicator
				//meter.x = -10;
				//meter.y = this._height/2;
				meter.measureX = -10;
				meter.measureY = 0;
				//meter.graphics.beginFill(this._color).drawCircle(-10,this._height/2,2).endFill();
				//meter.graphics.setStrokeStyle(1).beginStroke('#000000').drawCircle(-10,this._height/2,2).endStroke();

				this.addChild(meter);
			};

			// background box
			this.drawBox();
			// tick marks
			this.drawTickMarks();
			// dial
			this.drawDial();
			// text
			this.drawText();
			// meter
			this.drawGauge();

			var hit = new createjs.Shape();
			hit.graphics.beginFill("#000").drawRect(0, -boxBuffer, this._width, this._height + (boxBuffer * 2));
			this.hitArea = hit;

			// event handlers
			this.on("click", this.handleClick);
			if (dragEnabled == true) {
				this.on("pressmove", this.handleDrag);
			}
			this.mouseChildren = false;
			this.cursor = "pointer";

			this.on("pressup", function(evt) {
				this.getCoords(evt);
			});

		};
		p.getCoords = function(evt) {
			this._measureY = evt.stageY - boxBuffer;
			this._measureX = evt.stageX - boxBuffer;

		};
		/**
		 *
		 */
		p.handleDrag = function(evt) {
			evt.target.x = evt.stageX;
			evt.target.y = evt.stageY;
		};

		/**
		 *
		 */
		p.handleClick = function(event) {
			var target = event.target;
			//alert("You clicked on a button: ");
		};

		/*
		*  Drawing Functions
		*/

		/**
		 * Change the actual, un rounded value of the Gauge.  This value is for calculations
		 * @param {Object} value
		 **/
		p.changeActualValue = function(value) {
			this._actualValue = value;
		};
		/**
		 * Change the value of the Gauge, clear and redraw
		 * @param {Object} value
		 **/
		p.changeValue = function(value) {
			this._value = value;

			// update value
			this.text.set({
				text : this._value
			});
			// redraw dial
			this.dial.graphics.clear();
			this.drawDial();
			this.addChild(this.dial);

		};

		/**
		 *
		 */
		p.getGaugeY = function() {
			return this._measureY;
		};
		/**
		 *
		 */
		p.getGaugeX = function() {
			return this._measureX;
		};

		/**
		 *
		 */
		p._tick = function() {
			this.Container_tick();
		};

		window.Gauge = Gauge;
	}(window));
