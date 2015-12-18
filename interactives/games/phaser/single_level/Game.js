var b_climateFlag = 'user';
var s_moisture = 'normal';
var s_temperature = 'normal';

var moistureBtnGroup;
var temperatureBtnGroup;

TreeRings.Game = function(game) {
    //a_targetTree = new Tree();
    //a_userTree = new Tree();
    //a_tree = new Tree();
};

TreeRings.Game.prototype = {
	
	create: function() {
		this.buildWorld();
	},
	
	buildWorld: function() {
		this.add.image(0, 0, 'game_bg');
		
		// Buttons for selecting moisture level (dry, normal or wet)
		this.createMoistureButtons();
		
		// Buttons for selecting temperature (cool, normal or warm)
		this.createTemperatureButtons();
        
		// Text for growing one year
		var style = { font: "24px Arial", fill: "#006600", align: "center" };
		var text = this.add.text(50, 10, "Grow One Year", style);
        
		// Insert Grow One Year button
       	var growBtn = this.add.button(150, 80, 'button_spritesheet', this.growRingListener, this, 2, 1, 0);
        growBtn.name = 'growButton';
        growBtn.anchor.setTo(0.5, 0.5); // anchored on the center of the button
                
        // text for undo one year
        var style = { font: "24px Arial", fill: "#006600", align: "center" };
		var text = this.add.text(300, 10, "Remove One Year", style);
        
        // Insert undo One Year button
       	var undoBtn = this.add.button(400, 80, 'button_spritesheet', this.undoRingListener, this, 2, 1, 0);
        //growBtn = this.add.button(this.world.centerX, this.world.centerY, 'buttonGeneric', this.debug, this, 2, 1, 0);
        undoBtn.name = 'undoButton';
        // anchored on the center of the button
        undoBtn.anchor.setTo(0.5, 0.5);
        
        
        // text for swapping
        //var style = { font: "24px Arial", fill: "#006600", align: "center" };
		//var text = this.add.text(50, 420, "Swap Tree", style);
        
        // Insert Swap button
       	//var swapBtn = this.add.button(300, 440, 'button_spritesheet', this.swapClimateListener, this, 2, 1, 0);
        //swapBtn.name = 'swapButton';
        //swapBtn.anchor.setTo(0.5, 0.5);
        
        // Temporary button for testing "End Game Level" situation
        // Button label text
        var style = { font: "24px Arial", fill: "#006600", align: "center" };
		var text = this.add.text(50, 420, "Win Level", style);
        
        // Insert Win Level button
       	var winLevelBtn = this.add.button(300, 440, 'button_spritesheet', this.winLevelListener, this, 2, 1, 0);
        winLevelBtn.name = 'winLevel';
        winLevelBtn.anchor.setTo(0.5, 0.5);
        
		// Create the user's tree that they will add rings to
        var baseRadius = 0;    
        this.a_userTree = new Tree(this, 650, 250, 'left');
        this.add.existing(this.a_userTree);
        
		// Insert target tree ring pattern user should try to match
		//this.add.image(650, 51, 'tree_ring_sample');
        this.a_targetTree = new Tree(this, 650, 250, 'right');   
	    this.buildTarget();
        this.add.existing(this.a_targetTree);
		
		// Instructions - VERY alpha version
        this.instructions = new Instructions(this, 800, 400);
        this.add.existing(this.instructions);

	},
	createMoistureButtons: function() {
		// Create buttons for selecting moisture level of dry, normal, or wet
		
		// Container for buttons
		moistureBtnGroup = this.add.sprite(60, 130);
		
		// Place three buttons on stage as sprites
		moistureBtnGroup.dryBtn = moistureBtnGroup.addChild(this.make.sprite(0, 0, 'moisture_btn_dry'));
		moistureBtnGroup.normalBtn = moistureBtnGroup.addChild(this.make.sprite(140, 0, 'moisture_btn_normal'));
		moistureBtnGroup.wetBtn = moistureBtnGroup.addChild(this.make.sprite(280, 0, 'moisture_btn_wet'));
		
		// Enable click/touch input
        moistureBtnGroup.dryBtn.inputEnabled = true;
        moistureBtnGroup.normalBtn.inputEnabled = true;
        moistureBtnGroup.wetBtn.inputEnabled = true;
		
		// Add listeners
        moistureBtnGroup.dryBtn.events.onInputDown.add(this.moistureBtnDryListener,this); // phaser events: http://phaser.io/docs/2.4.2/Phaser.Events.html
        moistureBtnGroup.normalBtn.events.onInputDown.add(this.moistureBtnNormalListener,this);
        moistureBtnGroup.wetBtn.events.onInputDown.add(this.moistureBtnWetListener,this);
		
		// Highlight for selected button (highlight for other two hidden at start)
		moistureBtnGroup.dryBtn.highlight = moistureBtnGroup.dryBtn.addChild(this.make.sprite(0, 0, 'moisture_btn_selected_highlight'));
		moistureBtnGroup.normalBtn.highlight = moistureBtnGroup.normalBtn.addChild(this.make.sprite(0, 0, 'moisture_btn_selected_highlight'));
		moistureBtnGroup.wetBtn.highlight = moistureBtnGroup.wetBtn.addChild(this.make.sprite(0, 0, 'moisture_btn_selected_highlight'));
		
		// "Normal" moisture selected at startup; hide highlights of dry and wet buttons
		moistureBtnGroup.dryBtn.highlight.visible = false;
		moistureBtnGroup.wetBtn.highlight.visible = false;
	},
	createTemperatureButtons: function() {
		// Create buttons for selecting temperature level of cool, normal, or warm
		
		// Container for buttons
		temperatureBtnGroup = this.add.sprite(60, 270);
		
		// Place three buttons on stage as sprites
		temperatureBtnGroup.coolBtn = temperatureBtnGroup.addChild(this.make.sprite(0, 0, 'temperature_btn_cool'));
		temperatureBtnGroup.normalBtn = temperatureBtnGroup.addChild(this.make.sprite(140, 0, 'temperature_btn_normal'));
		temperatureBtnGroup.warmBtn = temperatureBtnGroup.addChild(this.make.sprite(280, 0, 'temperature_btn_warm'));
		
		// Enable click/touch input
        temperatureBtnGroup.coolBtn.inputEnabled = true;
        temperatureBtnGroup.normalBtn.inputEnabled = true;
        temperatureBtnGroup.warmBtn.inputEnabled = true;
		
		// Add listeners
        temperatureBtnGroup.coolBtn.events.onInputDown.add(this.temperatureBtnCoolListener,this);
        temperatureBtnGroup.normalBtn.events.onInputDown.add(this.temperatureBtnNormalListener,this);
        temperatureBtnGroup.warmBtn.events.onInputDown.add(this.temperatureBtnWarmListener,this);
		
		// Highlight for selected button (highlight for other two hidden at start)
		temperatureBtnGroup.coolBtn.highlight = temperatureBtnGroup.coolBtn.addChild(this.make.sprite(0, 0, 'moisture_btn_selected_highlight'));
		temperatureBtnGroup.normalBtn.highlight = temperatureBtnGroup.normalBtn.addChild(this.make.sprite(0, 0, 'moisture_btn_selected_highlight'));
		temperatureBtnGroup.warmBtn.highlight = temperatureBtnGroup.warmBtn.addChild(this.make.sprite(0, 0, 'moisture_btn_selected_highlight'));
		
		// "Normal" temperature selected at startup; hide highlights of cool and warm buttons
		temperatureBtnGroup.coolBtn.highlight.visible = false;
		temperatureBtnGroup.warmBtn.highlight.visible = false;
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
		
	},
    buildTarget: function(){
        // initiate the Target
        this.a_targetTree.addRing('normal','wet'); // Year 1
        this.a_targetTree.addRing('normal','wet'); // Year 2
        this.a_targetTree.addRing('cool','dry'); // Year 3
        this.a_targetTree.addRing('cool','dry'); // Year 4
        this.a_targetTree.addRing('cool','dry'); // Year 5
        this.a_targetTree.addRing('cool','dry'); // Year 6
        this.a_targetTree.addRing('cool','dry'); // Year 7
        this.a_targetTree.addRing('cool','dry'); // Year 8
        this.a_targetTree.addRing('cool','dry'); // Year 9
        this.a_targetTree.addRing('cool','dry'); // Year 10
        this.a_targetTree.addRing('cool','dry'); // Year 11
        this.a_targetTree.addRing('cool','dry'); // Year 12
        this.a_targetTree.addRing('cool','dry'); // Year 13
        this.a_targetTree.addRing('cool','dry'); // Year 14
        this.a_targetTree.addRing('normal','wet'); // Year 15
		
        /*this.a_targetTree.addRing('normal','normal'); // Year 1
        this.a_targetTree.addRing('warm','normal'); // Year 2
        this.a_targetTree.addRing('normal','normal'); // Year 3
        this.a_targetTree.addRing('warm','normal'); // Year 4
        this.a_targetTree.addRing('warm','dry'); // Year 5
        this.a_targetTree.addRing('warm','dry'); // Year 6
        this.a_targetTree.addRing('normal','dry'); // Year 7
        this.a_targetTree.addRing('normal','normal'); // Year 8
        this.a_targetTree.addRing('warm','normal'); // Year 9
        this.a_targetTree.addRing('normal','normal'); // Year 10
        this.a_targetTree.addRing('cool','wet'); // Year 11
        this.a_targetTree.addRing('normal','normal'); // Year 12
        this.a_targetTree.addRing('warm','normal'); // Year 13
        this.a_targetTree.addRing('warm','wet'); // Year 14
        this.a_targetTree.addRing('warm','wet'); // Year 15 */
    },
    /* listener functions */
    undoRingListener:  function(){
       /*if(this.a_tree.getRings().length > 0){
            this.a_tree.removeRing();
        }*/
       if(this.a_userTree.getRings().length > 0){
            this.a_userTree.removeRing();
        }
    },
    growRingListener: function(){
        //this.a_tree.addRing(s_temperature, s_moisture);
        this.a_userTree.addRing(s_temperature, s_moisture);
    } ,
    winLevelListener:  function(){
        console.log('I won this level, so time to move to the Choose Level screen.');
    },
    /*swapClimateListener:  function(){
        
        if(b_climateFlag == 'target'){
            b_climateFlag = 'user';
            // we are now using the user submitted climate
            this.a_targetTree.setExists(false);
            this.a_userTree.setExists(true);
            
            // change action reference
            this.a_tree = this.a_userTree;
            this.add.existing(this.a_tree);
            console.log('we are now using the user submitted climate');
        } else {
            b_climateFlag = 'target';
            // when using the target tree, reset and rebuild it
            this.a_targetTree.resetTree();
            this.buildTarget();
            
           // we are now using the target climate
            this.a_targetTree.setExists(true);
            this.a_userTree.setExists(false);
            
            // change action reference
            this.a_tree = this.a_targetTree;
            this.add.existing(this.a_tree);
            console.log('we are now using the target climate');
        }
    },*/
	moistureBtnDryListener: function(){
		s_moisture = 'dry';
		moistureBtnGroup.dryBtn.highlight.visible = true;
		moistureBtnGroup.normalBtn.highlight.visible = false;
		moistureBtnGroup.wetBtn.highlight.visible = false;
	},
	moistureBtnNormalListener: function(){
		s_moisture = 'normal';
		moistureBtnGroup.normalBtn.highlight.visible = true;
		moistureBtnGroup.dryBtn.highlight.visible = false;
		moistureBtnGroup.wetBtn.highlight.visible = false;
	},
	moistureBtnWetListener: function(){
		s_moisture = 'wet';
		moistureBtnGroup.wetBtn.highlight.visible = true;
		moistureBtnGroup.dryBtn.highlight.visible = false;
		moistureBtnGroup.normalBtn.highlight.visible = false;
	},
	temperatureBtnCoolListener: function(){
		s_temperature = 'cool';
		temperatureBtnGroup.coolBtn.highlight.visible = true;
		temperatureBtnGroup.normalBtn.highlight.visible = false;
		temperatureBtnGroup.warmBtn.highlight.visible = false;
	},
	temperatureBtnNormalListener: function(){
		s_temperature = 'normal';
		temperatureBtnGroup.normalBtn.highlight.visible = true;
		temperatureBtnGroup.coolBtn.highlight.visible = false;
		temperatureBtnGroup.warmBtn.highlight.visible = false;
	},
	temperatureBtnWarmListener: function(){
		s_temperature = 'warm';
		temperatureBtnGroup.warmBtn.highlight.visible = true;
		temperatureBtnGroup.coolBtn.highlight.visible = false;
		temperatureBtnGroup.normalBtn.highlight.visible = false;
	},
    debug: function(){
        console.log(this);
    }
};

// outside function just to pick a random keyval
var randomProperty = function (obj) {
    var keys = Object.keys(obj)
    return obj[keys[ keys.length * Math.random() << 0]];
};