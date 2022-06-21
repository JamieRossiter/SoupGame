/* Create Game_Temp variables at boot */
const soupcooking_game_temp_initialize_override = Game_Temp.prototype.initialize;
Game_Temp.prototype.initialize = function() {
    soupcooking_game_temp_initialize_override.call(this);
    this.clearDestination(); // Prevents automatic movement at boot
    this._soupCooking = {
        ingredients: []
    }
};

/* Scene_SoupCooking */
function Scene_SoupCooking(){
    this.initialize.apply(this, arguments);
}

Scene_SoupCooking.prototype = Object.create(Scene_MenuBase.prototype);
Scene_SoupCooking.prototype.constructor = Scene_SoupCooking;

Scene_SoupCooking.prototype.create = function(){
    Scene_MenuBase.prototype.create.call(this);
    this.createIngredientCardWindows();
    this.createIngredientSelectionWindow();
    this._ingredientSelectionWindow.setHandler('ok',     this.onItemOk.bind(this));
    this._ingredientSelectionWindow.setHandler('cancel', this.onItemCancel.bind(this));
    this._defaultIngredientData = { 
        name: "New Ingredient",
        quality: 0,
        price: 0,
        type: "produce",
        imgIndex: 0,
        stats: {
            taste: 0,
            heartiness: 0,
            calories: 0
        }
    }
}

Scene_SoupCooking.prototype.update = function(){
    Scene_MenuBase.prototype.update.call(this);
    this.populateIngredientCardWindows();
    this.handleIngredientDelete();
}

Scene_SoupCooking.prototype.handleIngredientDelete = function(){
    this._ingredientCardWMeasurementWindows.forEach((win, index) => {
        if(win.isClicked()){
            if($gameTemp._soupCooking.ingredients.length == 1){
                $gameTemp._soupCooking.ingredients = [];
            } else {
                $gameTemp._soupCooking.ingredients.splice(index, 1);
            }
            // Reset all windows when clicked
            this._ingredientCardWMeasurementWindows.forEach(win => {
                win.reset();
            })
            this._ingredientSelectionWindow.redrawAllItems();
        }
    })
}

Scene_SoupCooking.prototype.createIngredientCardWindows = function(){
    this._ingredientCardWMeasurementWindows = [
        new Window_IngredientCardWithMeasurements(130, 100), 
        new Window_IngredientCardWithMeasurements(385, 100),
        new Window_IngredientCardWithMeasurements(640, 100)
    ]
    this._ingredientCardWMeasurementWindows.forEach(win => {
        this.addChild(win);
    })
}

Scene_SoupCooking.prototype.createIngredientSelectionWindow = function(){
    this._ingredientSelectionWindow = new Window_IngredientSelection();
    this.addChild(this._ingredientSelectionWindow);
}

Scene_SoupCooking.prototype.populateIngredientCardWindows = function(){
    let ingredientsData = $gameTemp._soupCooking.ingredients;
    if(ingredientsData.length > 0){
        for(let i = 0; i < ingredientsData.length; i++){
            if(ingredientsData[i]){
                this._ingredientCardWMeasurementWindows[i].refresh(ingredientsData[i]);
                this._ingredientCardWMeasurementWindows[i]._measurementWindow.refresh(ingredientsData[i].quantity);
            }
        }
    } 
}

Scene_SoupCooking.prototype.onItemOk = function() {
    this.createMeasurementSelectWindow();
    this._measurementSelectWindow.setHandler("ok", () => {
        this.addIngredientToCard();
        this._ingredientSelectionWindow.activate();
        this._ingredientSelectionWindow.redrawCurrentItem();
        this.removeChild(this._measurementSelectWindow);
        // Check if max ingredients reached
        if($gameTemp._soupCooking.ingredients.length >= 3){
            this._ingredientSelectionWindow.deactivate();
            this.deactivateIngredientWindows();
            this.createRecipeConfirmationWindow();
        }
    })
    this._measurementSelectWindow.setHandler("cancel", () => {
        this._ingredientSelectionWindow.activate();
        this.removeChild(this._measurementSelectWindow);
    })
};

Scene_SoupCooking.prototype.deactivateIngredientWindows = function(){
    this._ingredientCardWMeasurementWindows.forEach(win => {
        win.deactivate();
    })
}

