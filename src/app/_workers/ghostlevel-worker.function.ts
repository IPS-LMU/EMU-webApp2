export function ghostLevelWorker() {
  let selfAny = <any>self;
  ///////////////////////////////////
  // start: global vars
  selfAny.executed = false;

  // end: global vars
  //////////////////////////////////

  selfAny.renderHierarchy = function(image_width,
                                     image_height,
                                     viewport_sample_start,
                                     viewport_sample_end,
                                     annotation) {

    // create new picture
    selfAny.resultImgArr = new Uint8ClampedArray(Math.ceil(image_width * image_height * 4));

    console.log("djsfklasjdfklasdfklasd--------");
    console.log(annotation);

    const color = 100;
    for (let i = 0; i < image_width * image_height * 4; i += 4) {
      selfAny.resultImgArr[i] = color;
      selfAny.resultImgArr[i + 1] = 0;
      selfAny.resultImgArr[i + 2] = 0;
      selfAny.resultImgArr[i + 3] = 0;
    }

    // post generated image block with settings back
    selfAny.postMessage({
      img: selfAny.resultImgArr.buffer
    }, [selfAny.resultImgArr.buffer]);
  };

  //////////////////////////
  // communication functions

  /**
   * function to handle messages events
   * @param e message event
   */

  selfAny.onmessage = function (e) {
    console.log("------------------");
    console.log(e.data);
    selfAny.renderHierarchy(
      e.data.image_width,
      e.data.image_height,
      e.data.viewport_sample_start,
      e.data.viewport_sample_end,
      e.data.annotation,
      );
  };
}
