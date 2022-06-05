/*:
* @plugindesc Handles all notebook-related logic.
* @author Jamie Rossiter
*/

/* Pre-load Notebook image in scene booter */
let notebook_scene_boot_create_override = Scene_Boot.prototype.create;
Scene_Boot.prototype.create = function() {
    notebook_scene_boot_create_override.call(this);
    ImageManager.loadPicture("notebook");
};

function Window_Notebook(){
    this.initialize.apply(this, arguments);
}

Window_Notebook.prototype = Object.create(Window_Draggable.prototype);
Window_Notebook.prototype.constructor = Window_Notebook;

Window_Notebook.prototype.initialize = function(x, y, width, height){
    Window_Draggable.prototype.initialize.call(this, x, y, width, height);
    this._windowType = "notebook";
    this._leftNavArrow = { x: 5, y: 200, width: 50, height: 50 };
    this._rightNavArrow = { x: 505, y: 200, width: 50, height: 50 };
}

Window_Notebook.prototype.refresh = function(){
    Window_Draggable.prototype.refresh.call(this);
    this.drawPicture("notebook", 0, 0);
    this.setBackgroundType(2);
    this.drawArrows();
    this.drawVillagerImage();
    this.drawVillagerName();
    this.drawVillagerPersonality();
    // Check if navigation/pagination is taking place
    if(TouchInput.isPressed()){
        if(this.checkForNavButtonPress(this._leftNavArrow)){
            // Do left pagination
            console.log("left pagination");
        } else if(this.checkForNavButtonPress(this._rightNavArrow)){
            // Do right pagination
            console.log("right pagination");
        }
    }
}

Window_Notebook.prototype.drawArrows = function(){
    // Left
    this.drawIcon(114, this._leftNavArrow.x, this._leftNavArrow.y);
    // Right
    this.drawIcon(113, this._rightNavArrow.x, this._rightNavArrow.y);
}

Window_Notebook.prototype.drawVillagerImage = function(){
    this.drawCharacter("npc1", 0, 150, 130);
}

Window_Notebook.prototype.drawVillagerName = function(){
    this.drawTextExAlign("\\c[1]SIMON MORSZO\\c[0]", 50, 130, 100, "center");
}

Window_Notebook.prototype.drawVillagerPersonality = function(){
    this.drawTextEx("\\c[1]Alignment\\c[0]", 50, 160);
    this.drawTextExAlign("\\c[1]Left\\c[0]", -50, 185, 200, "center");
    this.drawPicture("example_text", 278, 65);
}

Window_Notebook.prototype.checkForNavButtonPress = function(arrow){
    const navDir = arrow;
    let mouseX = TouchInput.x;
    let mouseY = TouchInput.y;
    let validX = mouseX >= (this.x + arrow.x) && mouseX <= ((this.x + arrow.x) + arrow.width);
    let validY = mouseY >= (this.y + arrow.y) && mouseY <= ((this.y + arrow.y) + arrow.height);
    return validX && validY;
}


/* TESTING */

/* Override map scene */
// const Notebook_scene_map_start_override = Scene_Map.prototype.start;
// const Notebook_scene_map_update_override = Scene_Map.prototype.update;

// Scene_Map.prototype.start = function(){
//     Notebook_scene_map_start_override.call(this);
//     this._notebookWindow = new Window_Notebook(500, 50, 580, 450);
//     this.addChild(this._notebookWindow);
// }

// Scene_Map.prototype.update = function(){
//     Notebook_scene_map_update_override.call(this);
//     this._notebookWindow.refresh();
// }