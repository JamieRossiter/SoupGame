/*:
* @plugindesc Creates the stat selection screen that displays after each chapter.   
* @author Jamie Rossiter
*/

const Y_OFFSET = 50;
const X_OFFSET = -85;

/* Pre-load item get image in scene booter */
let stat_select_scene_boot_create_override = Scene_Boot.prototype.create;
Scene_Boot.prototype.create = function() {
    stat_select_scene_boot_create_override.call(this);
    ImageManager.loadPicture("weights");
    ImageManager.loadPicture("books");
    ImageManager.loadPicture("mugs");
    ImageManager.loadCharacter("government");
};

function Scene_StatSelection(){
    this.initialize.apply(this, arguments);
}

Scene_StatSelection.prototype = Object.create(Scene_MenuBase.prototype);
Scene_StatSelection.prototype.constructor = Scene_StatSelection;

Scene_StatSelection.prototype.create = function(){
    Scene_MenuBase.prototype.create.call(this);
    this._selectionWindow = new Window_StatSelection();
    this._descriptionWindow = new Window_StatDescription();
    this._pointsWindow = new Window_StatPoints();
    this._titleWindow = new Window_StatTitle();
    this._characterWindow = new Window_StatCharacter();
    this.addChild(this._selectionWindow);
    this.addChild(this._descriptionWindow);
    this.addChild(this._pointsWindow);
    this.addChild(this._titleWindow);
    this.addChild(this._characterWindow);
}

Scene_StatSelection.prototype.update = function(){
    Scene_MenuBase.prototype.update.call(this);
    this._descriptionWindow.refresh(this._selectionWindow._index);
    this._pointsWindow.refresh(0);
    this._characterWindow.refresh();
}

function Window_StatSelection(){
    this.initialize.apply(this, arguments);
}

Window_StatSelection.prototype = Object.create(Window_HorzCommand.prototype);
Window_StatSelection.prototype.constructor = Window_StatSelection;

Window_StatSelection.prototype.initialize = function(){
    this.windowPosition = { x: 150 + X_OFFSET, y: 180 + Y_OFFSET};
    Window_HorzCommand.prototype.initialize.call(this, this.windowPosition.x, this.windowPosition.y);
}

Window_StatSelection.prototype.makeCommandList = function(){
    this.addCommand("Purchase books on state policy", "int", true);
    this.addCommand("Go out drinking with friends", "cha", true);
    this.addCommand("Buy 30 day gymnasium membership", "tim", true);
}

Window_StatSelection.prototype.itemWidth = function(){
    return 300;
}

Window_StatSelection.prototype.itemHeight = function(){
    return 200;
}

Window_StatSelection.prototype.windowWidth = function(){
    return 960;
}

Window_StatSelection.prototype.windowHeight = function(){
    return 240;
}

Window_StatSelection.prototype.drawItem = function(index) {
    var rect = this.itemRectForText(index);
    var align = this.itemTextAlign();
    this.resetTextColor();
    this.changePaintOpacity(this.isCommandEnabled(index));
    if(index === 0) this.drawPicture("books", rect.x + 50, rect.y + 50);
    if(index === 1) this.drawPicture("mugs", rect.x + 60, rect.y + 40);
    if(index === 2) this.drawPicture("weights", rect.x + 45, rect.y);
    this.drawText(this.commandName(index), rect.x, rect.y, rect.width, align);
};

function Window_StatDescription(){
    this.initialize.apply(this, arguments);
}

Window_StatDescription.prototype = Object.create(Window_Base.prototype);
Window_StatDescription.prototype.constructor = Window_StatDescription;

Window_StatDescription.prototype.initialize = function(){
    this.windowPosition = { x: 150 + X_OFFSET, y: 420 + Y_OFFSET};
    this.windowSize = { width: 960, height: 80 }; 
    Window_Base.prototype.initialize.call(this, this.windowPosition.x, this.windowPosition.y, this.windowSize.width, this.windowSize.height);
}

