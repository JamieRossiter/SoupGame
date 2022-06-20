/* Center drawTextEx with X, Y coords and width */
Window_Base.prototype.drawTextExAlign = function(text, x, y, width, align){
    let tx = x;
    var txWidth = this.drawTextEx(text, -100, -100);
    txWidth += this.textPadding() * 2;
    var wx = (width - txWidth) / 2;
    if (align === 'center') {
        tx += width / 2;
    }
    if (align === 'right') {
        tx += width;
    }
    this.drawTextEx(text, (wx + this.textPadding()) + tx, y);
}