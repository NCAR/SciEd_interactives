(function (window) {
	function Icon(iconWidth,imgSrc,color,titleText)  {
        this.initialize(iconWidth,imgSrc,color,titleText);
    }
	
	Icon.prototype = new createjs.Container();
	Icon.prototype.Container_initialize = Icon.prototype.initialize;
	Icon.prototype.Container_tick = Icon.prototype._tick; 
	
    Icon.prototype.initialize = function (iconWidth,imgSrc,color,titleText) {
		this.Container_initialize();
		this._iconWidth = iconWidth;
		this._imgSrc = imgSrc;
		this._color = color;
		this._titleText = titleText;
        
		this.graphic = new createjs.Graphics();
		this.graphic.beginFill("#777");
		this.graphic.drawRoundRect(0,0,this._iconWidth,this._iconWidth,this._iconWidth*.1);
		this.roundRectangle= new createjs.Shape(this.graphic);
		this.addChild(this.roundRectangle);
			
		this.text = new createjs.Text(this._titleText, "bold 16px Courier",this._color);
		this.text.textAlign ="center";
		this.text.y = this._iconWidth+15;
		this.text.x = (this._iconWidth*0.5);
		this.addChild(this.text);
			
		this.bitmap = new createjs.Bitmap(this._imgSrc);
		
		this.bitmap.regX = this._iconWidth*0.5;
		this.bitmap.regY = this._iconWidth*0.5;
		this.bitmap.x =  (this._iconWidth*0.5);
		this.bitmap.y =  (this._iconWidth*0.5);
		this.addChild(this.bitmap);
		
		this.roundRectangle.onClick = function(){
			console.log("click "+this.graphics);
		}
		this.roundRectangle.addEventListener("click", handleClick);
       function handleClick(event){
 			console.log('asdf');
       }
		
		this.roundRectangle.onMouseOver = function(){
			this.parent.graphic.clear();
			this.parent.graphic.beginFill(this.parent._color);
			this.parent.graphic.beginStroke(createjs.Graphics.getRGB(255,255,255));
			this.parent.graphic.drawRoundRect(0,0,this.parent._iconWidth,this.parent._iconWidth,this.parent._iconWidth*.1);
			this.parent.roundRectangle.graphics = this.parent.graphic;
		}
		this.roundRectangle.onMouseOut = function(){
			this.parent.graphic.clear();
			this.parent.graphic.beginFill("#777");
			this.parent.graphic.drawRoundRect(0,0,this.parent._iconWidth,this.parent._iconWidth,this.parent._iconWidth*.1);
			this.parent.roundRectangle.graphics = this.parent.graphic;
		}
	}
	
    Icon.prototype._tick = function () {
		this.Container_tick();
        //console.log("Icon Ticked");
    }
    window.Icon= Icon;
} (window));