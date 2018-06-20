export class FontScaleService {

  public static spaceTop = 0;

  /**
   * In the old system, FontScaleService.scaleY and .scaleX would be their initial
   * value of 0 until either drawUndistortedText() or drawUndistortedTextTwoLines()
   * had been called. The new version, getScaleY and getScaleX do not do that.
   */
  public static getScaleY (ctx: CanvasRenderingContext2D): number {
      return ctx.canvas.height / ctx.canvas.offsetHeight;
  }

  public static getScaleX (ctx: CanvasRenderingContext2D): number {
    return ctx.canvas.width / ctx.canvas.offsetWidth;
  }

  /**
   *
   */
  public static drawUndistortedText (ctxOriginal, text, fontPxSize, fontType, x, y, color, alignLeft) {
    ctxOriginal.save();
    ctxOriginal.font = (fontPxSize + 'px' + ' ' + fontType);
    ctxOriginal.scale(FontScaleService.getScaleX(ctxOriginal), FontScaleService.getScaleY(ctxOriginal));
    ctxOriginal.fillStyle = color;
    if(alignLeft){
      ctxOriginal.fillText(text, x / FontScaleService.getScaleX(ctxOriginal), (y + fontPxSize + FontScaleService.spaceTop) / FontScaleService.getScaleY(ctxOriginal));
    }else{
      let alignLeftX = x  / FontScaleService.getScaleX(ctxOriginal) - ctxOriginal.measureText(text).width / 2;
      ctxOriginal.fillText(text, alignLeftX, (y + fontPxSize + FontScaleService.spaceTop) / FontScaleService.getScaleY(ctxOriginal));
    }
    ctxOriginal.scale(1, 1);
    ctxOriginal.restore();
  }

  /**
   *
   */

  public static drawUndistortedTextTwoLines(ctxOriginal, text, text2, fontPxSize, fontType, x, y, color, alignLeft) {
    ctxOriginal.save();
    ctxOriginal.font = (fontPxSize + 'px' + ' ' + fontType);
    ctxOriginal.scale(FontScaleService.getScaleX(ctxOriginal), FontScaleService.getScaleY(ctxOriginal));
    ctxOriginal.fillStyle = color;
    if (alignLeft) {
      ctxOriginal.fillText(text, x / FontScaleService.getScaleX(ctxOriginal), (y + fontPxSize + FontScaleService.spaceTop));
      ctxOriginal.fillText(text2, x / FontScaleService.getScaleX(ctxOriginal), (y + 2 * fontPxSize + FontScaleService.spaceTop));
    } else {
      let a = ctxOriginal.measureText(text).width;
      let b = ctxOriginal.measureText(text2).width;
      // var c;
      if (a > b) {
        ctxOriginal.fillText(text, x / FontScaleService.getScaleX(ctxOriginal), y + fontPxSize + FontScaleService.spaceTop);
        ctxOriginal.fillText(text2, (x + (a - b)) / FontScaleService.getScaleX(ctxOriginal), y + 2 * (fontPxSize) + FontScaleService.spaceTop);
      } else {
        ctxOriginal.fillText(text, (x + (b - a)) / FontScaleService.getScaleX(ctxOriginal), y + fontPxSize + FontScaleService.spaceTop);
        ctxOriginal.fillText(text2, x / FontScaleService.getScaleX(ctxOriginal), y + 2 * (fontPxSize) + FontScaleService.spaceTop);
      }
    }
    ctxOriginal.scale(1, 1);
    ctxOriginal.restore();
  }
}
