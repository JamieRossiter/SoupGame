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
    this.drawTextEx("\\c[1]MINISTRY OF\\c[0]", 55, 15);
    this.drawTextEx("\\c[1]AGRICULTURE\\c[0]", 55, 35);
    this.drawTextEx("\\c[1]LABOR\\c[0]", 99, 83);
    this.drawTextEx("\\c[1]CERTIFICATE\\c[0]", 55, 103);
}

Window_Passport.prototype.drawIdImage = function(){
    this.drawCharacter("npc1", 0, 70, 290);
}

Window_Passport.prototype.drawIdName = function(){
    this.drawTextExAlign("\\c[1]Morszo, Simon\\c[0]", 0, 165, 100, "right");
}

Window_Passport.prototype.drawIdExpiry = function(){
    this.drawTextExAlign("\\c[1]EXPIRES\\c[0]", 35, 190, 100, "right");
    this.drawTextExAlign("\\c[1]02-08-1928\\c[0]", 30, 215, 100, "right");
}

Window_Passport.prototype.drawIdRegion = function(){
    this.drawTextEx("\\c[1]PROVINCE\\c[0]", 105, 245);
    this.drawTextExAlign("\\c[1]Ormasz\\c[0]", 50, 265, 100, "right");
}

/* TESTING */

/* Override map scene */
const passport_scene_map_start_override = Scene_Map.prototype.start;
const passport_scene_map_update_override = Scene_Map.prototype.update;

Scene_Map.prototype.start = function(){
    passport_scene_map_start_override.call(this);
    this._passportWindow = new Window_Passport(50, 50, 300, 350);
    this.addChild(this._passportWindow);
}

Scene_Map.prototype.update = function(){
    passport_scene_map_update_override.call(this);
    this._passportWindow.refresh();
}