Window_StatDescription.prototype.refresh = function(index){
    this.contents.clear();
    switch(index){
        case 0:
            this.drawTextExCentered("Brush up on the state's latest policies. \\c[5]Increases intelligence.\\c[0]");
            break;
        case 1:
            this.drawTextExCentered("Catch up with some old friends at the tavern. \\c[5]Increases charisma.\\c[0]");
            break;
        case 2:
            this.drawTextExCentered("Build muscle and raw strength. \\c[5]Increases intimidation.\\c[0]");
            break;
    }
}

function Window_StatPoints(){
    this.initialize.apply(this, arguments);
}

Window_StatPoints.prototype = Object.create(Window_Base.prototype);
Window_StatPoints.prototype.constructor = Window_StatPoints;

Window_StatPoints.prototype.initialize = function(){
    this.windowPosition = { x: 760 + X_OFFSET, y: 110 + Y_OFFSET};
    this.windowSize = { width: 350, height: 70 }; 
    Window_Base.prototype.initialize.call(this, this.windowPosition.x, this.windowPosition.y, this.windowSize.width, this.windowSize.height);
}

Window_StatPoints.prototype.refresh = function(points){
    this.contents.clear();
    this.drawTextEx(`Skill Points Remaining: ${points}`, 10, -5);
}

function Window_StatTitle(){
    this.initialize.apply(this, arguments);
}

Window_StatTitle.prototype = Object.create(Window_Base.prototype);
Window_StatTitle.prototype.constructor = Window_StatTitle;

Window_StatTitle.prototype.initialize = function(){
    this.windowPosition = { x: 150 + X_OFFSET, y: 110 + Y_OFFSET};
    this.windowSize = { width: 609, height: 70 }; 
    Window_Base.prototype.initialize.call(this, this.windowPosition.x, this.windowPosition.y, this.windowSize.width, this.windowSize.height);
    this.drawTextEx("Assign Skill Points", 10, -5);
}

function Window_StatCharacter(){
    this.initialize.apply(this, arguments);
}

Window_StatCharacter.prototype = Object.create(Window_Base.prototype);
Window_StatCharacter.prototype.constructor = Window_StatCharacter;

Window_StatCharacter.prototype.initialize = function(){
    this.windowPosition = { x: 1111 + X_OFFSET, y: 110 + Y_OFFSET};
    this.windowSize = { width: 200, height: 390 }; 
    Window_Base.prototype.initialize.call(this, this.windowPosition.x, this.windowPosition.y, this.windowSize.width, this.windowSize.height);
}

Window_StatCharacter.prototype.refresh = function(){
    this.contents.clear();
    this.yOffset = 10; // Offset UI features by a certain value
    this.drawCharacter("government", 6, 80, 100);
    this.drawText("IVAN LENIN", 20, 98, 120, "center");
    this.drawIntelligence(3);
    this.drawCharisma(5);
    this.drawIntimidation(8);
}

Window_StatCharacter.prototype.drawIntelligence = function(intelligence){
    this.drawTextEx("Intelligence", 30, 130 + this.yOffset);
    for(let i = 0; i < 10; i++){
        this.drawIcon(4, -5 + (i * 15), 160 + this.yOffset);
    }
    for(let i = 0; i < intelligence; i++){
        this.drawIcon(3, -5 + (i * 15), 160 + this.yOffset);
    }
}

Window_StatCharacter.prototype.drawCharisma = function(charisma){
    this.drawTextEx("Charisma", 40, 190 + this.yOffset);
    for(let i = 0; i < 10; i++){
        this.drawIcon(4, -5 + (i * 15), 220 + this.yOffset);
    }
    for(let i = 0; i < charisma; i++){
        this.drawIcon(3, -5 + (i * 15), 220 + this.yOffset);
    }
}

Window_StatCharacter.prototype.drawIntimidation = function(intimidation){
    this.drawTextEx("Intimidation", 40, 250 + this.yOffset);
    for(let i = 0; i < 10; i++){
        this.drawIcon(4, -5 + (i * 15), 280 + this.yOffset);
    }
    for(let i = 0; i < intimidation; i++){
        this.drawIcon(3, -5 + (i * 15), 280 + this.yOffset);
    }
}