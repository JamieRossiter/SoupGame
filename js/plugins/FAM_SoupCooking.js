/* Create Game_Temp variables at boot */
const soupcooking_game_temp_initialize_override = Game_Temp.prototype.initialize;
Game_Temp.prototype.initialize = function() {
    soupcooking_game_temp_initialize_override.call(this);
    this.clearDestination(); // Prevents automatic movement at boot
    this._soupCooking = {
        ingredients: [],
        currentRecipe: {
            name: "Edit Name",
            quality: 3,
            price: 250,
            type: "soup",
            imgIndex: 0,
            stats: {
                taste: 6,
                heartiness: 3,
                calories: 980
            }
        },
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
    this._ingredientSelectionWindow.setHandler('ok',     this.onIngredientSelect.bind(this));
    this._ingredientSelectionWindow.setHandler('cancel', () => { SceneManager.pop() });
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
            $gameTemp._soupCooking.ingredients.splice(index, 1);
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
    const ingredientsData = $gameTemp._soupCooking.ingredients;
    if(ingredientsData.length > 0){
        for(let i = 0; i < ingredientsData.length; i++){
            if(ingredientsData[i]){
                this._ingredientCardWMeasurementWindows[i].refresh(ingredientsData[i]);
                this._ingredientCardWMeasurementWindows[i]._measurementWindow.refresh(ingredientsData[i].quantity);
            }
        }
    } 
}

Scene_SoupCooking.prototype.onIngredientSelect = function() {
    this.createMeasurementSelectWindow();
    // Handle measurement selection
    this._measurementSelectWindow.setHandler("ok", this.onMeasurementSelect.bind(this));
    this._measurementSelectWindow.setHandler("cancel", () => {
        this._ingredientSelectionWindow.activate();
        this.removeChild(this._measurementSelectWindow);
    })
};

Scene_SoupCooking.prototype.onMeasurementSelect = function(){
    this.addIngredientToSoupCookingVar();
    this._ingredientSelectionWindow.activate();
    this._ingredientSelectionWindow.redrawCurrentItem();
    this.removeChild(this._measurementSelectWindow);
    // Check if max ingredients reached
    if($gameTemp._soupCooking.ingredients.length >= 3){
        this._ingredientSelectionWindow.deactivate();
        this.deactivateIngredientWindows();
        this.createRecipeConfirmationWindow();
        // Handle recipe confirmation
        this._recipeConfirmationWindow.setHandler("ok", this.onRecipeConfirmation.bind(this))
        this._recipeConfirmationWindow.setHandler("cancel", () => {
            this.removeChild(this._recipeConfirmationWindow);
            this._ingredientSelectionWindow.activate();
            this.activateIngredientWindows();
        })
    }
}

Scene_SoupCooking.prototype.onRecipeConfirmation = function(){
    const ingredientsData = $gameTemp._soupCooking.ingredients;
    $gameTemp._soupCooking.currentRecipe.price = this.calculateTotalIngredientPrice(ingredientsData);
    $gameTemp._soupCooking.currentRecipe.stats = this.calculateStats(ingredientsData);
    $gameTemp._soupCooking.currentRecipe.quality = this.calculateQuality(ingredientsData);
    SceneManager.push(Scene_SoupRecipeCreated);
}

Scene_SoupCooking.prototype.calculateQuality = function(ingredients){
    let finalQuality = 0;
    const qualities = ingredients.map(ing => {
        return parseInt(ing.quality);
    })
    console.log(qualities);
    qualities.forEach(qual => {
        finalQuality += qual;
    })
    finalQuality = Math.floor(finalQuality / qualities.length);
    console.log(finalQuality);
    return finalQuality;
}

Scene_SoupCooking.prototype.calculateStats = function(ingredients){
    let finalStats = {
        taste: 0,
        heartiness: 0,
        calories: 0
    };
    const tastes = ingredients.map(ing => {
        return parseInt(ing.stats.taste);
    })
    const heartinesses = ingredients.map(ing => {
        return parseInt(ing.stats.heartiness);
    })
    const calories = ingredients.map(ing => {
        return parseInt(ing.stats.calories);
    })
    tastes.forEach((taste, index) => {
        finalStats.taste += taste;
        finalStats.heartiness += heartinesses[index];
        finalStats.calories += calories[index];
    })
    return finalStats;
}

Scene_SoupCooking.prototype.calculateTotalIngredientPrice = function(ingredients){
    let totalPrice = 0;
    const prices = ingredients.map(ing => {
        return ing.price;
    })
    const quantities = ingredients.map(ing => {
        return parseInt(ing.quantity.split("g")[0]); // Remove "g" measurement and turn into a number
    })
    prices.forEach((price, index) => {
        let priceQuantity = quantities[index] * 0.01;
        let totalItemPrice = price * priceQuantity;
        totalPrice += totalItemPrice;
    })
    return totalPrice;
}

Scene_SoupCooking.prototype.activateIngredientWindows = function(){
    this._ingredientCardWMeasurementWindows.forEach(win => {
        win.activate();
    })
}

Scene_SoupCooking.prototype.deactivateIngredientWindows = function(){
    this._ingredientCardWMeasurementWindows.forEach(win => {
        win.deactivate();
    })
}

Scene_SoupCooking.prototype.createMeasurementSelectWindow = function(){
    this._measurementSelectWindow = new Window_IngredientMeasurementSelect();
    this.addChild(this._measurementSelectWindow);
}

Scene_SoupCooking.prototype.addIngredientToSoupCookingVar = function(){
    let ingredientData = this._ingredientCardWMeasurementWindows[0].getIngredientCardDataFromItem(this._ingredientSelectionWindow.item());
    let ingredientIndex = $gameTemp._soupCooking.ingredients.push(ingredientData) - 1;
    $gameTemp._soupCooking.ingredients[ingredientIndex].quantity = this._measurementSelectWindow.currentSymbol();
}

Scene_SoupCooking.prototype.createRecipeConfirmationWindow = function(){
    this._recipeConfirmationWindow = new Window_IngredientRecipeConfirm();
    this.addChild(this._recipeConfirmationWindow);
}

/* Window IngredientCard with measurements */
function Window_IngredientCardWithMeasurements(){
    this.initialize.apply(this, arguments);
}

Window_IngredientCardWithMeasurements.prototype = Object.create(Window_IngredientCard.prototype);
Window_IngredientCardWithMeasurements.prototype.constructor = Window_IngredientCardWithMeasurements;

Window_IngredientCardWithMeasurements.prototype.initialize = function(x, y){
    Window_IngredientCard.prototype.initialize.call(this, x, y);
    this.createMeasurementWindow();
    this._activated = true;
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
    this._windowPos = { x: 150, y: 460 };
    this._windowSize = { width: 700, height: 150 };
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
        // If ingredients list is not populated in any way, ensure all ingredients are enabled
        if(chosenItems.length > 0){
            chosenItems.forEach(chosen => {
                if(chosen){
                    if(chosen.includes(item.name)){
                        this.changePaintOpacity(false);
                    } else {
                        this.changePaintOpacity(true);
                    }
                }
            })
        } else {
            this.changePaintOpacity(true);
        }
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

Window_IngredientSelection.prototype.maxCols = function(){
    return 3;
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

/* Scene_SoupRecipeCreated */

function Scene_SoupRecipeCreated(){
    this.initialize.apply(this, arguments);
}

Scene_SoupRecipeCreated.prototype = Object.create(Scene_MenuBase.prototype);
Scene_SoupRecipeCreated.prototype.constructor = Scene_SoupRecipeCreated;

Scene_SoupRecipeCreated.prototype.create = function(){
    Scene_MenuBase.prototype.create.call(this);
    this._recipeCardWindow = new Window_IngredientCardRecipe(330, 130);
    this.addChild(this._recipeCardWindow);
}

Scene_SoupRecipeCreated.prototype.update = function(){
    Scene_MenuBase.prototype.update.call(this);
    this._recipeCardWindow.refresh($gameTemp._soupCooking.currentRecipe);
}

/* Window IngredientCardRecipe */
function Window_IngredientCardRecipe(){
    this.initialize.apply(this, arguments);
}

Window_IngredientCardRecipe.prototype = Object.create(Window_IngredientCard.prototype);
Window_IngredientCardRecipe.prototype.constructor = Window_IngredientCardRecipe;

Window_IngredientCardRecipe.prototype.initialize = function(x, y){
    Window_IngredientCard.prototype.initialize.call(this, x, y)
    this.createTabWindows();
    this.createRecipeNameInputWindow();
    this.createRecipeMessageWindow();
    this.createRecipeConfirmationWindow();
    this._recipeConfirmationWindow.setHandler('ok', this.onFullConfirmation.bind(this));
}

const recipe_windowingredientcardreciperefresh_override = Window_IngredientCardRecipe.prototype.refresh;
Window_IngredientCardRecipe.prototype.refresh = function(currentRecipe){
    recipe_windowingredientcardreciperefresh_override.call(this, currentRecipe);
    this._recipeNameInputWindow.refresh();
}

Window_IngredientCardRecipe.prototype.onFullConfirmation = function(){
    if(this._recipeNameInputWindow._textBuffer != 0){
        // TODO: ADD RECIPE TO PLAYER RECIPES
        $gameTemp._soupCooking.name = this._recipeNameInputWindow._textBuffer;
        // Revert soup cooking object back to its original state
        $gameTemp._soupCooking = {
            ingredients: [],
            currentRecipe: {
                name: "Edit Name",
                quality: 3,
                price: 250,
                type: "soup",
                imgIndex: 0,
                stats: {
                    taste: 6,
                    heartiness: 3,
                    calories: 980
                }
            },
        }
        SceneManager.pop();
    } else {
        this._recipeConfirmationWindow.activate();
    }
}

Window_IngredientCardRecipe.prototype.createRecipeMessageWindow = function(){
    this._recipeMessageWindow = new Window_RecipeMessage(0, -70);
    this.addChild(this._recipeMessageWindow);
}

Window_IngredientCardRecipe.prototype.createRecipeConfirmationWindow = function(){
    this._recipeConfirmationWindow = new Window_RecipeConfirmation(0, 355);
    this.addChild(this._recipeConfirmationWindow);
}

Window_IngredientCardRecipe.prototype.createRecipeNameInputWindow = function(){
    this._recipeNameInputWindow = new Window_TextInput(this, 0, 150, 230, 80, $gameTemp._soupCooking.currentRecipe.name, 11);
    this.addChild(this._recipeNameInputWindow);
}

Window_IngredientCardRecipe.prototype.createTabWindows = function(){
    this._ingredients = $gameTemp._soupCooking.ingredients;
    this._recipeTabWindows = [
        new Window_RecipeIngredientTab(228, 86),
        new Window_RecipeIngredientTab(228, 145),
        new Window_RecipeIngredientTab(228, 204),
    ]
    this._recipeTabWindows.forEach((tab, index) => {
        this.addChild(tab);
        tab.drawIngredient(this._ingredients[index]);
    })
}

Window_IngredientCardRecipe.prototype.drawPrice = function(price){
    this.drawText(`${price}`, 140, -7, 50, "center");
    this.drawIcon(382, 105, 0);
}

Window_IngredientCardRecipe.prototype.drawName = function(name){
}

/* Window RecipeIngredientTab */
function Window_RecipeIngredientTab(){
    this.initialize.apply(this, arguments);
}

Window_RecipeIngredientTab.prototype = Object.create(Window_Base.prototype);
Window_RecipeIngredientTab.prototype.constructor = Window_IngredientCardRecipe;

Window_RecipeIngredientTab.prototype.initialize = function(x, y){
    this._windowSize = { width: 140, height: 65 };
    Window_Base.prototype.initialize.call(this, x, y, this._windowSize.width, this._windowSize.height);
}

Window_RecipeIngredientTab.prototype.drawIngredient = function(ingredientData){
    this.drawIcon(ingredientData.iconIndex, 0, 0);
    this.drawTextEx(ingredientData.quantity, 40, -3);
}

/* Window RecipeMessage */
function Window_RecipeMessage(){
    this.initialize.apply(this, arguments);
}

Window_RecipeMessage.prototype = Object.create(Window_Base.prototype);
Window_RecipeMessage.prototype.constructor = Window_IngredientCardRecipe;

Window_RecipeMessage.prototype.initialize = function(x, y){
    this._windowSize = { width: 370, height: 65 };
    Window_Base.prototype.initialize.call(this, x, y, this._windowSize.width, this._windowSize.height);
    this.drawMessage();
}

Window_RecipeMessage.prototype.drawMessage = function(){
    this.drawTextEx("You created a recipe!", 30, -3);
}

/* Window RecipeMessage */
function Window_RecipeConfirmation(){
    this.initialize.apply(this, arguments);
}

Window_RecipeConfirmation.prototype = Object.create(Window_Command.prototype);
Window_RecipeConfirmation.prototype.constructor = Window_IngredientCardRecipe;

Window_RecipeConfirmation.prototype.initialize = function(x, y){
    Window_Command.prototype.initialize.call(this, x, y);
}

Window_RecipeConfirmation.prototype.windowWidth = function(){
    return 370;
}

Window_RecipeConfirmation.prototype.makeCommandList = function(enabled){
    this.addCommand("OK", "ok", true);
}

Window_RecipeConfirmation.prototype.itemTextAlign = function(){
    return "center";
}