myGame.Preloader = function(game) {
    this.preloadBar = null;
    this.titleText = null;
    this.ready = false;
};

myGame.Preloader.prototype = {

	create: function() {
		this.preloadBar.cropEnabled = false;
       
    	//this.state.start('StartMenu');
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
		
		this.load.json('dialog', 'assets/data/dialog.json');
		
		
		this.load.image('game_start_bkg', 'assets/images/game_start_bkg.png');
		this.load.image('game_play_again_bkg', 'assets/images/game_play_again_bkg.png');
		this.load.image('game_bg_level1', 'assets/images/game_bg_level1.png');
		this.load.image('game_bg_level2', 'assets/images/game_bg_level2.png');
		this.load.image('game_bg_level3', 'assets/images/game_bg_level3.png');
		this.load.image('game_bg', 'assets/images/game_bg_900x500.png');
        // 193x71 is the size of each frame
        this.load.spritesheet('button_spritesheet_finish_level', 'assets/images/spritesheets/button_sprite_sheet_finish_level.png', 193, 71);
        this.load.spritesheet('button_spritesheet_add_points', 'assets/images/spritesheets/button_sprite_sheet_add_points.png', 193, 71);
        this.load.spritesheet('button_spritesheet_close_dialog', 'assets/images/spritesheets/button_sprite_sheet_close_dialog.png', 193, 71);
        
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