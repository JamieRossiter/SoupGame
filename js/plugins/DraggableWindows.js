/*:
* @plugindesc Creates draggable windows that can be closed with an X button.
* @author Jamie Rossiter
*/

const EXIT_BTN_COORDS = { x: -7, y: 0, width: 55, height: 55 };

/* Allow pictures to be drawn onto windows */
Window_Base.prototype.drawPicture = function(filename, x, y) {    
    var bitmap = ImageManager.loadPicture(filename);    
    this.contents.blt(bitmap, 0, 0, bitmap._canvas.width, bitmap._canvas.height, x, y);
    return bitmap;
};

/* Draggable Window */
function Window_Draggable(){
    this.initialize.apply(this, arguments);
}

Window_Draggable.prototype = Object.create(Window_Base.prototype);
Window_Draggable.prototype.constructor = Window_Draggable;

Window_Draggable.prototype.initialize = function(x, y, width, height){
    Window_Base.prototype.initialize.call(this, x, y, width, height);
    this._originalX = x;
    this._originalY = y;
    this._windowType = "";
    this._isDraggable = false;
    this._initTouchPos = {x: 0, y: 0};
    this._initWindowPos = {x: 0, y: 0};
}

Window_Draggable.prototype.refresh = function(){
    this.contents.clear();

    // Ensure that if two windows are overlapping, the top window is dragged
    this.handleOverlappingWindows();
    
    // Determines where in the scene stack the window is
    this._scenePosition = SceneManager._scene.getChildIndex(this)
    
    // Draw exit icon 
    this.drawExitIcon();

    // Handle dragging
    this.handleDrag();

    // Check if window is placed beyond window boundary
    if(this.isBeyondWindowBoundary()){
        this.x = this._originalX;
        this.y = this._originalY;
    }
}

Window_Draggable.prototype.handleOverlappingWindows = function(){
    let draggableWindows = SceneManager._scene.children.filter(child => {
        return "_isDraggable" in child;
    })
    const filteredWindows = draggableWindows.filter(win => {
        let mouseX = TouchInput.x;
        let mouseY = TouchInput.y;
        let validX = mouseX >= win.x && mouseX <= win.x + win.width;
        let validY = mouseY >= win.y && mouseY <= win.y + win.height;
        return validX && validY;
    })
    const topWindow = filteredWindows[filteredWindows.length - 1];
    if(topWindow){
        topWindow._isDraggable = true;
        draggableWindows.forEach(win => {
            if(win != topWindow){
                win._isDraggable = false;
            }
        })
    }
}

Window_Draggable.prototype.handleDrag = function(){
    this.maintainOriginalWindowPositionOnDrag();
    const lastStackElem = SceneManager._scene.children.length - 2; // This allows for the mouse cursor
    
    // Check if windows are being selected and dragged
    if(TouchInput.isPressed() && this.checkMouseClickValid(EXIT_BTN_COORDS) && !$gameTemp._isDragging && this._isDraggable){
        $gameTemp._isDragging = true;
        SceneManager._scene.setChildIndex(this, lastStackElem);
    }

    if(TouchInput.isPressed() && $gameTemp._isDragging){
        if(this._scenePosition === lastStackElem){
            if(this._initTouchPos.x && this._initTouchPos.y){
                var deltaX = TouchInput.x - this._initTouchPos.x;
                var deltaY = TouchInput.y - this._initTouchPos.y;
            }
            if(this._initWindowPos.x && this._initWindowPos.y){
                this.x = this._initWindowPos.x + deltaX;
                this.y = this._initWindowPos.y + deltaY;
            }
        }
    } else {
        $gameTemp._isDragging = false;
    }
}

Window_Draggable.prototype.maintainOriginalWindowPositionOnDrag = function(){
    // Maintain original window position when dragging windows
    if(TouchInput.isPressed() && this.checkMouseClickValid(EXIT_BTN_COORDS) && !TouchInput.isMoved()){
        this._initTouchPos = {x: TouchInput.x, y: TouchInput.y};
        this._initWindowPos = { x: this.x, y: this.y };
    }
}

Window_Draggable.prototype.checkMouseClickValid = function(exitBtn){
    let mouseX = TouchInput.x;
    let mouseY = TouchInput.y;
    let validX = mouseX >= this.x && mouseX <= this.x + this.width;
    let validY = mouseY >= this.y && mouseY <= this.y + this.height;
    // Consider anywhere where the exit button is to be "invalid"
    let invalidX = mouseX >= (this.x + exitBtn.x) && mouseX <= ((this.x + exitBtn.x) + exitBtn.width);
    let invalidY = mouseY >= (this.y + exitBtn.y) && mouseY <= ((this.y + exitBtn.y) + exitBtn.height);
    if((invalidX && invalidY && !$gameTemp._isDragging)){
        this.close();
    }
    return (validX && validY) && !(invalidX && invalidY);
}

Window_Draggable.prototype.isBeyondWindowBoundary = function(){
    const invalidX = ((this.x + 20) >= Graphics.boxWidth) || this.x <= -this.width + 20;
    const invalidY = ((this.y + 20) >= Graphics.boxHeight) || this.y <= -this.height + 20;
    return invalidX || invalidY
}

Window_Draggable.prototype.drawExitIcon = function(){
    this.drawIcon(106, EXIT_BTN_COORDS.x, EXIT_BTN_COORDS.y);
}