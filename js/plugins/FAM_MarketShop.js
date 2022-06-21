/* Create Game_Temp variables at boot */
const marketshop_game_temp_initialize_override = Game_Temp.prototype.initialize;
Game_Temp.prototype.initialize = function() {
    marketshop_game_temp_initialize_override.call(this);
    this.clearDestination(); // Prevents automatic movement at boot
    // MarketShop object
    this._marketShop = {
        name: "Shop Name",
        type: "Shop Type",
        goods: [[]],
        ingredientCard: {
            name: "Ingredient Name",
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
    };
};

/* Scene Map */
const marketshop_scene_start_override = Scene_Map.prototype.start;
const marketshop_scene_update_override = Scene_Map.prototype.update;

Scene_Map.prototype.start = function(){
    marketshop_scene_start_override.call(this);
}

Scene_Map.prototype.update = function(){
    marketshop_scene_update_override.call(this);
}

/* Scene MarketShop */

function Scene_MarketShop() {
    this.initialize.apply(this, arguments);
}

Scene_MarketShop.prototype = Object.create(Scene_MenuBase.prototype);
Scene_MarketShop.prototype.constructor = Scene_MarketShop;

Scene_MarketShop.prototype.initialize = function () {
    Scene_MenuBase.prototype.initialize.call(this);
    this.collectiveX = 140;
    this.collectiveY = 160;
}

Scene_MarketShop.prototype.create = function () {
    Scene_MenuBase.prototype.create.call(this);
    this._shopType = $gameTemp._marketShop.type;
    this._goods = $gameTemp._marketShop.goods;
    this._shopName = $gameTemp._marketShop.name;
    this.createMainWindow();
    this.createItemCardWindow();
    this.createShopkeeperWindow(this._shopType);
    this.createKuponWindow();
    this.createShopNameWindow(this._shopName);
    this.activateShopWindow();
    this._shopWindow.setHandler('ok', this.onBuy.bind(this));
    this._shopWindow.setHandler('cancel', () => { SceneManager.pop() });
}

Scene_MarketShop.prototype.update = function(){
    Scene_MenuBase.prototype.update.call(this);
    this._shopWindow.refresh(this._itemCardWindow.getIngredientCardDataFromItem(this.item()));
    this._itemCardWindow.refresh($gameTemp._marketShop.ingredientCard);
}

Scene_MarketShop.prototype.createMainWindow = function(){
    this._shopWindow = new Window_MarketShop(this.collectiveX, this.collectiveY + 70, 195, this._goods);
    this.addChild(this._shopWindow);
}

Scene_MarketShop.prototype.createShopkeeperWindow = function(shopType){
    this._shopkeeperWindow = new Window_Shopkeeper(this.collectiveX, this.collectiveY + (this._itemCardWindow.height - 80), 456, 80, shopType);
    this.addChild(this._shopkeeperWindow);
}

Scene_MarketShop.prototype.createKuponWindow = function(){
    this._kuponWindow = new Window_Kupon(this.collectiveX + 291, this.collectiveY);
    this.addChild(this._kuponWindow);
}

Scene_MarketShop.prototype.createShopNameWindow = function(shopName){
    this._shopNameWindow = new Window_MarketShopName(this.collectiveX, this.collectiveY, 285, 65, shopName);
    this.addChild(this._shopNameWindow);
}

Scene_MarketShop.prototype.createItemCardWindow = function(ingredientData){
    this._itemCardWindow = new Window_IngredientCard(603, 160, ingredientData);
    this.addChild(this._itemCardWindow);
}

Scene_MarketShop.prototype.createBuyConfirmWindow = function(){
    let itemY = this._shopWindow.itemHeight() * this._shopWindow.index();
    this._buyConfirmWindow = new Window_MarketShopConfirm(this._shopWindow.x + 120, this._shopWindow.y + itemY);
}

Scene_MarketShop.prototype.onBuy = function () {
    this._shopWindow.deactivate();
    this.createBuyConfirmWindow();
    this.addChild(this._buyConfirmWindow);
    this._buyConfirmWindow.setHandler('confirm', () => {
        this._item = this._shopWindow.item();
        $gameParty.loseGold(this._shopWindow.price(this._item));
        $gameParty.gainItem(this._item, 1);
        this.activateShopWindow();
    });
    this._buyConfirmWindow.setHandler('cancel', () => { 
        this.removeChild(this._buyConfirmWindow);
        this.activateShopWindow();
    });
};

Scene_MarketShop.prototype.activateShopWindow = function () {
    this._shopWindow.setMoney($gameParty.gold());
    this._shopWindow.show();
    this._shopWindow.activate();
};

/* Window MarketShop */

function Window_MarketShop() {
    this.initialize.apply(this, arguments);
}

Window_MarketShop.prototype = Object.create(Window_ShopBuy.prototype);
Window_MarketShop.prototype.constructor = Window_MarketShop;

Window_MarketShop.prototype.initialize = function (x, y, height, goods) {
    Window_ShopBuy.prototype.initialize.call(this, x, y, height, goods);
}

Window_MarketShop.prototype.refresh = function(data){
    Window_ShopBuy.prototype.refresh.call(this);
    $gameTemp._marketShop.ingredientCard = data;
}

/* Window MarketShop - Shopkeeper Window */

function Window_Shopkeeper() {
    this.initialize.apply(this, arguments);
}

Window_Shopkeeper.prototype = Object.create(Window_Base.prototype);
Window_Shopkeeper.prototype.constructor = Window_Shopkeeper;

Window_Shopkeeper.prototype.initialize = function (x, y, width, height, shopType) {
    Window_Base.prototype.initialize.call(this, x, y, width, height);
    this._head = this.getHead(shopType);
    this.drawIcon(this._head, 0, 7);
    this.drawTextEx('"Welcome to my shop!"', 45, 5);
}

Window_Shopkeeper.prototype.getHead = function(type){
    let head = 1;
    switch(type){
        case "meat":
            head = 1072;
            break;
        case "produce":
            head = 1073;
            break;
        case "medical":
            head = 1074;
            break;
    }
    return head;
}

/* Window MarketShop - Shop Name */

function Window_MarketShopName() {
    this.initialize.apply(this, arguments);
}

Window_MarketShopName.prototype = Object.create(Window_Base.prototype);
Window_MarketShopName.prototype.constructor = Window_MarketShopName;

Window_MarketShopName.prototype.initialize = function (x, y, width, height, name) {
    Window_Base.prototype.initialize.call(this, x, y, width, height);
    this.drawTextEx(`\\c[1]${name.toUpperCase()}\\c[0]`, 0, -3);
}

/* Window MarketShop - Kupon Window */

function Window_Kupon() {
    this.initialize.apply(this, arguments);
}

Window_Kupon.prototype = Object.create(Window_Gold.prototype);
Window_Kupon.prototype.constructor = Window_Kupon;

Window_Kupon.prototype.initialize = function (x, y) {
    Window_Gold.prototype.initialize.call(this, x, y);
}

Window_Kupon.prototype.windowWidth = function () {
    return 165;
};

Window_Kupon.prototype.windowHeight = function () {
    return 65;
};

Window_Kupon.prototype.refresh = function () {
    this.contents.clear();
    this.drawText(this.value().toString(), 70, -1, 50, "right");
    this.drawIcon(382, -2, 5);
};

/* Window Marketshop - Confirm Window */

function Window_MarketShopConfirm(){
    this.initialize.apply(this, arguments);
}

Window_MarketShopConfirm.prototype = Object.create(Window_HorzCommand.prototype);
Window_MarketShopConfirm.prototype.constructor = Window_MarketShopConfirm;

Window_MarketShopConfirm.prototype.initialize = function(x, y){
    Window_HorzCommand.prototype.initialize.call(this, x, y);
}

Window_MarketShopConfirm.prototype.makeCommandList = function(){
    this.addCommand("Buy", "confirm", true);
    this.addCommand("Cancel", "cancel", true);
}

Window_MarketShopConfirm.prototype.itemWidth = function(){
    return 90;
}
