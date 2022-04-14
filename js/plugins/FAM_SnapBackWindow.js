/*:
* @plugindesc Displays a window allowing the player to snapback to their original position when the camera moves out of position.
* @author Jamie Rossiter
*/

/* Preload checkout item images at boot */
const snapback_scene_boot_create_override = Scene_Boot.prototype.create;
Scene_Boot.prototype.create = function(){
    snapback_scene_boot_create_override.call(this);
}

/* Scene Map */
const snapback_scene_start_override = Scene_Map.prototype.start;
const snapback_scene_update_override = Scene_Map.prototype.update;

Scene_Map.prototype.start = function(){
    snapback_scene_start_override.call(this);
    this._cameraWindow = new Window_Snapback();
}

Scene_Map.prototype.update = function(){
    snapback_scene_update_override.call(this);
    if(!this._cameraWindow.isPlayerOnScreen().validTotal){
        this.addChild(this._cameraWindow);
        const windowEdgeX = -(($gamePlayer.screenX() - Graphics.boxWidth) - $gamePlayer.screenX());
        const windowEdgeY = -(($gamePlayer.screenY() - Graphics.boxHeight) - $gamePlayer.screenY());
        if(!this._cameraWindow.isPlayerOnScreen().validXEast){
            this._cameraWindow.x = windowEdgeX - this._cameraWindow.width;
            this._cameraWindow.y = $gamePlayer.screenY() - this._cameraWindow.height;
        }
        if(!this._cameraWindow.isPlayerOnScreen().validXWest){
            this._cameraWindow.x = 0;
            this._cameraWindow.y = $gamePlayer.screenY() - this._cameraWindow.height;
        }
        if(!this._cameraWindow.isPlayerOnScreen().validYNorth){
            this._cameraWindow.y = 0;
            this._cameraWindow.x = $gamePlayer.screenX() - this._cameraWindow.width;
        }
        if(!this._cameraWindow.isPlayerOnScreen().validYSouth){
            this._cameraWindow.y = windowEdgeY - this._cameraWindow.height;
            this._cameraWindow.x = $gamePlayer.screenX() - this._cameraWindow.width;
        }
        if(!this._cameraWindow.isPlayerOnScreen().validNE){
            this._cameraWindow.x = windowEdgeX - this._cameraWindow.width;
            this._cameraWindow.y = 0;
        }
        if(!this._cameraWindow.isPlayerOnScreen().validNW){
            this._cameraWindow.x = 0;
            this._cameraWindow.y = 0;
        }
        if(!this._cameraWindow.isPlayerOnScreen().validSE){
            this._cameraWindow.y = windowEdgeY - this._cameraWindow.height;
            this._cameraWindow.x = windowEdgeX - this._cameraWindow.width;
        }
        if(!this._cameraWindow.isPlayerOnScreen().validSW){
            this._cameraWindow.y = 0;
            this._cameraWindow.x = windowEdgeX - this._cameraWindow.width;
        }
        this._cameraWindow.drawCameraWindow(this._cameraWindow.x, this._cameraWindow.y);
    } else {
        this.removeChild(this._cameraWindow);
        $gameMap.removeCamera(1);
    }
}

/* Snapback Window */

function Window_Snapback(){
    this.initialize.apply(this, arguments);
}

Window_Snapback.prototype = Object.create(Window_Base.prototype);
Window_Snapback.prototype.constructor = Window_Snapback;

Window_Snapback.prototype.initialize = function(){
    this.windowSize = { width: 125, height: 125 };
    Window_Base.prototype.initialize.call(this, 0, 0, this.windowSize.width, this.windowSize.height);
}

Window_Snapback.prototype.isPlayerOnScreen = function(){
    const screenWidthInTiles = Math.floor(Graphics.boxWidth / 48);
    const screenHeightInTiles = Math.floor(Graphics.boxHeight / 48); 
    let validXEast = $gamePlayer.x <= $gameMap.displayX() + screenWidthInTiles;
    let validXWest = $gamePlayer.x >= $gameMap.displayX();
    let validYSouth = $gamePlayer.y <= $gameMap.displayY() + screenHeightInTiles;
    let validYNorth = $gamePlayer.y >= $gameMap.displayY();
    return {
        validTotal: validXEast && validXWest && validYNorth && validYSouth,
        validXEast: validXEast,
        validXWest: validXWest,
        validYNorth: validYNorth,
        validYSouth: validYSouth,
        validNE: validYNorth || validXEast,
        validNW: validYNorth || validXWest,
        validSE: validYSouth || validXEast,
        validSW: validYSouth || validXWest
    };
}

Window_Snapback.prototype.determineWindowEdgeOfPlayer = function(){
    if(!this.isPlayerOnScreen().validX){
        return windowEdgeX - this._snapBackWindow.width;
    } else {
        return windowEdgeY - this._snapBackWindow.height;
    }
}

Window_Snapback.prototype.drawCameraWindow = function(x, y){
    $gameMap.addCamera(1, x, y, 2, 2);
    $gameMap.cameraToEvent(1, -1);
}