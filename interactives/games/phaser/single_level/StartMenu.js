TreeRings.StartMenu = function(game) {
    this.startBG;
    this.startPrompt;
}

TreeRings.StartMenu.prototype = {
	
	create: function() {
		startBG = this.add.image(0, 0, 'titlescreen');
		startBG.inputEnabled = true;
		startBG.events.onInputDown.addOnce(this.startGame, this);
      
		startPrompt = this.add.bitmapText(this.world.centerX-105, this.world.centerY+180, 'desyrel', 'Touch to Start!', 24);
        //var style = { font: "50px Arial", fill: "#000066", align: "center" };
       // startPrompt = this.add.text(this.world.centerX-155, this.world.centerY+180, "Touch to Start!", style);    
    	//this.state.start('Game');
	},

	startGame: function (pointer) {
		this.state.start('Game');
	},
	
	init: function() {
		
	},
	loadRender: function(){
		
		
	},
	loadUpdate: function() {
		
	},
	paused: function() {
		
	},
	pauseUpdate: function() {
		
	},
	preload: function() {
		  
	},
	preRender: function() {
		
	},
	render: function (){
		
	},
	resize: function() {
		
	},
	resumed: function() {
		
	},
	shutdown: function() {
		
	},
	update: function () {
		
	}
};