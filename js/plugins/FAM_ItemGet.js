/*:
* @plugindesc Creates a scene for when the player picks up an item.
* @author Jamie Rossiter
*/

/* Center drawTextEx */
Window_Base.prototype.drawTextExCentered = function(text){
    var txWidth = this.drawTextEx(text, -100, -100);
    txWidth += this.textPadding() * 2;
    var wx = (this.contents.width - txWidth) / 2;
    var wy = 0;
    this.drawTextEx(text, wx + this.textPadding(), wy);
}

/* Center drawTextEx with X, Y coords and width */
Window_Base.prototype.drawTextExAlign = function(text, x, y, width, align){
    let tx = x;
    var txWidth = this.drawTextEx(text, -100, -100);
    txWidth += this.textPadding() * 2;
    var wx = (width - txWidth) / 2;
    if (align === 'center') {
        tx += width / 2;
    }
    if (align === 'right') {
        tx += width;
    }
    this.drawTextEx(text, (wx + this.textPadding()) + tx, y);
}

/* Item images */
Window_Base.prototype.itemImageDictionary = function(){
    return {
        "default": [1, 0],
        "severed_arm": [1, 0]
    }
}

/* Pre-load item get image in scene booter */
let item_get_scene_boot_create_override = Scene_Boot.prototype.create;
Scene_Boot.prototype.create = function() {
    item_get_scene_boot_create_override.call(this);
    ImageManager.loadFace("item_faces_1");
};

/* Override SceneManager */
SceneManager.snapForBackground = function() {
    this._backgroundBitmap = this.snap();
    // this._backgroundBitmap.blur();
    this._backgroundBitmap.adjustTone(-125, -125, -125);
};

/* Override map scene */
const item_get_scene_map_start_override = Scene_Map.prototype.start;
Scene_Map.prototype.start = function(){
    item_get_scene_map_start_override.call(this);
    $gameTemp._item = {};
    $gameTemp._item.pickUp = null;
    $gameTemp._item.image = "default";
}

function Scene_ItemGet(){
    this.initialize.apply(this, arguments);
}

Scene_ItemGet.prototype = Object.create(Scene_MenuBase.prototype);
Scene_ItemGet.prototype.constructor = Scene_ItemGet;

Scene_ItemGet.prototype.create = function(){
    Scene_MenuBase.prototype.create.call(this);
    this._itemWindowImage = new Window_ItemGetImage();
    this._itemWindowPrompt = new Window_ItemGetPrompt();
    this._itemWindowSelect = new Window_ItemGetSelect();
    setTimeout(() => {
        this.addChild(this._itemWindowImage);
        this.addChild(this._itemWindowPrompt);
        this.addChild(this._itemWindowSelect);
    }, 500)
}

function Window_ItemGetImage(){
    this.initialize.apply(this, arguments);
}

Window_ItemGetImage.prototype = Object.create(Window_Base.prototype);
Window_ItemGetImage.prototype.constructor = Window_ItemGetImage;

Window_ItemGetImage.prototype.initialize = function(){
    this.windowSize = { width: 180, height: 180 };
    this.windowPosition = { x: 540, y: 180};
    Window_Base.prototype.initialize.call(this, this.windowPosition.x, this.windowPosition.y, this.windowSize.width, this.windowSize.height);
    let itemImage = $gameTemp._item.image;
    this.drawItemImage(itemImage);
}

Window_ItemGetImage.prototype.drawItemImage = function(itemImage){
    let imageData = this.itemImageDictionary()[itemImage];
    this.drawFace(`item_faces_${imageData[0]}`, imageData[1], 0, 0);
}

function Window_ItemGetPrompt(){
    this.initialize.apply(this, arguments);
}

Window_ItemGetPrompt.prototype = Object.create(Window_Base.prototype);
Window_ItemGetPrompt.prototype.constructor = Window_ItemGetPrompt;

Window_ItemGetPrompt.prototype.initialize = function(){
    this.windowSize = { width: 500, height: 80 };
    this.windowPosition = { x: 385, y: 370};
    Window_Base.prototype.initialize.call(this, this.windowPosition.x, this.windowPosition.y, this.windowSize.width, this.windowSize.height);
    let item = $gameTemp._item.pickUp;
    this.drawPromptText(item);
}

Window_ItemGetPrompt.prototype.drawPromptText = function(item){
    this.drawTextExCentered(`Will you take the \\c[4]${item.name}\\c[0]?`);
}

function Window_ItemGetSelect(){
    this.initialize.apply(this, arguments);
}

Window_ItemGetSelect.prototype = Object.create(Window_HorzCommand.prototype);
Window_ItemGetSelect.prototype.constructor = Window_ItemGetSelect;

Window_ItemGetSelect.prototype.initialize = function(){
    this.windowPosition = { x: 510, y: 460};
    Window_HorzCommand.prototype.initialize.call(this, this.windowPosition.x, this.windowPosition.y);
    let item = $gameTemp._item.pickUp;
    this.setHandler("yes", () => this.addItemToInventory(item))
    this.setHandler("no", () => SceneManager.pop())
}

Window_ItemGetSelect.prototype.makeCommandList = function(){
    this.addCommand("Yes", "yes", true);
    this.addCommand("No", "no", true);
}

Window_ItemGetSelect.prototype.itemWidth = function() {
    return 100;
}

Window_ItemGetSelect.prototype.addItemToInventory = function(item){
    $gameParty.gainItem(item, 1);
    SceneManager.pop();
}