myGame.Game = function(game) {
     this.game = game; // keep reference to main game object
     this._currentLevel = 0;
    
    this._score = 0;
    this._scoreText;
    
    this.instructions;
    this.credits;
};

myGame.Game.prototype = {
	
	create: function() {
		this.buildWorld();
	},
	
	buildWorld: function() {
        // determine which background image to load base on what level we're at
        switch(this._currentLevel){
            case 1:
		      this.add.image(0, 0, 'game_bg_level1');
              break;
            case 2:
		      this.add.image(0, 0, 'game_bg_level2');
              break;
            case 3:
		      this.add.image(0, 0, 'game_bg_level3');
              break;
        }
        //button to add points
        
        var pointsBtn = this.add.button(this.world.centerX, this.world.centerY, 'button_spritesheet_add_points', this.addPoints, this, 2, 1, 0);
        pointsBtn.anchor.setTo(0.5, 0.5);
        pointsBtn.name = 'pointsButton';
        pointsBtn.anchor.setTo(0.5, 0.5); // anchored on the center of the button
        
        // button to quit level
        var quitBtn = this.add.button(this.world.centerX, this.world.centerY+100, 'button_spritesheet_finish_level', this.returnToMain, this, 2, 1, 0);
        quitBtn.anchor.setTo(0.5, 0.5);
        quitBtn.name = 'quitButton';
        quitBtn.anchor.setTo(0.5, 0.5); // anchored on the center of the button
        
        // score text
        this._scoreText = this.add.text(this.world.centerX, this.world.centerY+200, "Score: " + this._score, { fontSize: '32px', fill: '#000' });
        this._scoreText.anchor.setTo(0.5, 0.5);
        
        // instructions button
        this.instructions = this.add.text(100, this.world.height-50, "Instructions", { fontSize: '32px', fill: '#000' });
        this.instructions.anchor.setTo(0.5, 0.5);
        this.instructions.inputEnabled = true;
        this.instructions.events.onInputDown.add(this.showInstructions, this);
        
        
        // credits button
        this.credits = this.add.text(this.world.width-100, this.world.height-50, "Credits", { fontSize: '32px', fill: '#000' });
        this.credits.anchor.setTo(0.5, 0.5);
        this.credits.inputEnabled = true;
        this.credits.events.onInputDown.add(this.showCredits, this);
		
	},
    addPoints: function(pointer){
        
        console.log('add points');
        switch(this._currentLevel){
            case 1:
		     this._score += 10;
              break;
            case 2:
		     this._score += 20;
              break;
            case 3:
		     this._score += 30;
              break;
        }
        console.log('now have '+ this._score);
        this._scoreText.setText("Score: " + this._score);
    },
    returnToMain: function(pointer){
        this.state.start('StartMenu');
    },
    showCredits: function(pointer){
        this.drawDialog('credits');
        
        
    },
    showInstructions: function(pointer){
        this.drawDialog('level'+this._currentLevel);
    },
    drawDialog: function(key){
        // pause game and disable the instructions and credits button
        this.paused = true;
        this.instructions.inputEnabled = false;
        this.credits.inputEnabled = false;
        
        // draw outline box
        this.dialogBox = this.add.graphics(0,0);
        this.dialogBox.beginFill(0xFF3300);
        this.dialogBox.lineStyle(2, 0x0000FF, 1);
        this.dialogBox.drawRect(200, 50, 550, 550);
                
        // draw text
        var style = { font: 'bold 20pt Arial', fill: 'white', align: 'left', wordWrap: true, wordWrapWidth: 450 };
        this.dialogText = this.add.text(this.world.centerX, this.world.centerY, this.dialog[key], style);
        this.dialogText.anchor.set(0.5, 0.5);
        this.dialogText.setShadow(2, 2, 'rgba(0,0,0,0.5)', 0);
        
        //draw close button
        this.dialogCloseBtn = this.add.button(this.world.centerX, this.world.centerY+150, 'button_spritesheet_close_dialog', this.closeDialog, this, 2, 1, 0);
        this.dialogCloseBtn.anchor.setTo(0.5, 0.5);
        this.dialogCloseBtn.name = 'closeButton';
        this.dialogCloseBtn.anchor.setTo(0.5, 0.5); // anchored on the center of the button
    },
    closeDialog: function(){
        // kill off the dialog box, text, and close button
        // re-enable the instructions and credits button
        // unpause the game
        this.dialogBox.kill();
        this.dialogCloseBtn.kill();
        this.dialogText.kill();
        this.paused = false;
        this.instructions.inputEnabled = true;
        this.credits.inputEnabled = true
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
        // load the dialog json data file
		this.dialog =   this.cache.getJSON('dialog');
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
		
	},
    
    debug: function(){
        console.log(this);
    }
};
