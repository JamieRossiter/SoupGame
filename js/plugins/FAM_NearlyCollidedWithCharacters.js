Game_Character.prototype.isNearlyCollidedWithCharacters = function(x, y){
    let isNearlyCollided = false;
    let directions = ["left", "right", "up", "down"];
    directions.forEach(dir => {
        switch(dir){
            case "left":
                if($gameMap.eventsXyNt(x - 1, y).length > 0) isNearlyCollided = true; 
                break;
            case "right":
                if($gameMap.eventsXyNt(x + 1, y).length > 0) isNearlyCollided = true; 
                break;
            case "up":
                if($gameMap.eventsXyNt(x, y - 1).length > 0) isNearlyCollided = true; 
                break;
            case "down":
                if($gameMap.eventsXyNt(x, y + 1).length > 0) isNearlyCollided = true; 
                break;
        }
    })
    return isNearlyCollided;
}