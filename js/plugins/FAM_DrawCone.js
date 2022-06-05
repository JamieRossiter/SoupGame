let scene_map_initialize_override = Scene_Map.prototype.initialize;
Scene_Map.prototype.initialize = function(){
    scene_map_initialize_override.call(this);
    this._coneWindow = new Window_Cone();
    this._bitmap = new Bitmap(150, 150);
    this._bitmap.drawCircle(150, 150, 150, "red");
    this.circle = new Sprite(this._bitmap);
    this._blockBit = new Bitmap(48, 48);
    this._blockBit.fillRect(0, 0, 48, 48, "transparent");
    this.rectangle = new Sprite(this._blockBit);
}

let scene_map_update_override = Scene_Map.prototype.update;
Scene_Map.prototype.update = function(){
    scene_map_update_override.call(this);
    // this.addChild(this._coneWindow);
    // this._coneWindow.refresh();
    this.circle.x = $gamePlayer.screenX() + 5;
    this.circle.y = $gamePlayer.screenY() + 160;
    this.circle.opacity = 60;
    this.circle.rotation = 3.9;
    this.addChildAt(this.circle, 1);
    this.rectangle.x = 300;
    this.rectangle.y = 400;
    this.addChildAt(this.rectangle, 2);
}

function Window_Cone(){
    this.initialize.apply(this, arguments);
}

Window_Cone.prototype = Object.create(Window_Base.prototype);
Window_Cone.prototype.constructor = Window_Cone;

Window_Cone.prototype.initialize = function(){
    Window_Base.prototype.initialize.call(this, 50, 50, 100, 100);
}

Window_Cone.prototype.refresh = function(){
    this.x = $gamePlayer.screenX();
    this.y = $gamePlayer.screenY();
    this.width = 300;
    this.height = 300;
    this.contents.height = 300;
    this.contents.width = 300;
    this.contents.drawCircle(15, 15, 30, "red");
}