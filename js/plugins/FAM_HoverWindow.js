/*:
* @plugindesc Shows a profile window when hovering over an NPC.
* @author Jamie Rossiter
*/

/* Preload checkout item images at boot */
const checkout_scene_boot_create_override = Scene_Boot.prototype.create;
Scene_Boot.prototype.create = function(){
    checkout_scene_boot_create_override.call(this);
}

/* Scene Map */
const hover_scene_start_override = Scene_Map.prototype.start;
const hover_scene_update_override = Scene_Map.prototype.update;

Scene_Map.prototype.start = function(){
    hover_scene_start_override.call(this);
    this._hoverWindow = new Window_Hover();
}

Scene_Map.prototype.update = function(){
    hover_scene_update_override.call(this);
    let hoveredNpcs = checkIfNpc(TouchInput._checkForEventUnderMouse(TouchInput.x, TouchInput.y));
    if(hoveredNpcs && hoveredNpcs.length > 0){
        this.addChild(this._hoverWindow);
        toggleThoughtTail(true, hoveredNpcs);
        this._hoverWindow.refresh(hoveredNpcs);
    } else {
        this.removeChild(this._hoverWindow);
        toggleThoughtTail(false, null);
    }
}

function checkIfNpc(hoveredEvents){
    if(hoveredEvents){
        return hoveredEvents.filter(event => {
            if(event){
                return event.event().note.includes("<npc>");
            }
        })
    }
}

function toggleThoughtTail(visible, hoveredNpcs, opacity){
    if(visible){
        $gameScreen.showPicture(1, "tail", 1, hoveredNpcs[0].screenX(), hoveredNpcs[0].screenY() - 62, 100, 100, 255, 0);
    } else {
        $gameScreen.erasePicture(1);
    }
}

/* Hover Window */
function Window_Hover(){
    this.initialize.apply(this, arguments);
}

Window_Hover.prototype = Object.create(Window_Base.prototype);
Window_Hover.prototype.constructor = Window_Hover;

Window_Hover.prototype.initialize = function(){
    this.windowSize = { width: 100, height: 100 };
    Window_Base.prototype.initialize.call(this, 0, 0, this.windowSize.width, this.windowSize.height);
}

Window_Hover.prototype.refresh = function(mapEvent){
    this.x = mapEvent[0].screenX() - 50;
    this.y = mapEvent[0].screenY() - 175;
}

// Set the window skin to a thought bubble window
Window_Hover.prototype.loadWindowskin = function() {
    this.windowskin = ImageManager.loadSystem('Window_Thought');
};

// Set the window colour to white
Window_Hover.prototype.updateTone = function() {
    this.setTone(0, 0, 0);
};
