var myGame = {};

myGame.Boot = function(game) {
	// variables
	// this.var_name;
 
};

myGame.Boot.prototype = {
	create: function() {
        this.input.maxPointers = 1;
		this.stage.disableVisibilityChange = true;
		this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		this.scale.minWidth = 270;
		this.scale.minHeight = 480;
		this.scale.pageAlignHorizontally = true;
		this.scale.pageAlignVertically = true;
		this.stage.forcePortrait = true;
		//this.scale.setScreenSize(true);

		this.input.addPointer();
		this.stage.backgroundColor = '#cccccc';
		
		this.state.start('Preloader');
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
		this.load.image('preloaderBar', 'assets/images/loader_bar.png');
		this.load.image('titleimage', 'assets/images/TitleImage.png');
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