TreeRings.Preloader = function(game) {
    this.preloadBar = null;
    this.titleText = null;
    this.ready = false;
};

TreeRings.Preloader.prototype = {

	create: function() {
		this.preloadBar.cropEnabled = false;
		
    	this.state.start('StartMenu');
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
		this.preloadBar = this.add.sprite(this.world.centerX, this.world.centerY, 'preloaderBar');
		this.preloadBar.anchor.setTo(0.5, 0.5);
		this.load.setPreloadSprite(this.preloadBar);
		this.titleText = this.add.image(this.world.centerX, this.world.centerY-100, 'titleimage');
		this.titleText.anchor.setTo(0.5, 0.5);
		this.load.image('titlescreen', 'assets/images/TitleBG.jpg');
		this.load.bitmapFont('desyrel', 'assets/fonts/desyrel.png', 'assets/fonts/desyrel.xml');
		this.load.image('game_bg', 'assets/images/game_bg_900x500.png');
		//this.load.image('phaser_logo', 'assets/images/phaser_logo.png');
		//this.load.image('tree_ring_sample', 'assets/images/tree_ring_sample_330x330.png');
		this.load.image('tree_ring_sample', 'assets/images/tree_ring_sample_02_200x400.png');
		this.load.image('calendar_icon', 'assets/images/calendar_icon_128x128.png');
		
		this.load.image('moisture_btn_dry', 'assets/images/moisture_btn_dry_120x120.png');
		this.load.image('moisture_btn_normal', 'assets/images/moisture_btn_normal_120x120.png');
		this.load.image('moisture_btn_wet', 'assets/images/moisture_btn_wet_120x120.png');
		
		this.load.image('temperature_btn_cool', 'assets/images/temperature_btn_cool_120x120.png');
		this.load.image('temperature_btn_normal', 'assets/images/temperature_btn_normal_120x120.png');
		this.load.image('temperature_btn_warm', 'assets/images/temperature_btn_warm_120x120.png');
		
		this.load.image('moisture_btn_selected_highlight', 'assets/images/moisture_btn_selected_highlight_120x120.png');
		
        // 193x71 is the size of each frame.
        this.load.spritesheet('button_spritesheet', 'assets/images/spritesheets/button_sprite_sheet.png', 193, 71);
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
		this.ready = true;
		this.state.start('StartMenu');
	}
};