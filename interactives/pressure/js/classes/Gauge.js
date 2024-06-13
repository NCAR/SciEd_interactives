(function (window) {
	
	var pressure_units = new Array('psi','millibars','pascals','kPa');
	var flow_units = new Array('m/s','ft/sec','mph','km/hr');
    function Gauge(obj) {
    	var self = this;
    	//Container.apply(self);
    	// provide defaults
	  	radius = typeof obj.radius !== 'undefined' ? obj.radius : 5;
    	height = typeof obj.height !== 'undefined' ? obj.height : 30;
	  	width = typeof obj.width !== 'undefined' ? obj.width : 30;
	  	color = typeof obj.color !== 'undefined' ? obj.color : "#FFE900";
	  	value = typeof obj.value !== 'undefined' ? obj.value : 0;
	  	dragEnabled = typeof obj.dragEnabled !== 'undefined' ? obj.dragEnabled : false;

	  	// toMeasure can only be pressure or flow at this point
	  	if(obj.toMeasure != 'pressure' && obj.toMeasure != 'flow'){
	  		obj.toMeasure = toMeasure = 'pressure';
	  	} else {
	  		toMeasure = obj.toMeasure;
	  	}
	  	if(obj.units == 'undefined'){
	  		// pick default units based on what is being measured
	  		if(toMeasure == 'pressure'){
	  			obj.units = units = 'kPa';
	  		} else if (toMeasure == 'flow'){
	  			obj.units = units = 'mph';
	  		}
	  	} else {
	  		units = obj.units;
	  	}
    	// verify the selected units makes sense
    	if((units == 'psi' || units == 'millibars' || units == 'pascals' || units == 'kPa') && toMeasure == 'flow'){
    		// impossible set to default
	  		obj.units = units = 'mph';
    	} else if((units == 'm/s' || units == 'ft/sec' || units == 'mph' || units == 'km/hr') && toMeasure == 'pressure'){
    		// impossible set to default
	  		obj.units = units = 'kPa';
    	}
    	
		this.initialize(radius, height, width, color, toMeasure, units, value, dragEnabled);
		if (dragEnabled)
		{
			this.enableKeyboardControls(obj.onMove);
		}
    }
    //Inheritance from Container
    var p = Gauge.prototype = new createjs.Container();
    p.Container_initialize = Gauge.prototype.initialize;
    p.Container_tick = Gauge.prototype._tick;
    var boxBuffer = 10;
     /**
      * 
      */
    p.initialize = function (radius,height,width,color,toMeasure,units,value,dragEnabled) {
        //call to initialize() method from parent class
        this.Container_initialize(); 
        
        this._radius = radius;
        this._height = height;
        this._width = width;
        this._color = color;
        this._toMeasure = toMeasure;
        this._units = units;
        this._maxTick = 100;
        this._value = value;
        this._actualValue = value;
        var _dragEnabled = dragEnabled;
        this._hex = "0x"+this._color;
        var box;
        this.text;
        this.dial;
        var meter;
        this.unitChanger = new createjs.Shape();
    	
    	
        this.boundingBox;
        this._measureX = -boxBuffer;
        this._measureY = this._height/2;
		
	    //this.circle.cache(-this._width/2,-this._width/2,this._width*2,this._width*2);
       
        // set maxTick
     	this.setMaxTick = function(){
     	if(this._toMeasure == 'pressure'){
        	switch(this._units){
        		case 'psi':
        			this._maxTick = 30;
        			break;
        		case 'millibars':
        			this._maxTick = 2000;
        			break; 
        		case 'pascals':
        			this._maxTick = 200000;
        			break;
        		case 'kPa':
        			this._maxTick = 200;
        			break;
	    	}
       
        } else if(this._toMeasure == 'flow'){
        	switch(this._units){
        		case 'm/s':
        			this._maxTick = 15;
        			break;
        		case 'ft/sec':
        			this._maxTick = 50;
        			break; 
        		case 'mph':
        			this._maxTick = 35;
        			break;
        		case 'km/hr':
        			this._maxTick = 50;
        			break;
	    	}
        }
     };
		
	/**
     * 
    **/
    this.drawBox = function(){
   		box = new createjs.Shape();
	    // need to add some buffer at the bottom so text will fit
	    box.graphics.beginFill(this._color).drawRect(0,-boxBuffer,this._width,this._height+(boxBuffer*3),5).endFill();
	    box.graphics.setStrokeStyle(2).beginStroke("rgba(0,0,0,1)").drawRect(0,-boxBuffer,this._width,this._height+(boxBuffer*3),5).endStroke();
	    // draw a white dial
	    //box.graphics.beginFill("#ffffff").drawCircle((this._width/2),(this._height/2),this._radius).endFill();
        box.graphics.beginFill("#ffffff").arc((this._width/2),(this._height/2)+boxBuffer,this._radius, 0, Math.PI, true).endFill();
         //include the type of gauge title
	    var title = new createjs.Text(this._toMeasure, "bold 12px Arial","#000000");
        title.textAlign ="center";
        title.x = this._width/2;
        title.y = -8;
        this.addChild(box,title);
        
   	};
   	
   	/**
     * 
     */
    this.drawTickMarks = function(){
    	var tickCont = new createjs.Container();
        tickCont.x = (this._width/2);
        tickCont.y = (this._height/2)+boxBuffer;
		for(deg = 90; deg <= 270; deg+= 36) { // rotate to create 10 markers
 			var radius = 2; // default size of markers
			var ticks = new createjs.Shape();
        	ticks.graphics.beginFill("#CC0000").drawCircle(0,this._radius-(boxBuffer/2),radius).endFill();
			ticks.rotation = deg; // draw markers for all 60 minutes
   			tickCont.addChild(ticks);
   		}
   		// add tick marks to object
   		
        this.addChild(tickCont);
    };
    
    /**
     * 
     */
    this.drawDial = function(){
    	// initiate dial at bottom
    	/*this.dial = new createjs.Shape();
        this.dial.x = (this._width/2);
        this.dial.y = (this._height/2)+boxBuffer;
        
        Math.TAU = 2 * Math.PI;
        //TODO: math likely needs help
        //var hArmRadians = Math.TAU * (this._value/12);
        var hArmRadians = Math.TAU * (this._value);
       // console.log(hArmRadians);
		var hArmLength = this._radius;
		//  this is where the x and y value the other end of the arm should point to
		var targetX = Math.floor(Math.cos(hArmRadians - (Math.TAU/2)) * hArmLength);
		var targetY = Math.floor(Math.sin(hArmRadians - (Math.TAU/2)) * hArmLength);

       // console.log(targetX);
        //console.log(targetY);
        this.dial.graphics.setStrokeStyle(2).beginStroke('#666666').moveTo(0,0).lineTo(targetX,targetY).endStroke();
        this.addChild(this.dial);*/
       
       this.dial = new createjs.Shape();
       //this.dial.x = (this._width/2);
       //this.dial.y = (this._height/2)+boxBuffer;
       
       
        var iValAsAngle = this.convertValueToAngle(this._value);
        
    	var iValAsAngleRad = this.degToRad(iValAsAngle);
       // console.log(this._value +' is '+ iValAsAngleRad);
    	var innerTickX = this._radius - (Math.cos(iValAsAngleRad));
    	var innerTickY = this._height - ((Math.sin(iValAsAngleRad))+(boxBuffer/2));
 
        var fromX = ((this._width/2) - this._radius) + innerTickX;
	    var fromY = ((this._height/2) - this._radius) + innerTickY;
	 
	    var endNeedleX = this._radius - (Math.cos(iValAsAngleRad) * this._radius);
	    var endNeedleY = this._radius - (Math.sin(iValAsAngleRad) * this._radius)+(boxBuffer);
	    var toX = ((this._width/2) - this._radius) + endNeedleX;
	    var toY = ((this._height/2) - this._radius) + endNeedleY;
       
       this.dial.graphics.setStrokeStyle(2).beginStroke('#666666').moveTo(fromX,fromY).lineTo(toX,toY).endStroke();
       this.addChild(this.dial);
        
    };
    
    /**
     * 
     */
    this.drawText = function(){
    	this.text = new createjs.Text(this._value+"\r\n"+this._units, "bold 12px Arial","#000000");
        this.text.textAlign ="center";
        this.text.y = (this._height/2) + this._radius - boxBuffer;
        this.text.x = (this._width/2);
        
        this.addChild(this.text);
    };
    
    /**
     * 
     */
    this.drawUnitChanger = function(){
    	this.unitChanger.graphics.beginFill("black");
		this.unitChanger.graphics.setStrokeStyle(2).beginStroke("rgba(0,0,0,1)").drawRect(0,this._height+(boxBuffer*2),this._width,10,5).endStroke();
		this.unitChanger.graphics.beginFill(this._color).drawRect(0,this._height+(boxBuffer*2),this._width,10,5).endFill();
    	// add change units text
    	var btnTxt = new createjs.Text('Change Units', "bold 8px Arial","#000000");
        btnTxt.textAlign ="center";
        btnTxt.x = this._width/2;
        btnTxt.y = this._height+22;
        this.addChild(this.unitChanger,btnTxt);
    };
    /**
     * 
     */
    this.drawGauge = function(){
    	meter = new createjs.Shape();
	    // need to add some buffer at the bottom so text will fit
	    meter.graphics.beginFill(this._color).moveTo(0,-boxBuffer).lineTo(-boxBuffer,-boxBuffer).lineTo(0,0).endFill();
	    meter.graphics.setStrokeStyle(2).beginStroke('#000000').moveTo(0,-boxBuffer).lineTo(-boxBuffer,-boxBuffer).lineTo(0,0).endStroke();
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
        this.setMaxTick();
        
        // unitChanger
        this.drawUnitChanger();

		var hit = new createjs.Shape();
		// hit area needs to encompas all of the object
		hit.graphics.beginFill("#000").drawRect(-boxBuffer,-boxBuffer,this._width,this._height+(boxBuffer*2)+20);
		this.hitArea = hit;
		
		// event handlers
		this.on("click", this.handleClick);

		if(dragEnabled == true){
			this.on("pressmove", this.handleDrag);
		}
		this.mouseChildren = false;
		this.cursor = "pointer";

		this.on("pressup", function gaugePressup(evt) { 
			//this.getCoords(evt);
		});
		
		this.unitChanger.on("click", function gaugeUnitChangerClick(event) {
        	
        	this.handleUnitChanger(evt);
    	});
		
    };
    p.getCoords = function(evt){
    	//console.log(evt.stageY);
    	// need to get value at point
    	
    	this._measureY = evt.stageY;
    	this._measureX = evt.stageX;
    	//console.log(this._measureX+','+this._measureY);
    };
    /**
     * 
     */
	p.handleDrag = function (evt) {    
		evt.target.x = evt.stageX+boxBuffer;
    	evt.target.y = evt.stageY+boxBuffer;
    	
    	this.getCoords(evt);
	};
   
    p.handleUnitChanger = function(evt){
		//alert(evt.currentTarget);
		//alert("You clicked on a button: ");
		//if click in unit area, then change the units

		if(this._toMeasure == 'pressure'){
			//console.log(pressure_units);
			var index = pressure_units.indexOf(this._units);
			//console.log(this._units+" is at index" + index);
			index++;

			if(index >= pressure_units.length){
				index = 0;
			}
			
			//console.log(pressure_units[index]+" is at index" + index);
			this._units = pressure_units[index];
		} else if(this._toMeasure == 'flow'){
			var index = flow_units.indexOf(this._units);
			//console.log(this._units+" is at index" + index);
			index++;

			if(index >= flow_units.length){
				index = 0;
			}
			
			//console.log(pressure_units[index]+" is at index" + index);
			this._units = flow_units[index];
			// need to also trigger change in values and let stage know
			
		}
		
    };
    /**
     * 
     */
	p.handleClick = function (evt) {    
		var target = evt.target;
		
		var clickLoc = evt.stageY - evt.target.y - (boxBuffer) ;

		// only if between height and extra for button
		if(clickLoc < (this._height+(boxBuffer*2)) &&
		   clickLoc > this._height){
			this.handleUnitChanger(evt);
		}
	};
   
    /*
     *  Drawing Functions
     */
    
    
    
     /**
     * Change the actual, un rounded value of the Gauge.  This value is for calculations
 	 * @param {Object} value
    **/
    p.changeActualValue = function(value){
    	this._actualValue = value;
    };
    /**
     * Change the value of the Gauge, clear and redraw
 	 * @param {Object} value
    **/
    p.changeValue = function(value){
    	this._value = value;
    	// update value
    	//console.log('dial value changed to '+this._value);
    	this.text.set({text:this._value+"\r\n"+this._units});
    	// redraw dial
    	this.dial.graphics.clear();
    	this.drawDial();
        this.addChild(this.dial);
    	
    	
    };
    
 	/**
     * Change the units of the Gauge, clear and redraw
 	 * @param {Object} value
    **/
    p.changeUnits = function(value){
    	//console.log("caller is " + arguments.callee.caller);
    	this._units = value;
    	//console.log('units changed to '+this._units);
    	// update value
    	this.text.set({text:this._value+"\r\n"+this._units});
    	// redraw dial
    	this.dial.graphics.clear();
    	this.drawDial();
        this.addChild(this.dial);
    	
    	//this.circle.updateCache();
    	this.setMaxTick();
    	
    };
    
    
    p.convertValueToAngle = function(val) {
		/* Helper function to convert a speed to the
		* equivelant angle.
		*/
		var convert = 180/this._maxTick;

		var iSpeed = (val * convert)/20;
		
		//iSpeedAsAngle = ((iSpeed * 20) + 10) % 180;
		iSpeedAsAngle = ((iSpeed * 20)) % 180;
		
		// Ensure the angle is within range
		if (iSpeedAsAngle > 180) {
		        iSpeedAsAngle = iSpeedAsAngle - 180;
		} else if (iSpeedAsAngle < 0) {
		        iSpeedAsAngle = iSpeedAsAngle + 180;
		}

		return iSpeedAsAngle;
		
		
	};
	
	p.degToRad = function(angle) {
		// Degrees to radians
		return ((angle * Math.PI) / 180);
	};
	/**
	 * 
	 */
	p.getGaugeY = function(){
		return this._measureY;
	};/**
	 * 
	 */
	p.getGaugeX = function(){
		return this._measureX;
	};
  
   /**
     * 
     */
    p._tick = function () {
    	this.Container_tick(); 
	};
	
    
	p.enableKeyboardControls = function(onMoveCallback) {
		var self = this;
        window.addEventListener("keydown", function(event) {
			var step = 10; // The distance to move the gauge with each key press
			var moved = false;
            switch(event.key) {
                case "w":
					self.y -= step;
					moved = true;
                    break;
                case "s":
					self.y += step;
					moved = true;
                    break;
                case "a":
					self.x -= step;
					moved = true;
                    break;
                case "d":
					self.x += step;
					moved = true;
                    break;
			}
			if (moved) {
                self.getCoords({ stageX: self.x, stageY: self.y });
                self.getStage().update(); // Ensure the stage is updated

                if (typeof onMoveCallback === 'function') {
                    onMoveCallback();
                }
            }
        });
    };
    window.Gauge= Gauge;
} (window));


