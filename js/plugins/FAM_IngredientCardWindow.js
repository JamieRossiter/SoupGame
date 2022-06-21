/* Preload item images at boot */
const ingredientcard_scene_boot_create_override = Scene_Boot.prototype.create;
Scene_Boot.prototype.create = function(){
    ingredientcard_scene_boot_create_override.call(this);
    ImageManager.loadFace("produce");
}

/* Window IngredientCard */
function Window_IngredientCard(){
    this.initialize.apply(this, arguments);
}

Window_IngredientCard.prototype = Object.create(Window_Base.prototype);
Window_IngredientCard.prototype.constructor = Window_IngredientCard;

Window_IngredientCard.prototype.initialize = function(x, y){
    this.windowSize = { width: 230, height: 350 };
    Window_Base.prototype.initialize.call(this, x, y, this.windowSize.width, this.windowSize.height);
    // Add quality and stats subwindows
    this._qualityWindow = new Window_IngredientCardQuality();
    this._statsWindow = new Window_IngredientCardStats({width: this.windowSize.width, height: this.windowSize.height});
    this.addChild(this._qualityWindow);
    this.addChild(this._statsWindow);
}

Window_IngredientCard.prototype.refresh = function(ingredientData){
    // Draw ingredient image, name and price
    this.contents.clear();
    this.drawImg(ingredientData.type, ingredientData.imgIndex);
    this.drawName(ingredientData.name);
    this.drawPrice(ingredientData.price);
    this._statsWindow.refresh(ingredientData.stats);
    this._qualityWindow.refresh(ingredientData.quality);
}

Window_IngredientCard.prototype.drawImg = function(type, index){
    this.drawFace(type, index, 25, 30);
}

Window_IngredientCard.prototype.drawName = function(name){
    this.drawTextExAlign(`\\c[1]${name.toUpperCase()}\\c[0]`, -5, 150, 100, "center");
}

Window_IngredientCard.prototype.drawPrice = function(price){
    this.drawTextExAlign(`\\c[1]${price}\\c[0]`, 90, -7, 50, "right");
    this.drawIcon(382, 105, 0);
}

/* SUB WINDOWS */

/* Window ItemCardQuality */
function Window_IngredientCardQuality(){
    this.initialize.apply(this, arguments);
}

Window_IngredientCardQuality.prototype = Object.create(Window_Base.prototype);
Window_IngredientCardQuality.prototype.constructor = Window_IngredientCardQuality;

Window_IngredientCardQuality.prototype.initialize = function(){
    this.windowPos = { x: 0, y: 0 };
    this.windowSize = { width: 110, height: 55 };
    Window_Base.prototype.initialize.call(this, this.windowPos.x, this.windowPos.y, this.windowSize.width, this.windowSize.height);
}

Window_IngredientCardQuality.prototype.refresh = function(quality){
    this.drawRating(quality);
}

Window_IngredientCardQuality.prototype.drawRating = function(quality){
    // Empty stars
    for(let i = 0; i < 3; i++){
        this.drawIcon(4, 20 * i, -5)
    }
    // Filled stars
    for(let i = 0; i < quality; i++){
        this.drawIcon(3, 20 * i, -5);
    }
}

/* Window ItemCardStats */
function Window_IngredientCardStats(){
    this.initialize.apply(this, arguments);
}

Window_IngredientCardStats.prototype = Object.create(Window_Base.prototype);
Window_IngredientCardStats.prototype.constructor = Window_IngredientCardStats;

Window_IngredientCardStats.prototype.initialize = function(parentSize, stats){
    this.windowSize = { width: parentSize.width, height: 125 };
    this.windowPos = { x: 0, y: parentSize.height - this.windowSize.height };
    Window_Base.prototype.initialize.call(this, this.windowPos.x, this.windowPos.y, this.windowSize.width, this.windowSize.height);
}

Window_IngredientCardStats.prototype.refresh = function(stats){
    this.contents.clear();
    this.drawTaste(stats.taste);
    this.drawHeartiness(stats.heartiness);
    this.drawCalories(stats.calories);
}

Window_IngredientCardStats.prototype.drawTaste = function(taste){
    this.drawIcon(110, 0, 0);
    this.drawTextExAlign(`\\c[1]Taste\\c[0]`, 40, -2, 50, "left");
    this.drawText(`${taste.toString()}`, 150, -3, 20, "right");
}

Window_IngredientCardStats.prototype.drawHeartiness = function(heartiness){
    this.drawIcon(1, 0, 28);
    this.drawTextExAlign(`\\c[1]Hearty\\c[0]`, 50, 25, 50, "left");
    this.drawText(`${heartiness.toString()}`, 150, 25, 20, "right");
}

Window_IngredientCardStats.prototype.drawCalories = function(calories){
    this.drawIcon(338, -2, 60);
    this.drawTextExAlign(`\\c[1]Calor.\\c[0]`, 45, 53, 50, "left");
    this.drawText(`${calories.toString()}`, 150, 53, 20, "right");
}
