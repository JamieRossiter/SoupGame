/*:
* @plugindesc Handles all report-related logic.
* @author Jamie Rossiter
*/

/* Pre-load passport image in scene booter */
let report_scene_boot_create_override = Scene_Boot.prototype.create;
Scene_Boot.prototype.create = function() {
    report_scene_boot_create_override.call(this);
    ImageManager.loadPicture("form");
    ImageManager.loadPicture("text_input");
    ImageManager.loadPicture("text_input_focus");
};

function Window_Report(){
    this.initialize.apply(this, arguments);
}

Window_Report.prototype = Object.create(Window_Draggable.prototype);
Window_Report.prototype.constructor = Window_Report;

Window_Report.prototype.initialize = function(x, y, width, height){
    Window_Draggable.prototype.initialize.call(this, x, y, width, height);
    this._windowType = "report";
    this._textInputs = {
        name: {header: "N A M E", x: 35, y: 200, bitmap: null, buffer: "", focus: false},
        province: {header: "P R O V I N C E", x: 35, y: 270, bitmap: null, buffer: "", focus: false},
        yield_collected: {header: "Y I E L D  C O L L E C T E D", x: 35, y: 340, bitmap: null, buffer: "", focus: false}
    }
    // Create listeners that listen to the player's key strokes depending on the text input
    this.createKeyStrokeListeners();
    this.setBackgroundType(2);
}

Window_Report.prototype.refresh = function(){
    this.contents.clear();
    Window_Draggable.prototype.refresh.call(this);
    // Draw main report image
    this.drawReportImage();
    // Draw Text inputs
    Object.keys(this._textInputs).forEach(input => {
        this.drawTextInputs(input);
    })
    // Draw report Title
    this.drawReportTitle();
}

Window_Report.prototype.drawReportImage = function(){
    this.drawPicture("form", 0, 0);
}

Window_Report.prototype.drawReportTitle = function(){
    let xOffset = 15;
    let yOffset = 80;
    this.drawTextEx("\\} M I N I S T R Y  O F", 80 - xOffset, 15 + yOffset);
    this.drawTextEx("\\}  A G R I C U L T U R E \\{", 69 - xOffset, 30 + yOffset);
    this.drawTextEx("COLLECTION REPORT", 40, 130);
}

Window_Report.prototype.drawTextInputs = function(textInput){
    let input = this._textInputs[textInput];
    if(input.focus){
        input.bitmap = this.drawPicture("text_input_focus", input.x, input.y);   
    } else {
        input.bitmap = this.drawPicture("text_input", input.x, input.y);   
    }
    this.drawTextEx(input.buffer, input.x + 10, input.y);
    this.detectFocus(textInput);
    this.drawTextInputHeaders(textInput);
}

Window_Report.prototype.drawTextInputHeaders = function(textInput){
    let input = this._textInputs[textInput];
    this.drawTextEx(`\\} ${input.header} \\{`, input.x, input.y - 30);
}

Window_Report.prototype.createKeyStrokeListeners = function(){
    Object.keys(this._textInputs).forEach(input => {
        this.detectKeyStroke(input);
    })
}

Window_Report.prototype.detectFocus = function(textInput){
    let input = this._textInputs[textInput];
    return document.addEventListener("mousedown", e => {
        let mouseX = TouchInput.x;
        let mouseY = TouchInput.y;
        let validX = mouseX >= this.x + input.x && mouseX <= this.x + input.x + input.bitmap.width + 15;
        let validY = mouseY >= this.y + input.y && mouseY <= this.y + input.y + input.bitmap.height + 15;
        input.focus = TouchInput.isPressed() && (validX && validY);
    })
}

Window_Report.prototype.detectKeyStroke = function(textInput){
    let input = this._textInputs[textInput];
    let alphabetUpper = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
    let alphabetLower = alphabetUpper.map(alph => alph.toLowerCase());
    document.addEventListener("keydown", e => {
        let print = true;
        if (!(alphabetUpper.contains(e.key) || alphabetLower.contains(e.key))) { print = false; }
        if(e.key === "Backspace"){
            if(input.focus) input.buffer = input.buffer.slice(0, -1);
            print = false;
        }
        if(e.code === "Space"){
            if(input.focus) input.buffer += " ";
        }
        if(print && input.focus) input.buffer += e.key;
    })
}

/* TESTING */
/* Override map scene */
// const report_scene_map_start_override = Scene_Map.prototype.start;
// const report_scene_map_update_override = Scene_Map.prototype.update;

// Scene_Map.prototype.start = function(){
//     report_scene_map_start_override.call(this);
//     this._reportWindow = new Window_Report(300, 50, 310, 450);
//     this.addChild(this._reportWindow);
// }

// Scene_Map.prototype.update = function(){
//     report_scene_map_update_override.call(this);
//     // if($gameTemp._visibleDocuments.report){
//     // } else {
//     //     this.removeChild(this._passportWindow);
//     // }
//     this._reportWindow.refresh();
// }