import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FontScaleService {

  constructor() { }

  lastTextWidth = null;
  spaceTop = 0;
  scaleY = 0;
  scaleX = 0;

  /**
   *
   */
  public drawUndistortedText (ctxOriginal, text, fontPxSize, fontType, x, y, color, alignLeft) {
    this.scaleY = ctxOriginal.canvas.height / ctxOriginal.canvas.offsetHeight;
    this.scaleX = ctxOriginal.canvas.width / ctxOriginal.canvas.offsetWidth;
    ctxOriginal.save();
    ctxOriginal.font = (fontPxSize + 'px' + ' ' + fontType);
    ctxOriginal.scale(this.scaleX, this.scaleY);
    ctxOriginal.fillStyle = color;
    if(alignLeft){
      ctxOriginal.fillText(text, x / this.scaleX, (y + fontPxSize + this.spaceTop) / this.scaleY);
    }else{
      let alignLeftX = x  / this.scaleX - ctxOriginal.measureText(text).width / 2;
      ctxOriginal.fillText(text, alignLeftX, (y + fontPxSize + this.spaceTop) / this.scaleY);
    }
    ctxOriginal.scale(1, 1);
    ctxOriginal.restore();
  }

  /**
   *
   */

  public drawUndistortedTextTwoLines(ctxOriginal, text, text2, fontPxSize, fontType, x, y, color, alignLeft) {
    this.scaleY = ctxOriginal.canvas.height / ctxOriginal.canvas.offsetHeight;
    this.scaleX = ctxOriginal.canvas.width / ctxOriginal.canvas.offsetWidth;
    ctxOriginal.save();
    ctxOriginal.font = (fontPxSize + 'px' + ' ' + fontType);
    ctxOriginal.scale(this.scaleX, this.scaleY);
    ctxOriginal.fillStyle = color;
    if (alignLeft) {
      ctxOriginal.fillText(text, x / this.scaleX, (y + fontPxSize + this.spaceTop));
      ctxOriginal.fillText(text2, x / this.scaleX, (y + 2 * fontPxSize + this.spaceTop));
    } else {
      let a = ctxOriginal.measureText(text).width;
      let b = ctxOriginal.measureText(text2).width;
      // var c;
      if (a > b) {
        ctxOriginal.fillText(text, x / this.scaleX, y + fontPxSize + this.spaceTop);
        ctxOriginal.fillText(text2, (x + (a - b)) / this.scaleX, y + 2 * (fontPxSize) + this.spaceTop);
      } else {
        ctxOriginal.fillText(text, (x + (b - a)) / this.scaleX, y + fontPxSize + this.spaceTop);
        ctxOriginal.fillText(text2, x / this.scaleX, y + 2 * (fontPxSize) + this.spaceTop);
      }
    }
    ctxOriginal.scale(1, 1);
    ctxOriginal.restore();
  }
}
