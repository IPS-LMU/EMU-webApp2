export class MathHelperService {
  //////////////////////
  //////////////////////
  // public API

  /**
   * calculate the closest power of two that is
   * greater than the passed in number
   * @param num
   * @returns power of two value
   */
  public static calcClosestPowerOf2Gt(num) {
    let curExp = 0;

    while (Math.pow(2, curExp) < num) {
      curExp = curExp + 1;
    }

    return (Math.pow(2, curExp));

  }

  /**
   * round to n digits after decimal point
   * used to help display numbers with a given
   * precision
   * @param x number
   * @param n digits after decimal point
   * @returns rounded number
   */
  public static roundToNdigitsAfterDecPoint(x, n) {
    if (n < 1 || n > 14) {
      console.error('error in call of round function!!');
    }
    let e = Math.pow(10, n);
    let k = (Math.round(x * e) / e).toString();
    if (k.indexOf('.') === -1) {
      k += '.';
    }
    k += e.toString().substring(1);
    return parseFloat(k.substring(0, k.indexOf('.') + n + 1));
  }

}