Scene_SoupCooking.prototype.createMeasurementSelectWindow = function(){
    this._measurementSelectWindow = new Window_IngredientMeasurementSelect();
    this.addChild(this._measurementSelectWindow);
}

Scene_SoupCooking.prototype.addIngredientToCard = function(){
    let ingredientData = this._ingredientCardWMeasurementWindows[0].getIngredientCardDataFromItem(this._ingredientSelectionWindow.item());
    let ingredientIndex = $gameTemp._soupCooking.ingredients.push(ingredientData) - 1;
    $gameTemp._soupCooking.ingredients[ingredientIndex].quantity = this._measurementSelectWindow.currentSymbol();
}

Scene_SoupCooking.prototype.createRecipeConfirmationWindow = function(){
    this._recipeConfirmationWindow = new Window_IngredientRecipeConfirm();
    this.addChild(this._recipeConfirmationWindow);
}

Scene_SoupCooking.prototype.onItemCancel = function() {
    SceneManager.pop();
};

/* Window IngredientCard with measurements */
function Window_IngredientCardWithMeasurements(){
    this.initialize.apply(this, arguments);
}

Window_IngredientCardWithMeasurements.prototype = Object.create(Window_IngredientCard.prototype);
Window_IngredientCardWithMeasurements.prototype.constructor = Window_IngredientCardWithMeasurements;

Window_IngredientCardWithMeasurements.prototype.initialize = function(x, y){
    Window_IngredientCard.prototype.initialize.call(this, x, y);
    this.createMeasurementWindow();
}

Window_IngredientCardWithMeasurements.prototype.createMeasurementWindow = function(){
    this._measurementWindow = new Window_IngredientMeasurement();
    this.addChild(this._measurementWindow);
}

Window_IngredientCardWithMeasurements.prototype.isClicked = function(){
    let mouseX = TouchInput.x;
    let mouseY = TouchInput.y;
    let validX = mouseX >= this.x && mouseX <= this.x + this.width;
    let validY = mouseY >= this.y && mouseY <= this.y + this.height;
    return (validX && validY && TouchInput.isReleased() && this._activated);
}

Window_IngredientCardWithMeasurements.prototype.activate = function(){
    this._activated = true;
}

Window_IngredientCardWithMeasurements.prototype.deactivate = function(){
    this._activated = false;
}

Window_IngredientCardWithMeasurements.prototype.reset = function(){
    this.contents.clear();
    this._statsWindow.contents.clear();
    this._qualityWindow.contents.clear();
    this._measurementWindow.contents.clear();
}

/* Window IngredientCardWithMeasurements - measurement window */
function Window_IngredientMeasurement(){
    this.initialize.apply(this, arguments);
}

Window_IngredientMeasurement.prototype = Object.create(Window_Base.prototype);
Window_IngredientCardWithMeasurements.prototype.constructor = Window_Base;

Window_IngredientMeasurement.prototype.initialize = function(){
    this.windowSize = { width: 95, height: 60 };
    this.windowPos = { x: 70, y: -40 };
    Window_Base.prototype.initialize.call(this, this.windowPos.x, this.windowPos.y, this.windowSize.width, this.windowSize.height);
}

Window_IngredientMeasurement.prototype.refresh = function(measurement){
    this.contents.clear();
    this.drawMeasurement(measurement);
}

Window_IngredientMeasurement.prototype.drawMeasurement = function(measurement){
    this.drawText(measurement, 0, -7, 30, "left");
}

/* Window IngredientSelection */
function Window_IngredientSelection(){
    this.initialize.apply(this, arguments);
}

Window_IngredientSelection.prototype = Object.create(Window_ItemList.prototype);
Window_IngredientSelection.prototype.constructor = Window_IngredientSelection;

Window_IngredientSelection.prototype.initialize = function(){
    this._windowPos = { x: 210, y: 460 };
    this._windowSize = { width: 580, height: 150 };
    Window_ItemList.prototype.initialize.call(this, this._windowPos.x, this._windowPos.y, this._windowSize.width, this._windowSize.height);
    this.setCategory("item");
    this.activate();
}

