/*:
* @plugindesc Creates custom windows for text input.
* @author Jamie Rossiter
*/

function Window_TextInput(){
    this.initialize.apply(this, arguments);
}

Window_TextInput.prototype = Object.create(Window_Base.prototype);
Window_TextInput.prototype.constructor = Window_TextInput;

Window_TextInput.prototype.initialize = function(parentWindow, x, y, width, height, defaultText, charLimit){
    Window_Base.prototype.initialize.call(this, x, y, width, height);
    this._charLimit = charLimit;
    this._defaultText = defaultText;
    this._textBuffer = this._defaultText.length > 0 ? this._defaultText : "";
    this._parentWindow = parentWindow;
    this.detectKeyStroke();
    this.detectFocus();
    this.setBackgroundType(2);
}

Window_TextInput.prototype.refresh = function(){
    this.contents.clear();
    if(this._textBuffer === this._defaultText) this.changePaintOpacity(false);
    else this.changePaintOpacity(true);
    this.drawText(this._textBuffer.toUpperCase(), 70, 0, 50, "center");
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
        if(this._textBuffer.length >= this._charLimit){
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
        let actualX = (this._parentWindow.x + this.x);
        let actualY = (this._parentWindow.y + this.y);
        let validX = mouseX >= actualX && mouseX <= actualX + this.width;
        let validY = mouseY >= actualY && mouseY <= actualY + this.height;
        this._focus = (validX && validY);
        console.log(this.width);
    })
}

/* TESTING */
/* Override map scene */
// const textinput_scene_map_start_override = Scene_Map.prototype.start;
// const textinput_scene_map_update_override = Scene_Map.prototype.update;

// Scene_Map.prototype.start = function(){
//     textinput_scene_map_start_override.call(this);
//     this._textinputWindow = new Window_TextInput();
//     this.addChild(this._textinputWindow);
// }

// Scene_Map.prototype.update = function(){
//     textinput_scene_map_update_override.call(this);
//     this._textinputWindow.refresh();
// }