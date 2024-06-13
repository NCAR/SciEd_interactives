(function(){
var stage;
var myIcon;
var myImage;
var myCanvas = $("#stageCanvas").get(0);

this.init = function() {
	
	stage = new createjs.Stage(myCanvas);
	myIcon = new Icon(60,"img/car.png","#fff","Title");
	myIcon.x = 400;
	myIcon.y = 300;
	
	stage.addChild(myIcon);
	stage.update();
	stage.enableMouseOver();
	
	createjs.Ticker.setFPS(24);
	createjs.Ticker.addListener(this);
};
this.tick = function(){
       stage.tick();
};
window.onload = init();

})();