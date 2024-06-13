(function (window) {
	var pi = Math.PI, twoPi = 2 * pi
    function Tank(obj) {
    	// provide defaults
	  	radius = typeof obj.radius !== 'undefined' ? obj.radius : 5;
    	height = typeof obj.height !== 'undefined' ? obj.height : 30;
	  	fillLevel = typeof obj.fillLevel !== 'undefined' ? obj.fillLevel : 10;
	  	color = typeof obj.color !== 'undefined' ? obj.color : "#FFE900";
	  	toDraw = typeof obj.toDraw !== 'undefined' ? obj.toDraw : "both";
    	
    	
        this.initialize(radius,height,fillLevel,color,toDraw);
    }
    //Inheritance from Container
    var p = Tank.prototype = new createjs.Container();
    p.Container_initialize = Tank.prototype.initialize;
    p.Container_tick = Tank.prototype._tick;
     
     /**
      * 
      */
    p.initialize = function (radius,height,fillLevel,color,toDraw) {
        //call to initialize() method from parent class
        this.Container_initialize();  
        this._radius = radius;
        this._height = height;
        this._fillLevel = fillLevel;
        this._color = color;
        this._toDraw = toDraw;
        this._hex = "0x"+this._color;
        
        this.tankOutline = new createjs.Graphics(); 
        this.water = new createjs.Graphics(); 
      	// fill tank with water
    	this.drawTankWater();
    	
    	// draw tank outline
    	this.drawTankOutline();
    	
        this.tank= new createjs.Shape(this.water);
		this.tankOutline = new createjs.Shape(this.tankOutline);
        this.addChild(this.tank);
        this.addChild(this.tankOutline);
    };
    
    /**
     *	tick method 
     */
    p._tick = function () {
    	//call to _tick method from parent class
    	this.Container_tick();
        
    };


    /**
     * 	draw the water in the tank using two ellipses for the top and bottom and a rectangle that meets each
     *  ellipse in the middle
     */
    p.drawTankWater = function(){
    	var i, xPos, yPos;
    	
    	// top ellipse
    	this.water
    	.beginFill(createjs.Graphics.getRGB(this._hex, .75))
		.drawEllipse(0,this._height-this._fillLevel-((this._height/12)/2),this._radius*2,this._height/12).endFill();
		// main water
    	this.water
    	.beginFill(createjs.Graphics.getRGB(this._hex, 0.5))
    	.drawRect(0,this._height-this._fillLevel,(this._radius*2),this._fillLevel)
    	.endFill();	
    	// bottom ellipse
    	this.water.beginFill(createjs.Graphics.getRGB(this._hex, .75))
	    .moveTo(0, 0 + this._height / 12)
	    .lineTo(0, 0 + this._height - this._height / 12)
		.drawEllipse(0,this._height-((this._height/12)/2),this._radius*2,this._height/12)
    	.endFill();
    };
    
    /**
     * 	Draw just the outline of the tank using an sllipse for the top and bottom and 
     *  a rectangle that meets in the middle
     */
    p.drawTankOutline = function(){
    	var i, xPos, yPos;
    	this.tankOutline
    	.setStrokeStyle(4)
    	.beginStroke("rgba(0,0,0,1)")
    	.drawEllipse(0,-((this._height/12)/2),this._radius*2,this._height/12)
	    .moveTo(0, -(this._height / 12) + this._height / 12)
	    .lineTo(0, (this._height / 12) + this._height - this._height / 12)
	    .drawEllipse(0,this._height-((this._height/12)/2),this._radius*2,this._height/12)
	    .moveTo(0 + (this._radius*2), (this._height / 12) - this._height / 12)
	    .lineTo(0 + (this._radius*2), (this._height / 12) + this._height - this._height / 12)
	    .closePath();
    };
    /**
     * Change the level of the water of the Tank, clear just the water and redraw
 	 * @param int value	the height of the tank
    **/
    p.changeLevel = function(value){
    	this._fillLevel = value;
    	this.water.clear();
        this.drawTankWater();
    };
    
    /**
     * Change the color of the water in the Tank, clear just the water and redraw
 	 * @param text value	the hexadecimal color code
    **/
    p.changeColor = function(value){
    	this._color = value;
		this.water.clear();
    	this.drawTankWater();
    };
    
    /**
     * 
     */
    p.deleteObject = function(){
    	this.removeAllEventListeners();
    };
    
    
    window.Tank= Tank;
 
} (window));
