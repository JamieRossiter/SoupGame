/*:
* @plugindesc Controls the potato counter window and system
* @author Jamie Rossiter
*/

/* Override map scene */
const potato_scene_map_start_override = Scene_Map.prototype.start;
const potato_scene_map_update_override = Scene_Map.prototype.update;

Scene_Map.prototype.start = function(){
    potato_scene_map_start_override.call(this);
    this._potatoWindow = new Window_Potato();
    this.addChild(this._potatoWindow);
    $gameTemp._potatoCount = 0;
}

Scene_Map.prototype.update = function(){
    potato_scene_map_update_override.call(this);
    this._potatoWindow.refresh();
}

/* Potato Window */
function Window_Potato(){
    this.initialize.apply(this, arguments);
}

Window_Potato.prototype = Object.create(Window_Base.prototype);
Window_Potato.prototype.constructor = Window_Potato;

Window_Potato.prototype.initialize = function(){
    this.windowPosition = { x: 50, y: 10 };
    this.windowSize = { width: 120, height: 58 };
    Window_Base.prototype.initialize.call(this, this.windowPosition.x, this.windowPosition.y, this.windowSize.width, this.windowSize.height);
}

Window_Potato.prototype.refresh = function(){
    this.contents.clear();
    this.drawIcon(327, -3, -5);
    // $gameTemp._potatoCount++;
    this.drawTextEx(`\\c[1]${$gameTemp._potatoCount.toString()}\\c[0]`, 40, -8, 50, "left");
}