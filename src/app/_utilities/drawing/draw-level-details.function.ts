import {getPixelDistanceBetweenSamples, getPixelPositionOfSampleInViewport} from '../view-state-helper-functions';
import {FontScaleService} from '../../_services/font-scale.service';
import {ILevel} from '../../_interfaces/annot-json.interface';

export function drawLevelDetails(ctx: CanvasRenderingContext2D,
                                 level: ILevel,
                                 attribute: string,
                                 viewportStartSample: number,
                                 viewportEndSample: number) {
    let labelFontFamily; // font family used for labels only
    let fontFamily = 'HelveticaNeue'; //this.config_provider_service.design.font.small.family; // font family used for everything else
    // if(typeof this._database_configuration.perspectives[this.view_state_service.curPerspectiveIdx].levelCanvases.labelFontFamily === 'undefined'){
    labelFontFamily = 'HelveticaNeue';//this.config_provider_service.design.font.small.family;
    // }else{
    //  labelFontFamily = this._database_configuration.perspectives[this.view_state_service.curPerspectiveIdx].levelCanvases.labelFontFamily;
    // }

    let labelFontSize; // font family used for labels only
    let fontSize = 12; //this.config_provider_service.design.font.small.size.slice(0, -2) * 1; // font size used for everything else
    // if(typeof this._database_configuration.perspectives[this.view_state_service.curPerspectiveIdx].levelCanvases.fontPxSize === 'undefined') {
    labelFontSize = 12;//this.config_provider_service.design.font.small.size.slice(0, -2) * 1;
    // }else{
    //  labelFontSize = this._database_configuration.perspectives[this.view_state_service.curPerspectiveIdx].levelCanvases.labelFontPxSize;
    // }


    // let curAttrDef = this.vs.getCurAttrDef(this.level.name);
    // let isOpen = element.parent().css('height') !== '25px';// ? false : true;
    // if ($.isEmptyObject(this.level)) {
    //   //console.log('undef levelDetails');
    //   return;
    // }
    // if ($.isEmptyObject(this.vs)) {
    //   //console.log('undef this.view_state_service');
    //   return;
    // }
    // if ($.isEmptyObject(this.cps)) {
    //   //console.log('undef config');
    //   return;
    // }
    //
    // // draw hierarchy if canvas is displayed
    // if(this.drawHierarchy){
    //   this.drawHierarchyDetails();
    // }


    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // predef lets
    let sDist, posS, posE;

    sDist = getPixelDistanceBetweenSamples(viewportStartSample, viewportEndSample, ctx.canvas.width);

    // draw name of level and type
    let scaleY = ctx.canvas.height / ctx.canvas.offsetHeight;

    if (level.name === attribute) {
        //   if (isOpen) {
        FontScaleService.drawUndistortedTextTwoLines(ctx, level.name, '(' + level.type + ')', fontSize, fontFamily, 4, ctx.canvas.height / 2 - fontSize * scaleY, 'black', true);
        //   }
        //   else {
        //     fontSize -= 2;
        //     FontScaleService.drawUndistortedText(ctx, this.level.name, fontSize, fontFamily, 4, ctx.canvas.height / 2 - (fontSize * scaleY / 2), this.config_provider_service.design.color.black, true);
        //   }
        // } else {
        //   FontScaleService.drawUndistortedTextTwoLines(ctx, this.level.name + ':' + curAttrDef, '(' + this.level.type + ')', fontSize, fontFamily, 4, ctx.canvas.height / 2 - fontSize * scaleY, this.config_provider_service.design.color.black, true);
    }

    let curID = -1;

    // calculate generic max with of single char (m char used)
    //let mTxtImg = FontScaleService.drawUndistortedText(ctx, 'm', fontSize - 2, labelFontFamily, this.config_provider_service.design.color.black);
    let mTxtImgWidth = ctx.measureText('m').width * FontScaleService.getScaleX(ctx);

    // calculate generic max with of single digit (0 digit used)
    //let zeroTxtImg = FontScaleService.drawUndistortedText(ctx, '0', fontSize - 4, labelFontFamily, this.config_provider_service.design.color.black);
    let zeroTxtImgWidth = ctx.measureText('0').width * FontScaleService.getScaleX(ctx);
    if (level.type === 'SEGMENT') {
        ctx.fillStyle = 'black';//this.config_provider_service.design.color.black;
        // draw segments

        level.items.forEach((item) => {
            ++curID;

            if (item.sampleStart >= viewportStartSample &&
                item.sampleStart <= viewportEndSample || //within segment
                item.sampleStart + item.sampleDur > viewportStartSample &&
                item.sampleStart + item.sampleDur < viewportEndSample || //end in segment
                item.sampleStart < viewportStartSample &&
                item.sampleStart + item.sampleDur > viewportEndSample // within sample
            ) {
                // get label
                let curLabVal;
                item.labels.forEach((lab) => {
                    if (lab.name === attribute) {
                        curLabVal = lab.value;
                    }
                });

                // draw segment start
                posS = getPixelPositionOfSampleInViewport(item.sampleStart, viewportStartSample, viewportEndSample, ctx.canvas.width);
                posE = getPixelPositionOfSampleInViewport(item.sampleStart + item.sampleDur + 1, viewportStartSample, viewportEndSample, ctx.canvas.width);

                ctx.fillStyle = 'black';//this.config_provider_service.design.color.black;
                ctx.fillRect(posS, 0, 2, ctx.canvas.height / 2);

                //draw segment end
                ctx.fillStyle = 'grey'; //this.config_provider_service.design.color.grey;
                ctx.fillRect(posE, ctx.canvas.height / 2, 2, ctx.canvas.height);

                ctx.font = (fontSize - 2 + 'px' + ' ' + labelFontFamily);

                //check for enough space to stroke text
                if ((curLabVal !== undefined) && posE - posS > (mTxtImgWidth * curLabVal.length)) {
                    //         if (isOpen) {
                    FontScaleService.drawUndistortedText(ctx, curLabVal, labelFontSize - 2, labelFontFamily, posS + (posE - posS) / 2, (ctx.canvas.height / 2) - (fontSize - 2) + 2, 'black', false);
                    //         } else {
                    //           FontScaleService.drawUndistortedText(ctx, curLabVal, labelFontSize - 2, labelFontFamily, posS + (posE - posS) / 2, (ctx.canvas.height / 2) - fontSize + 2, this.config_provider_service.design.color.black, false);
                    //         }
                }

                //draw helper lines
                if (true && curLabVal !== undefined && curLabVal.length !== 0) { // only draw if label is not empty; NOTE true used to be this.open
                    let labelCenter = posS + (posE - posS) / 2;

                    let hlY = ctx.canvas.height / 4;
                    // start helper line
                    ctx.strokeStyle = 'black'; // this.config_provider_service.design.color.black;
                    ctx.beginPath();
                    ctx.moveTo(posS, hlY);
                    ctx.lineTo(labelCenter, hlY);
                    ctx.lineTo(labelCenter, hlY + 5);
                    ctx.stroke();

                    hlY = ctx.canvas.height / 4 * 3;
                    // end helper line
                    ctx.strokeStyle = 'grey'; //this.config_provider_service.design.color.grey;
                    ctx.beginPath();
                    ctx.moveTo(posE, hlY);
                    ctx.lineTo(labelCenter, hlY);
                    ctx.lineTo(labelCenter, hlY - 5);
                    ctx.stroke();
                }
                //
                //       if (this.open){
                // draw sampleStart numbers
                //check for enough space to stroke text
                if (posE - posS > zeroTxtImgWidth * item.sampleStart.toString().length) {
                    FontScaleService.drawUndistortedText(ctx, item.sampleStart, fontSize - 2, fontFamily, posS + 3, 0, 'grey', true);
                }

                // draw sampleDur numbers.
                let durtext = 'dur: ' + item.sampleDur + ' ';
                //check for enough space to stroke text
                if (posE - posS > zeroTxtImgWidth * durtext.length) {
                    FontScaleService.drawUndistortedText(ctx, durtext, fontSize - 2, fontFamily, posE - (ctx.measureText(durtext).width * FontScaleService.getScaleX(ctx)), ctx.canvas.height / 4 * 3, 'grey', true);
                }
                //       }
            }
        });

    }else if (level.type === 'EVENT') {
        ctx.fillStyle = 'black'; //this.config_provider_service.design.color.black;
        // predef. lets
        let perc;

        level.items.forEach((item) => {
            if (item.samplePoint > viewportStartSample && item.samplePoint < viewportEndSample) {
                let pos = getPixelPositionOfSampleInViewport(item.samplePoint, viewportStartSample, viewportEndSample, ctx.canvas.width);
                perc = Math.round(pos + (sDist / 2));
                // get label
                let curLabVal;
                item.labels.forEach((lab) => {
                    if (lab.name === attribute) {
                        curLabVal = lab.value;
                    }
                });

                ctx.fillStyle = 'black'; //this.config_provider_service.design.color.black;
                ctx.fillRect(perc, 0, 1, ctx.canvas.height / 2 - ctx.canvas.height / 5);
                ctx.fillRect(perc, ctx.canvas.height / 2 + ctx.canvas.height / 5, 1, ctx.canvas.height / 2 - ctx.canvas.height / 5);

                FontScaleService.drawUndistortedText(ctx, curLabVal, labelFontSize - 2, labelFontFamily, perc, (ctx.canvas.height / 2) - (fontSize - 2) + 2, 'black', false);
                //       if (isOpen) {
                FontScaleService.drawUndistortedText(ctx, item.samplePoint, fontSize - 2, labelFontFamily, perc + 5, 0, 'grey', true);
                //       }
            }
        });
    }
}
