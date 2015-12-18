// Instructions object
// game object, x coord, y coord
Instructions = function(game, x, y) {
    Phaser.Graphics.call(this, game, x, y, 'instructions');
    this.exists = true;
}

Instructions.prototype = Object.create(Phaser.Graphics.prototype);
Instructions.prototype.constructor = Instructions;

// set exists property, which controls visibility on the main game
Instructions.prototype.setExists = function(b_bool){
    if(b_bool == true){
        this.exists = true;
    } else {
        this.exists = false;
    }
};
// Template to do something (method/function)
Instructions.prototype.addRing = function(s_temperature, s_moisture) {
    //this.a_climateYearly.push({s_temperature, s_moisture});
};
// provide a preset for rings
Instructions.prototype.setRings = function(value){  
    //this.a_climateYearly = value;
}

Instructions.prototype.debug = function(){
    console.log(this);   
};

// draw the rings
Instructions.prototype.update = function() {
    this.clear();
	var ringRadius = 50;
	
    // Dark, late growth
    this.beginFill(0x336699);
	this.arc(0, 0, ringRadius, 0, Math.PI);
	this.endFill();
	
	
	
	//var style = "gucci";
	var style = { font: "24px Arial", fill: "#990000", align: "center" };
	console.log(style);
	//var text = this.add.text(0, 0, "Instructions", style);
};