Window_IngredientSelection.prototype.drawItem = function(index) {
    var item = this._data[index];
    if (item) {
        var numberWidth = this.numberWidth();
        var rect = this.itemRect(index);
        rect.width -= this.textPadding();
        let chosenItems = $gameTemp._soupCooking.ingredients.map(ing => { return ing.name });
        console.log(chosenItems);
        chosenItems.forEach(chosen => {
            if(chosen){
                if(chosen.includes(item.name)){
                    console.log("yes");
                    this.changePaintOpacity(false);
                } else {
                    this.changePaintOpacity(true);
                }
            }
        })
        this.drawItemName(item, rect.x, rect.y, rect.width - numberWidth);
        // this.drawItemNumber(item, rect.x, rect.y, rect.width);
    }
};

Window_IngredientSelection.prototype.windowWidth = function(){
    return 600;
}

Window_IngredientSelection.prototype.redrawAllItems = function(){
    for (var i = 0; i < this.maxPageItems(); i++) {
        if(this.item(i)){
            this.redrawItem(i);
        }
    }
}

/* Window IngredientMeasurementSelect */
function Window_IngredientMeasurementSelect(){
    this.initialize.apply(this, arguments);
}

Window_IngredientMeasurementSelect.prototype = Object.create(Window_Command.prototype);
Window_IngredientMeasurementSelect.prototype.constructor = Window_IngredientMeasurementSelect;

Window_IngredientMeasurementSelect.prototype.initialize = function(){
    this._windowPos = { x: 540, y: 500 };
    Window_Command.prototype.initialize.call(this, this._windowPos.x, this._windowPos.y);
    this.addChild(new Window_IngredientMeasurementSelectPrompt());
}

Window_IngredientMeasurementSelect.prototype.makeCommandList = function(){
    for(let i = 100; i < 1100; i += 100){
        this.addCommand(`${i.toString()}g`, `${i.toString()}g`, true);
    }
}

Window_IngredientMeasurementSelect.prototype.windowWidth = function(){
    return 110;
}

Window_IngredientMeasurementSelect.prototype.windowHeight = function(){
    return 80;
}

/* Window IngredientMeasurementSelectPrompt */
function Window_IngredientMeasurementSelectPrompt(){
    this.initialize.apply(this, arguments);
}

Window_IngredientMeasurementSelectPrompt.prototype = Object.create(Window_Base.prototype);
Window_IngredientMeasurementSelectPrompt.prototype.constructor = Window_IngredientMeasurementSelectPrompt;

Window_IngredientMeasurementSelectPrompt.prototype.initialize = function(){
    this._windowPos = { x: -200, y: 0 };
    this._windowSize = { width: 200, height: 80 };
    Window_Base.prototype.initialize.call(this, this._windowPos.x, this._windowPos.y, this._windowSize.width, this._windowSize.height);
    this.drawPromptText();
}

Window_IngredientMeasurementSelectPrompt.prototype.drawPromptText = function(){
    this.drawTextEx("How much?", 10, 3);
}

/* Window IngredientRecipeConfirm */
function Window_IngredientRecipeConfirm(){
    this.initialize.apply(this, arguments);
}

Window_IngredientRecipeConfirm.prototype = Object.create(Window_HorzCommand.prototype);
Window_IngredientRecipeConfirm.prototype.constructor = Window_IngredientRecipeConfirm;

Window_IngredientRecipeConfirm.prototype.initialize = function(){
    this._windowPos = { x: 290, y: 480 };
    Window_HorzCommand.prototype.initialize.call(this, this._windowPos.x, this._windowPos.y);
    this.drawConfirmationText();
}

Window_IngredientRecipeConfirm.prototype.windowWidth = function(){
    return 400;
}

Window_IngredientRecipeConfirm.prototype.windowHeight = function(){
    return 100;
}

Window_IngredientRecipeConfirm.prototype.makeCommandList = function(){
    this.addCommand("Yes", "confirm", true);
    this.addCommand("No", "cancel", true);
}

Window_IngredientRecipeConfirm.prototype.itemWidth = function(){
    return 170;
}

Window_IngredientRecipeConfirm.prototype.itemRect = function(index) {
    var rect = new Rectangle();
    var maxCols = this.maxCols();
    rect.width = this.itemWidth();
    rect.height = this.itemHeight();
    rect.x = index % maxCols * (rect.width + this.spacing()) - this._scrollX;
    // rect.y = Math.floor(index / maxCols) * rect.height - this._scrollY;
    rect.y = 30;
    return rect;
};

Window_IngredientRecipeConfirm.prototype.drawConfirmationText = function(){
    this.drawTextEx("Confirm this recipe?", 45, -10);
}