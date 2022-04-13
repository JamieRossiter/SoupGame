/*:
* @plugindesc Creates custom windows for text input.
* @author Jamie Rossiter
*/

function Window_TextInput(){
    this.initialize.apply(this, arguments);
}

Window_TextInput.prototype = Object.create(Window_Base.prototype);
Window_TextInput.prototype.constructor = Window_TextInput;

Window_TextInput.prototype.initialize = function(parentWindow, offsetX, offsetY, width, height){
    Window_Base.prototype.initialize.call(this, 0, 0, width, height);
    this._parentWindow = parentWindow;
    this._offset = { x: offsetX, y: offsetY };
    this._textBuffer = "";
    this.detectKeyStroke();
    this.detectFocus();
    this.setBackgroundType(2);
}

Window_TextInput.prototype.refresh = function(){
    this.contents.clear();
    if(this._focus){
        this.drawPicture("text_input_focus", 0, 0);
    } else {
        this.drawPicture("text_input", 0, 0);
    }
    this.drawTextEx(this._textBuffer, 10, 0);
    this.x = this._parentWindow.x + this._offset.x;
    this.y = this._parentWindow.y + this._offset.y;
    // let stackElemAboveNotebook = SceneManager._scene.getChildIndex(SceneManager._scene.children.find(nbWin => nbWin._windowType === "notebook"));
    // SceneManager._scene.setChildIndex(this, stackElemAboveNotebook);
}

Window_TextInput.prototype.detectKeyStroke = function(){
    let alphabetUpper = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
    let alphabetLower = alphabetUpper.map(alph => alph.toLowerCase());
    document.addEventListener("keydown", e => {
        let print = true;
        if (!(alphabetUpper.contains(e.key) || alphabetLower.contains(e.key))) { print = false; }
        if(e.key === "Backspace"){
            if(this._focus) this._textBuffer = this._textBuffer.slice(0, -1);
            print = false;
        }
        if(e.code === "Space"){
            if(this._focus) this._textBuffer += " ";
        }
        if(print && this._focus) this._textBuffer += e.key;
    })
}

Window_TextInput.prototype.detectFocus = function(){
    return document.addEventListener("mousedown", e => {
        let mouseX = TouchInput.x;
        let mouseY = TouchInput.y;
        let validX = mouseX >= this.x && mouseX <= this.x + this.width;
        let validY = mouseY >= this.y && mouseY <= this.y + this.height;
        this._focus = TouchInput.isPressed() && (validX && validY);
    })
}

/* TESTING */
/* Override map scene */
const textinput_scene_map_start_override = Scene_Map.prototype.start;
const textinput_scene_map_update_override = Scene_Map.prototype.update;

Scene_Map.prototype.start = function(){
    textinput_scene_map_start_override.call(this);
    // this._textinputWindow = new Window_TextInput(300, 300, 300, 75);
}

Scene_Map.prototype.update = function(){
    textinput_scene_map_update_override.call(this);
    // this.addChild(this._textinputWindow);
    // if($gameTemp._isPassportVisible){
    // } else {
    //     this.removeChild(this._passportWindow);
    // }
    // this._textinputWindow.refresh();
}