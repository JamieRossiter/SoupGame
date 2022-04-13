/*:
* @plugindesc Handles all passport-related logic.
* @author Jamie Rossiter
*/

/* Pre-load passport image in scene booter */
let passport_scene_boot_create_override = Scene_Boot.prototype.create;
Scene_Boot.prototype.create = function() {
    passport_scene_boot_create_override.call(this);
    ImageManager.loadPicture("passport");
};

function Window_Passport(){
    this.initialize.apply(this, arguments);
}

Window_Passport.prototype = Object.create(Window_Draggable.prototype);
Window_Passport.prototype.constructor = Window_Passport;

Window_Passport.prototype.initialize = function(x, y, width, height){
    Window_Draggable.prototype.initialize.call(this, x, y, width, height);
    this._windowType = "passport";
}

Window_Passport.prototype.refresh = function(){
    Window_Draggable.prototype.refresh.call(this);
    this.drawPicture("passport", 20, 0);
    this.drawIdTitle();
    this.drawIdImage();
    this.drawIdName();
    this.drawIdExpiry();
    this.drawIdRegion();
    this.setBackgroundType(2);
}

Window_Passport.prototype.drawIdTitle = function(){
    this.drawTextEx("\\} M I N I S T R Y  O F", 80, 15);
    this.drawTextEx("\\}  A G R I C U L T U R E \\{", 69, 30);
    this.drawTextEx("LABOR CERTIFICATE", 60, 100);
}

Window_Passport.prototype.drawIdImage = function(){
    this.drawCharacter("npc1", 0, 70, 275);
}

Window_Passport.prototype.drawIdName = function(){
    this.drawText("Morszo, Simon", 90, 175, 150, "right");
}

Window_Passport.prototype.drawIdExpiry = function(){
    this.drawTextEx("\\} E X P I R E S \\{", 160, 200);
    this.drawText("02-08-1928", 90, 215, 150, "right");
}

Window_Passport.prototype.drawIdRegion = function(){
    this.drawTextEx("\\} P R O V I N C E \\{", 148, 240);
    this.drawText("Ormasz", 80, 255, 160, "right");
}

/* TESTING */

/* Override map scene */
// const passport_scene_map_start_override = Scene_Map.prototype.start;
// const passport_scene_map_update_override = Scene_Map.prototype.update;

// Scene_Map.prototype.start = function(){
//     passport_scene_map_start_override.call(this);
//     this._passportWindow = new Window_Passport(50, 50, 300, 350);
//     this.addChild(this._passportWindow);
// }

// Scene_Map.prototype.update = function(){
//     passport_scene_map_update_override.call(this);
//     this._passportWindow.refresh();
// }