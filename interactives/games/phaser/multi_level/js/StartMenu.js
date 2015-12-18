myGame.StartMenu = function (game) {
    this.game = game; // keep reference to main game object

    this._selectedLevel = 0;

}

myGame.StartMenu.prototype = {

    create: function () {
        if(this._selectedLevel == 0){
            var startBG = this.add.image(0, 0, 'game_start_bkg');
        } else {
            var startBG = this.add.image(0, 0, 'game_play_again_bkg');
        }

        var style = {
            font: "50px Arial",
            fill: "#000066",
            align: "center"
        };
        var level1 = this.add.text(this.world.centerX, this.world.centerY + 80, "Level 1", style);
        var level2 = this.add.text(this.world.centerX, this.world.centerY + 130, "Level 2", style);
        var level3 = this.add.text(this.world.centerX, this.world.centerY + 180, "Level 3", style);

        level1.anchor.setTo(0.5, 0.5);
        level2.anchor.setTo(0.5, 0.5);
        level3.anchor.setTo(0.5, 0.5);

        level1.inputEnabled = level2.inputEnabled = level3.inputEnabled = true;
        level1.events.onInputDown.addOnce(this.startLevel1, this);
        level2.events.onInputDown.addOnce(this.startLevel2, this);
        level3.events.onInputDown.addOnce(this.startLevel3, this);

    },
    startGame: function () {
        // send the current level to the game state
        this.game.state.states['Game']._currentLevel = this._selectedLevel;
        this.state.start('Game');
    },
    startLevel1: function (pointer) {
        this._selectedLevel = 1;
        this.startGame();
    },
    startLevel2: function (pointer) {
        this._selectedLevel = 2;
        this.startGame();
    },
    startLevel3: function (pointer) {
        this._selectedLevel = 3;
        this.startGame();
    },

    init: function () {

    },
    loadRender: function () {


    },
    loadUpdate: function () {

    },
    paused: function () {

    },
    pauseUpdate: function () {

    },
    preload: function () {

    },
    preRender: function () {

    },
    render: function () {

    },
    resize: function () {

    },
    resumed: function () {

    },
    shutdown: function () {

    },
    update: function () {

    }
};