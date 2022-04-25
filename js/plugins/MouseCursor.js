/*:
* @plugindesc Creates a custom mouse cursor.
* @author Jamie Rossiter
*/

/* Preload checkout item images at boot */
const cursor_scene_boot_create_override = Scene_Boot.prototype.create;
Scene_Boot.prototype.create = function(){
    cursor_scene_boot_create_override.call(this);
    ImageManager.loadSystem("cursor_normal");
    ImageManager.loadSystem("cursor_click");
    ImageManager.loadSystem("cursor_grab");
}

const cursor_game_temp_initialize_override = Game_Temp.prototype.initialize;
Game_Temp.prototype.initialize = function() {
    cursor_game_temp_initialize_override(this);
    this._cursor = new Sprite(ImageManager.loadSystem("cursor_normal"));
};

// /* Override map scene */
const cursor_scene_base_start_override = Scene_Base.prototype.start;
Scene_Base.prototype.start = function(){
    cursor_scene_base_start_override.call(this);
}

const cursor_scene_base_update_override = Scene_Base.prototype.update;
Scene_Base.prototype.update = function(){
    cursor_scene_base_update_override.call(this);
    $gameTemp._cursor.x = TouchInput.x;
    $gameTemp._cursor.y = TouchInput.y;
    this.addChild($gameTemp._cursor);
}

Game_Temp.prototype.changeCursor = function(cursorName){
    SceneManager._scene.removeChild($gameTemp._cursor);
    $gameTemp._cursor = new Sprite(ImageManager.loadSystem(cursorName));
}

const cursor_onleftbuttondown_override = TouchInput._onLeftButtonDown;
TouchInput._onLeftButtonDown = function(event){
    cursor_onleftbuttondown_override.call(this, event);
    $gameTemp.changeCursor("cursor_click");
}

const cursor_onrightbuttondown_override = TouchInput._onRightButtonDown;
TouchInput._onRightButtonDown = function(event){
    cursor_onrightbuttondown_override.call(this, event);
    $gameTemp.changeCursor("cursor_grab");
}

const cursor_onmouseup_override = TouchInput._onMouseUp;
TouchInput._onMouseUp = function(event){
    cursor_onmouseup_override.call(this, event);
    $gameTemp.changeCursor("cursor_normal");
}